'use client';

import { useState, useEffect } from 'react';
import { Lock, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'closet-access-granted';

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [isGranted, setIsGranted] = useState<boolean | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [error, setError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // 初回ロード時にlocalStorageをチェック
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setIsGranted(stored === 'true');
    } catch {
      setIsGranted(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setError(false);

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: inputCode }),
      });

      if (response.ok) {
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {}
        setIsGranted(true);
      } else {
        setError(true);
        setInputCode('');
      }
    } catch {
      setError(true);
      setInputCode('');
    } finally {
      setIsChecking(false);
    }
  };

  // ロード中
  if (isGranted === null) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // アクセス許可済み
  if (isGranted) {
    return <>{children}</>;
  }

  // パスワード入力画面
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800">
            <Lock className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-zinc-100 mb-2">My Closet</h1>
          <p className="text-sm text-zinc-500">招待コードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                setError(false);
              }}
              placeholder="招待コード"
              className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 text-center text-lg tracking-widest placeholder-zinc-600 focus:outline-none transition-colors ${
                error
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-zinc-800 focus:border-emerald-500/50'
              }`}
              autoFocus
              disabled={isChecking}
            />
            {error && (
              <p className="text-red-400 text-xs text-center mt-2">
                コードが正しくありません
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputCode.trim() || isChecking}
            className="w-full bg-emerald-500 text-zinc-950 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '入る'
            )}
          </button>
        </form>

        <p className="text-xs text-zinc-600 text-center mt-8">
          招待コードは管理者にお問い合わせください
        </p>
      </div>
    </div>
  );
}
