'use client'
import { useEffect, useRef, useCallback } from 'react'

export default function WorldCupBackground() {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const handleMouse = useCallback((e) => {
    mouseRef.current = { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // State
    var animId, time = 0, earthRot = 0
    var W, H

    // Mouse parallax
    var mouseX = 0.5, mouseY = 0.5
    var targetMX = 0.5, targetMY = 0.5

    window.addEventListener('mousemove', function(e) {
      targetMX = e.clientX / (window.innerWidth || 1)
      targetMY = e.clientY / (window.innerHeight || 1)
    })

    // Particles
    var particles = []
    var confetti = []
    var fireworks = []
    var stars = []
    var dataNumbers = []
    var scanning = { active: false, angle: 0, x: 0, y: 0 }

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles (2000)
    for (var i = 0; i < 2000; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.3,
        alpha: Math.random() * 0.4 + 0.05,
        pulse: Math.random() * Math.PI * 2,
        color: ['rgba(0,255,136,', 'rgba(0,217,255,', 'rgba(255,215,0,', 'rgba(255,255,255,'][Math.floor(Math.random() * 4)]
      })
    }

    // Stars (background dots)
    for (var i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H * 0.5,
        size: Math.random() * 1.2 + 0.3,
        alpha: Math.random() * 0.3 + 0.05,
        twinkle: Math.random() * Math.PI * 2
      })
    }

    // Data numbers
    var numLabels = ['+3.2%', '+4.8%', 'AI 97%', 'YIELD 5.1%', '+$847K', '3,629 TRADERS', '87,491 MKTS', '127 CNTRIES']
    for (var i = 0; i < 15; i++) {
      dataNumbers.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.1 - Math.random() * 0.2,
        text: numLabels[Math.floor(Math.random() * numLabels.length)],
        alpha: 0.02 + Math.random() * 0.04,
        size: 8 + Math.random() * 4,
        life: 300 + Math.random() * 400,
        maxLife: 300 + Math.random() * 400
      })
    }

    // Scanning
    var scanTimer = 0

    function drawEarth(cx, cy, r) {
      ctx.save()
      ctx.translate(cx, cy)

      // Glow
      var glow = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r * 1.5)
      glow.addColorStop(0, 'rgba(0,255,136,0.03)')
      glow.addColorStop(0.5, 'rgba(0,217,255,0.01)')
      glow.addColorStop(1, 'rgba(0,255,136,0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Sphere outline
      var sphereGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r)
      sphereGrad.addColorStop(0, 'rgba(10,30,50,0.6)')
      sphereGrad.addColorStop(0.5, 'rgba(5,15,30,0.8)')
      sphereGrad.addColorStop(1, 'rgba(2,5,10,0.9)')
      ctx.fillStyle = sphereGrad
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 2)
      ctx.fill()

      // Grid lines
      ctx.strokeStyle = 'rgba(0,255,136,0.06)'
      ctx.lineWidth = 0.5

      // Latitudes
      for (var lat = -60; lat <= 60; lat += 30) {
        var latRad = lat * Math.PI / 180
        var latR = r * Math.cos(latRad)
        var latY = r * Math.sin(latRad)
        if (latR > 0) {
          ctx.beginPath()
          ctx.arc(0, latY, latR, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Longitudes
      for (var lon = 0; lon < 360; lon += 30) {
        var a = (lon + earthRot * 180 / Math.PI) * Math.PI / 180
        ctx.beginPath()
        ctx.ellipse(0, 0, r, r * 0.4, a, 0, Math.PI * 2)
        ctx.stroke()
      }

      // North America highlight (simplified)
      ctx.fillStyle = 'rgba(0,255,136,0.04)'
      ctx.beginPath()
      var naPoints = [
        [-0.15, -0.55], [-0.1, -0.5], [-0.05, -0.45], [0, -0.4],
        [0.05, -0.35], [0.1, -0.3], [0.12, -0.2], [0.15, -0.1],
        [0.12, 0], [0.1, 0.05], [0.05, 0.1], [0, 0.12],
        [-0.05, 0.1], [-0.1, 0.05], [-0.12, 0], [-0.15, -0.1],
        [-0.18, -0.2], [-0.2, -0.3], [-0.18, -0.4]
      ]
      ctx.moveTo(naPoints[0][0] * r, naPoints[0][1] * r)
      for (var p of naPoints) ctx.lineTo(p[0] * r, p[1] * r)
      ctx.closePath()
      ctx.fill()

      // NA glow
      var naGlow = ctx.createRadialGradient(0, -0.15 * r, 0, 0, -0.15 * r, r * 0.25)
      naGlow.addColorStop(0, 'rgba(0,255,136,0.06)')
      naGlow.addColorStop(1, 'rgba(0,255,136,0)')
      ctx.fillStyle = naGlow
      ctx.beginPath()
      ctx.arc(0, -0.15 * r, r * 0.25, 0, Math.PI * 2)
      ctx.fill()

      // City dots
      var cities = [
        { x: -0.05, y: -0.18, label: 'NYC' },    // NYC
        { x: -0.03, y: -0.3, label: 'TOR' },     // Toronto
        { x: -0.15, y: -0.02, label: 'MEX' },    // Mexico City
        { x: 0.5, y: -0.25, label: 'LON' },      // London
        { x: 0.48, y: -0.15, label: 'PAR' },     // Paris
        { x: 0.52, y: -0.08, label: 'MAD' },     // Madrid
        { x: 0.7, y: 0.1, label: 'DXB' },        // Dubai
        { x: 0.75, y: 0.3, label: 'SGP' },       // Singapore
        { x: 0.85, y: 0.25, label: 'TYO' },      // Tokyo
        { x: 0.9, y: -0.35, label: 'SYD' },      // Sydney
      ]

      for (var city of cities) {
        var cxa = city.x * r, cya = city.y * r
        ctx.fillStyle = 'rgba(0,255,136,0.15)'
        ctx.beginPath()
        ctx.arc(cxa, cya, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = 'rgba(0,255,136,0.3)'
        ctx.beginPath()
        ctx.arc(cxa, cya, 1, 0, Math.PI * 2)
        ctx.fill()
      }

      // Connection lines between cities (arbitrage network)
      var connections = [
        [0, 1], [1, 2], [0, 2], [0, 3], [3, 4], [4, 5], [0, 6], [6, 7], [7, 8], [8, 9]
      ]
      for (var conn of connections) {
        var c1 = cities[conn[0]], c2 = cities[conn[1]]
        var x1 = c1.x * r, y1 = c1.y * r
        var x2 = c2.x * r, y2 = c2.y * r
        var dx = x2 - x1, dy = y2 - y1
        var dist = Math.sqrt(dx * dx + dy * dy)

        // Only draw visible lines (not behind the globe)
        if (y1 > -r * 0.1 && y2 > -r * 0.1) {
          ctx.strokeStyle = 'rgba(0,255,136,0.04)'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          var midx = (x1 + x2) / 2, midy = (y1 + y2) / 2 - dist * 0.15
          ctx.moveTo(x1, y1)
          ctx.quadraticCurveTo(midx, midy, x2, y2)
          ctx.stroke()

          // Moving dot
          var t = ((time * 0.5) % 100) / 100
          var tt = t, mt = 1 - t
          var px = mt * mt * x1 + 2 * mt * t * midx + tt * tt * x2
          var py = mt * mt * y1 + 2 * mt * t * midy + tt * tt * y2
          ctx.fillStyle = 'rgba(0,217,255,0.15)'
          ctx.beginPath()
          ctx.arc(px, py, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    function drawTrophy(tx, ty, s) {
      ctx.save()
      ctx.translate(tx, ty)

      // Golden aura
      var aura = ctx.createRadialGradient(0, 0, s * 0.3, 0, 0, s * 2)
      aura.addColorStop(0, 'rgba(255,215,0,0.04)')
      aura.addColorStop(0.5, 'rgba(255,215,0,0.01)')
      aura.addColorStop(1, 'rgba(255,215,0,0)')
      ctx.fillStyle = aura
      ctx.beginPath()
      ctx.arc(0, 0, s * 2, 0, Math.PI * 2)
      ctx.fill()

      // Rotating trophy
      ctx.rotate(Math.sin(time * 0.005) * 0.1)

      // Trophy cup
      ctx.strokeStyle = 'rgba(255,215,0,0.15)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(0, -s * 0.1, s * 0.7, s * 0.9, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Trophy body
      ctx.fillStyle = 'rgba(255,215,0,0.03)'
      ctx.beginPath()
      ctx.ellipse(0, -s * 0.1, s * 0.65, s * 0.85, 0, 0, Math.PI * 2)
      ctx.fill()

      // Handles
      ctx.beginPath()
      ctx.arc(-s * 0.75, -s * 0.1, s * 0.35, -Math.PI * 0.4, Math.PI * 0.4)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(s * 0.75, -s * 0.1, s * 0.35, Math.PI * 0.6, Math.PI * 1.4)
      ctx.stroke()

      // Base
      ctx.beginPath()
      ctx.moveTo(-s * 0.5, s * 0.7)
      ctx.lineTo(-s * 0.7, s * 1.2)
      ctx.lineTo(s * 0.7, s * 1.2)
      ctx.lineTo(s * 0.5, s * 0.7)
      ctx.closePath()
      ctx.stroke()

      ctx.fillStyle = 'rgba(255,215,0,0.02)'
      ctx.fill()

      // Light ray effect
      for (var i = 0; i < 8; i++) {
        var angle = (Math.PI * 2 / 8) * i + time * 0.005
        ctx.strokeStyle = 'rgba(255,215,0,' + (0.02 + Math.sin(time * 0.02 + i) * 0.015) + ')'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(0, -s * 1.2)
        ctx.lineTo(Math.cos(angle) * s * 2.5, Math.sin(angle) * s * 2.5)
        ctx.stroke()
      }

      ctx.restore()
    }

    function drawPlayerSilhouette(x, y, s, color) {
      ctx.save()
      ctx.translate(x, y)
      ctx.globalAlpha = 0.06
      ctx.fillStyle = color

      // Head
      ctx.beginPath()
      ctx.arc(0, -s * 0.35, s * 0.1, 0, Math.PI * 2)
      ctx.fill()

      // Body
      ctx.beginPath()
      ctx.ellipse(0, -s * 0.08, s * 0.08, s * 0.15, 0, 0, Math.PI * 2)
      ctx.fill()

      // Arms
      ctx.save()
      ctx.translate(0, -s * 0.05)
      ctx.rotate(-0.3)
      ctx.fillRect(-s * 0.13, -s * 0.02, s * 0.12, s * 0.03)
      ctx.restore()
      ctx.save()
      ctx.translate(0, -s * 0.05)
      ctx.rotate(0.3)
      ctx.fillRect(s * 0.01, -s * 0.02, s * 0.12, s * 0.03)
      ctx.restore()

      // Legs
      ctx.save()
      ctx.translate(0, s * 0.06)
      ctx.rotate(-0.4)
      ctx.fillRect(-s * 0.06, 0, s * 0.04, s * 0.15)
      ctx.restore()
      ctx.save()
      ctx.translate(0, s * 0.06)
      ctx.rotate(0.5)
      ctx.fillRect(s * 0.02, 0, s * 0.04, s * 0.16)
      ctx.restore()

      // Holographic edge glow
      ctx.globalAlpha = 0.03
      ctx.strokeStyle = color
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(0, -s * 0.35, s * 0.1, 0, Math.PI * 2)
      ctx.stroke()

      ctx.globalAlpha = 1
      ctx.restore()
    }

    function drawSkyline(w, h) {
      // NYC buildings
      var bldgs = [
        { x: 0, w: w * 0.03, h: h * 0.12 },
        { x: w * 0.04, w: w * 0.025, h: h * 0.15 },
        { x: w * 0.07, w: w * 0.035, h: h * 0.2 },
        { x: w * 0.11, w: w * 0.025, h: h * 0.25 },
        { x: w * 0.14, w: w * 0.03, h: h * 0.18 },
        { x: w * 0.18, w: w * 0.04, h: h * 0.28 },
        { x: w * 0.23, w: w * 0.025, h: h * 0.15 },
        { x: w * 0.26, w: w * 0.035, h: h * 0.22 },
        { x: w * 0.30, w: w * 0.025, h: h * 0.3 },
        { x: w * 0.33, w: w * 0.03, h: h * 0.2 },
      ]
      // Toronto
      var torBldgs = [
        { x: w * 0.35, w: w * 0.025, h: h * 0.1 },
        { x: w * 0.38, w: w * 0.03, h: h * 0.14 },
        { x: w * 0.42, w: w * 0.035, h: h * 0.18 },
        { x: w * 0.46, w: w * 0.025, h: h * 0.22 },
        { x: w * 0.49, w: w * 0.03, h: h * 0.16 },
      ]

      // Mexico City
      var mexBldgs = [
        { x: w * 0.53, w: w * 0.03, h: h * 0.08 },
        { x: w * 0.57, w: w * 0.025, h: h * 0.12 },
        { x: w * 0.60, w: w * 0.03, h: h * 0.15 },
        { x: w * 0.64, w: w * 0.025, h: h * 0.1 },
      ]

      // Dubai towers
      var dubaiBldgs = [
        { x: w * 0.68, w: w * 0.02, h: h * 0.28 },
        { x: w * 0.71, w: w * 0.03, h: h * 0.15 },
        { x: w * 0.75, w: w * 0.025, h: h * 0.2 },
        { x: w * 0.78, w: w * 0.02, h: h * 0.25 },
      ]

      // Singapore
      var sgpBldgs = [
        { x: w * 0.81, w: w * 0.025, h: h * 0.18 },
        { x: w * 0.84, w: w * 0.03, h: h * 0.22 },
        { x: w * 0.88, w: w * 0.025, h: h * 0.15 },
      ]

      function drawBuildingSet(buildings, col) {
        for (var b of buildings) {
          var by = h - b.h
          ctx.fillStyle = col
          ctx.fillRect(b.x, by, b.w, b.h)
          ctx.strokeStyle = col.replace('0.01', '0.02')
          ctx.lineWidth = 0.5
          ctx.strokeRect(b.x, by, b.w, b.h)

          // Windows
          var wCols = Math.floor(b.w / 5), wRows = Math.floor(b.h / 6)
          for (var r = 0; r < wRows && r < 20; r++) {
            for (var c = 0; c < wCols && c < 10; c++) {
              if (Math.random() > 0.4) {
                ctx.fillStyle = col.replace('0.01', (0.01 + Math.random() * 0.02).toFixed(3))
                ctx.fillRect(b.x + 2 + c * 5, by + 2 + r * 6, 2, 3)
              }
            }
          }
        }
      }

      drawBuildingSet(bldgs, 'rgba(0,255,136,0.01)')
      drawBuildingSet(torBldgs, 'rgba(0,217,255,0.01)')
      drawBuildingSet(mexBldgs, 'rgba(255,215,0,0.01)')
      drawBuildingSet(dubaiBldgs, 'rgba(255,255,255,0.01)')
      drawBuildingSet(sgpBldgs, 'rgba(0,255,136,0.01)')
    }

    function drawStadium(cx, cy, w, h) {
      // Stadium outline
      ctx.strokeStyle = 'rgba(0,255,136,0.03)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Inner field
      ctx.fillStyle = 'rgba(0,255,136,0.01)'
      ctx.beginPath()
      ctx.ellipse(cx, cy, w / 2.5, h / 2.5, 0, 0, Math.PI * 2)
      ctx.fill()

      // Field lines
      ctx.strokeStyle = 'rgba(0,255,136,0.02)'
      ctx.beginPath()
      ctx.moveTo(cx, cy - h / 2.5)
      ctx.lineTo(cx, cy + h / 2.5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(cx, cy, h / 8, 0, Math.PI * 2)
      ctx.stroke()

      // Crowd lights
      var crowdCount = 40
      for (var i = 0; i < crowdCount; i++) {
        var angle2 = (Math.PI * 2 / crowdCount) * i
        var lx = cx + Math.cos(angle2) * w / 2.2
        var ly = cy + Math.sin(angle2) * h / 2.2
        ctx.fillStyle = 'rgba(255,215,0,' + (0.02 + Math.sin(time * 0.03 + i * 1.5) * 0.015) + ')'
        ctx.beginPath()
        ctx.arc(lx, ly, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      // Spotlights
      var spotAngles = [0.3, 1.8, 3.5, 5.0]
      for (var sa of spotAngles) {
        ctx.strokeStyle = 'rgba(255,255,255,0.008)'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(sa) * w / 2.5, cy + Math.sin(sa) * h / 2.5)
        ctx.lineTo(cx + Math.cos(sa) * w * 0.8, cy + Math.sin(sa) * h * 0.8)
        ctx.stroke()
      }
    }

    function drawScanner(w, h) {
      scanTimer++
      if (scanTimer > 300) {
        scanning.active = true
        scanning.angle = (scanning.angle + 2) % 360
        scanning.x = w * 0.5 + Math.cos(scanning.angle * Math.PI / 180) * w * 0.3
        scanning.y = h * 0.4 + Math.sin(scanning.angle * Math.PI / 180) * h * 0.2

        // Scanning beam
        ctx.strokeStyle = 'rgba(0,255,136,0.04)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(w * 0.5, h * 0.4)
        ctx.lineTo(scanning.x, scanning.y)
        ctx.stroke()

        // Detection flash
        ctx.fillStyle = 'rgba(0,255,136,0.03)'
        ctx.beginPath()
        ctx.arc(scanning.x, scanning.y, 3, 0, Math.PI * 2)
        ctx.fill()

        if (scanTimer > 320) {
          scanning.active = false
          scanTimer = 0
        }
      }
    }

    function animate() {
      time++
      mouseX += (targetMX - mouseX) * 0.05
      mouseY += (targetMY - mouseY) * 0.05
      earthRot += 0.003

      ctx.clearRect(0, 0, W, H)

      // Base background
      var bgGrad = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.5, H * 0.8)
      bgGrad.addColorStop(0, '#0d1b2a')
      bgGrad.addColorStop(0.3, '#070d18')
      bgGrad.addColorStop(0.5, '#05080f')
      bgGrad.addColorStop(1, '#020305')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.006)'
      ctx.lineWidth = 0.3
      for (var gx = 0; gx < W; gx += 70) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke()
      }
      for (var gy = 0; gy < H; gy += 70) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke()
      }

      // Stars
      for (var s of stars) {
        var twinkle = 0.3 + Math.sin(time * 0.01 + s.twinkle) * 0.2
        ctx.fillStyle = 'rgba(255,255,255,' + (s.alpha * twinkle) + ')'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill()
      }

      // Skyline (bottom)
      drawSkyline(W, H)

      // Earth (center-right)
      var earthX = W * 0.65 + (mouseX - 0.5) * 20
      var earthY = H * 0.45 + (mouseY - 0.5) * 15
      var earthR = Math.min(W, H) * 0.18
      drawEarth(earthX, earthY, earthR)

      // Energy core (center of NA on the globe)
      var coreX = earthX - 0.05 * earthR
      var coreY = earthY - 0.15 * earthR
      var pulseSize = 8 + Math.sin(time * 0.04) * 3
      ctx.fillStyle = 'rgba(0,255,136,0.08)'
      ctx.beginPath()
      ctx.arc(coreX, coreY, pulseSize, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(0,255,136,0.15)'
      ctx.beginPath()
      ctx.arc(coreX, coreY, pulseSize * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // Energy waves
      var waveRadius = pulseSize + 15 + Math.sin(time * 0.03) * 8
      ctx.strokeStyle = 'rgba(0,255,136,' + (0.03 + Math.sin(time * 0.03) * 0.02) + ')'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.arc(coreX, coreY, waveRadius, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(coreX, coreY, waveRadius * 1.5, 0, Math.PI * 2)
      ctx.stroke()

      // Stadium (center-left)
      var stadX = W * 0.25 + (mouseX - 0.5) * 10
      var stadY = H * 0.7
      drawStadium(stadX, stadY, W * 0.12, W * 0.06)

      // Player silhouettes (around the scene)
      var players = [
        { x: W * 0.1, y: H * 0.3, s: 80, c: '#75AADB' },   // Messi
        { x: W * 0.85, y: H * 0.25, s: 75, c: '#FF0000' },  // Ronaldo
        { x: W * 0.5, y: H * 0.15, s: 85, c: '#002395' },   // Mbappe
        { x: W * 0.08, y: H * 0.55, s: 70, c: '#00ff88' },  // Haaland
        { x: W * 0.92, y: H * 0.5, s: 70, c: '#FFFFFF' },   // Bellingham
      ]
      for (var pl of players) {
        drawPlayerSilhouette(pl.x, pl.y, pl.s, pl.c)
      }

      // Trophy (upper right)
      var trophyX = W * 0.85 + (mouseX - 0.5) * 15
      var trophyY = H * 0.12 + (mouseY - 0.5) * 10
      drawTrophy(trophyX, trophyY, Math.min(W, H) * 0.04)

      // Data numbers (floating)
      for (var dn of dataNumbers) {
        dn.x += dn.vx
        dn.y += dn.vy
        dn.life--
        if (dn.life <= 0) {
          dn.x = Math.random() * W
          dn.y = H * 0.8 + Math.random() * H * 0.2
          dn.life = dn.maxLife
          dn.text = numLabels[Math.floor(Math.random() * numLabels.length)]
        }
        ctx.fillStyle = 'rgba(0,255,136,' + (dn.alpha * (dn.life / dn.maxLife)) + ')'
        ctx.font = dn.size + 'px Orbitron'
        ctx.fillText(dn.text, dn.x, dn.y)
      }

      // Scanner
      drawScanner(W, H)

      // Fireworks
      if (Math.random() < 0.005 && fireworks.length < 3) {
        var fw = {
          x: W * 0.2 + Math.random() * W * 0.6,
          y: H * 0.1 + Math.random() * H * 0.15,
          particles: [],
          life: 60
        }
        var fwColors = ['#00ff88', '#00d9ff', '#ffd700', '#ff4d4f', '#ff6b35']
        for (var i = 0; i < 25; i++) {
          var a2 = (Math.PI * 2 / 25) * i
          var sp = 2 + Math.random() * 2.5
          fw.particles.push({
            x: fw.x, y: fw.y,
            vx: Math.cos(a2) * sp, vy: Math.sin(a2) * sp,
            life: 30 + Math.random() * 25,
            color: fwColors[Math.floor(Math.random() * fwColors.length)]
          })
        }
        fireworks.push(fw)
      }
      for (var i = fireworks.length - 1; i >= 0; i--) {
        fw = fireworks[i]
        fw.life--
        for (var fp of fw.particles) {
          fp.x += fp.vx; fp.y += fp.vy
          fp.vy += 0.02
          fp.life--
          ctx.fillStyle = fp.color
          ctx.globalAlpha = fp.life / 45
          ctx.beginPath(); ctx.arc(fp.x, fp.y, 1.2, 0, Math.PI * 2); ctx.fill()
        }
        ctx.globalAlpha = 1
        if (fw.life <= 0) fireworks.splice(i, 1)
      }

      // Confetti
      if (Math.random() < 0.04) {
        confetti.push({
          x: Math.random() * W, y: -5,
          vx: (Math.random() - 0.5) * 1.2, vy: Math.random() * 1.2 + 0.5,
          color: ['#00ff88','#00d9ff','#ffd700','#ff4d4f'][Math.floor(Math.random() * 4)],
          size: Math.random() * 3 + 2, rotation: Math.random() * Math.PI * 2
        })
      }
      for (var i = confetti.length - 1; i >= 0; i--) {
        var cc = confetti[i]
        cc.x += cc.vx; cc.y += cc.vy; cc.rotation += 0.03
        ctx.save()
        ctx.translate(cc.x, cc.y)
        ctx.rotate(cc.rotation)
        ctx.fillStyle = cc.color
        ctx.globalAlpha = 0.08
        ctx.fillRect(-cc.size / 2, -cc.size / 4, cc.size, cc.size / 2)
        ctx.restore()
        ctx.globalAlpha = 1
        if (cc.y > H) confetti.splice(i, 1)
      }

      // Particles
      for (var p of particles) {
        p.x += p.vx + (mouseX - 0.5) * 0.1
        p.y += p.vy + (mouseY - 0.5) * 0.1
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0
        p.pulse += 0.02
        var pa = p.alpha * (0.5 + Math.sin(p.pulse) * 0.5)
        ctx.fillStyle = p.color + pa + ')'
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      }

      // Ground glow
      var gg = ctx.createLinearGradient(0, H * 0.85, 0, H)
      gg.addColorStop(0, 'rgba(0,255,136,0)')
      gg.addColorStop(1, 'rgba(0,255,136,0.008)')
      ctx.fillStyle = gg
      ctx.fillRect(0, H * 0.85, W, H * 0.15)

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ cursor: 'default' }}
    />
  )
}
