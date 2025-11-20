import { Phone } from '../../../types';
import { Card, Badge } from '../../ui';
import { formatCurrency, formatBattery, formatMegapixels } from '../../../utils';

interface PhoneCardProps {
  phone: Phone;
  className?: string;
}

export function PhoneCard({ phone, className = '' }: PhoneCardProps) {
  const pricing = phone.pricing?.[0];

  return (
    <Card variant="glass" className={`overflow-hidden ${className}`}>
      <div className="relative h-64">
        <img
          src={phone.images.hero}
          alt={`${phone.brand} ${phone.model}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-xl font-bold text-white">
            {phone.brand} {phone.model}
          </h3>
          {phone.series && (
            <p className="text-sm text-white/80">{phone.series} Series</p>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {phone.badges && phone.badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {phone.badges.slice(0, 3).map((badge) => (
              <Badge key={badge} variant="primary" size="sm">
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-neutral-600">Camera</p>
            <p className="font-semibold text-neutral-900">
              {formatMegapixels(phone.specs.camera.main.megapixels)}
            </p>
          </div>

          <div>
            <p className="text-neutral-600">Battery</p>
            <p className="font-semibold text-neutral-900">
              {formatBattery(phone.specs.battery.capacityMah)}
            </p>
          </div>

          <div>
            <p className="text-neutral-600">Display</p>
            <p className="font-semibold text-neutral-900">
              {phone.specs.display.sizeInches}" {phone.specs.display.refreshRate}Hz
            </p>
          </div>

          <div>
            <p className="text-neutral-600">Chipset</p>
            <p className="font-semibold text-neutral-900 truncate">{phone.specs.soc.model}</p>
          </div>
        </div>

        {pricing && (
          <div className="pt-3 border-t border-neutral-200">
            <p className="text-sm text-neutral-600">Starting at</p>
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(pricing.basePrice, pricing.currency)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
