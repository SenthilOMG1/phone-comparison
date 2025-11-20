import { Phone } from '../../../types';
import { formatCurrency } from '../../../utils/formatting';

interface SpecComparisonTableProps {
  phone1: Phone;
  phone2: Phone;
}

export function SpecComparisonTable({ phone1, phone2 }: SpecComparisonTableProps) {
  const specs = [
    {
      category: 'Display',
      rows: [
        { label: 'Size', value1: `${phone1.specs.display.sizeInches}"`, value2: `${phone2.specs.display.sizeInches}"` },
        { label: 'Type', value1: phone1.specs.display.type, value2: phone2.specs.display.type },
        { label: 'Resolution', value1: `${phone1.specs.display.resolution.width}x${phone1.specs.display.resolution.height}`, value2: `${phone2.specs.display.resolution.width}x${phone2.specs.display.resolution.height}` },
        { label: 'Refresh Rate', value1: `${phone1.specs.display.refreshRate}Hz`, value2: `${phone2.specs.display.refreshRate}Hz` },
        { label: 'Peak Brightness', value1: `${phone1.specs.display.peakBrightness} nits`, value2: `${phone2.specs.display.peakBrightness} nits` },
        { label: 'Protection', value1: phone1.specs.display.protectionGlass || 'N/A', value2: phone2.specs.display.protectionGlass || 'N/A' },
      ],
    },
    {
      category: 'Camera',
      rows: [
        { label: 'Main Camera', value1: `${phone1.specs.camera.main.megapixels}MP f/${phone1.specs.camera.main.aperture}`, value2: `${phone2.specs.camera.main.megapixels}MP f/${phone2.specs.camera.main.aperture}` },
        { label: 'Sensor Size', value1: phone1.specs.camera.main.sensorSize ? `1/${phone1.specs.camera.main.sensorSize}"` : 'N/A', value2: phone2.specs.camera.main.sensorSize ? `1/${phone2.specs.camera.main.sensorSize}"` : 'N/A' },
        { label: 'Stabilization', value1: phone1.specs.camera.main.stabilization || 'N/A', value2: phone2.specs.camera.main.stabilization || 'N/A' },
        { label: 'Ultrawide', value1: phone1.specs.camera.ultrawide ? `${phone1.specs.camera.ultrawide.megapixels}MP` : 'N/A', value2: phone2.specs.camera.ultrawide ? `${phone2.specs.camera.ultrawide.megapixels}MP` : 'N/A' },
        { label: 'Telephoto', value1: phone1.specs.camera.telephoto ? `${phone1.specs.camera.telephoto.megapixels}MP ${phone1.specs.camera.telephoto.opticalZoom}x` : 'N/A', value2: phone2.specs.camera.telephoto ? `${phone2.specs.camera.telephoto.megapixels}MP ${phone2.specs.camera.telephoto.opticalZoom}x` : 'N/A' },
        { label: 'Front Camera', value1: `${phone1.specs.camera.front.megapixels}MP`, value2: `${phone2.specs.camera.front.megapixels}MP` },
        { label: 'Video Recording', value1: `${phone1.specs.camera.video.maxResolution}@${phone1.specs.camera.video.maxFps}fps`, value2: `${phone2.specs.camera.video.maxResolution}@${phone2.specs.camera.video.maxFps}fps` },
      ],
    },
    {
      category: 'Performance',
      rows: [
        { label: 'Processor', value1: `${phone1.specs.soc.family} ${phone1.specs.soc.model}`, value2: `${phone2.specs.soc.family} ${phone2.specs.soc.model}` },
        { label: 'Process', value1: phone1.specs.soc.process, value2: phone2.specs.soc.process },
        { label: 'GPU', value1: phone1.specs.soc.gpu, value2: phone2.specs.soc.gpu },
        { label: 'RAM Options', value1: phone1.specs.ram.join(' / ') + 'GB', value2: phone2.specs.ram.join(' / ') + 'GB' },
        { label: 'Storage Options', value1: phone1.specs.storage.join(' / ') + 'GB', value2: phone2.specs.storage.join(' / ') + 'GB' },
        { label: 'Geekbench Single', value1: phone1.benchmarks?.geekbench?.singleCore?.median?.toString() || 'N/A', value2: phone2.benchmarks?.geekbench?.singleCore?.median?.toString() || 'N/A' },
        { label: 'Geekbench Multi', value1: phone1.benchmarks?.geekbench?.multiCore?.median?.toString() || 'N/A', value2: phone2.benchmarks?.geekbench?.multiCore?.median?.toString() || 'N/A' },
        { label: 'AnTuTu Score', value1: phone1.benchmarks?.antutu?.total?.median ? `${Math.round(phone1.benchmarks.antutu.total.median / 1000)}k` : 'N/A', value2: phone2.benchmarks?.antutu?.total?.median ? `${Math.round(phone2.benchmarks.antutu.total.median / 1000)}k` : 'N/A' },
      ],
    },
    {
      category: 'Battery & Charging',
      rows: [
        { label: 'Battery Capacity', value1: `${phone1.specs.battery.capacityMah}mAh`, value2: `${phone2.specs.battery.capacityMah}mAh` },
        { label: 'Wired Charging', value1: phone1.specs.battery.wiredCharging ? `${phone1.specs.battery.wiredCharging}W` : 'N/A', value2: phone2.specs.battery.wiredCharging ? `${phone2.specs.battery.wiredCharging}W` : 'N/A' },
        { label: 'Wireless Charging', value1: phone1.specs.battery.wirelessCharging ? `${phone1.specs.battery.wirelessCharging}W` : 'N/A', value2: phone2.specs.battery.wirelessCharging ? `${phone2.specs.battery.wirelessCharging}W` : 'N/A' },
        { label: '0-50% Charging', value1: phone1.specs.battery.chargingTime?.to50Percent ? `${phone1.specs.battery.chargingTime.to50Percent} min` : 'N/A', value2: phone2.specs.battery.chargingTime?.to50Percent ? `${phone2.specs.battery.chargingTime.to50Percent} min` : 'N/A' },
        { label: '0-100% Charging', value1: phone1.specs.battery.chargingTime?.to100Percent ? `${phone1.specs.battery.chargingTime.to100Percent} min` : 'N/A', value2: phone2.specs.battery.chargingTime?.to100Percent ? `${phone2.specs.battery.chargingTime.to100Percent} min` : 'N/A' },
      ],
    },
    {
      category: 'Design & Build',
      rows: [
        { label: 'Weight', value1: `${phone1.specs.design.weightGrams}g`, value2: `${phone2.specs.design.weightGrams}g` },
        { label: 'Dimensions', value1: `${phone1.specs.design.dimensions.heightMm}x${phone1.specs.design.dimensions.widthMm}x${phone1.specs.design.dimensions.thicknessMm}mm`, value2: `${phone2.specs.design.dimensions.heightMm}x${phone2.specs.design.dimensions.widthMm}x${phone2.specs.design.dimensions.thicknessMm}mm` },
        { label: 'Frame Material', value1: phone1.specs.design.materials.frame || 'N/A', value2: phone2.specs.design.materials.frame || 'N/A' },
        { label: 'Back Material', value1: phone1.specs.design.materials.back, value2: phone2.specs.design.materials.back },
        { label: 'IP Rating', value1: phone1.specs.design.ipRating || 'N/A', value2: phone2.specs.design.ipRating || 'N/A' },
        { label: 'Colors', value1: phone1.specs.design.colors.join(', '), value2: phone2.specs.design.colors.join(', ') },
      ],
    },
    {
      category: 'Connectivity',
      rows: [
        { label: 'Wi-Fi', value1: phone1.specs.connectivity.wifi.join(', '), value2: phone2.specs.connectivity.wifi.join(', ') },
        { label: 'Bluetooth', value1: phone1.specs.connectivity.bluetooth, value2: phone2.specs.connectivity.bluetooth },
        { label: 'USB', value1: phone1.specs.connectivity.usb, value2: phone2.specs.connectivity.usb },
        { label: '5G', value1: phone1.specs.connectivity.fiveG ? 'Yes' : 'No', value2: phone2.specs.connectivity.fiveG ? 'Yes' : 'No' },
        { label: 'NFC', value1: phone1.specs.connectivity.nfc ? 'Yes' : 'No', value2: phone2.specs.connectivity.nfc ? 'Yes' : 'No' },
        { label: 'SIM', value1: phone1.specs.connectivity.sim, value2: phone2.specs.connectivity.sim },
      ],
    },
    {
      category: 'Software',
      rows: [
        { label: 'OS', value1: `${phone1.specs.software.os} ${phone1.specs.software.version}`, value2: `${phone2.specs.software.os} ${phone2.specs.software.version}` },
        { label: 'UI', value1: phone1.specs.software.skinName || 'Stock', value2: phone2.specs.software.skinName || 'Stock' },
        { label: 'Update Promise', value1: phone1.specs.software.updatePromise || 'N/A', value2: phone2.specs.software.updatePromise || 'N/A' },
      ],
    },
    {
      category: 'Pricing',
      rows: [
        { label: 'Base Price', value1: phone1.pricing?.[0] ? formatCurrency(phone1.pricing[0].basePrice, phone1.pricing[0].currency) : 'N/A', value2: phone2.pricing?.[0] ? formatCurrency(phone2.pricing[0].basePrice, phone2.pricing[0].currency) : 'N/A' },
        { label: 'Region', value1: phone1.pricing?.[0]?.region || 'N/A', value2: phone2.pricing?.[0]?.region || 'N/A' },
      ],
    },
  ];

  const compareValues = (v1: string | undefined, v2: string | undefined) => {
    if (!v1 || !v2) return 'equal';

    // Numeric comparison
    const num1 = parseFloat(v1);
    const num2 = parseFloat(v2);

    if (!isNaN(num1) && !isNaN(num2)) {
      if (num1 > num2) return 'better1';
      if (num2 > num1) return 'better2';
    }

    return 'neutral';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-2xl font-bold text-neutral-900 mb-6">Detailed Specifications</h3>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-200">
              <th className="text-left p-3 text-neutral-600 font-medium w-1/4">Specification</th>
              <th className="text-center p-3 text-primary-600 font-semibold w-3/8">{phone1.brand} {phone1.model}</th>
              <th className="text-center p-3 text-secondary-600 font-semibold w-3/8">{phone2.brand} {phone2.model}</th>
            </tr>
          </thead>
          <tbody>
            {specs.map((category, catIndex) => (
              <>
                <tr key={`cat-${catIndex}`} className="bg-neutral-100">
                  <td colSpan={3} className="p-3 font-bold text-neutral-900">{category.category}</td>
                </tr>
                {category.rows.map((row, rowIndex) => {
                  const comparison = compareValues(row.value1, row.value2);
                  return (
                    <tr key={`row-${catIndex}-${rowIndex}`} className="border-b border-neutral-200 hover:bg-neutral-50">
                      <td className="p-3 text-neutral-700">{row.label}</td>
                      <td className={`p-3 text-center ${comparison === 'better1' ? 'bg-success-50 font-semibold text-success-700' : ''}`}>
                        {row.value1}
                      </td>
                      <td className={`p-3 text-center ${comparison === 'better2' ? 'bg-success-50 font-semibold text-success-700' : ''}`}>
                        {row.value2}
                      </td>
                    </tr>
                  );
                })}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
