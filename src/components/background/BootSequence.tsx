'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

var STEP_THRESHOLDS = [
  { label: 'Initializing AI Core', threshold: 12, en: true },
  { label: 'Connecting North America Network', threshold: 30, en: true, sub: 'USA 🇺🇸  CANADA 🇨🇦  MEXICO 🇲🇽' },
  { label: 'Scanning FIFA 2026 Markets', threshold: 50, en: true, sub: '87,491 Markets Detected' },
  { label: 'Detecting Arbitrage Opportunities', threshold: 70, en: true, sub: 'Opportunity Found +4.82%' },
  { label: 'Synchronizing Trading Engine', threshold: 88, en: true },
  { label: 'System Ready', threshold: 100, en: true },
]

var matchFloats = [
  { match: 'ARG vs FRA', yield: '+4.2%', x: 8, y: 15, dur: 25, delay: 0 },
  { match: 'BRA vs GER', yield: '+3.8%', x: 72, y: 28, dur: 30, delay: 5 },
  { match: 'ENG vs ESP', yield: '+5.1%', x: 55, y: 10, dur: 28, delay: 10 },
  { match: 'POR vs NED', yield: '+2.9%', x: 18, y: 68, dur: 32, delay: 3 },
  { match: 'ITA vs BEL', yield: '+6.7%', x: 78, y: 62, dur: 26, delay: 8 },
]

var binaryLines = [
  '0101101001 1101001010 0110100101 1010010110',
  '1101001010 0110100101 1010010110 0101101001',
  '0110100101 1010010110 0101101001 1101001010',
  '1010010110 0101101001 1101001010 0110100101',
]

export default function BootSequence({ onComplete }: any) {
  var [phase, setPhase] = useState('loading')
  var [progress, setProgress] = useState(0)
  var [displayPct, setDisplayPct] = useState(0)
  
  var [flash, setFlash] = useState(false)
  var [nums, setNums] = useState({ opps: 0, traders: 0, conf: 0 })
  var canvasRef = useRef(null)

  // Progress update loop (20ms interval)
  useEffect(function() {
    if (phase !== 'loading') return
    var startTime = Date.now()
    var duration = 5000

    var timer = setInterval(function() {
      var elapsed = Date.now() - startTime
      var pct = Math.min(100, Math.round((elapsed / duration) * 100))
      setProgress(pct)

      // Smooth display percentage
      setDisplayPct(function(prev) {
        if (prev >= pct) return prev
        return Math.min(pct, prev + 1)
      })

      // Numbers count up with progress
      var oppTarget = 1283, traderTarget = 3629, confTarget = 98.7
      var opps = Math.min(oppTarget, Math.floor((pct / 100) * oppTarget))
      var traders = Math.min(traderTarget, Math.floor((pct / 100) * traderTarget))
      var conf = Math.min(confTarget, Math.floor((pct / 100) * confTarget * 10) / 10)
      setNums({ opps: opps, traders: traders, conf: conf })

      // Opportunity popup at 70%
      
      // Complete at 100%
      if (pct >= 100) {
        clearInterval(timer)
        // Smooth display to 100
        var smoothTimer = setInterval(function() {
          setDisplayPct(function(p) {
            if (p >= 100) {
              clearInterval(smoothTimer)
              // Transition after 1s
              setTimeout(function() {
                setFlash(true)
                setTimeout(function() {
                  setPhase('final')
                  setFlash(false)
                }, 400)
              }, 1000)
              return 100
            }
            return Math.min(100, p + 2)
          })
        }, 30)
      }
    }, 40) // 40ms update (25fps)
    return function() { clearInterval(timer) }
  }, [phase])

  // Canvas for searchlights
  useEffect(function() {
    var canvas = canvasRef.current
    if (!canvas) return
    var ctx = (canvas as HTMLCanvasElement).getContext('2d')
    if (!ctx) return
    var animId, time = 0

    var resize = function() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    var animate = function() {
      time++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      var angles = [0.2, 1.5, 3.0, 4.5]
      for (var a of angles) {
        var angle = a + Math.sin(time * 0.005) * 0.3
        ctx.save()
        ctx.translate(canvas.width * 0.5, canvas.height * 0.3)
        ctx.rotate(angle)
        var grad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6)
        grad.addColorStop(0, 'rgba(0,255,136,0.02)')
        grad.addColorStop(0.5, 'rgba(0,217,255,0.008)')
        grad.addColorStop(1, 'rgba(0,255,136,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(-3, 0); ctx.lineTo(3, 0); ctx.lineTo(25, canvas.height); ctx.lineTo(-25, canvas.height)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      animId = requestAnimationFrame(animate)
    }
    animate()
    return function() {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  function handleEnter() {
    setPhase('done')
    setTimeout(onComplete, 600)
  }

  // Get current step label
  function getCurrentStep() {
    var p = displayPct
    for (var i = STEP_THRESHOLDS.length - 1; i >= 0; i--) {
      if (p >= STEP_THRESHOLDS[i].threshold) return STEP_THRESHOLDS[i]
    }
    return STEP_THRESHOLDS[0]
  }

  var currentStep = getCurrentStep()

  return (
    <AnimatePresence>
      {phase !== 'done' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[100] overflow-hidden"
          style={{ backgroundColor: '#020305' }}
        >
          {/* Background canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Floating match data */}
          {matchFloats.map(function(m, i) {
            return (
              <motion.div
                key={i}
                className="absolute pointer-events-none"
                style={{ left: m.x + '%', top: m.y + '%' }}
                animate={{ y: [0, -25, 0], opacity: [0.06, 0.1, 0.06] }}
                transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="glass-card rounded-lg px-2.5 py-1.5 border border-white/5">
                  <div className="text-[9px] text-white/25 font-mono">{m.match}</div>
                  <div className="text-[11px] font-orbitron text-[#00ff88]/50 font-bold">{m.yield}</div>
                </div>
              </motion.div>
            )
          })}

          {/* MAIN LAYOUT */}
          {phase === 'loading' && (
            <div className="relative z-10 h-screen flex flex-col justify-center">
              <div className="max-w-6xl w-full mx-auto px-8 grid grid-cols-12 gap-6 items-center flex-1">

                {/* LEFT: Step labels */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                  <div className="mb-6">
                    <span className="text-[10px] font-orbitron text-[#00ff88]/30 tracking-[0.3em]">
                      NEXUS AI
                    </span>
                  </div>

                  <div className="space-y-3 font-mono text-sm">
                    {STEP_THRESHOLDS.map(function(step, i) {
                      var isActive = displayPct >= step.threshold
                      var isCurrent = currentStep.label === step.label
                      return (
                        <motion.div
                          key={i}
                          className={'flex items-start gap-2.5 transition-all duration-300 ' + (isActive ? '' : 'opacity-30')}
                        >
                          <div className={'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ' + (isCurrent ? 'bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.6)]' : 'bg-white/20')} />
                          <div>
                            <div className={'text-xs ' + (isCurrent ? 'text-[#00ff88] font-semibold' : 'text-white/40')}>
                              {step.label}
                            </div>
                            {isCurrent && step.sub && (
                              <div className="text-[9px] text-white/20 mt-0.5 font-mono">{step.sub}</div>
                            )}
                          </div>
                          {isActive && (
                            <span className="ml-auto text-[10px] font-orbitron text-[#00ff88]/50">{step.threshold}%</span>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                {/* CENTER: Big numbers */}
                <div className="col-span-12 lg:col-span-4 space-y-7">
                  <div className="text-center">
                    <div className="text-[9px] text-white/20 font-orbitron tracking-wider mb-2">
                      {''.padEnd(20, '━')}
                    </div>
                    <div className="text-[9px] text-white/30 font-orbitron tracking-wider mb-2">
                      OPPORTUNITIES FOUND
                    </div>
                    <motion.div className="text-4xl md:text-5xl font-orbitron font-bold text-gradient-primary">
                      {nums.opps.toLocaleString()}
                    </motion.div>
                  </div>

                  <div className="text-center">
                    <div className="text-[9px] text-white/30 font-orbitron tracking-wider mb-2">
                      ONLINE TRADERS
                    </div>
                    <motion.div className="text-3xl md:text-4xl font-orbitron font-bold text-[#00d9ff]">
                      {nums.traders.toLocaleString()}
                    </motion.div>
                  </div>

                  <div className="text-center">
                    <div className="text-[9px] text-white/30 font-orbitron tracking-wider mb-2">
                      AI CONFIDENCE
                    </div>
                    <motion.div className="text-3xl md:text-4xl font-orbitron font-bold text-[#ffd700]">
                      {nums.conf.toFixed(1)}%
                    </motion.div>
                  </div>
                </div>

                {/* RIGHT: Holographic universe */}
                <div className="col-span-12 lg:col-span-4 flex items-center justify-center">
                  <div className="relative w-full max-w-[260px] aspect-square">
                    {/* Globe */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-52 h-52 rounded-full border border-[#00ff88]/10 relative">
                        <div className="absolute inset-2 rounded-full border border-[#00ff88]/5"></div>
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-[#00ff88]/5"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#00ff88]/5"></div>
                      </div>
                    </div>

                    <svg viewBox="0 0 260 260" className="absolute inset-0 w-full h-full" style={{ filter: 'blur(0.5px)' }}>
                      <defs>
                        <radialGradient id="naGlow">
                          <stop offset="0%" stopColor="rgba(0,255,136,0.12)" />
                          <stop offset="100%" stopColor="rgba(0,255,136,0)" />
                        </radialGradient>
                      </defs>
                      <circle cx="130" cy="130" r="120" fill="none" stroke="rgba(0,255,136,0.03)" strokeWidth="0.5" />
                      <path d="M120 45 L125 50 L130 55 L135 60 L138 65 L140 70 L138 75 L135 80 L130 83 L125 85 L120 87 L115 85 L110 83 L105 80 L102 75 L100 70 L102 65 L105 60 L110 55 L115 50 Z"
                        fill="rgba(0,255,136,0.04)" stroke="rgba(0,255,136,0.1)" strokeWidth="0.8" />
                      <circle cx="120" cy="66" r="22" fill="url(#naGlow)" />
                      {[
                        { cx: 125, cy: 60, label: 'NYC' },
                        { cx: 118, cy: 53, label: 'TOR' },
                        { cx: 115, cy: 72, label: 'MEX' },
                        { cx: 110, cy: 63, label: 'DAL' },
                        { cx: 105, cy: 57, label: 'LA' },
                      ].map(function(city) {
                        return (
                          <g key={city.label}>
                            <circle cx={city.cx} cy={city.cy} r="2.5" fill="rgba(0,255,136,0.08)" />
                            <circle cx={city.cx} cy={city.cy} r="1" fill="rgba(0,255,136,0.2)" />
                            <text x={city.cx} y={city.cy - 5} fill="rgba(0,255,136,0.15)" fontSize="5" textAnchor="middle">{city.label}</text>
                          </g>
                        )
                      })}
                      {[
                        [125,60,118,53],[118,53,115,72],[125,60,115,72],[125,60,110,63],[110,63,105,57],[118,53,105,57]
                      ].map(function(line, i) {
                        return <line key={i} x1={line[0]} y1={line[1]} x2={line[2]} y2={line[3]} stroke="rgba(0,217,255,0.04)" strokeWidth="0.5" />
                      })}

                      {/* Trophy */}
                      <g transform="translate(200, 45)">
                        <ellipse cx="0" cy="0" rx="11" ry="15" fill="none" stroke="rgba(255,215,0,0.1)" strokeWidth="0.8" />
                        <rect x="-3" y="15" width="6" height="3" rx="0.5" fill="rgba(255,215,0,0.06)" />
                        <line x1="-11" y1="-3" x2="-17" y2="-6" stroke="rgba(255,215,0,0.06)" strokeWidth="0.5" />
                        <line x1="11" y1="-3" x2="17" y2="-6" stroke="rgba(255,215,0,0.06)" strokeWidth="0.5" />
                        <circle cx="0" cy="0" r="18" fill="rgba(255,215,0,0.02)" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="px-8 pb-12">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-orbitron text-white/25 tracking-wider">AI CORE</span>
                      {/* Step indicator */}
                      <motion.span
                        key={currentStep.label}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[8px] font-mono text-[#00ff88]/40"
                      >
                        {currentStep.label.substring(0, 30)}
                      </motion.span>
                    </div>
                    {/* Glowing percentage */}
                    <motion.span
                      className="text-sm font-orbitron font-bold"
                      style={{
                        color: displayPct >= 100 ? '#00ff88' : displayPct > 50 ? '#00d9ff' : '#00ff88',
                        textShadow: displayPct >= 100
                          ? '0 0 10px rgba(0,255,136,0.5), 0 0 20px rgba(0,255,136,0.2)'
                          : '0 0 5px rgba(0,255,136,0.2)'
                      }}
                    >
                      {displayPct}%
                    </motion.span>
                  </div>
                  <div className="relative h-3 bg-white/5 rounded overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00ff88] via-[#00d9ff] to-[#00ff88]"
                      style={{ width: progress + '%' }}
                      layout
                    />
                    {/* Binary overlay */}
                    <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
                      <motion.div
                        className="text-[6px] font-mono text-white/[0.06] whitespace-nowrap"
                        animate={{ x: [0, -200] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                      >
                        {binaryLines.join('  ')}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Opportunity Popup at 70% */}
              
            </div>
          )}

          {/* FINAL SCREEN */}
          {phase === 'final' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 h-full flex items-center justify-center"
            >
              <div className="text-center space-y-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex items-center justify-center gap-3">
                  <span className="text-3xl">⚽</span>
                  <span className="text-sm font-orbitron text-white/60 tracking-[0.3em]">FIFA WORLD CUP 2026</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}
                  className="flex items-center justify-center gap-4 text-base">
                  <span>USA 🇺🇸</span><span className="text-white/20">|</span>
                  <span>CANADA 🇨🇦</span><span className="text-white/20">|</span>
                  <span>MEXICO 🇲🇽</span>
                </motion.div>

                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
                  className="w-48 h-px mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.0 }}
                  className="space-y-1">
                  <div className="text-4xl md:text-5xl font-bold">
                    <span className="text-gradient-primary">NEXUS AI</span>
                  </div>
                </motion.div>

                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.3 }}
                  className="w-64 h-px mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.5 }}
                  className="space-y-1">
                  <div className="text-2xl font-orbitron font-bold text-[#00ff88]">1283 Opportunities Found</div>
                  <div className="text-xs text-white/30 font-orbitron">ACROSS 127 COUNTRIES · 87,491 MARKETS</div>
                </motion.div>

                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 1.8 }}
                  className="w-32 h-px mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 2.2 }}
                  onClick={handleEnter}
                  className="group relative px-8 py-3 rounded-[14px] border border-white/10 bg-white/[0.03] text-white/80 font-orbitron text-sm font-semibold tracking-[0.08em] hover:border-[#00ff88]/30 hover:bg-white/[0.06] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(0,255,136,0.08)] transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">ENTER TERMINAL</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Flash */}
          {flash && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 z-50 bg-white pointer-events-none"
            />
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
