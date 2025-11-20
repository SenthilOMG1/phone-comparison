"""Check Supabase database connection and tables"""
from supabase import create_client, Client
import sys
import io

# Fix encoding for Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

SUPABASE_URL = "https://vdyhrjlqqfrsvqnilkuc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWhyamxxcWZyc3Zxbmlsa3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzM4ODIsImV4cCI6MjA3OTIwOTg4Mn0.M7So3WVB9TFyg8a-f8c5822wJ0y2Jcjk1RCuQWMuVEI"

try:
    print("Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("SUCCESS - Connected!\n")

    # Check retailers table
    print("Checking retailers table...")
    try:
        retailers = supabase.table('retailers').select('*').execute()
        if retailers.data:
            print(f"✓ Retailers table exists with {len(retailers.data)} retailers:")
            for r in retailers.data:
                print(f"  - {r['name']}")
        else:
            print("✓ Retailers table exists but is empty")
    except Exception as e:
        print(f"✗ Retailers table not found or error: {e}")

    # Check products table
    print("\nChecking products table...")
    try:
        products = supabase.table('products').select('id').execute()
        print(f"✓ Products table exists with {len(products.data)} products")
    except Exception as e:
        print(f"✗ Products table not found or error: {e}")

    # Check scraper_logs table
    print("\nChecking scraper_logs table...")
    try:
        logs = supabase.table('scraper_logs').select('id').execute()
        print(f"✓ Scraper_logs table exists with {len(logs.data)} logs")
    except Exception as e:
        print(f"✗ Scraper_logs table not found or error: {e}")

    print("\nDatabase check complete!")

except Exception as e:
    print(f"ERROR connecting to Supabase: {e}")
    import traceback
    traceback.print_exc()
