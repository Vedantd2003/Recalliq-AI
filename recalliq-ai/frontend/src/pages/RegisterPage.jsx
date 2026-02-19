import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, User, Mail, Lock, Eye, EyeOff, Building2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../context/authStore';

// Keep this outside to prevent focus loss while typing
const Field = ({ name, label, icon: Icon, type = 'text', placeholder, value, onChange, error, showPass, togglePassword }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
        <Icon size={18} />
      </div>
      <input
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#0B0F1A] border rounded-xl py-3 pl-11 pr-11 text-white transition-all outline-none focus:ring-2
          ${error ? 'border-red-500 focus:ring-red-500/20' : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'}`}
      />
      {name === 'password' && (
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 z-20"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
    {error && <p className="text-red-500 text-[11px] mt-1.5 ml-1 font-medium">{error}</p>}
  </div>
);

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear the specific error for this field as the user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (form.password.length < 8) e.password = "Minimum 8 characters required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      // 422 Handling: Server validation failed
      const responseData = err.response?.data;
      
      if (err.response?.status === 422 && responseData?.errors) {
        // If backend sends field-specific errors
        setErrors(responseData.errors);
        toast.error("Please fix the errors below");
      } else {
        // Fallback for general errors (e.g., "User already exists")
        toast.error(responseData?.message || responseData?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0B0F1A]/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
              <Brain className="text-white" size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create your account</h1>
            <p className="text-slate-400 text-sm mt-1">Start your AI meeting journey today</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <Field 
              name="name" label="Full Name" icon={User} placeholder="Jane Doe" 
              value={form.name} onChange={handleInputChange} error={errors.name}
            />
            <Field 
              name="email" label="Email Address" icon={Mail} type="email" placeholder="jane@company.com" 
              value={form.email} onChange={handleInputChange} error={errors.email}
            />
            <Field 
              name="password" label="Password" icon={Lock} 
              type={showPass ? 'text' : 'password'} 
              value={form.password} onChange={handleInputChange} error={errors.password}
              showPass={showPass} togglePassword={() => setShowPass(!showPass)}
            />
            <Field 
              name="company" label="Company (Optional)" icon={Building2} placeholder="Acme Inc." 
              value={form.company} onChange={handleInputChange}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}