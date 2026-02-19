import { useEffect, useState } from 'react';
import { BarChart3, Zap, TrendingDown, Activity } from 'lucide-react';
import { usageAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import { Skeleton } from '../components/ui';
import { format } from 'date-fns';

const ACTION_LABELS = {
  analyze_meeting: 'Meeting Analysis',
  regenerate_email: 'Email Regeneration',
  reanalyze: 'Re-analysis',
  export: 'Export',
  api_call: 'API Call',
};

export default function UsagePage() {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const { user } = useAuthStore();

  useEffect(() => {
    usageAPI.getHistory({ days, limit: 50 })
      .then(({ data }) => setUsageData(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Usage & Credits</h1>
          <p className="text-text-secondary text-sm mt-0.5">Track your AI credit consumption</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="input-base w-auto text-sm py-2"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Credit overview */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 sm:col-span-1"
          style={{ background: 'linear-gradient(135deg, rgba(124,106,255,0.12), rgba(0,212,255,0.05))' }}>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-neural-amber" />
            <span className="text-xs font-mono text-text-muted">BALANCE</span>
          </div>
          <div className="font-display font-bold text-4xl text-text-primary">{user?.credits ?? 0}</div>
          <div className="text-xs text-text-muted mt-1 capitalize">{user?.plan} plan</div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-3">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, user?.credits || 0)}%`,
                background: 'linear-gradient(90deg, #7c6aff, #00d4ff)',
              }}
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-neural-red" />
            <span className="text-xs font-mono text-text-muted">USED ({days}d)</span>
          </div>
          {loading ? <Skeleton className="h-8 w-16" /> : (
            <div className="font-display font-bold text-3xl text-text-primary">
              {usageData?.totalCreditsUsed || 0}
            </div>
          )}
          <div className="text-xs text-text-muted mt-1">credits consumed</div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={14} className="text-neural-green" />
            <span className="text-xs font-mono text-text-muted">OPERATIONS</span>
          </div>
          {loading ? <Skeleton className="h-8 w-16" /> : (
            <div className="font-display font-bold text-3xl text-text-primary">
              {usageData?.pagination?.total || 0}
            </div>
          )}
          <div className="text-xs text-text-muted mt-1">total actions</div>
        </div>
      </div>

      {/* Summary by action */}
      {!loading && usageData?.summary?.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="font-display font-semibold text-sm text-text-primary mb-4">By Action Type</h2>
          <div className="space-y-3">
            {usageData.summary.map((s) => {
              const max = Math.max(...usageData.summary.map((x) => x.totalCredits));
              const pct = max > 0 ? (s.totalCredits / max) * 100 : 0;
              return (
                <div key={s._id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-secondary">{ACTION_LABELS[s._id] || s._id}</span>
                    <span className="font-mono text-text-muted">
                      {s.totalCredits} credits · {s.count} ops
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #7c6aff, #00d4ff)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction history */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-sm text-text-primary">Transaction History</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
          </div>
        ) : !usageData?.usage?.length ? (
          <div className="p-10 text-center">
            <BarChart3 size={28} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No usage history yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {usageData.usage.map((u) => (
              <div key={u._id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap size={13} className="text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text-primary">
                      {ACTION_LABELS[u.action] || u.action}
                    </div>
                    {u.meeting && (
                      <div className="text-xs text-text-muted">{u.meeting.title}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-semibold text-neural-red">
                    -{u.creditsUsed}
                  </div>
                  <div className="text-xs text-text-muted">
                    {format(new Date(u.createdAt), 'MMM d, HH:mm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
