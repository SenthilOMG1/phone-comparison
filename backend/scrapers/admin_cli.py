"""
Admin CLI for scraper configuration
Quick way to toggle between agentic and hybrid modes
"""

import sys
from scraper_config import (
    get_scraper_mode, set_scraper_mode, load_settings, save_settings,
    get_enabled_retailers, get_max_products
)

def print_current_config():
    """Display current scraper configuration"""
    settings = load_settings()
    mode = settings.get('mode', 'agentic')
    max_products = settings.get('max_products', 50)
    retailers = settings.get('retailers', {})

    print("\n" + "="*60)
    print("SCRAPER CONFIGURATION")
    print("="*60)
    print(f"\nMode: {mode.upper()}")
    print(f"Max products per scrape: {max_products}")
    print("\nRetailers:")

    for name, config in retailers.items():
        status = "✓ ENABLED" if config.get('enabled') else "✗ DISABLED"
        print(f"  {status:12} {name}")
        print(f"              {config.get('url')}")

    print("="*60 + "\n")

def toggle_mode():
    """Toggle between agentic and hybrid"""
    current = get_scraper_mode()
    new_mode = 'hybrid' if current == 'agentic' else 'agentic'
    set_scraper_mode(new_mode)
    print(f"✓ Mode changed: {current} → {new_mode}")

def set_mode_interactive():
    """Interactively set scraper mode"""
    print("\nChoose scraper mode:")
    print("  1. Agentic (AI controls browser - more detailed, slower)")
    print("  2. Hybrid  (Playwright + AI - faster, reliable)")

    choice = input("\nEnter choice (1 or 2): ").strip()

    if choice == '1':
        set_scraper_mode('agentic')
        print("✓ Mode set to AGENTIC")
    elif choice == '2':
        set_scraper_mode('hybrid')
        print("✓ Mode set to HYBRID")
    else:
        print("✗ Invalid choice")

def toggle_retailer():
    """Enable/disable a retailer"""
    settings = load_settings()
    retailers = settings.get('retailers', {})

    print("\nRetailers:")
    retailer_list = list(retailers.keys())
    for i, name in enumerate(retailer_list, 1):
        status = "ENABLED" if retailers[name].get('enabled') else "DISABLED"
        print(f"  {i}. [{status:8}] {name}")

    choice = input("\nEnter retailer number to toggle (or 0 to cancel): ").strip()

    try:
        idx = int(choice) - 1
        if 0 <= idx < len(retailer_list):
            retailer_name = retailer_list[idx]
            current = retailers[retailer_name].get('enabled', False)
            retailers[retailer_name]['enabled'] = not current
            save_settings(settings)
            status = "ENABLED" if not current else "DISABLED"
            print(f"✓ {retailer_name} is now {status}")
        elif choice == '0':
            print("Cancelled")
        else:
            print("✗ Invalid choice")
    except ValueError:
        print("✗ Invalid input")

def set_max_products():
    """Set max products per scrape"""
    current = get_max_products()
    print(f"\nCurrent max products: {current}")

    try:
        new_max = input("Enter new max (or press Enter to keep current): ").strip()
        if new_max:
            new_max = int(new_max)
            settings = load_settings()
            settings['max_products'] = new_max
            save_settings(settings)
            print(f"✓ Max products set to {new_max}")
        else:
            print("Keeping current value")
    except ValueError:
        print("✗ Invalid number")

def main_menu():
    """Main menu"""
    while True:
        print_current_config()
        print("ADMIN MENU")
        print("-" * 60)
        print("  1. Toggle mode (agentic ↔ hybrid)")
        print("  2. Set mode interactively")
        print("  3. Enable/disable retailer")
        print("  4. Set max products per scrape")
        print("  5. Exit")
        print("-" * 60)

        choice = input("\nEnter choice: ").strip()

        if choice == '1':
            toggle_mode()
        elif choice == '2':
            set_mode_interactive()
        elif choice == '3':
            toggle_retailer()
        elif choice == '4':
            set_max_products()
        elif choice == '5':
            print("\nGoodbye!\n")
            break
        else:
            print("\n✗ Invalid choice\n")

        input("\nPress Enter to continue...")
        print("\n" * 2)

if __name__ == '__main__':
    try:
        main_menu()
    except KeyboardInterrupt:
        print("\n\nExiting...\n")
        sys.exit(0)
