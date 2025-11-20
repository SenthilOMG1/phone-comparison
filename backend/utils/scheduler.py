"""
Automated Scheduler for running scrapers at specific intervals
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scrapers.scraper_orchestrator import ScraperOrchestrator
from datetime import datetime

class ScraperScheduler:
    """Schedule automated scraping jobs"""

    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.orchestrator = ScraperOrchestrator()

    async def scrape_job(self):
        """Job to run all scrapers"""
        print(f"\n{'='*60}")
        print(f"SCHEDULED SCRAPE JOB - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}\n")

        try:
            await self.orchestrator.run_all_scrapers()
        except Exception as e:
            print(f"Scrape job failed: {e}")

    def start(self):
        """Start the scheduler"""

        # Schedule scrapers to run every 6 hours
        # At: 6 AM, 12 PM, 6 PM, 12 AM Mauritius time
        self.scheduler.add_job(
            self.scrape_job,
            CronTrigger(hour='6,12,18,0', minute=0),
            id='scraper_6hour',
            name='Run all scrapers every 6 hours',
            replace_existing=True
        )

        # Optional: Daily full scrape at 2 AM (low traffic time)
        self.scheduler.add_job(
            self.scrape_job,
            CronTrigger(hour=2, minute=0),
            id='scraper_daily',
            name='Daily full scrape at 2 AM',
            replace_existing=True
        )

        self.scheduler.start()
        print("Scheduler started!")
        print("Scraping schedule:")
        print("  - Every 6 hours: 6 AM, 12 PM, 6 PM, 12 AM")
        print("  - Full daily scrape: 2 AM")
        print()

    def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        print("Scheduler stopped")

    async def run_forever(self):
        """Keep scheduler running"""
        self.start()

        try:
            # Keep the script running
            while True:
                await asyncio.sleep(1)
        except (KeyboardInterrupt, SystemExit):
            self.stop()


async def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='MobiMEA Scraper Scheduler')
    parser.add_argument('--now', action='store_true', help='Run scrape immediately then start scheduler')
    parser.add_argument('--once', action='store_true', help='Run scrape once and exit (no scheduling)')

    args = parser.parse_args()

    scheduler = ScraperScheduler()

    if args.once:
        # Just run once
        await scheduler.scrape_job()
    else:
        # Run immediately if requested
        if args.now:
            print("Running initial scrape...")
            await scheduler.scrape_job()

        # Start scheduler
        print("\nStarting scheduler...")
        await scheduler.run_forever()


if __name__ == '__main__':
    print("="*60)
    print("MOBIMEA SCRAPER SCHEDULER")
    print("="*60)
    print()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nShutting down...")
