import { Prize } from '@/types';
import { Trophy, Gift } from 'lucide-react';

interface WinnerListProps {
  prizes: Prize[];
}

export default function WinnerList({ prizes }: WinnerListProps) {
  const allWinners = prizes.flatMap(prize => 
    prize.winners.map(winner => ({
      prizeName: prize.name,
      winner,
    }))
  );

  const hasWinners = prizes.some(p => p.winners.length > 0);

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gold flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6" />
        中奖记录
      </h3>

      {hasWinners ? (
        <div className="space-y-4">
          {prizes.map((prize) => (
            prize.winners.length > 0 && (
              <div key={prize.id} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="w-4 h-4 text-gold" />
                  <span className="font-bold text-gold">{prize.name}</span>
                  <span className="text-sm text-white/60">
                    ({prize.winners.length} / {prize.count})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prize.winners.map((winner, index) => (
                    <span
                      key={`${prize.id}-${index}`}
                      className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm"
                    >
                      {winner}
                    </span>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-white/40">
          暂无中奖记录
        </div>
      )}
    </div>
  );
}
