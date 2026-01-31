'use client';

import { Search, LogOut } from 'lucide-react';
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
  const { signOut, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
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
