'use client'

var paths: Record<string, string> = {
  btc: '/crypto-icons/btc.svg',
  eth: '/crypto-icons/eth.svg',
  usdt: '/crypto-icons/usdt.svg',
  sol: '/crypto-icons/sol.svg',
  bnb: '/crypto-icons/bnb.svg',
}

export default function CryptoIcon({ coin, size = 32 }: { coin: string; size?: number }) {
  var src = paths[coin]
  if (!src) return null
  return <img src={src} alt={coin} width={size} height={size} className="flex-shrink-0" loading="lazy" />
}
