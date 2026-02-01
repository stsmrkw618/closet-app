'use client';

import { useState, useRef } from 'react';
import { Search, LogOut, Upload } from 'lucide-react';
import { CategoryId, SortType } from '@/types';
import { CATEGORIES } from '@/hooks/useCloset';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  totalItems: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: CategoryId | 'all';
  onFilterChange: (category: CategoryId | 'all') => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  showFilters: boolean;
}

// 時間帯に応じた挨拶メッセージ
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'こんな時間に何着る？🌙';
  if (hour < 11) return 'おはよう！今日は何着る？☀️';
  if (hour < 17) return '今日は何着る？👕';
  if (hour < 21) return '明日の準備はOK？🌇';
  return 'おつかれさま！明日は何着る？🌙';
}

export default function Header({
  totalItems,
  searchQuery,
  onSearchChange,
  filterCategory,
  onFilterChange,
  sortBy,
  onSortChange,
  showFilters,
}: HeaderProps) {
  const { signOut } = useAuth();
  const [mascotImage, setMascotImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LocalStorageからマスコット画像を復元
  useState(() => {
    try {
      const saved = localStorage.getItem('mascot-image');
      if (saved) setMascotImage(saved);
    } catch {}
  });

  const handleMascotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setMascotImage(result);
      try {
        localStorage.setItem('mascot-image', result);
      } catch {}
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="px-4 py-3">
        {/* タイトル行 */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-emerald-400">MY</span> CLOSET
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500">{totalItems} items</span>
            <button
              onClick={signOut}
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
              title="ログアウト"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* マスコット＋吹き出し */}
        <div className="flex items-center gap-3 mb-3">
          {/* マスコットアイコン */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative flex-shrink-0 w-11 h-11 rounded-full overflow-hidden border-2 border-emerald-500/40 hover:border-emerald-400 transition-colors bg-zinc-800"
          >
            {mascotImage ? (
              <img src={mascotImage} alt="mascot" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg">
                👤
              </div>
            )}
            <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-0.5">
              <Upload className="w-2 h-2 text-zinc-950" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleMascotUpload}
            className="hidden"
          />

          {/* 吹き出し */}
          <div className="relative bg-zinc-800/80 rounded-2xl rounded-bl-sm px-4 py-2 flex-1">
            <span className="text-sm text-zinc-200">{getGreeting()}</span>
            {/* 吹き出しの三角 */}
            <div className="absolute left-0 bottom-1 -translate-x-1 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-zinc-800/80 border-b-[6px] border-b-transparent" />
          </div>
        </div>

        {showFilters && (
          <>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="服を検索..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => onFilterChange('all')}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                  filterCategory === 'all'
                    ? 'bg-emerald-500 text-zinc-950 font-medium'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                }`}
              >
                すべて
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    filterCategory === cat.id
                      ? 'bg-emerald-500 text-zinc-950 font-medium'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
