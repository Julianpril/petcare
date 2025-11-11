"""
Script para sincronizar el esquema de la base de datos local con Supabase
Agrega columnas faltantes que existen en Supabase pero no en local
"""
import traceback

import psycopg2

LOCAL_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'database': 'pawMi_db',
    'user': 'postgres',
    'password': '2502'
}

def run_schema_sync():
    """Actualiza el esquema local para que coincida con Supabase"""
    conn = None
    try:
        print("=" * 70)
        print("ACTUALIZACIÓN DE ESQUEMA: PostgreSQL Local")
        print("=" * 70)
        
        print("\n🔌 Conectando a PostgreSQL Local...")
        conn = psycopg2.connect(**LOCAL_CONFIG)
        cursor = conn.cursor()
        print("✅ Conectado")
        
        # Agregar columna is_for_adoption a pets
        print("\n📝 Agregando columna is_for_adoption a tabla pets...")
        try:
            cursor.execute("""
                ALTER TABLE pets 
                ADD COLUMN IF NOT EXISTS is_for_adoption BOOLEAN DEFAULT FALSE
            """)
            conn.commit()
            print("✅ Columna is_for_adoption agregada")
        except Exception as e:
            print(f"⚠️  {e}")
            conn.rollback()
        
        # Verificar resultado
        cursor.execute("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'pets' 
              AND column_name = 'is_for_adoption'
        """)
        result = cursor.fetchone()
        if result:
            print(f"✅ Columna verificada: {result[0]} ({result[1]})")
        
        cursor.close()
        print("\n🔌 Conexión cerrada")
        
        print("\n" + "=" * 70)
        print("✅ ESQUEMA ACTUALIZADO")
        print("💡 Ahora ejecuta: python sync_supabase_to_local.py")
        print("=" * 70)
        
    except Exception as e:
        print(f"\n❌ Error: {type(e).__name__}")
        print(f"   Detalles: {str(e)}")
        traceback.print_exc()
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_schema_sync()
