'use client'

const countryColors: Record<string, string[]> = {
  '🇦🇷': ['#75AADB', '#FFFFFF', '#75AADB'],
  '🇵🇹': ['#006600', '#FF0000', '#006600'],
  '🇫🇷': ['#002395', '#FFFFFF', '#ED2939'],
  '🇳🇴': ['#BA0C2F', '#FFFFFF', '#BA0C2F'],
  '🇧🇷': ['#009739', '#FFDF00', '#009739'],
  '🇪🇸': ['#AA151B', '#F1BF00', '#AA151B'],
}

export default function PlayerImage({ country, size = 'sm' }: { country: string; size?: 'sm' | 'lg' }) {
  const colors = countryColors[country] || ['#00ff88', '#00d9ff', '#00ff88']
  const s = size === 'lg' ? 200 : 120

  return (
    <svg viewBox="0 0 120 160" width={s} height={s * 160/120} className="rounded-lg">
      <defs>
        <linearGradient id={'bg' + country} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="0.15" />
          <stop offset="50%" stopColor={colors[1]} stopOpacity="0.08" />
          <stop offset="100%" stopColor={colors[2]} stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <rect width="120" height="160" rx="8" fill={'url(#bg' + country + ')'} />

      {/* Player silhouette */}
      <circle cx="60" cy="45" r="22" fill="rgba(255,255,255,0.12)" />
      <ellipse cx="60" cy="105" rx="30" ry="40" fill="rgba(255,255,255,0.08)" />

      {/* Running legs */}
      <line x1="42" y1="130" x2="35" y2="155" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />
      <line x1="78" y1="130" x2="85" y2="155" stroke="rgba(255,255,255,0.15)" strokeWidth="4" strokeLinecap="round" />

      {/* Arms */}
      <line x1="35" y1="75" x2="20" y2="95" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />
      <line x1="85" y1="75" x2="100" y2="60" stroke="rgba(255,255,255,0.12)" strokeWidth="3" strokeLinecap="round" />

      {/* Ball at feet */}
      <circle cx="85" cy="150" r="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />

      {/* Country flag */}
      <text x="60" y="16" textAnchor="middle" fontSize="14">{country}</text>

      {/* AI glow effect */}
      <circle cx="60" cy="45" r="22" fill="none" stroke="#00ff88" strokeWidth="0.5" opacity="0.3" />
      <circle cx="60" cy="45" r="18" fill="none" stroke="#00ff88" strokeWidth="0.3" opacity="0.2" />
    </svg>
  )
}
