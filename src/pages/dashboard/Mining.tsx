import { useNavigate } from 'react-router-dom'
import { Pickaxe, Cpu, Zap, Clock, Check, Activity } from 'lucide-react'

const PACKAGES = [
  {
    id: 'btc', coin: 'Bitcoin', symbol: 'BTC', algo: 'SHA-256', color: '#f59e0b',
    hashrate: '100 TH/s', contract: '180 days', price: 1000, estDaily: '0.00012 BTC',
    features: ['Daily payouts to wallet', 'No hardware or setup', 'Maintenance included'],
  },
  {
    id: 'ltc', coin: 'Litecoin', symbol: 'LTC', algo: 'Scrypt', color: '#94a3b8',
    hashrate: '2 GH/s', contract: '120 days', price: 500, estDaily: '0.018 LTC',
    features: ['Daily payouts to wallet', 'Merged DOGE rewards', 'Maintenance included'],
  },
  {
    id: 'kas', coin: 'Kaspa', symbol: 'KAS', algo: 'kHeavyHash', color: '#22d3ee',
    hashrate: '5 TH/s', contract: '90 days', price: 750, estDaily: '42 KAS',
    features: ['Daily payouts to wallet', 'Fast block times', 'Maintenance included'],
  },
  {
    id: 'etc', coin: 'Ethereum Classic', symbol: 'ETC', algo: 'Etchash', color: '#60a5fa',
    hashrate: '1 GH/s', contract: '120 days', price: 600, estDaily: '0.021 ETC',
    features: ['Daily payouts to wallet', 'GPU-optimised farms', 'Maintenance included'],
  },
]

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US')
}

export function Mining() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Mining</h1>
          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>New</span>
        </div>
        <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Rent hashrate from our mining farms and earn crypto rewards daily</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Supported Coins',  value: String(PACKAGES.length), icon: Cpu },
          { label: 'Payout Frequency', value: 'Daily',                  icon: Clock },
          { label: 'Farm Uptime',      value: '99.9%',                  icon: Activity },
        ].map(s => (
          <div key={s.label} style={{ background: 'hsl(222 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={16} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(40 6% 92%)' }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Packages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PACKAGES.map(p => (
          <div key={p.id} style={{ background: 'hsl(222 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: `${p.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Pickaxe size={16} style={{ color: p.color }} />
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 92%)' }}>{p.coin}</p>
                <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>{p.symbol} · {p.algo}</p>
              </div>
            </div>

            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(40 6% 95%)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 4 }}>
              {p.hashrate}
            </p>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)', marginBottom: '1.25rem' }}>
              hashrate · {p.contract} contract
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem', marginBottom: '1.25rem' }}>
              <div>
                <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)', marginBottom: 1 }}>Price</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 88%)' }}>{fmt(p.price)}</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)', marginBottom: 1 }}>Est. Daily Output</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: p.color }}>{p.estDaily}</p>
              </div>
            </div>

            <ul style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {p.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: 12, color: 'hsl(240 5% 65%)' }}>
                  <Check size={12} style={{ color: p.color, marginTop: 1, flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/dashboard/deposit')}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '0.625rem', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)', color: '#050505', border: 'none', transition: 'opacity 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Zap size={13} /> Start Mining
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'hsl(240 5% 40%)', textAlign: 'center', marginTop: '1.5rem' }}>
        Estimated output varies with network difficulty and coin price. Cryptocurrency mining involves risk.
      </p>
    </div>
  )
}
