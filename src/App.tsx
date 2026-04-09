import { useState, useRef, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Award, Crown, Gift, Users, Upload, Download, Trash2, RotateCcw } from 'lucide-react';

/* ===== 类型定义 ===== */
interface Prize {
  id: string;
  name: string;
  count: number;
  winners: string[];
}

const DEFAULT_PRIZES: Prize[] = [
  { id: '1', name: '特等奖', count: 1, winners: [] },
  { id: '2', name: '一等奖', count: 3, winners: [] },
  { id: '3', name: '二等奖', count: 5, winners: [] },
  { id: '4', name: '三等奖', count: 10, winners: [] },
];

/* ===== 主应用组件 ===== */
export default function App() {
  // ---- 状态管理 ----
  const [participants, setParticipants] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lottery-participants');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    try {
      const saved = localStorage.getItem('lottery-prizes');
      return saved ? JSON.parse(saved) : DEFAULT_PRIZES;
    } catch { return DEFAULT_PRIZES; }
  });

  const [currentPrizeIndex, setCurrentPrizeIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('lottery-currentPrizeIndex');
      return saved ? parseInt(saved) : 0;
    } catch { return 0; }
  });

  const [isRolling, setIsRolling] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const rollingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // ---- Toast 提示 ----
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ---- 持久化 ----
  useEffect(() => {
    localStorage.setItem('lottery-participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('lottery-prizes', JSON.stringify(prizes));
  }, [prizes]);

  useEffect(() => {
    localStorage.setItem('lottery-currentPrizeIndex', currentPrizeIndex.toString());
  }, [currentPrizeIndex]);

  // ---- 派生数据 ----
  const currentPrize = prizes[currentPrizeIndex];

  const getEligible = useCallback(() => {
    const allWinners = prizes.flatMap(p => p.winners);
    return participants.filter(p => !allWinners.includes(p));
  }, [participants, prizes]);

  const eligibleCount = getEligible().length;

  const getRandomName = useCallback(() => {
    const eligible = getEligible();
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, [getEligible]);

  // ---- 烟花 ----
  const triggerConfetti = useCallback(() => {
    const end = Date.now() + 3000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#FFD700', '#D4192C', '#FF6B6B', '#FFE44D'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#FFD700', '#D4192C', '#FF6B6B', '#FFE44D'] });
      if (Date.now() < end) animFrameRef.current = requestAnimationFrame(frame);
    };
    frame();
  }, []);

  // ---- 抽奖逻辑 ----
  const startRolling = useCallback(() => {
    if (participants.length === 0) {
      showToast('请先添加参与者名单！');
      return;
    }
    if (getEligible().length === 0) {
      showToast('没有可抽奖的参与者了！');
      return;
    }
    if (currentPrize && currentPrize.winners.length >= currentPrize.count) {
      showToast(`${currentPrize.name} 名额已满，请切换奖项！`);
      return;
    }
    setIsRolling(true);
    setCurrentWinner(null);
    rollingRef.current = setInterval(() => { setCurrentWinner(getRandomName()); }, 50);
  }, [participants, getEligible, getRandomName, currentPrize, showToast]);

  const stopRolling = useCallback(() => {
    if (!isRolling) return;
    if (rollingRef.current) { clearInterval(rollingRef.current); rollingRef.current = null; }
    let speed = 50;
    let times = 10;
    const slowDown = () => {
      if (times > 0) {
        setCurrentWinner(getRandomName());
        times--;
        speed += 30;
        rollingRef.current = setTimeout(slowDown, speed);
      } else {
        const winner = getRandomName();
        setCurrentWinner(winner);
        setIsRolling(false);
        if (winner) {
          setPrizes(prev => {
            const next = [...prev];
            next[currentPrizeIndex] = { ...next[currentPrizeIndex], winners: [...next[currentPrizeIndex].winners, winner] };
            return next;
          });
          triggerConfetti();
        }
      }
    };
    slowDown();
  }, [isRolling, currentPrizeIndex, getRandomName, triggerConfetti]);

  // ---- 名单操作 ----
  const handleEdit = () => {
    if (isRolling) return; // 抽奖中不允许编辑
    setIsEditing(true);
    setTextContent(participants.join('\n'));
  };

  const handleSave = () => {
    const names = textContent.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    setParticipants(names);
    setIsEditing(false);
    showToast(`已保存 ${names.length} 位参与者`);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTextContent('');
  };

  const handleClear = () => {
    if (isRolling) return;
    if (window.confirm('确定要清空所有参与者吗？')) {
      setParticipants([]);
      showToast('已清空参与者名单');
    }
  };

  const handleImport = () => {
    if (isRolling) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          const names = content.split('\n').map(n => n.trim()).filter(n => n.length > 0);
          setParticipants(names);
          showToast(`已导入 ${names.length} 位参与者`);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    if (participants.length === 0) return;
    const blob = new Blob([participants.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participants.txt';
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出参与者名单');
  };

  // ---- 重置 ----
  const resetAll = () => {
    if (isRolling) return;
    if (window.confirm('确定要重置所有数据吗？（包括参与者和中奖记录）')) {
      localStorage.removeItem('lottery-participants');
      localStorage.removeItem('lottery-prizes');
      localStorage.removeItem('lottery-currentPrizeIndex');
      setParticipants([]);
      setPrizes(DEFAULT_PRIZES);
      setCurrentPrizeIndex(0);
      setCurrentWinner(null);
      setIsRolling(false);
      showToast('已重置所有数据');
    }
  };

  const clearCurrentPrizeWinners = () => {
    if (isRolling) return;
    if (!currentPrize || currentPrize.winners.length === 0) return;
    if (window.confirm(`确定要清空「${currentPrize.name}」的中奖记录吗？`)) {
      setPrizes(prev => {
        const next = [...prev];
        next[currentPrizeIndex] = { ...next[currentPrizeIndex], winners: [] };
        return next;
      });
      showToast(`已清空「${currentPrize.name}」的中奖记录`);
    }
  };

  // ---- 清理定时器 ----
  useEffect(() => {
    return () => {
      if (rollingRef.current) clearInterval(rollingRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const hasWinners = prizes.some(p => p.winners.length > 0);
  const currentProgress = currentPrize ? (currentPrize.winners.length / currentPrize.count) * 100 : 0;

  /* ===== 渲染 ===== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-red-900/20 to-bg-dark">
      <div className="max-w-[1400px] mx-auto px-4 py-6">

        {/* ===== Toast 提示 ===== */}
        {toast && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-3 rounded-xl shadow-2xl border border-gold/30 text-sm animate-fade-in backdrop-blur-sm">
            {toast}
          </div>
        )}

        {/* ===== 顶部标题 ===== */}
        <header className="text-center py-6">
          <div className="flex items-center justify-center gap-4 mb-3">
            <Sparkles className="w-10 h-10 text-gold animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
              年会抽奖
            </h1>
            <Sparkles className="w-10 h-10 text-gold animate-pulse" />
          </div>
          <p className="text-gold text-lg opacity-80">2026 年度盛典</p>
        </header>

        {/* ===== 三栏布局 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* == 左侧栏：奖项 + 名单 == */}
          <div className="lg:col-span-1 space-y-5">

            {/* 奖项选择 */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gold flex items-center gap-2">
                  <Award className="w-5 h-5" />奖项选择
                </h3>
                <button
                  type="button"
                  onClick={clearCurrentPrizeWinners}
                  disabled={isRolling || !currentPrize || currentPrize.winners.length === 0}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer select-none"
                >
                  清空当前中奖
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {prizes.map((prize, index) => {
                  const isCurrent = index === currentPrizeIndex;
                  const isComplete = prize.winners.length >= prize.count;
                  return (
                    <button
                      type="button"
                      key={prize.id}
                      onClick={() => { if (!isRolling) setCurrentPrizeIndex(index); }}
                      disabled={isRolling}
                      className={`relative px-4 py-2 rounded-lg border-2 transition-all text-sm cursor-pointer select-none
                        ${isCurrent ? 'border-gold bg-gold/20 text-gold' : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'}
                        ${isComplete ? 'opacity-50' : ''}
                        ${isRolling ? 'cursor-not-allowed' : ''}
                      `}
                    >
                      {isCurrent && (
                        <div className="absolute -top-1 -right-1">
                          <Crown className="w-3 h-3 text-gold" />
                        </div>
                      )}
                      <div className="font-bold">{prize.name}</div>
                      <div className="text-xs text-white/60">{prize.winners.length}/{prize.count}</div>
                    </button>
                  );
                })}
              </div>
              {/* 进度条 */}
              <div className="mt-3">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-300"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 参与者名单 */}
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  参与者名单
                  <span className="text-xs text-white/60 font-normal">({participants.length}人)</span>
                </h3>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={isRolling}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="导入名单"
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={participants.length === 0}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="导出名单"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={participants.length === 0 || isRolling}
                    className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="清空名单"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!isEditing ? (
                <div
                  onClick={handleEdit}
                  className={`max-h-[250px] overflow-y-auto text-white/70 text-sm rounded-lg p-3 transition-colors ${isRolling ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-white/5'}`}
                >
                  {participants.length > 0 ? (
                    participants.map((name, i) => (
                      <div key={i} className="py-0.5">{i + 1}. {name}</div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-white/40">点击此处添加参与者</div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="每行输入一个姓名...&#10;例如：&#10;张三&#10;李四&#10;王五"
                    className="input min-h-[180px] resize-none text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      className="flex-1 btn-primary text-sm py-2 border-none cursor-pointer"
                    >
                      保存
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-all text-sm border-none cursor-pointer"
                    >
                      取消
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* == 中间主区域：抽奖 == */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center">
            {/* 主显示区 */}
            <div className="relative mb-6 w-full">
              <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
              <div className="relative card border-4 border-gold/50 p-10 min-h-[200px] flex items-center justify-center">
                <Trophy className="absolute top-3 left-3 w-6 h-6 text-gold/40" />
                <Trophy className="absolute top-3 right-3 w-6 h-6 text-gold/40" />
                <Trophy className="absolute bottom-3 left-3 w-6 h-6 text-gold/40" />
                <Trophy className="absolute bottom-3 right-3 w-6 h-6 text-gold/40" />

                <div className="text-center">
                  {currentWinner ? (
                    <div className={`transition-all duration-300 ${isRolling ? '' : 'scale-125'}`}>
                      {!isRolling && <p className="text-gold text-xl mb-3">恭喜中奖</p>}
                      <p className={`font-bold text-white ${isRolling ? 'text-5xl' : 'text-6xl'}`}>{currentWinner}</p>
                      {!isRolling && currentPrize && (
                        <p className="text-white/60 text-sm mt-3">{currentPrize.name}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl text-white/50">
                        {participants.length === 0 ? '请先添加参与者名单' : '准备开始抽奖...'}
                      </p>
                      {participants.length === 0 && (
                        <p className="text-sm text-white/30 mt-2">点击左侧「参与者名单」区域添加</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 奖项信息 */}
            <div className="text-center mb-6">
              <p className="text-gold text-lg font-bold mb-1">当前奖项</p>
              <p className="text-4xl font-bold text-primary mb-1">{currentPrize?.name || ''}</p>
              <p className="text-white/60">
                名额: <span className="text-gold font-bold">{currentPrize?.winners.length || 0}/{currentPrize?.count || 0}</span>
                {' | '}
                剩余可抽: <span className="text-gold font-bold">{eligibleCount}</span> 人
              </p>
            </div>

            {/* 控制按钮 */}
            <div className="flex gap-6">
              {!isRolling ? (
                <button
                  type="button"
                  onClick={startRolling}
                  disabled={eligibleCount === 0 || participants.length === 0 || (currentPrize && currentPrize.winners.length >= currentPrize.count)}
                  className="btn-primary text-xl px-10 py-3 border-none cursor-pointer"
                >
                  ▶ 开始抽奖
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRolling}
                  className="btn-gold text-xl px-10 py-3 animate-pulse border-none cursor-pointer"
                >
                  ⏹ 停止
                </button>
              )}
            </div>
          </div>

          {/* == 右侧栏：中奖记录 == */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gold flex items-center gap-2">
                  <Trophy className="w-5 h-5" />中奖记录
                </h3>
                {hasWinners && (
                  <span className="text-xs text-white/40">
                    共 {prizes.reduce((sum, p) => sum + p.winners.length, 0)} 人
                  </span>
                )}
              </div>
              {hasWinners ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {prizes.map(prize =>
                    prize.winners.length > 0 ? (
                      <div key={prize.id} className="bg-white/5 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Gift className="w-4 h-4 text-gold" />
                          <span className="font-bold text-gold text-sm">{prize.name}</span>
                          <span className="text-xs text-white/60">({prize.winners.length}/{prize.count})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {prize.winners.map((winner, i) => (
                            <span key={`${prize.id}-${i}`} className="px-2.5 py-0.5 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs">
                              {winner}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-white/40 text-sm">暂无中奖记录</div>
              )}
            </div>
          </div>
        </div>

        {/* ===== 重置按钮 ===== */}
        <div className="fixed bottom-4 right-4">
          <button
            type="button"
            onClick={resetAll}
            disabled={isRolling}
            className="bg-white/10 hover:bg-white/20 text-white/60 hover:text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="重置所有数据"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
