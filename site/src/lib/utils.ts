import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined) return 'N/A';
  return `$${price.toFixed(2)}`;
}

export function formatPriceRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return 'N/A';
  if (min === null) return `Up to ${formatPrice(max)}`;
  if (max === null) return `From ${formatPrice(min)}`;
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getRatingColor(rating: number): string {
  if (rating >= 4) return 'text-success';
  if (rating >= 3) return 'text-warning';
  return 'text-error';
}

export function getUptimeColor(uptime: number): string {
  if (uptime >= 99.9) return 'text-success';
  if (uptime >= 99) return 'text-warning';
  return 'text-error';
}
