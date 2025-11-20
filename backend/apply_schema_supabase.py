"""Apply Supabase schema using Supabase client"""
from supabase import create_client, Client

SUPABASE_URL = "https://vdyhrjlqqfrsvqnilkuc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWhyamxxcWZyc3Zxbmlsa3VjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzMzg4MiwiZXhwIjoyMDc5MjA5ODgyfQ.YourActualServiceRoleKey"

# Read the schema file
with open('database/schema_supabase.sql', 'r') as f:
    schema_sql = f.read()

try:
    print("Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Applying schema using SQL...")
    # Execute the schema SQL
    response = supabase.postgrest.rpc('exec_sql', {'query': schema_sql}).execute()

    print("SUCCESS - Schema applied!")

    # Verify retailers were created
    retailers = supabase.table('retailers').select('name').execute()
    print(f"\nRetailers configured ({len(retailers.data)}):")
    for retailer in retailers.data:
        print(f"  - {retailer['name']}")

    print("\nDatabase setup complete!")

except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
