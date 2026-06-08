'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CryptoIcon from '@/components/deposit/CryptoIcon'
import { Banknote, Check, Copy } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { depositPlans, paymentMethods } from '@/data/deposit'
import { formatCurrency } from '@/lib/utils'

export default function DepositPage() {
  const { addDeposit, addNotification, language } = useStore()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  function generateAddress(network: string): string {
    var addr = "0x"
    var chars = "0123456789abcdef"
    for (var i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)]
    return addr + network.substring(0, 4).toUpperCase()
  }

  function handleDeposit() {
    if (!selectedAmount || !selectedMethod) return
    setProcessing(true)
    setTimeout(() => {
      addDeposit(selectedAmount)
      addNotification('success', 'Deposit of ' + formatCurrency(selectedAmount) + ' completed!')
      setProcessing(false)
      setDone(true)
      setTimeout(() => setDone(false), 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        
        {/* ===== ASSET OVERVIEW ===== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-5"
        >
          <div className="bg-[#141C2F] rounded-2xl p-4 border border-white/[0.04]">
            <div className="text-[10px] text-white/30 tracking-wider mb-1">{t('deposit.balance', language).toUpperCase()}</div>
            <div className="text-lg sm:text-xl font-bold text-white/90">₿0.00</div>
            <div className="text-[10px] text-white/20 mt-0.5">~ $0.00</div>
          </div>
          <div className="bg-[#141C2F] rounded-2xl p-4 border border-white/[0.04]">
            <div className="text-[10px] text-white/30 tracking-wider mb-1">{t('deposit.todayProfit', language).toUpperCase()}</div>
            <div className="text-lg sm:text-xl font-bold text-green-400">+$0.00</div>
            <div className="text-[10px] text-green-400/30 mt-0.5">+0%</div>
          </div>
          <div className="bg-[#141C2F] rounded-2xl p-4 border border-white/[0.04]">
            <div className="text-[10px] text-white/30 tracking-wider mb-1">{t('deposit.vipLevel', language).toUpperCase()}</div>
            <div className="text-lg sm:text-xl font-bold text-[#F5C542]">VIP 0</div>
            <div className="text-[10px] text-[#F5C542]/30 mt-0.5">Next: $1,000</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ===== LEFT: DEPOSIT AREA ===== */}
          <div className="lg:col-span-2 space-y-4">

            {/* Payment Methods */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-white/70">{t('deposit.paymentMethod', language)}</h3>
                <span className="text-[10px] text-[#F5C542]/60 font-medium">{t('deposit.recommended', language)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id:'USDT_TRC20', ticker:'USDT', chain:'TRC20', time:'1-3 min' },
                  { id:'USDT_ERC20', ticker:'USDT', chain:'ERC20', time:'3-5 min' },
                  { id:'BTC', ticker:'BTC', chain:'BTC', time:'10-30 min' },
                  { id:'ETH', ticker:'ETH', chain:'ERC20', time:'3-5 min' },
                  { id:'BNB', ticker:'BNB', chain:'BEP20', time:'1-3 min' },
                  { id:'SOL', ticker:'SOL', chain:'SOL', time:'1-3 min' },
                ].map((coin) => {
                  var isSel = selectedMethod === coin.id
                  return (
                    <motion.button key={coin.id}
                      onClick={() => setSelectedMethod(coin.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={'relative flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 ' +
                        (isSel
                          ? 'border-[#F5C542]/50 bg-[#F5C542]/5 shadow-[0_0_15px_rgba(245,197,66,0.06)]'
                          : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]')
                      }
                    >
                      <CryptoIcon coin={['btc','eth','usdt','bnb','sol'].includes(coin.ticker.toLowerCase()) ? coin.ticker.toLowerCase() : coin.ticker.toLowerCase()} size={28} />
                      <div className="text-center">
                        <div className={'text-sm font-medium ' + (isSel ? 'text-[#F5C542]' : 'text-white/70')}>{coin.ticker}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">{coin.chain}</div>
                        <div className="text-[8px] text-white/20 mt-0.5">{coin.time}</div>
                      </div>
                      {isSel && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#F5C542] flex items-center justify-center">
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0B1220" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
                        </motion.div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>

            {/* Amount Selection */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]"
            >
              <h3 className="text-sm font-medium text-white/70 mb-4">{t('deposit.selectAmount', language)} <span className='text-white/40'>(USDT)</span></h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                {[100, 500, 1000, 3000, 5000, 10000].map((amt) => (
                  <button key={amt}
                    onClick={() => setSelectedAmount(amt)}
                    className={'py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ' +
                      (selectedAmount === amt
                        ? 'bg-[#F5C542]/10 border-[#F5C542]/40 text-[#F5C542]'
                        : 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/[0.15]')}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Wallet Address + QR */}
            {selectedMethod && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]"
              >
                <h3 className="text-sm font-medium text-white/70 mb-4">{t('deposit.receiptInfo', language)}</h3>
                <div className="flex gap-4">
                  <div className="hidden sm:flex w-[110px] h-[110px] rounded-xl bg-white border border-white/10 items-center justify-center flex-shrink-0">
                    <svg width="65" height="65" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5">
                      <rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="8" rx="1"/>
                      <rect x="2" y="14" width="8" height="8" rx="1"/><rect x="14" y="14" width="8" height="8" rx="1"/>
                      <rect x="3" y="3" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><rect x="3" y="15" width="5" height="5"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-white/40 mb-2">
                      <span className="text-[#00C087]">{t('deposit.network', language)}:</span> {selectedMethod === 'USDT_TRC20' ? 'TRC20' : selectedMethod === 'USDT_ERC20' || selectedMethod === 'ETH' ? 'ERC20' : selectedMethod === 'SOL' ? 'SOL' : selectedMethod === 'BNB' ? 'BEP20' : 'BTC'}
                    </div>
                    <div className="bg-black/30 rounded-xl p-3 border border-white/[0.06] mb-3">
                      <span className="font-mono text-xs text-white/60 break-all leading-relaxed">{generateAddress(selectedMethod)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-white/30">
                        {t('deposit.minDepositLabel', language)}: <span className="text-white/60">10 {selectedMethod === 'USDT_TRC20' || selectedMethod === 'USDT_ERC20' ? 'USDT' : selectedMethod}</span>
                      </div>
                      <button onClick={function() {
                        var a = generateAddress(selectedMethod)
                        navigator.clipboard.writeText(a)
                        alert('已复制')
                      }} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#F5C542]/10 border border-[#F5C542]/20 text-[#F5C542] text-xs font-medium hover:bg-[#F5C542]/20 transition-all">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        {t('deposit.copyAddress', language)}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]"
            >
              <h3 className="text-sm font-medium text-white/70 mb-4">{t('deposit.subtitle', language)}</h3>
              <div className="space-y-0">
                {[
                  { step: '01', text: t('deposit.step1', language) },
                  { step: '02', text: t('deposit.step2', language) },
                  { step: '03', text: t('deposit.step3', language) },
                  { step: '04', text: t('deposit.step4', language) },
                  { step: '05', text: t('deposit.step5', language) },
                ].map(function(item, i) {
                  return (
                    <div key={i} className="flex items-center gap-3 py-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#F5C542]/10 border border-[#F5C542]/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-[#F5C542]">{item.step}</span>
                      </div>
                      <span className="text-sm text-white/60">{item.text}</span>
                      {i < 4 && <div className="w-px h-3 bg-white/[0.06] ml-3.5" />}
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Risk Warning */}
            <div className="bg-[#F5C542]/[0.04] border border-[#F5C542]/10 rounded-2xl p-4">
              <div className="flex items-start gap-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5C542" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M12 9v4M12 17h.01"/></svg>
                <div className="text-[11px] text-[#F5C542]/60 leading-relaxed">
                  {t('deposit.riskWarning', language)}
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: STATS AREA ===== */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]"
            >
              <h3 className="text-sm font-medium text-white/70 mb-3">{t('deposit.currentProfit', language)}</h3>
              <div className="text-2xl font-bold text-[#00C087] mb-1">+$847.23</div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-[#00C087]/60">+3.87%</span>
                <span className="text-white/20">•</span>
                <span className="text-white/30">1283 {t('deposit.txnCount', language)}</span>
              </div>
              <div className="mt-4 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full w-[67%] bg-gradient-to-r from-[#00C087] to-[#F5C542] rounded-full" />
              </div>
              <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
                <span>$0</span>
                <span>$1,247</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-[#141C2F] rounded-2xl p-5 border border-white/[0.04]"
            >
              <h3 className="text-sm font-medium text-white/70 mb-3">{t('deposit.recentDeposits', language)}</h3>
              <div className="text-center py-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" className="mx-auto mb-2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <p className="text-xs text-white/20">{t('deposit.noRecords', language)}</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  )
}
