"""
Script de migración para agregar columnas de refugio a la tabla users
Ejecutar: python migrate_add_shelter_columns.py
"""
import psycopg2
from psycopg2 import sql

# Configuración de la base de datos local
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pawMi_db',
    'user': 'postgres',
    'password': '2502'  # Contraseña de PostgreSQL
}

def run_migration():
    """Ejecuta la migración para agregar columnas de refugio"""
    conn = None
    try:
        # Conectar a la base de datos
        print("🔌 Conectando a la base de datos...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        
        # Verificar si las columnas ya existen
        print("🔍 Verificando columnas existentes...")
        cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
              AND column_name IN ('shelter_name', 'shelter_description', 'shelter_license', 'is_verified_shelter')
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]
        
        if len(existing_columns) == 4:
            print("✅ Las columnas de refugio ya existen en la tabla users")
            return
        
        print(f"📝 Columnas existentes: {existing_columns}")
        print("➕ Agregando columnas faltantes...")
        
        # Agregar las columnas
        cursor.execute("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS shelter_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS shelter_description TEXT,
            ADD COLUMN IF NOT EXISTS shelter_license VARCHAR(100),
            ADD COLUMN IF NOT EXISTS is_verified_shelter BOOLEAN DEFAULT FALSE;
        """)
        
        # Confirmar cambios
        conn.commit()
        print("✅ Columnas agregadas exitosamente")
        
        # Verificar las columnas agregadas
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'users' 
              AND column_name IN ('shelter_name', 'shelter_description', 'shelter_license', 'is_verified_shelter')
            ORDER BY column_name
        """)
        
        print("\n📋 Columnas de refugio en la tabla users:")
        for row in cursor.fetchall():
            print(f"  - {row[0]}: {row[1]} (nullable: {row[2]}, default: {row[3]})")
        
        cursor.close()
        
    except psycopg2.Error as e:
        print(f"❌ Error de base de datos: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        if conn:
            conn.rollback()
    except Exception as e:
        print(f"❌ Error: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()
            print("\n🔌 Conexión cerrada")

if __name__ == "__main__":
    print("=" * 60)
    print("MIGRACIÓN: Agregar columnas de refugio a tabla users")
    print("=" * 60)
    run_migration()
    print("=" * 60)
    print("✅ Migración completada")
    print("💡 Ahora puedes reiniciar el backend con: uvicorn app.main:app --reload")
