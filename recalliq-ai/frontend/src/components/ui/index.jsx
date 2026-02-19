// Stat Card
export function StatCard({ icon: Icon, label, value, sub, color = '#7c6aff', trend }) {
  return (
    <div className="card-hover p-5 relative overflow-hidden group">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at top left, ${color}08, transparent 60%)` }}
      />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}25` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span
            className="text-xs font-mono"
            style={{ color: trend >= 0 ? '#00e68a' : '#ff4444' }}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="font-display font-bold text-2xl text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary mt-0.5">{label}</div>
      {sub && <div className="text-xs text-text-muted mt-1">{sub}</div>}
    </div>
  );
}

// Risk Badge
export function RiskBadge({ score }) {
  const config = score >= 80
    ? { label: 'CRITICAL', class: 'badge-risk-critical' }
    : score >= 60
      ? { label: 'HIGH', class: 'badge-risk-high' }
      : score >= 40
        ? { label: 'MEDIUM', class: 'badge-risk-medium' }
        : { label: 'LOW', class: 'badge-risk-low' };

  return (
    <span className={config.class}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label} RISK {score !== undefined && `${score}`}
    </span>
  );
}

// Risk Bar
export function RiskBar({ score, showLabel = false }) {
  const color = score >= 80 ? '#ff4444'
    : score >= 60 ? '#ff8800'
    : score >= 40 ? '#ffb800'
    : '#00e68a';

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Risk Score</span>
          <span className="font-mono" style={{ color }}>{score}/100</span>
        </div>
      )}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

// Sentiment Badge
export function SentimentBadge({ sentiment }) {
  const config = {
    positive: { color: '#00e68a', label: '↑ Positive' },
    negative: { color: '#ff4444', label: '↓ Negative' },
    mixed: { color: '#ffb800', label: '⊕ Mixed' },
    neutral: { color: '#8888aa', label: '− Neutral' },
  }[sentiment] || { color: '#8888aa', label: '− Neutral' };

  return (
    <span
      className="text-xs font-mono font-medium px-2 py-1 rounded-full"
      style={{ color: config.color, background: `${config.color}15`, border: `1px solid ${config.color}25` }}
    >
      {config.label}
    </span>
  );
}

// Priority Badge
export function PriorityBadge({ priority }) {
  const config = {
    urgent: { color: '#ff4444', label: 'URGENT' },
    high: { color: '#ff8800', label: 'HIGH' },
    medium: { color: '#ffb800', label: 'MEDIUM' },
    low: { color: '#00e68a', label: 'LOW' },
  }[priority] || { color: '#8888aa', label: 'MEDIUM' };

  return (
    <span
      className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
      style={{ color: config.color, background: `${config.color}12` }}
    >
      {config.label}
    </span>
  );
}

// Status Badge
export function StatusBadge({ status }) {
  const config = {
    pending: { color: '#8888aa', label: 'Pending' },
    in_progress: { color: '#00d4ff', label: 'In Progress' },
    completed: { color: '#00e68a', label: 'Completed' },
    cancelled: { color: '#555570', label: 'Cancelled' },
    overdue: { color: '#ff4444', label: 'Overdue' },
    processing: { color: '#7c6aff', label: 'Processing...' },
    failed: { color: '#ff4444', label: 'Failed' },
  }[status] || { color: '#8888aa', label: status };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
      style={{ color: config.color, background: `${config.color}12`, border: `1px solid ${config.color}20` }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

// Loading Skeleton
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  );
}

// Empty State
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon size={28} className="text-text-muted" />
      </div>
      <h3 className="font-display font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-sm max-w-xs">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// Section Header
export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h2 className="font-display font-bold text-xl text-text-primary">{title}</h2>
        {description && <p className="text-text-secondary text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
