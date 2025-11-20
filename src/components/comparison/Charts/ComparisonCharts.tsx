import { CategoryScore } from '../../../types/comparison.types';

interface ComparisonChartsProps {
  categoryScores: CategoryScore[];
  phone1Name: string;
  phone2Name: string;
}

export function ComparisonCharts({ categoryScores, phone1Name, phone2Name }: ComparisonChartsProps) {
  const categoryIcons = {
    camera: '📷',
    performance: '⚡',
    battery: '🔋',
    display: '📱',
    value: '💰',
  };

  const categoryColors = {
    camera: { phone1: 'bg-blue-500', phone2: 'bg-blue-300' },
    performance: { phone1: 'bg-purple-500', phone2: 'bg-purple-300' },
    battery: { phone1: 'bg-green-500', phone2: 'bg-green-300' },
    display: { phone1: 'bg-orange-500', phone2: 'bg-orange-300' },
    value: { phone1: 'bg-yellow-500', phone2: 'bg-yellow-300' },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-2xl font-bold text-neutral-900 mb-6">Performance Comparison</h3>

      <div className="space-y-6">
        {categoryScores.map((score) => {
          const categoryKey = score.category as keyof typeof categoryColors;
          const maxScore = Math.max(score.phone1Score, score.phone2Score);
          const phone1Percentage = (score.phone1Score / 100) * 100;
          const phone2Percentage = (score.phone2Score / 100) * 100;

          return (
            <div key={score.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{categoryIcons[categoryKey]}</span>
                  <h4 className="font-semibold text-neutral-900 capitalize">
                    {score.category}
                  </h4>
                </div>
                <div className="text-sm text-neutral-600">
                  {score.phone1Score} vs {score.phone2Score}
                </div>
              </div>

              {/* Phone 1 Bar */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-32 truncate">{phone1Name}</span>
                  <div className="flex-1 bg-neutral-200 rounded-full h-6 overflow-hidden relative">
                    <div
                      className={`h-full ${categoryColors[categoryKey].phone1} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${phone1Percentage}%` }}
                    >
                      <span className="text-xs font-bold text-white">{score.phone1Score}</span>
                    </div>
                  </div>
                </div>

                {/* Phone 2 Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-600 w-32 truncate">{phone2Name}</span>
                  <div className="flex-1 bg-neutral-200 rounded-full h-6 overflow-hidden relative">
                    <div
                      className={`h-full ${categoryColors[categoryKey].phone2} transition-all duration-500 flex items-center justify-end pr-2`}
                      style={{ width: `${phone2Percentage}%` }}
                    >
                      <span className="text-xs font-bold text-white">{score.phone2Score}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Winner Badge */}
              {score.winner !== 'tie' && (
                <div className="flex justify-end">
                  <span className="text-xs bg-success-100 text-success-700 px-2 py-1 rounded">
                    {score.winner === 'phone1' ? `${phone1Name} leads` : `${phone2Name} leads`}
                  </span>
                </div>
              )}

              {/* Rationale */}
              <p className="text-xs text-neutral-600 italic">{score.rationale}</p>
            </div>
          );
        })}
      </div>

      {/* Overall Winner */}
      <div className="mt-8 pt-6 border-t border-neutral-200">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-neutral-900">Overall Winner</h4>
          <div className="flex gap-4">
            {(() => {
              let phone1Wins = 0;
              let phone2Wins = 0;
              categoryScores.forEach((score) => {
                if (score.winner === 'phone1') phone1Wins++;
                if (score.winner === 'phone2') phone2Wins++;
              });

              return (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{phone1Wins}</div>
                    <div className="text-xs text-neutral-600">{phone1Name.split(' ').slice(-2).join(' ')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-600">{phone2Wins}</div>
                    <div className="text-xs text-neutral-600">{phone2Name.split(' ').slice(-2).join(' ')}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
