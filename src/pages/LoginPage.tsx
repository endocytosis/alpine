import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    navigate('/dashboard/guest');
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Mountain className="mx-auto h-6 w-6 text-ink" strokeWidth={1.5} />
          <h1 className="mt-6 font-display text-heading-1 text-ink">Welcome back</h1>
          <p className="mt-2 text-body-sm text-ink-subtle">Sign in to your Alpine account</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          {error && <div className="poet-alert-danger">{error}</div>}
          <div>
            <label className="poet-overline mb-1 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="poet-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="poet-overline mb-1 block">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="poet-input !pr-10" placeholder="Your password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors duration-fast">
                {showPw ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="poet-btn-primary w-full !py-3">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-body-sm text-ink-subtle">
          Don't have an account? <Link to="/signup" className="font-semibold text-ink underline underline-offset-2 hover:text-ink-muted transition-colors duration-fast">Create one</Link>
        </p>
      </div>
    </div>
  );
}
