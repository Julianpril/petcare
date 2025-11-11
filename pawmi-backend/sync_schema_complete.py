"""
Script mejorado para sincronizar esquema completo de Supabase a Local
Detecta automáticamente las diferencias y las aplica
"""
import traceback

import psycopg2
from psycopg2.extras import RealDictCursor

SUPABASE_CONFIG = {
    'host': 'db.jnttxcptkmokdwglxqpu.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'PawMi2502..'
}

LOCAL_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pawMi_db',
    'user': 'postgres',
    'password': '2502'
}

def get_table_columns(cursor, table_name):
    """Obtiene todas las columnas de una tabla"""
    cursor.execute("""
        SELECT column_name, data_type, character_maximum_length, 
               is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = %s
        ORDER BY ordinal_position
    """, (table_name,))
    return {row['column_name']: row for row in cursor.fetchall()}

def sync_table_schema(supabase_cursor, local_cursor, table_name, local_conn):
    """Sincroniza el esquema de una tabla"""
    try:
        print(f"\n📋 Analizando tabla: {table_name}")
        
        # Obtener columnas de ambas bases
        supabase_cols = get_table_columns(supabase_cursor, table_name)
        local_cols = get_table_columns(local_cursor, table_name)
        
        if not supabase_cols:
            print(f"  ⚠️  Tabla {table_name} no existe en Supabase")
            return False
        
        if not local_cols:
            print(f"  ⚠️  Tabla {table_name} no existe en Local")
            return False
        
        # Encontrar columnas faltantes
        missing_cols = set(supabase_cols.keys()) - set(local_cols.keys())
        
        if not missing_cols:
            print(f"  ✅ Esquema sincronizado ({len(supabase_cols)} columnas)")
            return True
        
        print(f"  📝 Agregando {len(missing_cols)} columnas faltantes...")
        
        for col_name in missing_cols:
            col_info = supabase_cols[col_name]
            data_type = col_info['data_type']
            
            # Construir tipo de datos
            if col_info['character_maximum_length']:
                data_type = f"{data_type}({col_info['character_maximum_length']})"
            
            # Construir DEFAULT
            default_clause = ""
            if col_info['column_default']:
                default_clause = f"DEFAULT {col_info['column_default']}"
            
            # Construir NULL/NOT NULL
            null_clause = "NULL" if col_info['is_nullable'] == 'YES' else "NOT NULL"
            
            # Ejecutar ALTER TABLE
            alter_sql = f"""
                ALTER TABLE {table_name} 
                ADD COLUMN IF NOT EXISTS {col_name} {data_type} {default_clause}
            """
            
            try:
                local_cursor.execute(alter_sql)
                local_conn.commit()
                print(f"  ✓ {col_name} ({data_type})")
            except Exception as e:
                print(f"  ✗ Error agregando {col_name}: {e}")
                local_conn.rollback()
        
        return True
        
    except Exception as e:
        print(f"  ❌ Error: {e}")
        traceback.print_exc()
        return False

def run_schema_sync():
    """Sincroniza esquemas de todas las tablas"""
    supabase_conn = None
    local_conn = None
    
    try:
        print("=" * 70)
        print("SINCRONIZACIÓN DE ESQUEMAS: Supabase → Local")
        print("=" * 70)
        
        # Conectar
        print("\n🌐 Conectando a Supabase...")
        supabase_conn = psycopg2.connect(**SUPABASE_CONFIG, cursor_factory=RealDictCursor)
        supabase_cursor = supabase_conn.cursor()
        print("✅ Conectado")
        
        print("\n🏠 Conectando a PostgreSQL Local...")
        local_conn = psycopg2.connect(**LOCAL_CONFIG, cursor_factory=RealDictCursor)
        local_cursor = local_conn.cursor()
        print("✅ Conectado")
        
        # Tablas a sincronizar
        tables = ['users', 'pets', 'reminders']
        
        for table in tables:
            sync_table_schema(supabase_cursor, local_cursor, table, local_conn)
        
        supabase_cursor.close()
        local_cursor.close()
        
        print("\n" + "=" * 70)
        print("✅ ESQUEMAS SINCRONIZADOS")
        print("💡 Ahora ejecuta: python sync_supabase_to_local.py")
        print("=" * 70)
        
    except psycopg2.OperationalError as e:
        print(f"\n❌ Error de conexión: {e}")
        if "could not translate host name" in str(e):
            print("⚠️  Necesitas conexión a Internet")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        traceback.print_exc()
    finally:
        if supabase_conn:
            supabase_conn.close()
        if local_conn:
            local_conn.close()

if __name__ == "__main__":
    run_schema_sync()
