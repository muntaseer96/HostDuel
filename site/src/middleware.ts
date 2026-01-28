import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  'indexnow',
  'yandex',
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

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

  // Note: Rate limiting removed - in-memory rate limiting doesn't work
  // on serverless platforms like Netlify where each request may hit
  // a different server instance. Use Netlify's built-in DDoS protection
  // or implement rate limiting with Redis/KV store if needed.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
