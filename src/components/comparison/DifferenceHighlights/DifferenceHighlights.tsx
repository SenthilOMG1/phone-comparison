import { DifferenceHighlight } from '../../../types';
import { DifferenceCard } from './DifferenceCard';

interface DifferenceHighlightsProps {
  differences: DifferenceHighlight[];
  phone1Name: string;
  phone2Name: string;
}

export function DifferenceHighlights({ differences, phone1Name, phone2Name }: DifferenceHighlightsProps) {
  if (differences.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-600">
        <p>These phones have very similar specifications.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-neutral-900 mb-4">Key Differences</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {differences.map((diff, index) => (
          <DifferenceCard
            key={`${diff.category}-${index}`}
            difference={diff}
            phone1Name={phone1Name}
            phone2Name={phone2Name}
          />
        ))}
      </div>
    </div>
  );
}
