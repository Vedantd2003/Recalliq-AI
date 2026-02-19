import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Brain, ArrowLeft, RefreshCw, Mail, AlertTriangle, 
  CheckSquare, Eye, Clock, User, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { meetingsAPI } from '../services/api';
import { RiskBadge, RiskBar, SentimentBadge, PriorityBadge, StatusBadge, Skeleton } from '../components/ui';
import DecisionTimeline from '../components/dashboard/DecisionTimeline';
import { format } from 'date-fns';

const TAB_CONFIG = [
  { id: 'overview', label: 'Overview', icon: Brain },
  { id: 'actions', label: 'Action Items', icon: CheckSquare },
  { id: 'decisions', label: 'Decisions', icon: Eye },
  { id: 'email', label: 'Follow-Up Email', icon: Mail },
];

export default function MeetingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    meetingsAPI.getById(id)
      .then(({ data: res }) => setData(res.data))
      .catch(() => { toast.error('Meeting not found'); navigate('/dashboard/meetings'); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRegenEmail = async () => {
    setRegenerating(true);
    try {
      const { data: res } = await meetingsAPI.regenerateEmail(id);
      setData((prev) => ({
        ...prev,
        meeting: { ...prev.meeting, followUpEmail: res.data.followUpEmail },
      }));
      toast.success(`Email regenerated (${res.data.creditsUsed} credits)`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Regeneration failed');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyEmail = () => {
    if (data?.meeting?.followUpEmail) {
      navigator.clipboard.writeText(data.meeting.followUpEmail);
      setCopied(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateAction = async (itemId, updates) => {
    setUpdatingItem(itemId);
    try {
      const { data: res } = await meetingsAPI.updateActionItem(id, itemId, updates);
      setData((prev) => ({
        ...prev,
        actionItems: prev.actionItems.map((ai) =>
          ai._id === itemId ? res.data.actionItem : ai
        ),
      }));
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdatingItem(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { meeting, actionItems = [], decisions = [] } = data;
  const emailBody = meeting.followUpEmail || '';
  const [emailSubject, ...emailContent] = emailBody.split('\n\n');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Back + Title */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/meetings')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4 text-sm"
        >
          <ArrowLeft size={16} /> Back to Meetings
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display font-bold text-2xl text-text-primary mb-2">
              {meeting.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {meeting.meetingDate && (
                <span className="text-sm text-text-muted flex items-center gap-1">
                  <Clock size={13} />
                  {format(new Date(meeting.meetingDate), 'MMMM d, yyyy')}
                </span>
              )}
              {meeting.participants?.length > 0 && (
                <span className="text-sm text-text-muted flex items-center gap-1">
                  <User size={13} />
                  {meeting.participants.join(', ')}
                </span>
              )}
              {meeting.sentiment && <SentimentBadge sentiment={meeting.sentiment} />}
              {meeting.riskScore !== null && <RiskBadge score={meeting.riskScore} />}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="font-mono">{meeting.creditsUsed} credits used</span>
            {meeting.processingTime && (
              <span className="font-mono">{(meeting.processingTime / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border overflow-x-auto">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-text-primary border-accent'
                : 'text-text-muted border-transparent hover:text-text-secondary'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.id === 'actions' && actionItems.length > 0 && (
              <span className="ml-1 text-xs bg-accent/20 text-accent-light px-1.5 py-0.5 rounded font-mono">
                {actionItems.length}
              </span>
            )}
            {tab.id === 'decisions' && decisions.length > 0 && (
              <span className="ml-1 text-xs bg-neural-cyan/20 text-neural-cyan px-1.5 py-0.5 rounded font-mono">
                {decisions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary + Risk */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card p-6">
              <h2 className="font-display font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Brain size={16} className="text-accent" />
                Executive Summary
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                {meeting.summary}
              </p>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm text-text-primary flex items-center gap-2">
                <AlertTriangle size={14} className="text-neural-red" />
                Risk Analysis
              </h3>
              <RiskBar score={meeting.riskScore || 0} showLabel />
              {meeting.riskFactors?.length > 0 && (
                <div>
                  <p className="text-xs text-text-muted mb-2">Risk Factors:</p>
                  <ul className="space-y-1">
                    {meeting.riskFactors.map((f, i) => (
                      <li key={i} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-neural-red mt-0.5">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Topics + Stats */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sm text-text-primary mb-3">Key Topics</h3>
              <div className="flex flex-wrap gap-2">
                {meeting.keyTopics?.map((topic) => (
                  <span
                    key={topic}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent/10 text-accent-light border border-accent/20"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-semibold text-sm text-text-primary mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Action Items', value: actionItems.length, color: '#7c6aff' },
                  { label: 'Decisions', value: decisions.length, color: '#00d4ff' },
                  { label: 'Hidden', value: decisions.filter((d) => d.type === 'hidden').length, color: '#ff4ddb' },
                  { label: 'High Risk', value: actionItems.filter((a) => (a.riskScore || 0) >= 70).length, color: '#ff4444' },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-lg bg-muted/50">
                    <div className="font-display font-bold text-xl" style={{ color: stat.color }}>{stat.value}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-3">
          {actionItems.length === 0 ? (
            <div className="card p-10 text-center">
              <CheckSquare size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No action items detected</p>
            </div>
          ) : (
            actionItems.map((item) => (
              <div
                key={item._id}
                className={`card p-4 transition-opacity ${updatingItem === item._id ? 'opacity-60' : ''}`}
                style={{
                  borderColor: item.riskScore >= 70 ? 'rgba(255,68,68,0.2)'
                    : item.riskScore >= 40 ? 'rgba(255,184,0,0.15)'
                    : undefined,
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleUpdateAction(item._id, {
                      status: item.status === 'completed' ? 'pending' : 'completed',
                    })}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      item.status === 'completed'
                        ? 'bg-neural-green border-neural-green'
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    {item.status === 'completed' && <Check size={12} className="text-void" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-medium text-sm ${
                        item.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'
                      }`}>
                        {item.title}
                      </h3>
                      {item.isInferred && (
                        <span className="text-xs font-mono text-neural-violet bg-neural-violet/10 px-1.5 py-0.5 rounded">
                          AI detected
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p className="text-xs text-text-secondary mb-2">{item.description}</p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <StatusBadge status={item.status} />
                      <PriorityBadge priority={item.priority} />

                      {item.assignee && item.assignee !== 'Unassigned' && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <User size={11} /> {item.assignee}
                        </span>
                      )}

                      {item.dueDate && (
                        <span className="text-xs text-text-muted flex items-center gap-1">
                          <Clock size={11} />
                          {format(new Date(item.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>

                    {item.riskReason && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertTriangle size={11} className="text-neural-red mt-0.5 shrink-0" />
                        <p className="text-xs text-neural-red/80">{item.riskReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Risk score */}
                  {item.riskScore !== null && (
                    <div className="text-right shrink-0">
                      <div className="text-lg font-display font-bold"
                        style={{ color: item.riskScore >= 70 ? '#ff4444' : item.riskScore >= 40 ? '#ffb800' : '#00e68a' }}>
                        {item.riskScore}
                      </div>
                      <div className="text-xs text-text-muted">risk</div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'decisions' && (
        <div>
          {decisions.length === 0 ? (
            <div className="card p-10 text-center">
              <Eye size={32} className="text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary">No decisions detected</p>
            </div>
          ) : (
            <DecisionTimeline decisions={decisions} />
          )}
        </div>
      )}

      {activeTab === 'email' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
              <Mail size={16} className="text-accent" />
              Follow-Up Email
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopyEmail}
                className="btn-ghost text-sm flex items-center gap-2 py-2"
              >
                {copied ? <Check size={14} className="text-neural-green" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleRegenEmail}
                disabled={regenerating}
                className="btn-secondary text-sm flex items-center gap-2 py-2"
              >
                <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} />
                {regenerating ? 'Regenerating...' : 'Regenerate (3 credits)'}
              </button>
            </div>
          </div>

          {emailBody ? (
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-lg bg-muted border border-border">
                <span className="text-xs text-text-muted font-mono mr-2">Subject:</span>
                <span className="text-sm font-medium text-text-primary">
                  {emailSubject.replace('Subject: ', '')}
                </span>
              </div>
              <div className="prose prose-sm prose-invert max-w-none text-text-secondary leading-relaxed text-sm"
                style={{ color: '#8888aa' }}>
                <ReactMarkdown>{emailContent.join('\n\n')}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted">
              <Mail size={28} className="mx-auto mb-3" />
              <p className="text-sm">No follow-up email generated</p>
              <button onClick={handleRegenEmail} disabled={regenerating} className="btn-primary text-sm mt-3">
                Generate Email
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
