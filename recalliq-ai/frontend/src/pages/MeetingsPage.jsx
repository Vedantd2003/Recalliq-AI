import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Plus, Search, Filter, ArrowRight, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { meetingsAPI } from '../services/api';
import { RiskBadge, SentimentBadge, StatusBadge, Skeleton, EmptyState } from '../components/ui';
import { formatDistanceToNow, format } from 'date-fns';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchMeetings = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const { data } = await meetingsAPI.getAll(params);
      setMeetings(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchMeetings(1), search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [search, statusFilter]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!confirm('Archive this meeting?')) return;
    try {
      await meetingsAPI.delete(id);
      setMeetings((prev) => prev.filter((m) => m._id !== id));
      toast.success('Meeting archived');
    } catch {
      toast.error('Failed to archive meeting');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Meetings</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            {pagination.total} meeting{pagination.total !== 1 ? 's' : ''} analyzed
          </p>
        </div>
        <Link to="/dashboard/meetings/new" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> New Analysis
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings..."
            className="input-base pl-9 py-2.5 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base py-2.5 text-sm w-auto pr-8"
        >
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={Brain}
          title={search ? 'No meetings found' : 'No meetings yet'}
          description={search ? 'Try adjusting your search' : 'Analyze your first meeting to get started'}
          action={
            !search && (
              <Link to="/dashboard/meetings/new" className="btn-primary flex items-center gap-2 text-sm">
                <Plus size={14} /> Analyze Meeting
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <Link
                key={meeting._id}
                to={`/dashboard/meetings/${meeting._id}`}
                className="card-hover p-5 flex flex-col group relative"
              >
                {/* Delete button */}
                <button
                  onClick={(e) => handleDelete(e, meeting._id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 
                             text-text-muted hover:text-neural-red hover:bg-neural-red/10 transition-all"
                  title="Archive"
                >
                  <Trash2 size={13} />
                </button>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
                    <Brain size={15} className="text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-sm text-text-primary line-clamp-2 
                                   group-hover:text-accent-light transition-colors">
                      {meeting.title}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {format(new Date(meeting.meetingDate || meeting.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {meeting.summary && (
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 mb-3 flex-1">
                    {meeting.summary}
                  </p>
                )}

                <div className="mt-auto space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={meeting.status} />
                    {meeting.sentiment && <SentimentBadge sentiment={meeting.sentiment} />}
                  </div>

                  {meeting.riskScore !== null && meeting.riskScore !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${meeting.riskScore}%`,
                            background: meeting.riskScore >= 70 ? '#ff4444'
                              : meeting.riskScore >= 40 ? '#ffb800' : '#00e68a',
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono text-text-muted">
                        Risk {meeting.riskScore}
                      </span>
                    </div>
                  )}

                  {meeting.keyTopics?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {meeting.keyTopics.slice(0, 3).map((topic) => (
                        <span key={topic} className="text-xs px-2 py-0.5 rounded bg-muted text-text-muted font-mono">
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-text-muted">
                    {formatDistanceToNow(new Date(meeting.createdAt), { addSuffix: true })}
                  </span>
                  <ArrowRight size={13} className="text-text-muted group-hover:text-accent-light transition-colors" />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchMeetings(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-mono transition-all ${
                    page === pagination.page
                      ? 'bg-accent text-white'
                      : 'bg-muted text-text-secondary hover:bg-border'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
