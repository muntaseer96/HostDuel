'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { computeTco, type TcoHost, type TcoOptions, TERM_OPTIONS } from '@/lib/tco';
import { HOSTING_TYPES, type HostingType } from '@/lib/constants';

const fmtMoney = (n: number) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: n % 1 === 0 ? 0 : 2 })}`;

const TYPE_OPTIONS: { value: HostingType | 'any'; label: string }[] = [
  { value: 'any', label: 'Any type' },
  ...(Object.entries(HOSTING_TYPES) as [HostingType, string][])
    .map(([value, label]) => ({ value, label })),
];

interface Props {
  hosts: TcoHost[];
  initialOptions: TcoOptions;
}

export function CalculatorClient({ hosts, initialOptions }: Props) {
  const router = useRouter();
  const [opts, setOpts] = useState<TcoOptions>(initialOptions);

  const results = useMemo(() => computeTco(hosts, opts), [hosts, opts]);

  // Keep the URL in sync so the current selection is shareable, without a full nav.
  const update = useCallback(
    (patch: Partial<TcoOptions>) => {
      const next = { ...opts, ...patch };
      setOpts(next);
      const qs = new URLSearchParams({
        years: String(next.years),
        type: next.type,
        sites: String(next.minSites),
      });
      router.replace(`/calculator?${qs.toString()}`, { scroll: false });
    },
    [opts, router]
  );

  const cheapest = results[0];

  return (
    <div>
      {/* Controls */}
      <div className="bg-bg-secondary border border-border-subtle rounded-xl p-5 sm:p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Term length */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">How many years?</label>
            <div className="flex gap-2">
              {TERM_OPTIONS.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => update({ years: y })}
                  className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                    opts.years === y
                      ? 'bg-accent text-background border-accent'
                      : 'bg-background text-text-secondary border-border-subtle hover:border-accent/50'
                  }`}
                >
                  {y} yr
                </button>
              ))}
            </div>
          </div>

          {/* Hosting type */}
          <div>
            <label htmlFor="tco-type" className="block text-sm font-medium text-text-secondary mb-2">
              Hosting type
            </label>
            <select
              id="tco-type"
              value={opts.type}
              onChange={(e) => update({ type: e.target.value as HostingType | 'any' })}
              className="w-full py-2 px-3 rounded-lg bg-background border border-border-subtle text-foreground text-sm focus:border-accent focus:outline-none"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Min sites */}
          <div>
            <label htmlFor="tco-sites" className="block text-sm font-medium text-text-secondary mb-2">
              Sites you need to host
            </label>
            <input
              id="tco-sites"
              type="number"
              min={1}
              max={50}
              value={opts.minSites}
              onChange={(e) => update({ minSites: Math.max(1, Math.min(50, Number(e.target.value) || 1)) })}
              className="w-full py-2 px-3 rounded-lg bg-background border border-border-subtle text-foreground text-sm focus:border-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Result headline */}
      {cheapest ? (
        <p className="text-text-secondary mb-6">
          Cheapest over {opts.years} {opts.years === 1 ? 'year' : 'years'}:{' '}
          <Link href={`/hosting/${cheapest.id}`} className="text-accent font-semibold hover:underline">
            {cheapest.name}
          </Link>{' '}
          at <strong className="text-foreground">{fmtMoney(cheapest.total)}</strong> total (
          {fmtMoney(cheapest.effectiveMonthly)}/mo effective). {results.length} hosts match.
        </p>
      ) : (
        <p className="text-text-secondary mb-6">No hosts match these filters — try widening them.</p>
      )}

      {/* Ranked table */}
      {results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border-subtle rounded-lg overflow-hidden">
            <thead className="bg-bg-secondary text-text-muted">
              <tr>
                <th className="text-left font-semibold p-3 w-10">#</th>
                <th className="text-left font-semibold p-3">Host</th>
                <th className="text-right font-semibold p-3">{opts.years}-yr total</th>
                <th className="text-right font-semibold p-3 hidden sm:table-cell">Effective /mo</th>
                <th className="text-right font-semibold p-3 hidden md:table-cell">Renewal tax</th>
                <th className="text-right font-semibold p-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={r.id}
                  className={`border-t border-border-subtle ${i === 0 ? 'bg-accent/5' : ''}`}
                >
                  <td className="p-3 text-text-muted font-mono">{i + 1}</td>
                  <td className="p-3">
                    <Link href={`/hosting/${r.id}`} className="text-foreground hover:text-accent font-medium">
                      {r.name}
                    </Link>
                    {i === 0 && (
                      <span className="ml-2 text-xs text-accent font-semibold">cheapest</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-mono font-semibold text-foreground">
                    {fmtMoney(r.total)}
                  </td>
                  <td className="p-3 text-right font-mono text-text-secondary hidden sm:table-cell">
                    {fmtMoney(r.effectiveMonthly)}
                  </td>
                  <td className="p-3 text-right font-mono hidden md:table-cell">
                    {r.renewalTax > 0 ? (
                      <span className="text-accent">+{fmtMoney(r.renewalTax)}</span>
                    ) : (
                      <span className="text-text-muted">$0</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Link href={`/go/${r.id}`} rel="sponsored" className="text-accent text-xs hover:underline whitespace-nowrap">
                      Visit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-text-muted mt-4">
        Total = year 1 (promotional price + any setup fee) + each later year at the full renewal price.
        &quot;Renewal tax&quot; is the extra you pay over the term versus if the sign-up price never expired.
        Effective /mo spreads the total across the whole term.
      </p>
    </div>
  );
}
