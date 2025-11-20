import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { Phone, PersonaType } from '../../types';
import { getPhoneById } from '../../services/search';
import { usePersona } from '../../hooks';

export function Compare() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activePersona, setActivePersona } = usePersona();
  const [phones, setPhones] = useState<Phone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (phones.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Not Enough Phones</h2>
          <p className="text-slate-600">Please select at least 2 phones to compare.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const personas: { id: PersonaType; name: string; icon: string }[] = [
    { id: 'photographer', name: 'Photographer', icon: '📷' },
    { id: 'gamer', name: 'Gamer', icon: '🎮' },
    { id: 'battery', name: 'Battery User', icon: '🔋' },
    { id: 'value', name: 'Budget Buyer', icon: '💰' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200/50 backdrop-blur-md bg-white/60 sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              MobiMEA
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-full mx-auto px-6 py-12 space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Comparing {phones.length} Phones
          </h1>
          <p className="text-slate-600">Side-by-side specifications comparison</p>
        </div>

        {/* Persona Selector */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Select Your Profile</h3>
          <div className="flex flex-wrap gap-3">
            {personas.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setActivePersona(persona.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activePersona === persona.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="mr-2">{persona.icon}</span>
                {persona.name}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-200 bg-slate-50">
                  <th className="text-left p-4 font-semibold text-slate-900 sticky left-0 bg-slate-50 z-10 min-w-[200px]">
                    Specification
                  </th>
                  {phones.map((phone, index) => (
                    <th key={phone.id} className="p-4 text-center min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{phone.brand === 'Honor' ? '🏆' : '📱'}</span>
                        </div>
                        <div className="font-bold text-slate-900">{phone.brand}</div>
                        <div className="text-sm text-slate-600">{phone.model}</div>
                        <div className="text-xs font-semibold text-blue-600">
                          {phone.pricing?.[0]?.currency} {phone.pricing?.[0]?.basePrice.toLocaleString()}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Display */}
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td colSpan={phones.length + 1} className="p-3 font-bold text-slate-900 sticky left-0 bg-slate-50">
                    Display
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Size</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center font-semibold">
                      {phone.specs.display.sizeInches}"
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Type</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.display.type}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Refresh Rate</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.display.refreshRate}Hz</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Peak Brightness</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.display.peakBrightness} nits</td>
                  ))}
                </tr>

                {/* Camera */}
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td colSpan={phones.length + 1} className="p-3 font-bold text-slate-900 sticky left-0 bg-slate-50">
                    Camera
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Main Camera</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center font-semibold">
                      {phone.specs.camera.main.megapixels}MP f/{phone.specs.camera.main.aperture}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Stabilization</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.camera.main.stabilization || 'N/A'}</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Front Camera</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.camera.front.megapixels}MP</td>
                  ))}
                </tr>

                {/* Performance */}
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td colSpan={phones.length + 1} className="p-3 font-bold text-slate-900 sticky left-0 bg-slate-50">
                    Performance
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Processor</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center font-semibold">
                      {phone.specs.soc.family} {phone.specs.soc.model}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">RAM</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.ram.join('/')}GB</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">AnTuTu</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center font-semibold text-blue-600">
                      {phone.benchmarks?.antutu?.total?.median ? `${Math.round(phone.benchmarks.antutu.total.median / 1000)}k` : 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Battery */}
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td colSpan={phones.length + 1} className="p-3 font-bold text-slate-900 sticky left-0 bg-slate-50">
                    Battery
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Capacity</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center font-semibold">
                      {phone.specs.battery.capacityMah}mAh
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Wired Charging</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">
                      {phone.specs.battery.wiredCharging ? `${phone.specs.battery.wiredCharging}W` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Wireless Charging</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">
                      {phone.specs.battery.wirelessCharging ? `${phone.specs.battery.wirelessCharging}W` : 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Design */}
                <tr className="border-b border-slate-100 bg-slate-50">
                  <td colSpan={phones.length + 1} className="p-3 font-bold text-slate-900 sticky left-0 bg-slate-50">
                    Design
                  </td>
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Weight</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.design.weightGrams}g</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">Thickness</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.design.dimensions.thicknessMm}mm</td>
                  ))}
                </tr>
                <tr className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-3 text-slate-700 sticky left-0 bg-white">IP Rating</td>
                  {phones.map(phone => (
                    <td key={phone.id} className="p-3 text-center">{phone.specs.design.ipRating || 'N/A'}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Winner Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick Summary</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phones.map(phone => (
              <div key={phone.id} className="bg-white rounded-xl p-4">
                <div className="font-semibold text-slate-900 mb-2">
                  {phone.brand} {phone.model}
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>• {phone.specs.display.sizeInches}" {phone.specs.display.type}</div>
                  <div>• {phone.specs.camera.main.megapixels}MP Camera</div>
                  <div>• {phone.specs.battery.capacityMah}mAh</div>
                  <div className="font-semibold text-blue-600 mt-2">
                    {phone.pricing?.[0]?.currency} {phone.pricing?.[0]?.basePrice.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
