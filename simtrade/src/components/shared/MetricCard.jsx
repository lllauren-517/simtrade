export default function MetricCard({ label, value, sub, color, size = 'default' }) {
  const valClass = `metric-val${size === 'sm' ? ' sm' : ''} ${color || 'neutral'}`
  return (
    <div className="metric">
      <div className="metric-label">{label}</div>
      <div className={valClass} style={typeof color === 'string' && color.startsWith('var') ? { color } : {}}>
        {value ?? '—'}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  )
}
