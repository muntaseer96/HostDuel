import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Company } from '@/types';

interface ProsConsProps {
  company: Company;
}

export function ProsCons({ company }: ProsConsProps) {
  const editorial = company.editorial;

  // Parse pros and cons from the editorial content
  const pros = parseBulletPoints(editorial.bestFor);
  const cons = parseBulletPoints(editorial.avoidIf);
  const knownIssues = parseBulletPoints(editorial.knownIssues);

  // Combine cons and known issues
  const allCons = [...cons, ...knownIssues].slice(0, 6);

  if (pros.length === 0 && allCons.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pros & Cons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pros */}
          {pros.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-green-400 mb-3">
                <ThumbsUp className="h-4 w-4" />
                What We Like
              </h4>
              <ul className="space-y-2">
                {pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                    <span className="text-text-secondary">{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {allCons.length > 0 && (
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold text-red-400 mb-3">
                <ThumbsDown className="h-4 w-4" />
                What Could Be Better
              </h4>
              <ul className="space-y-2">
                {allCons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                    <span className="text-text-secondary">{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Parse semicolon-separated bullet points
function parseBulletPoints(text: string | null): string[] {
  if (!text) return [];

  return text
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length < 150) // Filter out empty or too-long items
    .slice(0, 6); // Limit to 6 items
}
