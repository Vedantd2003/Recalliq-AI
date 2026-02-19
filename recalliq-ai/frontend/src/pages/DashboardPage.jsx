import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Brain, FileText, CheckCircle2, AlertTriangle, 
  TrendingUp, Plus, ArrowRight, Zap
} from 'lucide-react';
import { meetingsAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import { StatCard, RiskBadge, SentimentBadge, Skeleton } from '../components/ui';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    meetingsAPI.getStats()
      .then(({ data }) => setStats(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="text-text-muted text-sm font-mono mb-1">{greeting},</p>
          <h1 className="font-display font-bold text-3xl text-text-primary">
            {user?.name?.split(' ')[0] || 'there'}.
          </h1>
          <p className="text-text-secondary mt-1">
            {loading ? 'Loading your intelligence...' : `${stats?.totalMeetings || 0} meetings analyzed`}
          </p>
        </div>
        <Link to="/dashboard/meetings/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Analysis
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <StatCard
              icon={FileText}
              label="Total Meetings"
              value={stats?.totalMeetings || 0}
              color="#7c6aff"
            />
            <StatCard
              icon={AlertTriangle}
              label="Open Actions"
              value={stats?.pendingActions || 0}
              sub={stats?.overdueActions ? `${stats.overdueActions} overdue` : null}
              color="#ffb800"
            />
            <StatCard
              icon={TrendingUp}
              label="Avg Risk Score"
              value={`${stats?.avgRiskScore || 0}%`}
              color="#ff4ddb"
            />
            <StatCard
              icon={Zap}
              label="High Risk Items"
              value={stats?.highRiskItems || 0}
              color="#ff4444"
            />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent meetings */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-text-primary">Recent Meetings</h2>
            <Link to="/dashboard/meetings" className="text-xs text-accent-light hover:text-accent transition-colors flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : !stats?.recentMeetings?.length ? (
            <div className="text-center py-10">
              <Brain size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary text-sm">No meetings analyzed yet</p>
              <Link to="/dashboard/meetings/new" className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
                <Plus size={14} /> Analyze First Meeting
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentMeetings.map((meeting) => (
                <Link
                  key={meeting._id}
                  to={`/dashboard/meetings/${meeting._id}`}
                  className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                      <Brain size={14} className="text-accent-light" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-light transition-colors">
                        {meeting.title}
                      </div>
                      <div className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {meeting.sentiment && <SentimentBadge sentiment={meeting.sentiment} />}
                    {meeting.riskScore !== null && <RiskBadge score={meeting.riskScore} />}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + credits */}
        <div className="space-y-4">
          {/* Credit card */}
          <div className="card p-5"
            style={{ background: 'linear-gradient(135deg, rgba(124,106,255,0.1), rgba(0,212,255,0.05))' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-neural-amber" />
              <span className="font-display font-semibold text-text-primary text-sm">AI Credits</span>
            </div>
            <div className="font-display font-bold text-4xl text-text-primary mb-1">
              {user?.credits ?? 0}
            </div>
            <div className="text-xs text-text-muted mb-3">credits remaining</div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (user?.credits || 0))}%`,
                  background: 'linear-gradient(90deg, #7c6aff, #00d4ff)',
                }}
              />
            </div>
            <div className="mt-2 text-xs text-text-muted capitalize">{user?.plan} plan · 10 credits/meeting</div>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <h3 className="font-display font-semibold text-sm text-text-primary mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/dashboard/meetings/new"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                  <Plus size={14} className="text-accent" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary group-hover:text-accent-light transition-colors">
                    Analyze Meeting
                  </div>
                  <div className="text-xs text-text-muted">Paste transcript → get insights</div>
                </div>
                <ArrowRight size={14} className="ml-auto text-text-muted group-hover:text-accent transition-colors" />
              </Link>

              <Link
                to="/dashboard/meetings"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <FileText size={14} className="text-text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary group-hover:text-accent-light transition-colors">
                    All Meetings
                  </div>
                  <div className="text-xs text-text-muted">Browse your library</div>
                </div>
                <ArrowRight size={14} className="ml-auto text-text-muted group-hover:text-accent transition-colors" />
              </Link>

              <Link
                to="/dashboard/usage"
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <CheckCircle2 size={14} className="text-text-secondary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-text-primary group-hover:text-accent-light transition-colors">
                    Usage History
                  </div>
                  <div className="text-xs text-text-muted">Track credit consumption</div>
                </div>
                <ArrowRight size={14} className="ml-auto text-text-muted group-hover:text-accent transition-colors" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
