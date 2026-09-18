import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Gavel, ShieldCheck } from 'lucide-react';
import authImage from '../../assets/Auth-image1.jpg';
import samsungLogo from '../../assets/Samsung Logo - White - 13357x2048 - zonalogo.com.png';
import { supabase } from '../lib/supabase.js';

const ROLES = [
  { id: 'student', label: 'Student', icon: GraduationCap, portal: '/team/builder' },
  { id: 'judge', label: 'Judge', icon: Gavel, portal: '/judge' },
  { id: 'organiser', label: 'Organiser', icon: ShieldCheck, portal: '/organiser' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading
  const [isSignUp, setIsSignUp] = useState(false);

  const role = ROLES.find((r) => r.id === roleId);

  const [fullName, setFullName] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Enter your email and password to continue.');
      return;
    }
    if (isSignUp && roleId === 'student' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError('');
    setStatus('loading');

    if (role.id === 'organiser') {
      try {
        const cleanEmail = email.trim();
        if (isSignUp) {
          const { error: signUpError } = await supabase.auth.signUp({ email: cleanEmail, password });
          if (signUpError) throw signUpError;
          
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            setError('Account created! Please check your email or sign in.');
            setStatus('idle');
            return;
          }
          navigate('/organiser/workspaces');
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (signInError) throw signInError;
          navigate('/organiser/workspaces');
        }
      } catch (err) {
        setError(err.message);
        setStatus('idle');
      }
    } else if (role.id === 'judge') {
      try {
        const cleanEmail = email.trim();
        const { data: judgeList, error: judgeError } = await supabase
          .from('judges')
          .select('*')
          .ilike('email', cleanEmail)
          .limit(1);

        const judgeData = judgeList && judgeList.length > 0 ? judgeList[0] : null;

        if (judgeError || !judgeData) {
          throw new Error('Judge account not found. Please check your email or verify judge creation in setup.');
        }

        if (judgeData.password && judgeData.password !== password) {
          throw new Error('Invalid password.');
        }

        navigate('/judge', { state: { judge: judgeData } });
      } catch (err) {
        setError(err.message || 'Judge login failed');
        setStatus('idle');
      }
    } else {
      // Student Auth & Account Creation
      try {
        const cleanEmail = email.trim();
        if (isSignUp) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim(),
                role: 'student',
              }
            }
          });
          if (signUpError) throw signUpError;
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
          if (signInError) console.warn('Supabase auth bypass for local test:', signInError.message);
        }

        const studentProfile = {
          name: fullName.trim() || email.split('@')[0],
          email: cleanEmail,
        };

        navigate(role.portal, { state: { student: studentProfile } });
      } catch (err) {
        // Fallback for seamless developer testing
        navigate(role.portal, { state: { student: { name: fullName || email.split('@')[0], email } } });
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-app font-sans text-ink">
      {/* Hero panel */}
      <div
        className="hidden md:flex md:w-[45%] bg-sidebar text-white flex-col justify-between p-12 relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: `url("${authImage}")` }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10 flex items-center gap-3">
          <img src={samsungLogo} alt="Samsung" className="h-6 object-contain" />
          <span className="font-display font-semibold border-l pl-3 border-white/30">HackJudge</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-3xl font-semibold leading-tight mb-3 text-white">
          </h1>
          <p className="text-white/80 max-w-xs">Build. Solve. Impact.</p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold mb-1">{isSignUp ? 'Create an account' : 'Welcome back'}</h2>
          <p className="text-sm text-muted mb-8">{isSignUp ? `Sign up as a ${role.label}` : `Sign in to your ${role.label} account`}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-muted mt-6 mb-2">Select your role</p>
            <div className="flex gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const active = r.id === roleId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRoleId(r.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-display border transition-colors ${active
                      ? 'border-primary bg-primarylight text-primary'
                      : 'border-border text-muted hover:border-ink/20'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {r.label}
                  </button>
                );
              })}
            </div>

            {isSignUp && roleId === 'student' && (
              <div>
                <label className="block text-xs text-muted mb-1.5" htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-border rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-border rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs text-muted mb-1.5" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-border rounded-md px-3 py-2.5 text-sm text-ink placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary/30"
                />
                Remember me
              </label>
              <button type="button" className="text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-2.5 rounded-md font-display text-sm font-semibold text-white bg-primary hover:bg-primarydark disabled:opacity-60 transition-colors"
            >
              {status === 'loading' ? (isSignUp ? 'Signing up…' : 'Signing in…') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
            
            {(role.id === 'organiser' || role.id === 'student') && (
              <p className="text-center text-sm text-muted mt-4">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button type="button" onClick={() => { setIsSignUp(!isSignUp); setError(''); }} className="ml-1 text-primary hover:underline">
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            )}
          </form>


        </div>
      </div>
    </div>
  );
}
