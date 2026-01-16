import { DollarSign, Zap, Headphones, Globe, Code, Users, TrendingUp } from 'lucide-react';
import type { CategoryWinner } from '@/lib/comparisons';
import type { CompanyTableRow } from '@/types';

interface CategoryWinnersProps {
  hostA: CompanyTableRow;
  hostB: CompanyTableRow;
  winners: CategoryWinner[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  price: <DollarSign className="h-5 w-5" />,
  value: <TrendingUp className="h-5 w-5" />,
  performance: <Zap className="h-5 w-5" />,
  support: <Headphones className="h-5 w-5" />,
  wordpress: <Globe className="h-5 w-5" />,
  developers: <Code className="h-5 w-5" />,
  beginners: <Users className="h-5 w-5" />,
};

export function CategoryWinners({ hostA, hostB, winners }: CategoryWinnersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {winners.map((cw) => (
        <div
          key={cw.category}
          className={`rounded-lg border p-4 ${
            cw.winner === 'tie'
              ? 'border-border-subtle bg-bg-secondary'
              : cw.winner === 'A'
              ? 'border-blue-500/30 bg-blue-500/5'
              : 'border-purple-500/30 bg-purple-500/5'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className={`${
              cw.winner === 'tie'
                ? 'text-text-muted'
                : cw.winner === 'A'
                ? 'text-blue-400'
                : 'text-purple-400'
            }`}>
              {categoryIcons[cw.category] || <Zap className="h-5 w-5" />}
            </span>
            <span className="text-sm font-medium text-text-secondary">{cw.label}</span>
          </div>

          <p className={`font-semibold ${
            cw.winner === 'tie'
              ? 'text-text-muted'
              : cw.winner === 'A'
              ? 'text-blue-400'
              : 'text-purple-400'
          }`}>
            {cw.winnerName}
          </p>

          <p className="text-xs text-text-muted mt-1">{cw.reason}</p>
        </div>
      ))}
    </div>
  );
}
