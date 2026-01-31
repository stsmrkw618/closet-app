'use client';

import { useState } from 'react';
import { SortDesc, ChevronDown, Shirt, Loader2, Grid3X3, Grid2X2 } from 'lucide-react';
import { ClothingItem, CategoryId, SortType } from '@/types';
import { useCloset } from '@/hooks/useCloset';
import ClothingCard from './ClothingCard';

interface ClosetViewProps {
  clothes: ClothingItem[];
  searchQuery: string;
  filterCategory: CategoryId | 'all';
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  onSelectItem: (item: ClothingItem) => void;
  onAddClick: () => void;
  loading: boolean;
}

type GridSize = 'medium' | 'small';

function formatDate(date: Date | null): string {
  if (!date) return '未着用';
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = now.getTime() - target.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return '今日';
  if (days === 1) return '昨日';
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}

export default function ClosetView({
  clothes,
  searchQuery,
  filterCategory,
  sortBy,
  onSortChange,
  onSelectItem,
  onAddClick,
  loading,
}: ClosetViewProps) {
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [gridSize, setGridSize] = useState<GridSize>('small');
  const {
    getLastWornDate,
    getDaysAgo,
    getWearCount,
    isWornToday,
    getCategoryInfo,
    wearToday,
  } = useCloset();

  const getFilteredClothes = () => {
    let filtered = [...clothes];

    if (filterCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === filterCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.notes?.toLowerCase().includes(q) ||
          c.color?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === 'lastWorn') {
        const aDate = getLastWornDate(a.id);
        const bDate = getLastWornDate(b.id);
        const aDays = getDaysAgo(aDate);
        const bDays = getDaysAgo(bDate);
        return bDays - aDays;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'wearCount') {
        return getWearCount(a.id) - getWearCount(b.id);
      }
      return 0;
    });

    return filtered;
  };

  const filteredClothes = getFilteredClothes();

  const sortLabels: Record<SortType, string> = {
    lastWorn: '着てない順',
    name: '名前順',
    wearCount: '着用回数少ない順',
  };

  const gridConfig = {
    medium: {
      className: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
      cardSize: 'medium' as const,
    },
    small: {
      className: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6',
      cardSize: 'small' as const,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Sort & Grid Options */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <SortDesc className="w-3.5 h-3.5" />
            {sortLabels[sortBy]}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
              {Object.entries(sortLabels).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    onSortChange(id as SortType);
                    setShowSortMenu(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs whitespace-nowrap ${
                    sortBy === id
                      ? 'text-emerald-400'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-zinc-500">{filteredClothes.length}件表示</div>
          
          {/* Grid Size Toggle */}
          <div className="flex bg-zinc-900 rounded-lg p-1">
            <button
              onClick={() => setGridSize('medium')}
              className={`p-1.5 rounded-md transition-colors ${
                gridSize === 'medium'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="中表示"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setGridSize('small')}
              className={`p-1.5 rounded-md transition-colors ${
                gridSize === 'small'
                  ? 'bg-emerald-500 text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="小表示"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Clothes Grid */}
      {filteredClothes.length === 0 ? (
        <div className="text-center py-16">
          <Shirt className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-zinc-500 text-sm mb-4">
            {clothes.length === 0
              ? '服が登録されていません'
              : '該当する服がありません'}
          </p>
          {clothes.length === 0 && (
            <button
              onClick={onAddClick}
              className="bg-emerald-500 text-zinc-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-400 transition-colors"
            >
              服を登録する
            </button>
          )}
        </div>
      ) : (
        <div className={`grid gap-2 ${gridConfig[gridSize].className}`}>
          {filteredClothes.map((item) => {
            const lastWorn = getLastWornDate(item.id);
            const days = getDaysAgo(lastWorn);

            return (
              <ClothingCard
                key={item.id}
                item={item}
                category={getCategoryInfo(item.category)}
                lastWornText={formatDate(lastWorn)}
                daysAgo={days}
                wearCount={getWearCount(item.id)}
                isWornToday={isWornToday(item.id)}
                onSelect={() => onSelectItem(item)}
                onWearToday={() => wearToday(item.id)}
                size={gridConfig[gridSize].cardSize}
              />
            );
          })}
        </div>
      )}
    </>
  );
}