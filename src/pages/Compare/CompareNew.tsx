import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Zap, X, ArrowRight } from 'lucide-react';
import { Phone, PhoneSearchResult, PersonaType } from '../../types';
import { getPhoneById } from '../../services/search';
import { usePersona, useSearch } from '../../hooks';

export function Compare() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activePersona, setActivePersona } = usePersona();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Phone selector state
  const [selectedPhones, setSelectedPhones] = useState<PhoneSearchResult[]>([]);
  const { query, setQuery, results, isSearching, clearSearch } = useSearch();

  useEffect(() => {
    const phonesParam = searchParams.get('phones');

    if (!phonesParam) {
      setIsLoading(false);
      return;
    }

    const phoneIds = phonesParam.split(',');
    const loadedPhones = phoneIds
      .map(id => getPhoneById(id))
      .filter((phone): phone is Phone => phone !== undefined);

    if (loadedPhones.length < 2) {
      setIsLoading(false);
      return;
    }

    setPhones(loadedPhones);
    setIsLoading(false);
  }, [searchParams]);

  const handlePhoneSelect = (result: PhoneSearchResult) => {
    if (selectedPhones.find(p => p.phone.id === result.phone.id)) {
      return;
    }

    if (selectedPhones.length >= 6) {
      return;
    }

    setSelectedPhones([...selectedPhones, result]);
    clearSearch();
  };

  const handleRemovePhone = (phoneId: string) => {
    setSelectedPhones(selectedPhones.filter(p => p.phone.id !== phoneId));
  };

  const handleCompare = () => {
    if (selectedPhones.length < 2) return;

    const phoneIds = selectedPhones.map(p => p.phone.id).join(',');
    setSearchParams({ phones: phoneIds });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  // Show phone selector if no phones to compare
  if (phones.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        {/* Main Dashboard */}
        <section className="pt-12 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Compare Up To
                </span>{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  6 Phones
                </span>
              </h1>
              <p className="text-lg text-slate-600">
                Select phones and get instant AI-powered insights
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity blur-xl"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                  <div className="flex items-center gap-4 px-6 py-5">
                    <Search size={24} className="text-slate-400" />
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search phones... (Magic 6 Pro, Galaxy S24, Xiaomi 14)"
                      className="flex-1 text-lg outline-none text-slate-900 placeholder:text-slate-400"
                    />
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {results.length > 0 && (
                    <div className="border-t border-slate-100 max-h-96 overflow-y-auto">
                      {results.map((result) => (
                        <button
                          key={result.phone.id}
                          onClick={() => handlePhoneSelect(result)}
                          disabled={selectedPhones.find(p => p.phone.id === result.phone.id) !== undefined}
                          className="w-full px-6 py-4 hover:bg-slate-50 transition-colors text-left flex items-center justify-between group/item disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <span className="text-2xl">{result.phone.brand === 'Honor' ? '🏆' : '📱'}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 group-hover/item:text-blue-600 transition-colors">
                                {result.phone.brand} {result.phone.model}
                              </div>
                              <div className="text-sm text-slate-500">
                                {result.phone.pricing?.[0]?.currency} {result.phone.pricing?.[0]?.basePrice.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          {selectedPhones.find(p => p.phone.id === result.phone.id) ? (
                            <span className="text-sm font-medium text-green-600">✓ Selected</span>
                          ) : (
                            <ArrowRight size={20} className="text-slate-300 group-hover/item:text-blue-600 transition-colors" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected Phones Grid */}
            {selectedPhones.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Selected Phones ({selectedPhones.length}/6)
                  </h2>
                  {selectedPhones.length >= 2 && (
                    <button
                      onClick={handleCompare}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center gap-2"
                    >
                      Compare Now
                      <ArrowRight size={20} />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedPhones.map((result, index) => (
                    <div
                      key={result.phone.id}
                      className="relative group p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all duration-300"
                    >
                      <button
                        onClick={() => handleRemovePhone(result.phone.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={14} />
                      </button>

                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                        {index + 1}
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-3xl">{result.phone.brand === 'Honor' ? '🏆' : '📱'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {result.phone.brand}
                          </h3>
                          <p className="text-sm text-slate-600 truncate">{result.phone.model}</p>
                          <p className="text-sm font-semibold text-blue-600 mt-1">
                            {result.phone.pricing?.[0]?.currency} {result.phone.pricing?.[0]?.basePrice.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-slate-500">Display</div>
                          <div className="font-semibold text-slate-900">{result.phone.specs.display.sizeInches}"</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500">Battery</div>
                          <div className="font-semibold text-slate-900">{result.phone.specs.battery.capacityMah}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-500">Camera</div>
                          <div className="font-semibold text-slate-900">{result.phone.specs.camera.main.megapixels}MP</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: 6 - selectedPhones.length }).map((_, i) => (
                    <div
                      key={`empty-${i}`}
                      className="p-4 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center min-h-[140px]"
                    >
                      <div className="text-center text-slate-400">
                        <div className="text-3xl mb-2">+</div>
                        <div className="text-sm">Add Phone</div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPhones.length === 1 && (
                  <div className="mt-4 text-center text-sm text-slate-500">
                    Select at least one more phone to compare
                  </div>
                )}
              </div>
            )}

            {selectedPhones.length === 0 && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No Phones Selected
                </h3>
                <p className="text-slate-600">
                  Search and select phones to start comparing
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  // Show actual comparison - load dynamically
  // For now, show a placeholder
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowRight className="rotate-180" size={20} />
            Change Selection
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-6">
            Comparing {phones.length} Phones
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phones.map((phone) => (
              <div key={phone.id} className="p-6 bg-slate-50 rounded-xl">
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {phone.brand} {phone.model}
                </h3>
                <p className="text-slate-600">
                  {phone.pricing?.[0]?.currency} {phone.pricing?.[0]?.basePrice.toLocaleString()}
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div>Display: {phone.specs.display.sizeInches}" {phone.specs.display.type}</div>
                  <div>Battery: {phone.specs.battery.capacityMah}mAh</div>
                  <div>Camera: {phone.specs.camera.main.megapixels}MP</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-slate-500">
            Full comparison view coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
