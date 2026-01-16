import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting (resets on server restart)
// For production, use Redis or a proper rate limiting service
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 60; // 60 requests per minute per IP

// Known bad bot user agents
const BAD_BOTS = [
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'blexbot',
  'dataforseobot',
  'petalbot',
  'bytespider',
  'gptbot',
  'ccbot',
  'anthropic-ai',
  'claude-web',
  'scrapy',
  'python-requests',
  'go-http-client',
  'java/',
  'libwww-perl',
  'wget',
  'curl/',
];

// Good bots to always allow
const GOOD_BOTS = [
  'googlebot',
  'bingbot',
  'duckduckbot',
  'slurp',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'whatsapp',
  'telegrambot',
  'applebot',
];

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  record.count++;
  
  if (record.count > MAX_REQUESTS) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const ip = getClientIP(request);

  // Allow good bots (search engines, social media)
  const isGoodBot = GOOD_BOTS.some(bot => userAgent.includes(bot));
  if (isGoodBot) {
    return NextResponse.next();
  }

  // Block known bad bots
  const isBadBot = BAD_BOTS.some(bot => userAgent.includes(bot));
  if (isBadBot) {
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Apply rate limiting for regular users
  if (isRateLimited(ip)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
