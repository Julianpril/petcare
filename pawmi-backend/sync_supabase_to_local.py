"""
Script para sincronizar datos de Supabase a PostgreSQL Local
Ejecutar: python sync_supabase_to_local.py
REQUIERE: Conexión a Internet para conectarse a Supabase
"""
import traceback

import psycopg2
from psycopg2.extras import RealDictCursor

# Configuración de Supabase (origen)
SUPABASE_CONFIG = {
    'host': 'db.jnttxcptkmokdwglxqpu.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'PawMi2502..'
}

# Configuración de PostgreSQL Local (destino)
LOCAL_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pawMi_db',
    'user': 'postgres',
    'password': '2502'
}

# Tablas a sincronizar en orden (respetando dependencias)
TABLES_TO_SYNC = [
    'users',
    'pets',
    'reminders',
    'walker_profiles',
    'walker_availability',
    'walker_bookings',
    'pet_photos'
]

def truncate_table(cursor, table_name):
    """Vacía una tabla antes de insertar datos"""
    try:
        cursor.execute(f'TRUNCATE TABLE {table_name} CASCADE')
        print(f"  ✓ Tabla {table_name} vaciada")
    except Exception as e:
        print(f"  ⚠️  No se pudo vaciar {table_name}: {e}")

def sync_table(supabase_cursor, local_cursor, table_name):
    """Sincroniza una tabla de Supabase a Local"""
    try:
        print(f"\n📋 Sincronizando tabla: {table_name}")
        
        # Obtener datos de Supabase
        supabase_cursor.execute(f'SELECT * FROM {table_name}')
        rows = supabase_cursor.fetchall()
        
        if not rows:
            print(f"  ⚠️  Tabla {table_name} vacía en Supabase")
            return 0
        
        print(f"  📥 Encontrados {len(rows)} registros en Supabase")
        
        # Vaciar tabla local
        truncate_table(local_cursor, table_name)
        
        # Insertar datos
        if rows:
            columns = rows[0].keys()
            placeholders = ', '.join(['%s'] * len(columns))
            columns_str = ', '.join(columns)
            
            insert_query = f'INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})'
            
            for row in rows:
                try:
                    local_cursor.execute(insert_query, tuple(row.values()))
                except Exception as e:
                    print(f"  ⚠️  Error insertando registro: {e}")
                    continue
            
            print(f"  ✅ {len(rows)} registros sincronizados")
        
        return len(rows)
        
    except Exception as e:
        print(f"  ❌ Error sincronizando {table_name}: {e}")
        traceback.print_exc()
        return 0

def run_sync():
    """Ejecuta la sincronización completa"""
    supabase_conn = None
    local_conn = None
    
    try:
        print("=" * 70)
        print("SINCRONIZACIÓN: Supabase → PostgreSQL Local")
        print("=" * 70)
        
        # Conectar a Supabase
        print("\n🌐 Conectando a Supabase...")
        supabase_conn = psycopg2.connect(**SUPABASE_CONFIG, cursor_factory=RealDictCursor)
        supabase_cursor = supabase_conn.cursor()
        print("✅ Conectado a Supabase")
        
        # Conectar a Local
        print("\n🏠 Conectando a PostgreSQL Local...")
        local_conn = psycopg2.connect(**LOCAL_CONFIG)
        local_cursor = local_conn.cursor()
        print("✅ Conectado a PostgreSQL Local")
        
        # Sincronizar cada tabla
        total_records = 0
        for table in TABLES_TO_SYNC:
            count = sync_table(supabase_cursor, local_cursor, table)
            total_records += count
        
        # Commit cambios
        local_conn.commit()
        
        # Resumen
        print("\n" + "=" * 70)
        print(f"✅ SINCRONIZACIÓN COMPLETADA")
        print(f"📊 Total de registros sincronizados: {total_records}")
        print("=" * 70)
        
        # Verificar usuarios
        local_cursor.execute('SELECT COUNT(*) FROM users')
        user_count = local_cursor.fetchone()[0]
        print(f"\n👥 Usuarios en base local: {user_count}")
        
        local_cursor.execute('SELECT email, full_name, role FROM users LIMIT 5')
        print("\n📋 Primeros 5 usuarios:")
        for row in local_cursor.fetchall():
            print(f"  • {row[0]} - {row[1]} ({row[2]})")
        
        supabase_cursor.close()
        local_cursor.close()
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ Error de conexión: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        if "could not translate host name" in str(e):
            print("\n⚠️  No hay conexión a Internet. Necesitas conectarte para sincronizar.")
        traceback.print_exc()
    except Exception as e:
        print(f"\n❌ Error inesperado: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        traceback.print_exc()
        if local_conn:
            local_conn.rollback()
    finally:
        if supabase_conn:
            supabase_conn.close()
            print("\n🔌 Desconectado de Supabase")
        if local_conn:
            local_conn.close()
            print("🔌 Desconectado de PostgreSQL Local")
    
    print("\n" + "=" * 70)
    print("💡 Ahora puedes trabajar sin Internet con todos tus datos")
    print("=" * 70)

if __name__ == "__main__":
    run_sync()
