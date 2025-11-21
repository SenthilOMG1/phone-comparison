"""
Clear all data from Supabase to start fresh
Keeps table structure, removes all records
"""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_manager_supabase import DatabaseManager

def clear_all_data():
    """Clear all data from database tables"""
    db = DatabaseManager()

    print("\n" + "="*80)
    print("CLEARING ALL DATABASE DATA")
    print("="*80 + "\n")

    try:
        # Delete in correct order (respecting foreign keys)
        print("[1/5] Clearing prices...")
        result = db.client.table('prices').delete().gt('recorded_at', '1900-01-01').execute()
        print(f"      Deleted {len(result.data) if result.data else 'all'} price records")

        print("[2/5] Clearing promotions...")
        result = db.client.table('promotions').delete().neq('id', 0).execute()
        print(f"      Deleted {len(result.data) if result.data else 'all'} promotions")

        print("[3/5] Clearing retailer_links...")
        result = db.client.table('retailer_links').delete().neq('id', 0).execute()
        print(f"      Deleted {len(result.data) if result.data else 'all'} retailer links")

        print("[4/5] Clearing products...")
        result = db.client.table('products').delete().neq('id', 0).execute()
        print(f"      Deleted {len(result.data) if result.data else 'all'} products")

        print("[5/5] Clearing scraper_logs...")
        result = db.client.table('scraper_logs').delete().neq('id', 0).execute()
        print(f"      Deleted {len(result.data) if result.data else 'all'} scraper logs")

        print("\n" + "="*80)
        print("[SUCCESS] DATABASE CLEARED SUCCESSFULLY")
        print("="*80 + "\n")
        print("Ready to populate with fresh scraped data!")
        print("Run: python scrapers/unified_scraper_orchestrator.py\n")

    except Exception as e:
        print(f"\n[ERROR] {e}\n")
        raise

if __name__ == '__main__':
    confirm = input("[WARNING] This will DELETE ALL DATA from the database. Continue? (yes/no): ")

    if confirm.lower() == 'yes':
        clear_all_data()
    else:
        print("\nCancelled. No data was deleted.\n")
