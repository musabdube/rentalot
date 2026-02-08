'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Home, Building2, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<'TENANT' | 'LANDLORD' | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Client-side validation
    if (!role) {
      setError('Please select a role (Tenant or Landlord)');
      setIsLoading(false);
      return;
    }

    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    // Client-side password strength check
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      setError('Password must include uppercase, lowercase, number, and special character');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      setSuccess('Account created successfully! Signing you in...');
      
      // Auto sign in after successful signup
      setTimeout(() => {
        signIn('credentials', {
          email,
          password,
          redirect: true,
          callbackUrl: role === 'LANDLORD' ? '/landlord/dashboard' : '/tenant/dashboard',
        });
      }, 1500);
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <UserPlus className="w-8 h-8 text-emerald-600 mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Role Selection */}
          {!role && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">Who are you?</p>
              <div className="space-y-3">
                {/* Tenant Option */}
                <button
                  onClick={() => setRole('TENANT')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors">
                      <Home className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">I'm a Tenant</p>
                      <p className="text-xs text-gray-600">Looking for a rental property</p>
                    </div>
                  </div>
                </button>

                {/* Landlord Option */}
                <button
                  onClick={() => setRole('LANDLORD')}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 group-hover:bg-green-200 rounded-lg transition-colors">
                      <Building2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">I'm a Landlord</p>
                      <p className="text-xs text-gray-600">Listing rental properties</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Role Selected - Show Form */}
          {role && (
            <>
              <button
                onClick={() => setRole(null)}
                className="mb-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                ← Change role
              </button>

              <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating account...' : `Create Account as ${role === 'TENANT' ? 'Tenant' : 'Landlord'}`}
                </button>
              </form>

              {/* Google sign-up removed per request */}
            </>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-emerald-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
