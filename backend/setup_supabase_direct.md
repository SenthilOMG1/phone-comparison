# Set Up Supabase Database

## Quick Setup - Use Supabase SQL Editor

1. Go to your Supabase Dashboard:
   https://supabase.com/dashboard/project/vdyhrjlqqfrsvqnilkuc

2. Click "SQL Editor" in the left sidebar

3. Click "New Query"

4. Copy and paste the entire contents of:
   `backend/database/schema_supabase.sql`

5. Click "Run" or press Ctrl+Enter

That's it! The database will be set up with all tables, retailers, and views.

## What Gets Created:

- **Tables**: products, retailers, retailer_links, prices, promotions, scraper_logs
- **6 Retailers**: Courts Mauritius, Galaxy, Price Guru, 361 Degrees, Emtel, JKalachand
- **Views**: latest_prices, dashboard_stats
- **Indexes**: For fast queries

## After Running the Schema:

The Admin Panel will connect to Supabase and show real data once we run the scrapers!

---

## Troubleshooting Connection String

If you need the correct DATABASE_URL for .env, get it from:
Supabase Dashboard > Settings > Database > Connection String > URI

Format should be:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Make sure to URL-encode special characters in password (@ becomes %40).
