/**
 * study-data.ts — derives citable, original findings from the live 56-host dataset.
 *
 * Powers the /research linkbait studies. Everything here is computed at build time
 * from the same `CompanyTableRow` data the rest of the site uses, so the published
 * numbers always match the source data and refresh automatically when prices change.
 *
 * Edition 1 (now): renewal-markup, multi-year TCO shock, and hidden-fee findings —
 * all derivable from a single price snapshot. The "who raised prices in 2026"
 * change-over-time angle waits until the monthly refresh accumulates enough
 * `priceHistory` depth (see hostduel-maintenance-cadence) and will live in a
 * separate edition.
 */
import { getAllTableRows } from './data';
import type { CompanyTableRow } from '@/types';
import type { HostingType } from './constants';

export interface MarkupEntry {
  id: string;
  name: string;
  promo: number;
  renewal: number;
  markupPercent: number;
}

export interface TcoEntry {
  id: string;
  name: string;
  hostingType: HostingType | null;
  firstYear: number;
  secondYear: number;
  jump: number;
}

export interface FeeEntry {
  id: string;
  name: string;
  amount: number;
}

export interface StudyFindings {
  /** Total hosts in the dataset the study was computed from. */
  totalHosts: number;
  /** Most recent `dataLastUpdated` across the dataset (YYYY-MM-DD) — the "data as of" date. */
  dataAsOf: string | null;
  shared: {
    sampleSize: number;
    avgMarkupPercent: number;
    medianMarkupPercent: number;
    /** How many of the sample renew at a higher price than they sign up for. */
    withMarkupCount: number;
    /** Multiplier the average host's price grows to at renewal (e.g. 3.1×). */
    avgMultiplier: number;
    worstOffenders: MarkupEntry[];
  };
  tco: {
    biggestJumps: TcoEntry[];
  };
  hiddenFees: {
    setupFeeHosts: FeeEntry[];
    backupRestoreFeeHosts: FeeEntry[];
    noFreeDomainCount: number;
    noMoneyBackCount: number;
    avgMoneyBackDays: number;
  };
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const round1 = (n: number) => Math.round(n * 10) / 10;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export async function computeStudyFindings(): Promise<StudyFindings> {
  const rows: CompanyTableRow[] = await getAllTableRows();

  // --- Renewal markup, restricted to shared hosting (where promo→renewal is the
  // headline trap and the prices are directly comparable). ---
  const sharedMarkups: MarkupEntry[] = rows
    .filter((r) => r.hostingType === 'shared')
    .map((r) => {
      const promo = r.monthlyPrice;
      const renewal = r.renewalPrice;
      if (!isNum(promo) || !isNum(renewal) || promo <= 0) return null;
      return {
        id: r.id,
        name: r.name,
        promo,
        renewal,
        markupPercent: ((renewal - promo) / promo) * 100,
      };
    })
    .filter((x): x is MarkupEntry => x !== null);

  const markupValues = sharedMarkups.map((m) => m.markupPercent);
  const avgMarkup = markupValues.reduce((s, v) => s + v, 0) / (markupValues.length || 1);
  const worstOffenders = [...sharedMarkups]
    .filter((m) => m.markupPercent > 0)
    .sort((a, b) => b.markupPercent - a.markupPercent)
    .slice(0, 10);

  // --- Multi-year TCO shock: biggest absolute year-1 → year-2 cost jumps. ---
  const biggestJumps: TcoEntry[] = rows
    .map((r) => {
      if (!isNum(r.firstYearCost) || !isNum(r.secondYearCost)) return null;
      return {
        id: r.id,
        name: r.name,
        hostingType: r.hostingType,
        firstYear: r.firstYearCost,
        secondYear: r.secondYearCost,
        jump: r.secondYearCost - r.firstYearCost,
      };
    })
    .filter((x): x is TcoEntry => x !== null && x.jump > 0)
    .sort((a, b) => b.jump - a.jump)
    .slice(0, 8);

  // --- Hidden fees ---
  const setupFeeHosts: FeeEntry[] = rows
    .filter((r) => isNum(r.setupFee) && r.setupFee > 0)
    .map((r) => ({ id: r.id, name: r.name, amount: r.setupFee as number }))
    .sort((a, b) => b.amount - a.amount);

  const backupRestoreFeeHosts: FeeEntry[] = rows
    .filter((r) => isNum(r.backupRestoreFee) && r.backupRestoreFee > 0)
    .map((r) => ({ id: r.id, name: r.name, amount: r.backupRestoreFee as number }))
    .sort((a, b) => b.amount - a.amount);

  const dataAsOf =
    rows
      .map((r) => r.dataLastUpdated)
      .filter((d): d is string => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
      .sort()
      .pop() ?? null;

  const noFreeDomainCount = rows.filter((r) => r.freeDomain === false).length;
  const noMoneyBackCount = rows.filter((r) => r.moneyBackDays === 0).length;
  const moneyBackDays = rows.map((r) => r.moneyBackDays).filter(isNum);
  const avgMoneyBackDays = moneyBackDays.reduce((s, v) => s + v, 0) / (moneyBackDays.length || 1);

  return {
    totalHosts: rows.length,
    dataAsOf,
    shared: {
      sampleSize: sharedMarkups.length,
      avgMarkupPercent: round1(avgMarkup),
      medianMarkupPercent: round1(median(markupValues)),
      withMarkupCount: worstOffenders.length === 0 ? 0 : sharedMarkups.filter((m) => m.markupPercent > 0).length,
      avgMultiplier: round1(1 + avgMarkup / 100),
      worstOffenders,
    },
    tco: { biggestJumps },
    hiddenFees: {
      setupFeeHosts,
      backupRestoreFeeHosts,
      noFreeDomainCount,
      noMoneyBackCount,
      avgMoneyBackDays: Math.round(avgMoneyBackDays),
    },
  };
}
