'use client';

import { useState } from 'react';
import { Shirt, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      if (isSignUp) {
        await signUpWithEmail(email, password);
        setSuccess('確認メールを送信しました。メールをご確認ください。');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('メールアドレスが確認されていません。確認メールをご確認ください。');
      } else if (err.message?.includes('User already registered')) {
        setError('このメールアドレスは既に登録されています');
      } else {
        setError(err.message || 'エラーが発生しました。もう一度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-2xl mb-4">
            <Shirt className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-emerald-400">MY</span> CLOSET
          </h1>
          <p className="text-zinc-500 text-sm mt-2">
            服の着用履歴を管理して、眠っている服を発見しよう
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm text-center">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">パスワード</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6文字以上"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-500 text-zinc-950 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                処理中...
              </>
            ) : isSignUp ? (
              '新規登録'
            ) : (
              'ログイン'
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccess(null);
            }}
            className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors"
            disabled={isLoading}
          >
            {isSignUp ? (
              <>アカウントをお持ちの方は<span className="text-emerald-400">ログイン</span></>
            ) : (
              <>アカウントをお持ちでない方は<span className="text-emerald-400">新規登録</span></>
            )}
          </button>
        </div>

        <p className="text-zinc-600 text-xs text-center mt-6">
          ログインすることで、複数デバイスでデータを同期できます
        </p>
      </div>
    </div>
  );
}
