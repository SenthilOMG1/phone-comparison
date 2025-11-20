import { PhoneSearchResult } from '../../types';
import { SearchBar, SearchResults } from '../../components/search';
import { useSearch } from '../../hooks';

interface HeroSectionProps {
  onPhoneSelect: (result: PhoneSearchResult) => void;
}

export function HeroSection({ onPhoneSelect }: HeroSectionProps) {
  const { query, setQuery, results, isSearching, clearSearch } = useSearch();

  const handleSelect = (result: PhoneSearchResult) => {
    onPhoneSelect(result);
    clearSearch();
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-4">
          Compare Honor Phones
        </h1>
        <p className="text-xl text-neutral-600 mb-8">
          Data-driven comparisons powered by real benchmarks and expert testing
        </p>

        <div className="relative max-w-2xl mx-auto">
          <SearchBar
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={clearSearch}
            showClear={!!query}
            placeholder="Search for any phone (e.g., Magic 6 Pro, Galaxy S24)..."
          />
          <SearchResults results={results} onSelect={handleSelect} isSearching={isSearching} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <span className="text-sm text-neutral-500">Popular searches:</span>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Magic 6 Pro
          </button>
          <span className="text-neutral-300">•</span>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Honor 90 Pro
          </button>
          <span className="text-neutral-300">•</span>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Galaxy S24 Ultra
          </button>
        </div>
      </div>
    </section>
  );
}
