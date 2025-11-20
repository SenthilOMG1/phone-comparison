import { PhoneSearchResult } from '../../types';
import { SearchResultItem } from './SearchResultItem';
import { Card } from '../ui';

interface SearchResultsProps {
  results: PhoneSearchResult[];
  onSelect: (result: PhoneSearchResult) => void;
  isSearching: boolean;
}

export function SearchResults({ results, onSelect, isSearching }: SearchResultsProps) {
  if (isSearching) {
    return (
      <Card className="absolute top-full left-0 right-0 mt-2 p-4 z-50">
        <p className="text-center text-neutral-600">Searching...</p>
      </Card>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 p-2 z-50 max-h-96 overflow-y-auto">
      <div className="space-y-1">
        {results.map((result) => (
          <SearchResultItem key={result.phone.id} result={result} onClick={onSelect} />
        ))}
      </div>
    </Card>
  );
}
