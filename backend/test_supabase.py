"""Test Supabase connection"""
import os
from dotenv import load_dotenv
import psycopg2

load_dotenv()

try:
    print("Connecting to Supabase...")
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    print("✓ Connection successful!")

    cursor = conn.cursor()
    cursor.execute('SELECT version()')
    version = cursor.fetchone()[0]
    print(f"PostgreSQL version: {version[:80]}")

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
    print("\n✓ Test complete!")

except Exception as e:
    print(f"✗ Connection failed: {e}")
