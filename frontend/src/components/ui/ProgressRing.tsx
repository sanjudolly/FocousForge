interface Props {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
}

export default function ProgressRing({ value, size = 120, strokeWidth = 8, color = '#8b5cf6', label, sublabel }: Props) {
  const r     = (size - strokeWidth * 2) / 2;
  const circ  = 2 * Math.PI * r;
  const pct   = Math.min(100, Math.max(0, value));
  const dash  = (pct / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(139,92,246,0.12)" strokeWidth={strokeWidth} />
        {/* Progress */}
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: 'stroke-dasharray 1.2s ease-out' }} />
      </svg>
      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {label && (
          <span style={{ fontWeight: 900, fontSize: size * 0.22, color: '#1e1b4b', lineHeight: 1 }}>
            {label}
          </span>
        )}
        {sublabel && (
          <span style={{ fontSize: size * 0.1, color: 'rgba(100,80,180,0.55)', marginTop: 2 }}>
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
