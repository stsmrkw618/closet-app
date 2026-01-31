'use client';

import { Shirt, Plus, Calendar } from 'lucide-react';
import { ViewType } from '@/types';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export default function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800 px-6 py-3 z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onNavigate('closet')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
            currentView === 'closet'
              ? 'text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Shirt className="w-5 h-5" />
          <span className="text-[10px]">クローゼット</span>
        </button>

        <button
          onClick={() => onNavigate('add')}
          className="bg-emerald-500 text-zinc-950 p-3 rounded-full -mt-6 shadow-lg hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center gap-1 px-4 py-1 transition-colors ${
            currentView === 'history'
              ? 'text-emerald-400'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">履歴</span>
        </button>
      </div>
    </nav>
  );
}
