'use client';

import { Shirt, Plus, Calendar } from 'lucide-react';
import { ViewType } from '@/types';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 z-50">
      <div className="relative max-w-md mx-auto px-4 py-3">
        {/* 3カラムグリッドで完全中央配置 */}
        <div className="grid grid-cols-3 items-center">
          {/* 左: クローゼット */}
          <button
            onClick={() => onNavigate('closet')}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              currentView === 'closet'
                ? 'text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shirt className="w-5 h-5" />
            <span className="text-[10px]">クローゼット</span>
          </button>

          {/* 中央: ＋ボタン */}
          <div className="flex justify-center">
            <button
              onClick={() => onNavigate('add')}
              className="bg-emerald-500 text-zinc-950 p-3.5 rounded-full -mt-8 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* 右: カレンダー */}
          <button
            onClick={() => onNavigate('history')}
            className={`flex flex-col items-center gap-1 py-1 transition-colors ${
              currentView === 'history'
                ? 'text-emerald-400'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px]">カレンダー</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
