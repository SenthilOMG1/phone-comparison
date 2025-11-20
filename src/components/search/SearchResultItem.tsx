import { PhoneSearchResult } from '../../types';
import { Badge } from '../ui';
import { formatCurrency } from '../../utils';

interface SearchResultItemProps {
  result: PhoneSearchResult;
  onClick: (result: PhoneSearchResult) => void;
}

export function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const { phone, confidence, matchType } = result;

  const getBadgeVariant = () => {
    if (matchType === 'exact') return 'success';
    if (matchType === 'fuzzy') return 'primary';
    return 'neutral';
  };

  return (
    <button
      onClick={() => onClick(result)}
      className="w-full flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors text-left"
    >
      <img
        src={phone.images.hero}
        alt={`${phone.brand} ${phone.model}`}
        className="w-16 h-16 object-cover rounded-lg"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-neutral-900 truncate">
            {phone.brand} {phone.model}
          </h4>
          <Badge size="sm" variant={getBadgeVariant()}>
            {Math.round(confidence * 100)}%
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-sm text-neutral-600">
          <span>{phone.specs.camera.main.megapixels}MP</span>
          <span>{phone.specs.battery.capacityMah}mAh</span>
          <span>{phone.specs.display.refreshRate}Hz</span>
        </div>
      </div>

      {phone.pricing && phone.pricing[0] && (
        <div className="text-right">
          <p className="font-semibold text-neutral-900">
            {formatCurrency(phone.pricing[0].basePrice, phone.pricing[0].currency)}
          </p>
        </div>
      )}
    </button>
  );
}
