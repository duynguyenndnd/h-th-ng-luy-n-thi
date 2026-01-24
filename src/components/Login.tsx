import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { Button } from './Button';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await registerUser(email, password);
      } else {
        await loginUser(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      const errorMsg = err.message || 'Authentication failed';
      if (errorMsg.includes('email-already-in-use')) {
        setError('Email already registered');
      } else if (errorMsg.includes('user-not-found')) {
        setError('Email not found');
      } else if (errorMsg.includes('wrong-password')) {
        setError('Wrong password');
      } else if (errorMsg.includes('weak-password')) {
        setError('Password must be at least 6 characters');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background animation elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-6 text-6xl animate-bounce" style={{animationDuration: '2s'}}>✦</div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            TSA Master
          </h1>
          <p className="text-indigo-100 text-sm font-semibold">Luyện Thi Tư Duy & Năng Lực</p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-white mb-2.5">
              📧 Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-white mb-2.5">
              🔐 Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 border border-white/20 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/50 p-4 rounded-xl backdrop-blur-sm">
              <p className="text-red-100 text-sm font-bold">⚠️ {error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? '⏳ Đang xử lý...' : isRegistering ? '📝 Đăng ký' : '🚀 Đăng nhập'}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <div className="mt-7 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-indigo-200 hover:text-white text-sm font-semibold transition-colors"
          >
            {isRegistering
              ? '✅ Bạn đã có tài khoản? Đăng nhập'
              : '🆕 Chưa có tài khoản? Đăng ký'}
          </button>
        </div>
      </div>
    </div>
  );
};
