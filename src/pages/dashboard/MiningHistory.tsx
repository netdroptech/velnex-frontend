import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Pickaxe, Loader2, CheckCircle2, Plus, Activity, DollarSign, Layers } from 'lucide-react'
import { api } from '@/lib/api'

interface Session {
  id: string; coin: string; location: string; amount: number; hashrate: string
  dailyRate: number; contractDays: number; earned: number; status: string
  startedAt: string; endsAt: string
}

const LOCATION_NAMES: Record<string, string> = {
  iceland: 'Reykjavík, Iceland', norway: 'Oslo, Norway', texas: 'Texas, USA',
  quebec: 'Québec, Canada', kazakhstan: 'Almaty, Kazakhstan',
}
const COIN_COLORS: Record<string, string> = {
  BTC: '#f59e0b', ETH: '#818cf8', LTC: '#94a3b8', DOGE: '#eab308', KAS: '#22d3ee', ETC: '#60a5fa',
}
const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  Active:    { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  Completed: { color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  Cancelled: { color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
}

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const CARD: React.CSSProperties = { background: 'hsl(222 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem' }

export function MiningHistory() {
  const navigate = useNavigate()
  const justStarted = (useLocation().state as { justStarted?: boolean } | null)?.justStarted
  const [sessions, setSessions] = useState<Session[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<{ success: boolean; data: Session[] }>('/user/mining/history')
      .then(r => setSessions(r.data))
      .catch(e => setError(e.message ?? 'Could not load mining history'))
  }, [])

  const active      = sessions?.filter(s => s.status === 'Active') ?? []
  const totalMining = active.reduce((s, x) => s + x.amount, 0)
  const totalEarned = sessions?.reduce((s, x) => s + x.earned, 0) ?? 0

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto overflow-x-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)', marginBottom: 3 }}>Mining History</h1>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>All your mining contracts and their progress</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/mining')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.55rem 1rem', borderRadius: '0.6rem', background: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)', color: '#050505', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >
          <Plus size={14} /> Start Mining
        </button>
      </div>

      {justStarted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.875rem 1rem', borderRadius: '0.75rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', marginBottom: '1.25rem' }}>
          <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: 'hsl(40 6% 88%)' }}>Your mining contract has started.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Active Contracts', value: String(active.length), icon: Activity },
          { label: 'Currently Mining', value: fmt(totalMining),      icon: Layers },
          { label: 'Total Earned',     value: fmt(totalEarned),      icon: DollarSign },
        ].map(s => (
          <div key={s.label} style={{ ...CARD, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: 'rgba(96,165,250,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <s.icon size={16} style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'hsl(40 6% 92%)' }}>{sessions ? s.value : '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {error && <div style={{ ...CARD, padding: '2rem', textAlign: 'center', color: '#f87171', fontSize: 13 }}>{error}</div>}

      {!error && !sessions && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
          <Loader2 size={28} className="animate-spin" style={{ color: 'hsl(240 5% 40%)' }} />
        </div>
      )}

      {sessions && sessions.length === 0 && (
        <div style={{ ...CARD, padding: '3rem', textAlign: 'center' }}>
          <Pickaxe size={28} style={{ color: 'hsl(240 5% 45%)', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: 14, fontWeight: 500, color: 'hsl(40 6% 75%)', marginBottom: 4 }}>No mining contracts yet</p>
          <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)' }}>Start mining to see your contracts here.</p>
        </div>
      )}

      {sessions && sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sessions.map(s => {
            const start = new Date(s.startedAt).getTime()
            const end   = new Date(s.endsAt).getTime()
            const pct   = s.status === 'Active' ? Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100)) : 100
            const color = COIN_COLORS[s.coin] ?? '#60a5fa'
            const st    = STATUS_STYLE[s.status] ?? STATUS_STYLE.Active
            return (
              <div key={s.id} style={{ ...CARD, padding: '1.25rem' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div style={{ width: 36, height: 36, borderRadius: '0.6rem', background: `${color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pickaxe size={15} style={{ color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'hsl(40 6% 92%)' }}>{s.coin} Mining</p>
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>{LOCATION_NAMES[s.location] ?? s.location}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: st.bg, color: st.color }}>{s.status}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    ['Amount',   fmt(s.amount)],
                    ['Hashrate', s.hashrate],
                    ['Earned',   fmt(s.earned)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)', marginBottom: 2 }}>{k}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 88%)' }}>{v}</p>
                    </div>
                  ))}
                </div>

                <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.05)', overflow: 'hidden', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                </div>
                <div className="flex justify-between" style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>
                  <span>{fmtDate(s.startedAt)}</span>
                  <span>{Math.round(pct)}% · {s.contractDays} days</span>
                  <span>{fmtDate(s.endsAt)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
