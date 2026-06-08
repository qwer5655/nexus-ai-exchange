'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Copy, CreditCard, Banknote } from 'lucide-react'
import CryptoIcon from './CryptoIcon'
import { useStore } from '@/store/useStore'
import { t } from '@/lib/i18n'
import { depositPlans, paymentMethods } from '@/data/deposit'
import { formatCurrency } from '@/lib/utils'

export default function DepositModal() {
  const { showDepositModal, setShowDepositModal, addDeposit, addNotification, language } = useStore()
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select')
  const [copied, setCopied] = useState(false)

  function handleDeposit() {
    if (!selectedAmount || !selectedMethod) return
    setStep('success')
    setTimeout(() => {
      addDeposit(selectedAmount)
      addNotification('success', 'Deposit of ' + formatCurrency(selectedAmount) + ' completed successfully!')
      setShowDepositModal(false)
      setStep('select')
      setSelectedAmount(null)
      setSelectedMethod(null)
    }, 2000)
  }

  if (!showDepositModal) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
        onClick={() => setShowDepositModal(false)}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-lg w-full z-[81] overflow-auto"
      >
        <div className="glass-card rounded-2xl p-6 md:p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{t('deposit.title', language)}</h3>
              <p className="text-sm text-white/40">{t('deposit.subtitle', language)}</p>
            </div>
            <button onClick={() => { setShowDepositModal(false); setStep('select') }} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>

          {step === 'select' && (
            <>
              <div className="mb-6">
                <h4 className="text-sm text-white/60 mb-3">{t('deposit.selectAmount', language)}</h4>
                <div className="grid grid-cols-3 gap-3">
                  {depositPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedAmount(plan.amount)}
                      className={
                        'relative p-3 rounded-xl border text-center transition-all ' +
                        (selectedAmount === plan.amount
                          ? 'border-[#00ff88] bg-[#00ff88]/10'
                          : 'border-white/10 hover:border-white/20')
                      }
                    >
                      <div className="text-white font-orbitron font-bold text-lg"></div>
                      <div className="text-[10px] text-white/40">{plan.bonus}</div>
                      {plan.popular && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-[#ffd700] text-[8px] text-[#05070c] font-bold">
                          BEST
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm text-white/60 mb-3">{t('deposit.paymentMethod', language)}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={
                        'p-3 rounded-xl border text-center transition-all ' +
                        (selectedMethod === method.id
                          ? 'border-[#00ff88] bg-[#00ff88]/10'
                          : 'border-white/10 hover:border-white/20')
                      }
                      title={method.name}
                    >
                      <CryptoIcon coin={method.icon} size={24} />
                      <div className="text-[9px] text-white/40 mt-1 truncate">{method.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setStep('confirm')}
                disabled={!selectedAmount || !selectedMethod}
                className={
                  'w-full py-3 rounded-xl font-bold text-sm transition-all ' +
                  (selectedAmount && selectedMethod
                    ? 'bg-[#00ff88] text-[#05070c] hover:shadow-[0_0_30px_rgba(0,255,136,0.3)]'
                    : 'bg-white/5 text-white/20 cursor-not-allowed')
                }
              >
                Continue to Payment
              </button>
            </>
          )}

          {step === 'confirm' && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#00ff88]/10 flex items-center justify-center mx-auto mb-4">
                <CreditCard size={28} className="text-[#00ff88]" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">{t('deposit.confirmTitle', language)}</h4>
              <p className="text-white/40 text-sm mb-4">
                {t('deposit.confirmDesc', language)} {formatCurrency(selectedAmount || 0)}
              </p>
              <div className="glass-card rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-white/40">Amount</span>
                  <span className="text-white font-mono font-bold">{formatCurrency(selectedAmount || 0)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/40">Method</span>
                  <span className="text-white">{paymentMethods.find(m => m.id === selectedMethod)?.name}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium text-sm hover:bg-white/5 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleDeposit}
                  className="flex-1 py-3 rounded-xl bg-[#00ff88] text-[#05070c] font-bold text-sm hover:shadow-[0_0_30px_rgba(0,255,136,0.3)] transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 rounded-full bg-[#00ff88]/20 flex items-center justify-center mx-auto mb-4"
              >
                <Check size={36} className="text-[#00ff88]" />
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <h4 className="text-xl font-bold text-white mb-2">{t('deposit.success', language)}</h4>
                <p className="text-white/40 text-sm">
                  {formatCurrency(selectedAmount || 0)} {t('deposit.successDesc', language)}
                </p>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
