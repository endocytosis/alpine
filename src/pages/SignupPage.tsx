import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mountain, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);

    const { error: signupErr } = await signUp(email, password, fullName);
    if (signupErr) { setError(signupErr); setLoading(false); return; }

    const { error: loginErr } = await signIn(email, password);
    if (loginErr) { setError(loginErr); setLoading(false); return; }

    if (role === 'host') {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const currentUserId = currentUser?.id;
      if (currentUserId) {
        await supabase.from('profiles').update({ role: 'host' }).eq('id', currentUserId);
      }
    }

    setLoading(false);
    navigate(role === 'host' ? '/dashboard/host' : '/dashboard/guest');
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Mountain className="mx-auto h-6 w-6 text-ink" strokeWidth={1.5} />
          <h1 className="mt-6 font-display text-heading-1 text-ink">Create your account</h1>
          <p className="mt-2 text-body-sm text-ink-subtle">Join Alpine and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          {error && <div className="poet-alert-danger">{error}</div>}

          {/* Role toggle */}
          <div className="flex border border-line">
            {(['guest', 'host'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-body-sm font-medium transition-colors duration-sharp ${role === r ? 'bg-ink text-canvas' : 'bg-surface text-ink-muted hover:bg-surface-alt'}`}
              >
                I'm a {r === 'guest' ? 'Guest' : 'Host'}
              </button>
            ))}
          </div>

          <div>
            <label className="poet-overline mb-1 block">Full Name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="poet-input" placeholder="John Smith" />
          </div>
          <div>
            <label className="poet-overline mb-1 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="poet-input" placeholder="you@example.com" />
          </div>
          <div>
            <label className="poet-overline mb-1 block">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="poet-input !pr-10" placeholder="At least 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink transition-colors duration-fast">
                {showPw ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="poet-btn-primary w-full !py-3">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-8 text-center text-body-sm text-ink-subtle">
          Already have an account? <Link to="/login" className="font-semibold text-ink underline underline-offset-2 hover:text-ink-muted transition-colors duration-fast">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
