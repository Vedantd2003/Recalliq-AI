import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Upload, Zap, Plus, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { meetingsAPI } from '../services/api';
import useAuthStore from '../context/authStore';

const SAMPLE_TRANSCRIPT = `[Meeting: Product Roadmap Q1 2025]
[Participants: Sarah (CPO), Marcus (CTO), Jen (Lead Dev), Tom (PM)]

Sarah: Let's kick off. We need to finalize the roadmap. Marcus, the API refactor - where do we stand?

Marcus: We're about 60% done. Jen can probably push it in two weeks, maybe three.

Sarah: Jen, can you commit to two weeks?

Jen: I can try but we have the security audit next week. Realistically, three weeks.

Sarah: Okay, let's say three. Tom, the customer dashboard - is that still on track for end of month?

Tom: About that - we had some design changes come back yesterday. I think we need another sprint.

Sarah: So that's pushing to mid-February?

Tom: Probably, yeah.

Sarah: Alright. Marcus, you mentioned last week the infrastructure costs are getting high.

Marcus: Yes, we're burning about $40k/month now. I think we need to migrate some services to reduce that.

Sarah: Can we get that under $30k?

Marcus: Possibly. I'll look into it this week and share options by Friday.

Sarah: Good. Also, I want to start doing weekly status emails to the board. Marcus, can you draft a template?

Marcus: Sure, I can do that.

Sarah: Great. And Jen, the mobile app MVP - I know we haven't talked timeline but customers are asking.

Jen: We haven't even scoped it yet. We'd need at least 8 weeks once we start.

Sarah: Let's plan to start that after the API refactor. Tom, make sure it's in the next quarter plan.

Tom: Will do.

Sarah: One more thing - we've had three customer complaints this week about response time. We need to address it.

Marcus: I think it's the database queries. I'll have Jen look at it.

Jen: Okay, I'll check it tomorrow.

Sarah: Perfect. Let's meet same time next week. Marcus, please send out the infrastructure analysis by Friday.`;

export default function NewMeetingPage() {
  const [form, setForm] = useState({
    title: '',
    transcript: '',
    participants: [],
    meetingDate: new Date().toISOString().split('T')[0],
    duration: '',
    tags: [],
  });
  const [participantInput, setParticipantInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { user, deductCredits } = useAuthStore();
  const navigate = useNavigate();

  const wordCount = form.transcript.trim().split(/\s+/).filter(Boolean).length;
  const estimatedCredits = wordCount < 200 ? 10
    : wordCount < 1000 ? 15
    : wordCount < 3000 ? 20
    : 30;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.transcript.trim().split(/\s+/).length < 20) e.transcript = 'Transcript must be at least 50 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addParticipant = (e) => {
    if (e.key === 'Enter' && participantInput.trim()) {
      e.preventDefault();
      if (!form.participants.includes(participantInput.trim())) {
        setForm({ ...form, participants: [...form.participants, participantInput.trim()] });
      }
      setParticipantInput('');
    }
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!form.tags.includes(tag)) {
        setForm({ ...form, tags: [...form.tags, tag] });
      }
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (user.credits < estimatedCredits) {
      toast.error(`Insufficient credits. Need ~${estimatedCredits}, have ${user.credits}.`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: form.title,
        transcript: form.transcript,
        participants: form.participants,
        meetingDate: form.meetingDate,
        duration: form.duration ? parseInt(form.duration) : undefined,
        tags: form.tags,
      };

      const { data } = await meetingsAPI.analyze(payload);
      deductCredits(data.data.creditsUsed);
      toast.success(`Analysis complete! ${data.data.creditsUsed} credits used.`);
      navigate(`/dashboard/meetings/${data.data.meeting._id}`);
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) {
        const fieldErrors = {};
        errData.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors(fieldErrors);
      }
      toast.error(errData?.error || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
            <Brain size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-text-primary">New Analysis</h1>
            <p className="text-text-secondary text-sm">Paste your meeting transcript for AI analysis</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title + Date row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Meeting Title <span className="text-neural-red">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Q1 Product Roadmap Review"
              className={`input-base ${errors.title ? 'border-neural-red' : ''}`}
            />
            {errors.title && <p className="text-neural-red text-xs mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Meeting Date</label>
            <input
              type="date"
              value={form.meetingDate}
              onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
              className="input-base"
            />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Participants <span className="text-text-muted">(press Enter to add)</span>
          </label>
          <div className={`min-h-[46px] bg-surface border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center transition-colors ${
            form.participants.length > 0 ? 'border-border' : 'border-border'
          } focus-within:border-accent`}>
            {form.participants.map((p) => (
              <span
                key={p}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-accent/15 text-accent-light"
              >
                {p}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, participants: form.participants.filter((x) => x !== p) })}
                  className="hover:text-neural-red transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={addParticipant}
              placeholder={form.participants.length === 0 ? 'Type name and press Enter...' : ''}
              className="flex-1 min-w-20 bg-transparent text-text-primary text-sm placeholder:text-text-muted outline-none"
            />
          </div>
        </div>

        {/* Transcript */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">
              Meeting Transcript <span className="text-neural-red">*</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-text-muted">{wordCount} words</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, transcript: SAMPLE_TRANSCRIPT, title: form.title || 'Product Roadmap Q1 2025' })}
                className="text-xs text-accent-light hover:text-accent transition-colors underline"
              >
                Load sample
              </button>
            </div>
          </div>
          <textarea
            value={form.transcript}
            onChange={(e) => setForm({ ...form, transcript: e.target.value })}
            placeholder="Paste your meeting transcript here...

Include speaker names, timestamps if available, and the full conversation."
            rows={14}
            className={`input-base resize-none font-mono text-sm leading-relaxed ${errors.transcript ? 'border-neural-red' : ''}`}
          />
          {errors.transcript && <p className="text-neural-red text-xs mt-1">{errors.transcript}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tags <span className="text-text-muted">(press Enter)</span>
          </label>
          <div className="min-h-[46px] bg-surface border border-border rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center focus-within:border-accent transition-colors">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-muted text-text-secondary"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}
                  className="hover:text-neural-red transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              placeholder={form.tags.length === 0 ? 'product, q1, roadmap...' : ''}
              className="flex-1 min-w-20 bg-transparent text-text-primary text-sm placeholder:text-text-muted outline-none"
            />
          </div>
        </div>

        {/* Credit estimate */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-accent/20 bg-accent/5">
          <Zap size={16} className="text-neural-amber shrink-0" />
          <div className="flex-1">
            <span className="text-sm text-text-secondary">Estimated cost: </span>
            <span className="text-sm font-semibold text-accent-light">~{estimatedCredits} credits</span>
          </div>
          <div className="text-xs font-mono text-text-muted">
            Balance: <span className={user?.credits >= estimatedCredits ? 'text-neural-green' : 'text-neural-red'}>
              {user?.credits || 0}
            </span>
          </div>
        </div>

        {user?.credits < estimatedCredits && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-neural-red/30 bg-neural-red/5">
            <AlertCircle size={16} className="text-neural-red shrink-0" />
            <p className="text-sm text-neural-red">Insufficient credits. Please upgrade your plan.</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || user?.credits < estimatedCredits}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <Brain size={16} />
                Analyze Meeting
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
