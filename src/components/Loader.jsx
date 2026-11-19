// KADALUCK loaders: a paper cone catching bouncing kadala nuts + colored skeletons
// that mirror the real components' shapes (no layout jump when data arrives).

export function NutLoader({ label = 'Loading…', compact = false }) {
  return (
    <div className={`nutloader${compact ? ' compact' : ''}`} role="status" aria-live="polite">
      <div className="nl-stage" aria-hidden="true">
        <i className="nut n1" /><i className="nut n2" /><i className="nut n3" />
        <svg className="nl-cone" viewBox="0 0 80 100">
          <path d="M8 18 Q40 4 72 18 L46 92 Q40 100 34 92Z" fill="#f943a8" />
          <path d="M8 18 Q40 4 72 18 L66 30 Q40 20 14 30Z" fill="#ffc928" />
        </svg>
      </div>
      <span className="nl-label">{label}</span>
    </div>
  );
}

export const Sk = ({ w, h = 16, r = 12, tone = 'plum', style, className = '' }) => (
  <div className={`sk sk-${tone} ${className}`} style={{ width: w, height: h, borderRadius: r, ...style }} aria-hidden="true" />
);

export function HomeSkeleton() {
  return (
    <div className="wrap" role="status" aria-label="Loading">
      <div className="hero-grid">
        <div className="hero">
          <Sk w="40%" h={12} tone="yellow" />
          <Sk w="90%" h={30} tone="pink" />
          <Sk w="70%" h={30} tone="pink" />
          <div className="cones sk-cones" aria-hidden="true">
            <Sk className="c-blue" w={86} h={140} r={18} tone="blue" />
            <Sk className="c-yellow" w={86} h={140} r={18} tone="yellow" />
            <Sk className="c-red" w={104} h={170} r={20} tone="red" />
          </div>
        </div>
        <div className="stack">
          <div className="card stack"><Sk w="45%" h={12} tone="yellow" /><Sk h={22} w="80%" tone="pink" /><Sk h={30} r={99} w="70%" tone="plum" /></div>
          <div className="card stack"><div className="row"><Sk w={90} h={34} tone="mint" /><Sk w={60} h={20} r={99} tone="mint" /></div><Sk h={12} r={99} tone="mint" /></div>
          <div className="btns"><Sk h={48} r={16} tone="yellow" /><Sk h={48} r={16} tone="plum" /></div>
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton({ lines = 3, tone = 'plum' }) {
  return (
    <div className="card stack" role="status" aria-label="Loading">
      <Sk w="35%" h={12} tone="yellow" />
      <Sk w="75%" h={22} tone="pink" />
      {Array.from({ length: lines }).map((_, i) => <Sk key={i} h={14} w={`${95 - i * 12}%`} tone={tone} />)}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="stack" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div className="item" key={i}>
          <div className="stack" style={{ flex: 1 }}><Sk w="55%" h={16} tone={['pink', 'yellow', 'mint', 'blue'][i % 4]} /><Sk w="35%" h={12} /></div>
          <Sk w={44} h={44} r={14} tone={['yellow', 'mint', 'pink', 'blue'][i % 4]} />
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton({ fields = 5 }) {
  return (
    <div className="card stack" role="status" aria-label="Loading">
      {Array.from({ length: fields }).map((_, i) => (<div key={i} className="stack" style={{ gap: 6 }}><Sk w="30%" h={11} tone="yellow" /><Sk h={46} r={12} /></div>))}
      <Sk h={48} r={16} tone="pink" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="wrap">
      <Sk w="35%" h={12} tone="yellow" /><Sk w="70%" h={30} tone="pink" />
      <CardSkeleton /><CardSkeleton lines={2} tone="blue" />
    </div>
  );
}
