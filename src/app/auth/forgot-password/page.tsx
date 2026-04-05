'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/8 blur-[140px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px] z-10"
      >
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_24px_rgba(79,70,229,0.5)]">
            <Sparkles className="w-6 h-6 text-white fill-white/20" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">VidStrim</span>
        </div>

        <div className="bg-white/[0.03] border border-white/8 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl">
          {!sent ? (
            <>
              <h1 className="text-2xl font-black text-white mb-2">Reset Password</h1>
              <p className="text-white/40 text-sm mb-8">
                Enter your email and we&apos;ll send you a link to reset your password.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 pl-11 pr-4 bg-white/[0.04] border border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/8 transition-all text-sm"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-[0_0_24px_rgba(79,70,229,0.3)]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-3xl flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-black text-white mb-3">Check your email</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                We sent a password reset link to <span className="text-white/80 font-medium">{email}</span>.
                Check your inbox and spam folder.
              </p>
            </div>
          )}

          <Link
            href="/auth"
            className="mt-8 flex items-center justify-center gap-2 text-sm text-white/30 hover:text-white transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
