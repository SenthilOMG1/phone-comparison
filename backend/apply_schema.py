"""Apply Supabase schema"""
import psycopg2
from urllib.parse import quote_plus

# Connection string with URL-encoded password (@ becomes %40)
DATABASE_URL = "postgresql://postgres:Mobi%402025@db.vdyhrjlqqfrsvqnilkuc.supabase.co:5432/postgres"

# Read the schema file
with open('database/schema_supabase.sql', 'r') as f:
    schema_sql = f.read()

try:
    print("Connecting to Supabase...")
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cursor = conn.cursor()

    print("Applying schema...")
    cursor.execute(schema_sql)

    print("SUCCESS - Schema applied!")

    # Verify tables were created
    cursor.execute("""
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
    """)
    tables = cursor.fetchall()
    print(f"\nCreated tables ({len(tables)}):")
    for table in tables:
        print(f"  - {table[0]}")

    # Check retailers
    cursor.execute("SELECT name FROM retailers")
    retailers = cursor.fetchall()
    print(f"\nRetailers configured ({len(retailers)}):")
    for retailer in retailers:
        print(f"  - {retailer[0]}")

    conn.close()
    print("\nDatabase setup complete!")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
