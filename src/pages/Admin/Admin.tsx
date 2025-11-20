import { useState } from 'react';
import { Plus, Download, Upload } from 'lucide-react';
import { Phone } from '../../types';

export function Admin() {
  const [formData, setFormData] = useState<Partial<Phone>>({
    brand: 'Honor',
    model: '',
    series: '',
    releaseDate: new Date().toISOString().split('T')[0],
    variant: 'global',
    images: { hero: '' },
    specs: {
      display: {
        sizeInches: 6.7,
        type: 'AMOLED',
        resolution: { width: 1080, height: 2400 },
        refreshRate: 120,
        peakBrightness: 1200,
        hdr: true,
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      camera: {
        main: { megapixels: 50, aperture: 1.9, stabilization: 'OIS' },
        front: { megapixels: 16, aperture: 2.0 },
        video: { maxResolution: '4K', maxFps: 30, stabilization: true, hdr: false },
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      soc: {
        family: 'Snapdragon',
        model: '',
        process: '4nm',
        cpu: { cores: 8, architecture: 'Octa-core' },
        gpu: '',
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      ram: [8],
      storage: [256],
      battery: {
        capacityMah: 5000,
        wiredCharging: 66,
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      connectivity: {
        wifi: ['Wi-Fi 6'],
        bluetooth: '5.2',
        nfc: true,
        usb: 'Type-C 2.0',
        sim: 'Dual Nano-SIM',
        fiveG: true,
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      design: {
        weightGrams: 200,
        dimensions: { heightMm: 160, widthMm: 75, thicknessMm: 8 },
        materials: { back: 'Glass', frame: 'Aluminum' },
        colors: ['Black'],
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      software: {
        os: 'Android',
        version: '14',
        skinName: 'MagicOS 8.0',
        updatePromise: '3 years OS + 4 years security',
        provenance: { source: 'manufacturer', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
    },
    benchmarks: {
      geekbench: {
        version: '6',
        singleCore: { median: 1000, variance: 50, sampleSize: 50 },
        multiCore: { median: 3000, variance: 100, sampleSize: 50 },
        provenance: { source: 'geekbench', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
      antutu: {
        version: '10',
        total: { median: 500000, variance: 10000, sampleSize: 50 },
        breakdown: { cpu: 140000, gpu: 180000, memory: 110000, ux: 70000 },
        provenance: { source: 'antutu', lastChecked: new Date().toISOString().split('T')[0], confidence: 'high' },
      },
    },
    pricing: [{
      currency: 'MUR',
      basePrice: 20000,
      variants: [{ configuration: '8GB/256GB', price: 20000 }],
      region: 'Mauritius',
    }],
    badges: ['5G'],
    popularity: 80,
  });

  const handleExportJSON = () => {
    const phoneData = {
      ...formData,
      id: `${formData.brand?.toLowerCase()}_${formData.model?.toLowerCase().replace(/\s+/g, '_')}_${formData.variant}`,
    };

    const blob = new Blob([JSON.stringify(phoneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${phoneData.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-2">
            Phone Data Manager
          </h1>
          <p className="text-slate-600">Add new Honor devices to the database</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 space-y-8">

          {/* Basic Info */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Model Name</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Magic 6 Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Series</label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Magic"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Release Date</label>
                <input
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.images?.hero}
                  onChange={(e) => setFormData({ ...formData, images: { hero: e.target.value } })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          {/* Display */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              Display
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Size (inches)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.specs?.display.sizeInches}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: { ...formData.specs!, display: { ...formData.specs!.display, sizeInches: parseFloat(e.target.value) } }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select
                  value={formData.specs?.display.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: { ...formData.specs!, display: { ...formData.specs!.display, type: e.target.value as any } }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option>AMOLED</option>
                  <option>LTPO OLED</option>
                  <option>OLED</option>
                  <option>IPS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Refresh Rate (Hz)</label>
                <input
                  type="number"
                  value={formData.specs?.display.refreshRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: { ...formData.specs!, display: { ...formData.specs!.display, refreshRate: parseInt(e.target.value) } }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </section>

          {/* Processor */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
              Processor
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chipset Model</label>
                <input
                  type="text"
                  value={formData.specs?.soc.model}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: { ...formData.specs!, soc: { ...formData.specs!.soc, model: e.target.value } }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="8 Gen 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">GPU</label>
                <input
                  type="text"
                  value={formData.specs?.soc.gpu}
                  onChange={(e) => setFormData({
                    ...formData,
                    specs: { ...formData.specs!, soc: { ...formData.specs!.soc, gpu: e.target.value } }
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Adreno 750"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full"></div>
              Pricing (Mauritius)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Base Price (MUR)</label>
                <input
                  type="number"
                  value={formData.pricing?.[0]?.basePrice}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: [{ ...formData.pricing![0], basePrice: parseInt(e.target.value) }]
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="20000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Configuration</label>
                <input
                  type="text"
                  value={formData.pricing?.[0]?.variants[0]?.configuration}
                  onChange={(e) => setFormData({
                    ...formData,
                    pricing: [{
                      ...formData.pricing![0],
                      variants: [{ ...formData.pricing![0].variants[0], configuration: e.target.value }]
                    }]
                  })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="8GB/256GB"
                />
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleExportJSON}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Download size={20} />
              Export as JSON
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-4 rounded-xl border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all font-semibold text-slate-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
