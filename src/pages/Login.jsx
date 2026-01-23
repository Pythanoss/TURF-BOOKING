import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chrome, Mail, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    // TODO: Integrate Google OAuth with Supabase
    // Example: const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })

    setIsLoading(true);

    const result = await login('google');

    if (result.success) {
      navigate('/', { replace: true });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">TB</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Turf Booking</h1>
          <p className="text-gray-600 mt-2">Book your slot in seconds</p>
        </div>

        {/* Login Card */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-6">Login to continue booking</p>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 hover:border-green-500 text-gray-700 font-semibold rounded-lg transition-all mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                Signing in...
              </>
            ) : (
              <>
                <Chrome size={20} className="text-green-600" />
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Email Input (Disabled for demo) */}
          <div className="mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail size={16} />
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Phone Input (Disabled for demo) */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone size={16} />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Continue Button (Disabled for demo) */}
          <button
            disabled
            className="btn-disabled w-full mb-4"
          >
            Continue
          </button>

          {/* Signup Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-green-600 hover:text-green-700 font-semibold">
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            <span className="font-semibold">Demo Mode:</span> Click "Continue with Google" to login with mock data
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
