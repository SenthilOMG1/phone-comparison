import { ComparisonInsights } from '../../../types';
import { Card } from '../../ui';
import { Trophy, Scale, Target } from 'lucide-react';

interface TLDRCardProps {
  tldr: ComparisonInsights['tldr'];
  phone1Name: string;
  phone2Name: string;
}

export function TLDRCard({ tldr, phone1Name, phone2Name }: TLDRCardProps) {
  const getIcon = () => {
    if (tldr.winner === 'depends') return <Scale className="w-6 h-6" />;
    return <Trophy className="w-6 h-6" />;
  };

  const getWinnerColor = () => {
    if (tldr.winner === 'phone1') return 'text-primary-600';
    if (tldr.winner === 'phone2') return 'text-secondary-600';
    return 'text-neutral-600';
  };

  return (
    <Card variant="glass" className="p-6">
      <div className="flex items-start gap-4">
        <div className={`${getWinnerColor()} mt-1`}>{getIcon()}</div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-neutral-900 mb-2">The Verdict</h3>
          <p className="text-neutral-700 mb-3">{tldr.summary}</p>
          <div className="flex items-start gap-2 bg-white/50 p-3 rounded-lg">
            <Target className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-neutral-800">{tldr.verdict}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
