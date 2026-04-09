import { Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="text-center py-8">
      <div className="flex items-center justify-center gap-4 mb-4">
        <Sparkles className="w-12 h-12 text-gold animate-pulse" />
        <h1 className="text-6xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
          年会抽奖
        </h1>
        <Sparkles className="w-12 h-12 text-gold animate-pulse" />
      </div>
      <p className="text-gold text-xl opacity-80">🎊 2026 年度盛典 🎊</p>
    </header>
  );
}
