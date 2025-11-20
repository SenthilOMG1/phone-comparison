"""Simple Supabase connection test"""
import psycopg2

# Connection string from .env
DATABASE_URL = "postgresql://postgres.vdyhrjlqqfrsvqnilkuc:Mobi@2025@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

try:
    print("Connecting to Supabase...")
    conn = psycopg2.connect(DATABASE_URL)
    print("SUCCESS - Connection established!")

    cursor = conn.cursor()
    cursor.execute('SELECT version()')
    version = cursor.fetchone()[0]
    print(f"\nPostgreSQL version: {version[:80]}")

    # List existing tables
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print(f"\nExisting tables: {len(tables)}")
    for table in tables:
        print(f"  - {table[0]}")

    conn.close()
    print("\nTest complete!")

except Exception as e:
    print(f"ERROR - Connection failed: {e}")
