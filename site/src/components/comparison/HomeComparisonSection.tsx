'use client';

import { ComparisonTable } from './ComparisonTable';
import type { CompanyTableRow } from '@/types';

interface HomeComparisonSectionProps {
  hosts: CompanyTableRow[];
  hostingTypeCounts: Record<string, number>;
}

export function HomeComparisonSection({ hosts, hostingTypeCounts }: HomeComparisonSectionProps) {
  return <ComparisonTable hosts={hosts} hostingTypeCounts={hostingTypeCounts} />;
}
