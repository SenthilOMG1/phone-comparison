import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivePromotions } from '../../services/api';
import { Card } from '../../components/ui';
import { Tag, Filter, ExternalLink, Calendar, Percent, AlertCircle } from 'lucide-react';

export function Promotions() {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['promotions', selectedBrand, selectedRetailer],
    queryFn: () =>
      getActivePromotions(
        selectedBrand || undefined,
        selectedRetailer || undefined
      ),
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Extract unique brands and retailers for filters
  const brands = data
    ? Array.from(new Set(data.promotions.map((p) => p.brand))).sort()
    : [];
  const retailers = data
    ? Array.from(new Set(data.promotions.map((p) => p.retailer))).sort()
    : [];

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Unable to Load Promotions
            </h2>
            <p className="text-gray-600">
              Make sure the backend API is running at http://localhost:8000
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Tag className="w-8 h-8 text-orange-500" />
            Active Promotions
          </h1>
          <p className="text-gray-600 mt-2">
            Current deals and offers from Mauritius retailers
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retailer
              </label>
              <select
                value={selectedRetailer}
                onChange={(e) => setSelectedRetailer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Retailers</option>
                {retailers.map((retailer) => (
                  <option key={retailer} value={retailer}>
                    {retailer}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(selectedBrand || selectedRetailer) && (
            <button
              onClick={() => {
                setSelectedBrand('');
                setSelectedRetailer('');
              }}
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </Card>

        {/* Promotions Count */}
        {!isLoading && data && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{data.promotions.length}</span> active
              promotion{data.promotions.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </Card>
            ))}
          </div>
        )}

        {/* Promotions Grid */}
        {!isLoading && data && data.promotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.promotions.map((promo) => (
              <PromotionCard key={promo.id} promotion={promo} />
            ))}
          </div>
        ) : !isLoading ? (
          <Card className="p-12 text-center">
            <Tag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Promotions Found
            </h3>
            <p className="text-gray-600">
              {selectedBrand || selectedRetailer
                ? 'Try adjusting your filters'
                : 'No active promotions at the moment'}
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

interface PromotionCardProps {
  promotion: {
    id: number;
    product_name: string;
    brand: string;
    retailer: string;
    title: string;
    description: string | null;
    discount_percentage: number | null;
    original_price: number | null;
    discounted_price: number;
    valid_from: string;
    valid_until: string | null;
    source_url: string | null;
  };
}

function PromotionCard({ promotion }: PromotionCardProps) {
  const validUntil = promotion.valid_until
    ? new Date(promotion.valid_until)
    : null;
  const isExpiringSoon =
    validUntil && validUntil.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200 flex flex-col">
      {/* Discount Badge */}
      {promotion.discount_percentage && (
        <div className="flex justify-end mb-2">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <Percent className="w-4 h-4" />
            {promotion.discount_percentage}% OFF
          </span>
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
        {promotion.title}
      </h3>

      {/* Product and Brand */}
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-700">{promotion.product_name}</p>
        <p className="text-xs text-gray-500">{promotion.brand}</p>
      </div>

      {/* Description */}
      {promotion.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
          {promotion.description}
        </p>
      )}

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-orange-600">
            MUR {promotion.discounted_price.toLocaleString('en-MU')}
          </span>
          {promotion.original_price && promotion.original_price > promotion.discounted_price && (
            <span className="text-sm text-gray-500 line-through">
              MUR {promotion.original_price.toLocaleString('en-MU')}
            </span>
          )}
        </div>
        {promotion.original_price && promotion.original_price > promotion.discounted_price && (
          <p className="text-sm text-green-600 font-medium mt-1">
            Save MUR{' '}
            {(promotion.original_price - promotion.discounted_price).toLocaleString('en-MU')}
          </p>
        )}
      </div>

      {/* Retailer */}
      <div className="mb-4">
        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
          {promotion.retailer}
        </span>
      </div>

      {/* Validity Period */}
      <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>
          {validUntil ? (
            <>
              Valid until {validUntil.toLocaleDateString('en-MU')}
              {isExpiringSoon && (
                <span className="ml-2 text-orange-600 font-semibold">
                  (Expires soon!)
                </span>
              )}
            </>
          ) : (
            'Ongoing promotion'
          )}
        </span>
      </div>

      {/* Link to Product */}
      {promotion.source_url && (
        <a
          href={promotion.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          View on {promotion.retailer}
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </Card>
  );
}
