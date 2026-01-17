import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'HostDuel - Find Your Perfect Web Host';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1a1a1a 0%, #0a0a0a 50%)',
        }}
      >
        {/* Logo/Brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 100 100"
            fill="none"
            style={{ marginRight: 20 }}
          >
            <rect x="10" y="60" width="30" height="35" rx="4" fill="#84cc16" />
            <rect x="60" y="60" width="30" height="35" rx="4" fill="#84cc16" />
            <rect x="42" y="10" width="16" height="50" rx="4" fill="#84cc16" />
            <rect x="20" y="45" width="60" height="8" rx="2" fill="#84cc16" />
          </svg>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '-0.02em',
            }}
          >
            HOST
            <span style={{ color: '#84cc16' }}>DUEL</span>
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Compare 56 Web Hosts Across 355+ Data Points
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'flex',
            marginTop: 50,
            gap: 60,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 700, color: '#84cc16' }}>56</span>
            <span style={{ fontSize: 20, color: '#71717a' }}>Hosts</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 700, color: '#84cc16' }}>355+</span>
            <span style={{ fontSize: 20, color: '#71717a' }}>Data Points</span>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 48, fontWeight: 700, color: '#84cc16' }}>362</span>
            <span style={{ fontSize: 20, color: '#71717a' }}>Comparisons</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            fontSize: 24,
            color: '#52525b',
          }}
        >
          hostduel.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
