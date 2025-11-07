'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to home page
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#2d3e50' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/SemperVirens-white-logo.avif" 
            alt="SemperVirens" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">SemperVirens Accelerator</h1>
          <p className="text-gray-400 mt-2">Dashboard Access</p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg shadow-lg p-8" style={{ background: '#3a4f63' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                style={{ background: '#2d3e50', border: '1px solid #4a5f73' }}
                placeholder="Enter password"
                required
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg p-3" style={{ background: '#dc2626', color: 'white' }}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4dd0e1', color: '#2d3e50' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          © 2025 SemperVirens Venture Capital
        </p>
      </div>
    </div>
  );
}

