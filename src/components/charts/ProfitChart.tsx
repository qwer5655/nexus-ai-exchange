'use client'
import { useEffect, useRef } from 'react'

export default function ProfitChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    const init = async () => {
      const echarts = await import('echarts')
      if (!containerRef.current) return
      chartRef.current = echarts.init(containerRef.current, undefined, { renderer: 'canvas' })

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          textStyle: { color: '#fff', fontSize: 12 },
          backgroundColor: 'rgba(12,17,27,0.9)',
          borderColor: 'rgba(255,255,255,0.1)',
        },
        grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
        },
        yAxis: {
          type: 'value',
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
          axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, formatter: (v: number) => '$' + v },
        },
        series: [
          {
            type: 'line',
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { color: '#00ff88', width: 2 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0,255,136,0.3)' },
                  { offset: 1, color: 'rgba(0,255,136,0)' },
                ],
              },
            },
            data: [820, 1430, 980, 1760, 1240, 2100, 1890],
            animationDuration: 2000,
            animationEasing: 'cubicOut',
          },
        ],
      }

      chartRef.current.setOption(option)
      const resize = () => chartRef.current?.resize()
      window.addEventListener('resize', resize)
      return () => {
        window.removeEventListener('resize', resize)
        chartRef.current?.dispose()
      }
    }

    init()
  }, [])

  return <div ref={containerRef} className="w-full h-[300px]" />
}
