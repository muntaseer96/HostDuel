import { Calendar, Clock, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/blog';
import type { BlogCategory } from '@/types/blog';
import { CATEGORY_COLORS } from '@/types/blog';

interface BlogMetaProps {
  date: string;
  updatedDate?: string;
  readingTime: number;
  category: BlogCategory;
  showCategory?: boolean;
}

export function BlogMeta({
  date,
  updatedDate,
  readingTime,
  category,
  showCategory = true,
}: BlogMetaProps) {
  const categoryColor = CATEGORY_COLORS[category];

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
      {showCategory && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Calendar className="h-4 w-4" />
        {formatDate(date)}
      </span>
      {updatedDate && updatedDate !== date && (
        <span className="flex items-center gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Updated {formatDate(updatedDate)}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        {readingTime} min read
      </span>
    </div>
  );
}
