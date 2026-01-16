export const SITE_NAME = 'HostDuel';
export const SITE_DOMAIN = 'https://hostduel.com';
export const SITE_DESCRIPTION =
  'Compare web hosting providers across 355+ data points. Find the perfect host for your needs.';

export const HOSTING_TYPES = {
  shared: 'Shared Hosting',
  'managed-wordpress': 'Managed WordPress',
  vps: 'VPS Hosting',
  'cloud-iaas': 'Cloud Infrastructure',
  dedicated: 'Dedicated Servers',
  'website-builder': 'Website Builder',
  'ecommerce-platform': 'eCommerce Platform',
  jamstack: 'JAMstack/Static',
  paas: 'Platform as a Service',
  'domain-registrar': 'Domain Registrar',
  'cdn-security': 'CDN & Security',
} as const;

export type HostingType = keyof typeof HOSTING_TYPES;

export const HOSTING_TYPE_COLORS: Record<HostingType, string> = {
  shared: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
  'managed-wordpress': 'bg-purple-500/10 text-purple-400 border-purple-500/40',
  vps: 'bg-green-500/10 text-green-400 border-green-500/40',
  'cloud-iaas': 'bg-orange-500/10 text-orange-400 border-orange-500/40',
  dedicated: 'bg-red-500/10 text-red-400 border-red-500/40',
  'website-builder': 'bg-pink-500/10 text-pink-400 border-pink-500/40',
  'ecommerce-platform': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/40',
  jamstack: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40',
  paas: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/40',
  'domain-registrar': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
  'cdn-security': 'bg-amber-500/10 text-amber-400 border-amber-500/40',
};

export const COMPARISON_CATEGORIES = [
  { id: 'budget-shared', name: 'Budget Shared Hosting', types: ['shared'] },
  { id: 'managed-wp', name: 'Managed WordPress', types: ['managed-wordpress'] },
  { id: 'vps-cloud', name: 'VPS & Cloud', types: ['vps', 'cloud-iaas'] },
  { id: 'website-builders', name: 'Website Builders', types: ['website-builder', 'ecommerce-platform'] },
  { id: 'modern-platforms', name: 'Modern Platforms', types: ['jamstack', 'paas'] },
] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/compare', label: 'Compare' },
  { href: '/quiz', label: 'Find Hosting' },
  { href: '/blog', label: 'Blog' },
] as const;

export const RATING_WEIGHTS = {
  valueForMoney: 0.2,
  performance: 0.2,
  supportQuality: 0.15,
  security: 0.15,
  features: 0.1,
  easeOfUse: 0.1,
  transparency: 0.1,
} as const;

export const USE_CASES = [
  { id: 'blogger', name: 'Bloggers', icon: 'pen-tool' },
  { id: 'ecommerce', name: 'eCommerce', icon: 'shopping-cart' },
  { id: 'agency', name: 'Agencies', icon: 'briefcase' },
  { id: 'developer', name: 'Developers', icon: 'code' },
  { id: 'beginner', name: 'Beginners', icon: 'graduation-cap' },
  { id: 'enterprise', name: 'Enterprise', icon: 'building' },
] as const;
