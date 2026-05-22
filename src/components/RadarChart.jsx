export default function RadarChart({ data, labels, color = '#6366F1', size = 260 }) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.30
  const n = labels.length

  const ang = (i) => (2 * Math.PI * i / n) - Math.PI / 2
  const pt = (i, scale) => ({
    x: cx + r * scale * Math.cos(ang(i)),
    y: cy + r * scale * Math.sin(ang(i)),
  })
  const toPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + 'Z'

  const dataPts = Array.from({ length: n }, (_, i) => pt(i, data[i] / 100))

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* 그리드 링 */}
      {[0.25, 0.5, 0.75, 1].map(level => (
        <path
          key={level}
          d={toPath(Array.from({ length: n }, (_, i) => pt(i, level)))}
          fill="none"
          stroke={level === 1 ? '#D1D5DB' : '#F3F4F6'}
          strokeWidth={level === 1 ? 1.2 : 0.8}
        />
      ))}

      {/* 스포크 */}
      {Array.from({ length: n }, (_, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={pt(i, 1).x.toFixed(1)}
          y2={pt(i, 1).y.toFixed(1)}
          stroke="#E5E7EB"
          strokeWidth={0.8}
        />
      ))}

      {/* 데이터 면적 */}
      <path
        d={toPath(dataPts)}
        fill={color + '22'}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* 데이터 점 */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r={3.5} fill={color} />
      ))}

      {/* 레이블 */}
      {Array.from({ length: n }, (_, i) => {
        const lx = cx + r * 1.38 * Math.cos(ang(i))
        const ly = cy + r * 1.38 * Math.sin(ang(i))
        const parts = labels[i].split('\n')
        const lineH = 11
        return (
          <text
            key={i}
            x={lx.toFixed(1)}
            y={(ly - (parts.length - 1) * lineH / 2).toFixed(1)}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={9}
            fontWeight={700}
            fill="#374151"
          >
            {parts.map((part, j) => (
              <tspan key={j} x={lx.toFixed(1)} dy={j === 0 ? 0 : lineH}>
                {part}
              </tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}
