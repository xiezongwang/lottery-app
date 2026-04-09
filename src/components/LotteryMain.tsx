import { Trophy } from 'lucide-react';

interface LotteryMainProps {
  currentWinner: string | null;
  isRolling: boolean;
  currentPrizeName: string;
  eligibleCount: number;
  onStart: () => void;
  onStop: () => void;
}

export default function LotteryMain({
  currentWinner,
  isRolling,
  currentPrizeName,
  eligibleCount,
  onStart,
  onStop,
}: LotteryMainProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      {/* 主显示区 */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full"></div>
        <div className="relative card border-4 border-gold/50 p-12 min-w-[600px] min-h-[200px] flex items-center justify-center">
          <Trophy className="absolute top-4 left-4 w-8 h-8 text-gold/50" />
          <Trophy className="absolute top-4 right-4 w-8 h-8 text-gold/50" />
          <Trophy className="absolute bottom-4 left-4 w-8 h-8 text-gold/50" />
          <Trophy className="absolute bottom-4 right-4 w-8 h-8 text-gold/50" />

          <div className="text-center">
            {currentWinner ? (
              <div className={`transition-all duration-300 ${isRolling ? '' : 'scale-150'}`}>
                <p className="text-gold text-2xl mb-4">🎉 中奖者 🎉</p>
                <p className="text-7xl font-bold text-white mb-4">{currentWinner}</p>
              </div>
            ) : (
              <p className="text-4xl text-white/60">准备开始抽奖...</p>
            )}
          </div>
        </div>
      </div>

      {/* 奖项信息 */}
      <div className="text-center mb-8">
        <p className="text-gold text-2xl font-bold mb-2">当前奖项</p>
        <p className="text-5xl font-bold text-primary mb-2">{currentPrizeName}</p>
        <p className="text-white/60 text-lg">
          剩余可抽奖人数: <span className="text-gold font-bold">{eligibleCount}</span>
        </p>
      </div>

      {/* 控制按钮 */}
      <div className="flex gap-8">
        {!isRolling ? (
          <button
            onClick={onStart}
            disabled={eligibleCount === 0}
            className="btn-primary text-2xl px-12 py-4"
          >
            ▶ 开始抽奖
          </button>
        ) : (
          <button
            onClick={onStop}
            className="btn-gold text-2xl px-12 py-4 animate-pulse"
          >
            ⏹ 停止
          </button>
        )}
      </div>
    </div>
  );
}
