import { useState } from 'react';
import { User, Mail, Building2, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { usersAPI } from '../services/api';
import useAuthStore from '../context/authStore';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    company: user?.company || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const { data } = await usersAPI.updateProfile(form);
      updateUser(data.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const planColors = { free: '#8888aa', pro: '#7c6aff', enterprise: '#ffb800' };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="font-display font-bold text-2xl text-text-primary mb-6">Profile Settings</h1>

      <div className="space-y-4">
        {/* Avatar + Plan */}
        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 border-2 border-accent/30 flex items-center justify-center">
            <span className="font-display font-bold text-2xl text-accent-light">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">{user?.name}</h2>
            <p className="text-text-secondary text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-xs font-mono font-bold px-2.5 py-1 rounded-full capitalize"
                style={{
                  color: planColors[user?.plan] || '#8888aa',
                  background: `${planColors[user?.plan]}20`,
                  border: `1px solid ${planColors[user?.plan]}30`,
                }}
              >
                {user?.plan} plan
              </span>
              <span className="text-xs text-text-muted">
                {user?.credits} credits remaining
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <h3 className="font-display font-semibold text-text-primary">Personal Info</h3>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                value={user?.email}
                disabled
                className="input-base pl-10 opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-text-muted mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Company</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Your company"
                className="input-base pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save size={15} />
            )}
            Save Changes
          </button>
        </form>

        {/* Account info */}
        <div className="card p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Shield size={15} className="text-accent" />
            Account Information
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Role</span>
              <span className="text-text-primary capitalize font-medium">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Member since</span>
              <span className="text-text-primary font-medium">
                {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Last login</span>
              <span className="text-text-primary font-medium">
                {user?.lastLoginAt ? format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm') : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
