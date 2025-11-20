import { Phone } from '../../../types';

interface ImageComparisonViewerProps {
  phone1: Phone;
  phone2: Phone;
}

export function ImageComparisonViewer({ phone1, phone2 }: ImageComparisonViewerProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-2xl font-bold text-neutral-900 mb-6">Side-by-Side Comparison</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Phone 1 */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={phone1.images.hero}
              alt={`${phone1.brand} ${phone1.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-lg text-neutral-900">{phone1.brand} {phone1.model}</h4>
            <p className="text-sm text-neutral-600">{phone1.specs.design.colors.join(', ')}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-neutral-100 p-2 rounded">
              <p className="text-xs text-neutral-600">Weight</p>
              <p className="font-semibold text-neutral-900">{phone1.specs.design.weightGrams}g</p>
            </div>
            <div className="bg-neutral-100 p-2 rounded">
              <p className="text-xs text-neutral-600">Thickness</p>
              <p className="font-semibold text-neutral-900">{phone1.specs.design.dimensions.thicknessMm}mm</p>
            </div>
            <div className="bg-neutral-100 p-2 rounded">
              <p className="text-xs text-neutral-600">Display</p>
              <p className="font-semibold text-neutral-900">{phone1.specs.display.sizeInches}"</p>
            </div>
          </div>
        </div>

        {/* Phone 2 */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg overflow-hidden flex items-center justify-center">
            <img
              src={phone2.images.hero}
              alt={`${phone2.brand} ${phone2.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center">
            <h4 className="font-semibold text-lg text-neutral-900">{phone2.brand} {phone2.model}</h4>
            <p className="text-sm text-neutral-600">{phone2.specs.design.colors.join(', ')}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-neutral-100 p-2 rounded">
              <p className="text-xs text-neutral-600">Weight</p>
              <p className="font-semibold text-neutral-900">{phone2.specs.design.weightGrams}g</p>
            </div>
            <div className="bg-neutral-100 p-2 rounded">
              <p className="text-xs text-neutral-600">Thickness</p>
              <p className="font-semibold text-neutral-900">{phone2.specs.design.dimensions.thicknessMm}mm</p>
            </div>
            <div className="bg-neutral-100 p-2 rounded">
              <p className="text-xs text-neutral-600">Display</p>
              <p className="font-semibold text-neutral-900">{phone2.specs.display.sizeInches}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Design Comparison */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h5 className="font-semibold text-neutral-900">Build & Materials</h5>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-neutral-600">Frame:</span>
              <span className="font-medium text-neutral-900">{phone1.specs.design.materials.frame || 'N/A'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-neutral-600">Back:</span>
              <span className="font-medium text-neutral-900">{phone1.specs.design.materials.back}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-neutral-600">Protection:</span>
              <span className="font-medium text-neutral-900">{phone1.specs.design.ipRating || 'N/A'}</span>
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <h5 className="font-semibold text-neutral-900">Build & Materials</h5>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-neutral-600">Frame:</span>
              <span className="font-medium text-neutral-900">{phone2.specs.design.materials.frame || 'N/A'}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-neutral-600">Back:</span>
              <span className="font-medium text-neutral-900">{phone2.specs.design.materials.back}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-neutral-600">Protection:</span>
              <span className="font-medium text-neutral-900">{phone2.specs.design.ipRating || 'N/A'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
