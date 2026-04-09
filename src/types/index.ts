export interface Prize {
  id: string;
  name: string;
  count: number;
  winners: string[];
}

export interface LotteryState {
  participants: string[];
  prizes: Prize[];
  currentPrizeIndex: number;
  isRolling: boolean;
  currentWinner: string | null;
}

export const DEFAULT_PRIZES: Prize[] = [
  { id: '1', name: '特等奖', count: 1, winners: [] },
  { id: '2', name: '一等奖', count: 3, winners: [] },
  { id: '3', name: '二等奖', count: 5, winners: [] },
  { id: '4', name: '三等奖', count: 10, winners: [] },
];
