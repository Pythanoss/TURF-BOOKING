import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isLoggedIn) {
    navigate('/', { replace: true });
    return null;
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await login();
      if (result.success) {
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Failed to sign in. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(160deg, #022c22 0%, #064e3b 55%, #065f46 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
           style={{ background: 'radial-gradient(circle, #34d399, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
           style={{ background: 'radial-gradient(circle, #6ee7b7, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">

        {/* Logo */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 border border-white/20 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}
        >
          <span className="text-5xl">⚽</span>
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">TurfBook</h1>
        <p className="text-emerald-300 text-sm font-medium mb-1">Your premium turf booking platform</p>
        <p className="text-emerald-400/60 text-xs">Book · Play · Repeat</p>

        {/* Feature pills */}
        <div className="flex gap-3 mt-8 mb-10 flex-wrap justify-center">
          {[
            { emoji: '⚡', label: 'Instant Booking' },
            { emoji: '🔒', label: 'Secure Payment' },
            { emoji: '📅', label: 'Easy Scheduling' },
          ].map(f => (
            <div
              key={f.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-emerald-200 border border-white/10"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        {/* Login Card */}
        <div
          className="w-full max-w-sm rounded-3xl p-6 border border-white/15 shadow-2xl"
          style={{ background: 'rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)' }}
        >
          <h2 className="text-white text-xl font-bold mb-1">Sign in to continue</h2>
          <p className="text-emerald-300/80 text-sm mb-5">
            Access your bookings and manage slots
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-2xl">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                {/* Google G icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="text-xs text-emerald-300/50 text-center mt-4">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
