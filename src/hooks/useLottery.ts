import { useState, useRef, useCallback, useEffect } from 'react';
import { Prize, LotteryState, DEFAULT_PRIZES } from '@/types';
import confetti from 'canvas-confetti';

export function useLottery() {
  const [participants, setParticipants] = useState<string[]>(() => {
    const saved = localStorage.getItem('lottery-participants');
    return saved ? JSON.parse(saved) : [];
  });

  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const saved = localStorage.getItem('lottery-prizes');
    return saved ? JSON.parse(saved) : DEFAULT_PRIZES;
  });

  const [currentPrizeIndex, setCurrentPrizeIndex] = useState<number>(() => {
    const saved = localStorage.getItem('lottery-currentPrizeIndex');
    return saved ? parseInt(saved) : 0;
  });

  const [isRolling, setIsRolling] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<string | null>(null);

  const rollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 保存数据到localStorage
  useEffect(() => {
    localStorage.setItem('lottery-participants', JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    localStorage.setItem('lottery-prizes', JSON.stringify(prizes));
  }, [prizes]);

  useEffect(() => {
    localStorage.setItem('lottery-currentPrizeIndex', currentPrizeIndex.toString());
  }, [currentPrizeIndex]);

  // 获取当前奖项
  const currentPrize = prizes[currentPrizeIndex];

  // 获取可抽奖的参与者名单（排除已中奖者）
  const getEligibleParticipants = useCallback(() => {
    const allWinners = prizes.flatMap(p => p.winners);
    return participants.filter(p => !allWinners.includes(p));
  }, [participants, prizes]);

  // 随机选择一个名字
  const getRandomName = useCallback(() => {
    const eligible = getEligibleParticipants();
    if (eligible.length === 0) return null;
    return eligible[Math.floor(Math.random() * eligible.length)];
  }, [getEligibleParticipants]);

  // 触发烟花特效
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#D4192C', '#FF6B6B', '#FFE44D'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#D4192C', '#FF6B6B', '#FFE44D'],
      });

      if (Date.now() < end) {
        animationFrameRef.current = requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  // 开始滚动
  const startRolling = useCallback(() => {
    const eligible = getEligibleParticipants();
    if (eligible.length === 0) {
      alert('没有可抽奖的参与者了！');
      return;
    }

    setIsRolling(true);
    setCurrentWinner(null);

    // 快速滚动
    rollingIntervalRef.current = setInterval(() => {
      setCurrentWinner(getRandomName());
    }, 50);
  }, [getEligibleParticipants, getRandomName]);

  // 停止滚动并选择中奖者
  const stopRolling = useCallback(() => {
    if (!isRolling) return;

    clearInterval(rollingIntervalRef.current!);
    rollingIntervalRef.current = null;

    // 减速效果
    let speed = 50;
    let times = 10;
    const slowDown = () => {
      if (times > 0) {
        setCurrentWinner(getRandomName());
        times--;
        speed += 30;
        rollingIntervalRef.current = setTimeout(slowDown, speed);
      } else {
        // 最终选择
        const winner = getRandomName();
        setCurrentWinner(winner);
        setIsRolling(false);

        if (winner) {
          // 更新中奖名单
          setPrizes(prev => {
            const newPrizes = [...prev];
            newPrizes[currentPrizeIndex] = {
              ...newPrizes[currentPrizeIndex],
              winners: [...newPrizes[currentPrizeIndex].winners, winner],
            };
            return newPrizes;
          });

          // 触发烟花
          triggerConfetti();
        }
      }
    };

    slowDown();
  }, [isRolling, currentPrizeIndex, getRandomName, triggerConfetti]);

  // 设置参与人名单
  const setParticipantsList = useCallback((names: string[]) => {
    const cleanedNames = names
      .map(n => n.trim())
      .filter(n => n.length > 0);
    setParticipants(cleanedNames);
  }, []);

  // 切换奖项
  const switchPrize = useCallback((index: number) => {
    setCurrentPrizeIndex(index);
  }, []);

  // 重置所有数据
  const resetAll = useCallback(() => {
    if (confirm('确定要重置所有数据吗？')) {
      localStorage.clear();
      setParticipants([]);
      setPrizes(DEFAULT_PRIZES);
      setCurrentPrizeIndex(0);
      setCurrentWinner(null);
      setIsRolling(false);
    }
  }, []);

  // 清空当前奖项的中奖者
  const clearCurrentPrizeWinners = useCallback(() => {
    if (confirm('确定要清空当前奖项的中奖记录吗？')) {
      setPrizes(prev => {
        const newPrizes = [...prev];
        newPrizes[currentPrizeIndex] = {
          ...newPrizes[currentPrizeIndex],
          winners: [],
        };
        return newPrizes;
      });
    }
  }, [currentPrizeIndex]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (rollingIntervalRef.current) clearInterval(rollingIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return {
    participants,
    prizes,
    currentPrize,
    currentPrizeIndex,
    isRolling,
    currentWinner,
    eligibleCount: getEligibleParticipants().length,
    startRolling,
    stopRolling,
    setParticipantsList,
    switchPrize,
    resetAll,
    clearCurrentPrizeWinners,
  };
}
