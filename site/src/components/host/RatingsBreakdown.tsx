import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Company } from '@/types';

interface RatingsBreakdownProps {
  company: Company;
}

interface RatingItem {
  label: string;
  value: number | null;
  description: string;
}

export function RatingsBreakdown({ company }: RatingsBreakdownProps) {
  const ratings = company.ratings;

  const ratingItems: RatingItem[] = [
    {
      label: 'Value for Money',
      value: ratings.valueForMoney,
      description: 'Price vs features offered',
    },
    {
      label: 'Performance',
      value: ratings.performance,
      description: 'Speed and uptime',
    },
    {
      label: 'Support Quality',
      value: ratings.supportQuality,
      description: 'Response time and helpfulness',
    },
    {
      label: 'Security',
      value: ratings.security,
      description: 'SSL, backups, and protection',
    },
    {
      label: 'Features',
      value: ratings.features,
      description: 'Tools and capabilities',
    },
    {
      label: 'Ease of Use',
      value: ratings.easeOfUse,
      description: 'Beginner-friendliness',
    },
    {
      label: 'Transparency',
      value: ratings.transparency,
      description: 'Pricing clarity and policies',
    },
  ];

  const validRatings = ratingItems.filter((r) => r.value !== null);

  if (validRatings.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {validRatings.map((rating) => (
            <RatingBar key={rating.label} {...rating} />
          ))}
        </div>

        {/* Overall */}
        {ratings.overallRating !== null && (
          <div className="mt-6 pt-6 border-t border-border-subtle">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Overall Rating</p>
                <p className="text-xs text-text-muted">Weighted average of all categories</p>
              </div>
              <div className="text-3xl font-bold text-accent">
                {ratings.overallRating.toFixed(1)}
                <span className="text-lg text-text-muted">/5</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RatingBar({ label, value, description }: RatingItem) {
  if (value === null) return null;

  // Calculate percentage (rating is out of 5)
  const percentage = (value / 5) * 100;

  // Determine color based on rating
  const getColor = (val: number): string => {
    if (val >= 4) return 'bg-green-500';
    if (val >= 3) return 'bg-yellow-500';
    return 'bg-red-400';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-text-muted ml-2 hidden sm:inline">
            {description}
          </span>
        </div>
        <span className="text-sm font-semibold text-foreground">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-bg-primary">
        <div
          className={`h-2 rounded-full ${getColor(value)} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
