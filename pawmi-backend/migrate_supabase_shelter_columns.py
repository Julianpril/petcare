"""
Script de migración para agregar columnas de refugio a la tabla users en SUPABASE
Ejecutar: python migrate_supabase_shelter_columns.py
"""
import traceback

import psycopg2
from psycopg2 import sql

# Configuración de Supabase
SUPABASE_CONFIG = {
    'host': 'db.jnttxcptkmokdwglxqpu.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'PawMi2502..'
}

def run_migration():
    """Ejecuta la migración para agregar columnas de refugio en Supabase"""
    conn = None
    try:
        print("=" * 60)
        print("MIGRACIÓN SUPABASE: Agregar columnas de refugio a tabla users")
        print("=" * 60)
        print("🔌 Conectando a Supabase...")
        conn = psycopg2.connect(**SUPABASE_CONFIG)
        cursor = conn.cursor()
        
        # Verificar columnas existentes
        print("🔍 Verificando columnas existentes...")
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'users' 
              AND column_name IN ('shelter_name', 'shelter_description', 'shelter_license', 'is_verified_shelter')
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        print(f"📝 Columnas existentes: {existing_columns}")
        
        # Si todas las columnas ya existen, salir
        if len(existing_columns) == 4:
            print("✅ Todas las columnas ya existen. No es necesario migrar.")
            return
        
        # Agregar columnas faltantes
        print("➕ Agregando columnas faltantes...")
        
        alter_statements = []
        
        if 'shelter_name' not in existing_columns:
            alter_statements.append("ADD COLUMN shelter_name VARCHAR(255)")
        
        if 'shelter_description' not in existing_columns:
            alter_statements.append("ADD COLUMN shelter_description TEXT")
        
        if 'shelter_license' not in existing_columns:
            alter_statements.append("ADD COLUMN shelter_license VARCHAR(100)")
        
        if 'is_verified_shelter' not in existing_columns:
            alter_statements.append("ADD COLUMN is_verified_shelter BOOLEAN DEFAULT FALSE")
        
        if alter_statements:
            # Ejecutar ALTER TABLE con todas las columnas de una vez
            alter_query = f"ALTER TABLE users {', '.join(alter_statements)}"
            cursor.execute(alter_query)
            conn.commit()
            print("✅ Columnas agregadas exitosamente")
        
        # Verificar resultado final
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
              AND table_name = 'users' 
              AND column_name IN ('shelter_name', 'shelter_description', 'shelter_license', 'is_verified_shelter')
            ORDER BY column_name
        """)
        
        print("\n📋 Columnas de refugio en la tabla users (Supabase):")
        for row in cursor.fetchall():
            column_name, data_type, is_nullable, default = row
            print(f"  - {column_name}: {data_type} (nullable: {is_nullable}, default: {default})")
        
        cursor.close()
        print("\n🔌 Conexión cerrada")
        
    except Exception as e:
        print(f"❌ Error de base de datos: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()
    
    print("=" * 60)
    print("✅ Migración completada")
    print("💡 Ahora puedes reiniciar el backend con: uvicorn app.main:app --reload")
    print("=" * 60)

if __name__ == "__main__":
    run_migration()
