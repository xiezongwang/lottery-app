import { Prize } from '@/types';
import { Crown, Award } from 'lucide-react';

interface PrizeSelectorProps {
  prizes: Prize[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClear: () => void;
}

export default function PrizeSelector({
  prizes,
  currentIndex,
  onSelect,
  onClear,
}: PrizeSelectorProps) {
  const currentPrize = prizes[currentIndex];

  return (
    <div className="card mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gold flex items-center gap-2">
          <Award className="w-6 h-6" />
          奖项选择
        </h3>
        <button
          onClick={onClear}
          disabled={currentPrize.winners.length === 0}
          className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          清空当前中奖记录
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {prizes.map((prize, index) => {
          const isCurrent = index === currentIndex;
          const isComplete = prize.winners.length >= prize.count;
          const progress = (prize.winners.length / prize.count) * 100;

          return (
            <button
              key={prize.id}
              onClick={() => onSelect(index)}
              className={`
                relative px-6 py-3 rounded-lg border-2 transition-all
                ${isCurrent 
                  ? 'border-gold bg-gold/20 text-gold' 
                  : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                }
                ${isComplete ? 'opacity-50' : ''}
              `}
            >
              {isCurrent && (
                <div className="absolute -top-1 -right-1">
                  <Crown className="w-4 h-4 text-gold" />
                </div>
              )}
              <div className="text-sm font-bold">{prize.name}</div>
              <div className="text-xs text-white/60">
                {prize.winners.length} / {prize.count}
              </div>
              {isComplete && (
                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                  <span className="text-green-400 text-xs font-bold">已完成</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 进度条 */}
      <div className="mt-4">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
