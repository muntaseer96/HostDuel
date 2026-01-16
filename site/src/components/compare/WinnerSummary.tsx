import { Trophy, Equal } from 'lucide-react';
import type { CompanyTableRow } from '@/types';

interface WinnerSummaryProps {
  hostA: CompanyTableRow;
  hostB: CompanyTableRow;
  winner: 'A' | 'B' | 'tie';
  reasons: string[];
}

export function WinnerSummary({ hostA, hostB, winner, reasons }: WinnerSummaryProps) {
  const winningHost = winner === 'A' ? hostA : winner === 'B' ? hostB : null;
  const isTie = winner === 'tie';

  return (
    <div className={`rounded-xl border p-6 ${
      isTie
        ? 'border-yellow-500/30 bg-yellow-500/5'
        : 'border-accent/30 bg-accent/5'
    }`}>
      <div className="flex items-start gap-4">
        {/* Trophy Icon */}
        <div className={`rounded-full p-3 ${
          isTie ? 'bg-yellow-500/20' : 'bg-accent/20'
        }`}>
          {isTie ? (
            <Equal className="h-8 w-8 text-yellow-400" />
          ) : (
            <Trophy className="h-8 w-8 text-accent" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-sm text-text-secondary mb-1">
            {isTie ? 'Result' : 'Overall Winner'}
          </p>
          <h2 className={`text-2xl font-bold mb-2 ${
            isTie ? 'text-yellow-400' : 'text-accent'
          }`}>
            {isTie ? "It's a Tie!" : winningHost?.name}
          </h2>

          {/* Reasons */}
          <ul className="space-y-1">
            {reasons.map((reason, idx) => (
              <li key={idx} className="text-sm text-text-secondary flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  isTie ? 'bg-yellow-400' : 'bg-accent'
                }`} />
                {reason}
              </li>
            ))}
          </ul>
        </div>

        {/* Score Display */}
        {!isTie && (
          <div className="text-right hidden sm:block">
            <p className="text-sm text-text-secondary">Rating</p>
            <p className="text-3xl font-bold text-accent">
              {winningHost?.overallRating?.toFixed(1) ?? '—'}
              <span className="text-lg text-text-muted">/5</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
