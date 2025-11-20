import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, X, ArrowRight } from 'lucide-react';
import { PhoneSearchResult } from '../../types';
import { useSearch } from '../../hooks';

export function Home() {
  const navigate = useNavigate();
  const [selectedPhones, setSelectedPhones] = useState<PhoneSearchResult[]>([]);
  const { query, setQuery, results, isSearching, clearSearch } = useSearch();

  const handlePhoneSelect = (result: PhoneSearchResult) => {
    // Don't add duplicates
    if (selectedPhones.find(p => p.phone.id === result.phone.id)) {
      return;
    }

    // Max 6 phones
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
    navigate(`/compare?phones=${phoneIds}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Ultra-thin Header */}
      <header className="border-b border-slate-200/50 backdrop-blur-md bg-white/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              MobiMEA
            </span>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
          >
            Admin
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <section className="pt-20 pb-12 px-6">
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
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemovePhone(result.phone.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={14} />
                    </button>

                    {/* Phone Number Badge */}
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

                    {/* Quick Specs */}
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

                {/* Empty Slots */}
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

          {/* Empty State */}
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
