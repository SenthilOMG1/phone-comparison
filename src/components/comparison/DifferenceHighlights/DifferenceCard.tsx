import { DifferenceHighlight } from '../../../types';
import { Card, Badge } from '../../ui';
import { ArrowUp, ArrowDown, Minus, Camera, Battery, Cpu, Monitor, DollarSign } from 'lucide-react';

interface DifferenceCardProps {
  difference: DifferenceHighlight;
  phone1Name: string;
  phone2Name: string;
}

export function DifferenceCard({ difference, phone1Name, phone2Name }: DifferenceCardProps) {
  const getCategoryIcon = () => {
    switch (difference.category) {
      case 'camera':
        return <Camera className="w-5 h-5" />;
      case 'battery':
        return <Battery className="w-5 h-5" />;
      case 'performance':
        return <Cpu className="w-5 h-5" />;
      case 'display':
        return <Monitor className="w-5 h-5" />;
      case 'value':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getSignificanceBadge = () => {
    const variants = {
      major: 'error' as const,
      notable: 'warning' as const,
      minor: 'neutral' as const,
      none: 'neutral' as const,
    };

    const labels = {
      major: 'Major',
      notable: 'Notable',
      minor: 'Minor',
      none: 'Similar',
    };

    return (
      <Badge variant={variants[difference.significance]} size="sm">
        {labels[difference.significance]}
      </Badge>
    );
  };

  const getWinnerIndicator = () => {
    if (difference.winner === 'tie') return <Minus className="w-4 h-4 text-neutral-400" />;
    if (difference.winner === 'phone1') return <ArrowUp className="w-4 h-4 text-success-600" />;
    return <ArrowDown className="w-4 h-4 text-error-600" />;
  };

  return (
    <Card hover className="p-4">
      <div className="flex items-start gap-3">
        <div className="text-primary-600 mt-1">{getCategoryIcon()}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-neutral-900">{difference.title}</h4>
            {getSignificanceBadge()}
          </div>

          <p className="text-sm text-neutral-700 mb-2">{difference.claim}</p>

          {difference.delta && (
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-600 mb-2">
              {getWinnerIndicator()}
              <span>
                {difference.delta.value} {difference.delta.unit}
                {difference.delta.percentage && ` (${difference.delta.percentage}% difference)`}
              </span>
            </div>
          )}

          <p className="text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
            {difference.whyItMatters}
          </p>
        </div>
      </div>
    </Card>
  );
}
