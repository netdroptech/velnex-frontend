import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pickaxe, MapPin, Wallet, Coins, Check, ChevronLeft, Loader2, History, Zap, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Location { id: string; name: string; region: string; energy: string; uptime: number }
interface Coin {
  symbol: string; name: string; algo: string; unit: string; hashPerUsd: number
  minAmount: number; contractDays: number; dailyRate: number; color: string
}
interface Options { balance: number; locations: Location[]; coins: Coin[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const fmtHash = (v: number, unit: string) =>
  `${v >= 100 ? Math.round(v).toLocaleString('en-US') : v.toFixed(2).replace(/\.?0+$/, '')} ${unit}`

const CARD: React.CSSProperties = { background: 'hsl(222 60% 5%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem' }
const PRIMARY_BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.65rem 1.25rem',
  borderRadius: '0.625rem', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
  background: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)', color: '#050505',
}
const GHOST_BTN: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 6, padding: '0.6rem 1rem', borderRadius: '0.625rem', fontSize: 13,
  cursor: 'pointer', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 88%)',
}

const STEPS = [
  { label: 'Location', icon: MapPin },
  { label: 'Amount',   icon: Wallet },
  { label: 'Coin',     icon: Coins },
]

function Selectable({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        textAlign: 'left', width: '100%', padding: '1rem', borderRadius: '0.75rem', position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        background: active ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.03)',
        border: active ? '1px solid rgba(96,165,250,0.5)' : '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.15s',
      }}
    >
      {active && (
        <span style={{ position: 'absolute', top: 10, right: 10, width: 18, height: 18, borderRadius: '50%', background: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={11} style={{ color: '#050505' }} />
        </span>
      )}
      {children}
    </button>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Mining() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const [opts,     setOpts]     = useState<Options | null>(null)
  const [loadErr,  setLoadErr]  = useState('')
  const [step,     setStep]     = useState(0)
  const [location, setLocation] = useState<string>('')
  const [amount,   setAmount]   = useState<string>('')
  const [coin,     setCoin]     = useState<string>('')
  const [submitting, setSubmitting] = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    api.get<{ success: boolean; data: Options }>('/user/mining/options')
      .then(r => setOpts(r.data))
      .catch(e => setLoadErr(e.message ?? 'Could not load mining options'))
  }, [])

  if (loadErr) {
    return (
      <div className="p-6 max-w-[900px] mx-auto">
        <div style={{ ...CARD, padding: '2rem', textAlign: 'center', color: '#f87171', fontSize: 13 }}>{loadErr}</div>
      </div>
    )
  }
  if (!opts) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem 0' }}>
        <Loader2 size={28} className="animate-spin" style={{ color: 'hsl(240 5% 40%)' }} />
      </div>
    )
  }

  const balance    = opts.balance
  const minAmount  = Math.min(...opts.coins.map(c => c.minAmount))
  const amt        = parseFloat(amount) || 0
  const selLoc     = opts.locations.find(l => l.id === location)
  const selCoin    = opts.coins.find(c => c.symbol === coin)
  const lowBalance = balance < minAmount

  // Step 2 → continue: low balance goes to deposit, otherwise proceed
  function continueFromAmount() {
    setError('')
    if (lowBalance || amt > balance) {
      navigate('/dashboard/deposit')
      return
    }
    if (amt < minAmount) {
      setError(`Minimum mining amount is ${fmt(minAmount)}`)
      return
    }
    // Drop a previously chosen coin if it no longer fits the amount
    if (selCoin && amt < selCoin.minAmount) setCoin('')
    setStep(2)
  }

  async function startMining() {
    if (!selLoc || !selCoin) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/user/mining/start', { location: selLoc.id, coin: selCoin.symbol, amount: amt })
      refreshUser().catch(() => {})
      navigate('/dashboard/mining/history', { state: { justStarted: true } })
    } catch (e: any) {
      if (/insufficient/i.test(e.message ?? '')) {
        navigate('/dashboard/deposit')
        return
      }
      setError(e.message ?? 'Could not start mining')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-[1000px] mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'hsl(40 6% 95%)' }}>Start Mining</h1>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>New</span>
          </div>
          <p style={{ fontSize: 13, color: 'hsl(240 5% 55%)' }}>Rent hashrate from our mining farms, paid from your balance</p>
        </div>
        <button style={GHOST_BTN} onClick={() => navigate('/dashboard/mining/history')}>
          <History size={14} /> Mining History
        </button>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((s, i) => {
          const done = i < step, current = i === step
          return (
            <div key={s.label} className="flex items-center gap-2" style={{ flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done || current ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.05)',
                  border: current ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.08)',
                }}>
                  {done ? <Check size={13} style={{ color: '#60a5fa' }} /> : <s.icon size={13} style={{ color: current ? '#60a5fa' : 'hsl(240 5% 50%)' }} />}
                </div>
                <span className="hidden sm:inline" style={{ fontSize: 12, fontWeight: 600, color: current ? 'hsl(40 6% 92%)' : 'hsl(240 5% 50%)' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: done ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.08)' }} />}
            </div>
          )
        })}
      </div>

      <div style={{ ...CARD, padding: '1.5rem' }}>
        {/* ── Step 1: location ─────────────────────────────────────────── */}
        {step === 0 && (
          <>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 92%)', marginBottom: 4 }}>Select where to mine from</h2>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)', marginBottom: '1.25rem' }}>Choose the mining farm that will run your contract.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {opts.locations.map(l => (
                <Selectable key={l.id} active={location === l.id} onClick={() => setLocation(l.id)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <MapPin size={14} style={{ color: '#60a5fa' }} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'hsl(40 6% 92%)' }}>{l.name}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'hsl(240 5% 55%)' }}>{l.region} · {l.energy} power · {l.uptime}% uptime</p>
                </Selectable>
              ))}
            </div>
            <div className="flex justify-end mt-5">
              <button style={{ ...PRIMARY_BTN, opacity: location ? 1 : 0.5 }} disabled={!location} onClick={() => setStep(1)}>Continue</button>
            </div>
          </>
        )}

        {/* ── Step 2: amount from balance ──────────────────────────────── */}
        {step === 1 && (
          <>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 92%)', marginBottom: 4 }}>Amount to mine with</h2>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)', marginBottom: '1.25rem' }}>This amount is taken from your current balance.</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.625rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: 12, color: 'hsl(240 5% 55%)' }}>Current balance</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'hsl(40 6% 95%)' }}>{fmt(balance)}</span>
            </div>

            {lowBalance ? (
              <div style={{ display: 'flex', gap: 10, padding: '0.875rem 1rem', borderRadius: '0.625rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: '1rem' }}>
                <AlertTriangle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: 'hsl(40 6% 80%)' }}>
                  Your balance is below the {fmt(minAmount)} minimum. Deposit funds to start mining.
                </p>
              </div>
            ) : (
              <>
                <label style={{ fontSize: 12, color: 'hsl(240 5% 60%)', display: 'block', marginBottom: 6 }}>Amount (USD)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number" inputMode="decimal" min={minAmount} max={balance} step="any"
                    value={amount} onChange={e => { setAmount(e.target.value); setError('') }}
                    placeholder={`Min ${fmt(minAmount)}`}
                    style={{ flex: 1, minWidth: 0, padding: '0.65rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', color: 'hsl(40 6% 92%)', fontSize: 14, outline: 'none' }}
                  />
                  <button style={GHOST_BTN} onClick={() => setAmount(String(Math.floor(balance * 100) / 100))}>Max</button>
                </div>
                {amt > balance && (
                  <p style={{ fontSize: 12, color: '#f59e0b' }}>That's more than your balance. Continuing will take you to the deposit page.</p>
                )}
              </>
            )}

            {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{error}</p>}

            <div className="flex justify-between mt-5">
              <button style={GHOST_BTN} onClick={() => setStep(0)}><ChevronLeft size={14} /> Back</button>
              {lowBalance || amt > balance ? (
                <button style={PRIMARY_BTN} onClick={() => navigate('/dashboard/deposit')}>Deposit Funds</button>
              ) : (
                <button style={{ ...PRIMARY_BTN, opacity: amt > 0 ? 1 : 0.5 }} disabled={amt <= 0} onClick={continueFromAmount}>Continue</button>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: coin ─────────────────────────────────────────────── */}
        {step === 2 && (
          <>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'hsl(40 6% 92%)', marginBottom: 4 }}>Select coin to mine</h2>
            <p style={{ fontSize: 12, color: 'hsl(240 5% 50%)', marginBottom: '1.25rem' }}>
              Mining with {fmt(amt)} from {selLoc?.name}.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {opts.coins.map(c => {
                const tooLow = amt < c.minAmount
                return (
                  <Selectable key={c.symbol} active={coin === c.symbol} disabled={tooLow} onClick={() => setCoin(c.symbol)}>
                    <div className="flex items-center gap-2.5 mb-2">
                      <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: `${c.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Pickaxe size={14} style={{ color: c.color }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'hsl(40 6% 92%)' }}>{c.name}</p>
                        <p style={{ fontSize: 11, color: 'hsl(240 5% 50%)' }}>{c.symbol} · {c.algo}</p>
                      </div>
                    </div>
                    {tooLow ? (
                      <p style={{ fontSize: 11, color: '#f59e0b' }}>Minimum {fmt(c.minAmount)}</p>
                    ) : (
                      <p style={{ fontSize: 11, color: 'hsl(240 5% 60%)' }}>
                        {fmtHash(amt * c.hashPerUsd, c.unit)} · {c.contractDays} days · ~{fmt(amt * c.dailyRate / 100)}/day
                      </p>
                    )}
                  </Selectable>
                )
              })}
            </div>

            {selCoin && selLoc && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.04)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {[
                  ['Farm',        selLoc.name],
                  ['Coin',        `${selCoin.name} (${selCoin.symbol})`],
                  ['Amount',      fmt(amt)],
                  ['Hashrate',    fmtHash(amt * selCoin.hashPerUsd, selCoin.unit)],
                  ['Contract',    `${selCoin.contractDays} days`],
                  ['Est. daily',  `~${fmt(amt * selCoin.dailyRate / 100)}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p style={{ fontSize: 10, color: 'hsl(240 5% 50%)', marginBottom: 2 }}>{k}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'hsl(40 6% 90%)' }}>{v}</p>
                  </div>
                ))}
              </div>
            )}

            {error && <p style={{ fontSize: 12, color: '#f87171', marginTop: 10 }}>{error}</p>}

            <div className="flex justify-between mt-5">
              <button style={GHOST_BTN} onClick={() => setStep(1)}><ChevronLeft size={14} /> Back</button>
              <button style={{ ...PRIMARY_BTN, opacity: selCoin && !submitting ? 1 : 0.5 }} disabled={!selCoin || submitting} onClick={startMining}>
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Start Mining
              </button>
            </div>
          </>
        )}
      </div>

      <p style={{ fontSize: 11, color: 'hsl(240 5% 40%)', textAlign: 'center', marginTop: '1.5rem' }}>
        Estimated output varies with network difficulty and coin price. Cryptocurrency mining involves risk.
      </p>
    </div>
  )
}
