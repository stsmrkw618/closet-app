'use client';

import { Check } from 'lucide-react';
import { ClothingItem, Category } from '@/types';

interface ClothingCardProps {
  item: ClothingItem;
  category: Category;
  lastWornText: string;
  daysAgo: number;
  wearCount: number;
  isWornToday: boolean;
  onSelect: () => void;
  onWearToday: () => void;
  compact?: boolean;
}

function getDaysColor(days: number): string {
  if (days === Infinity) return 'text-red-400';
  if (days > 30) return 'text-red-400';
  if (days > 14) return 'text-amber-400';
  if (days > 7) return 'text-yellow-400';
  return 'text-emerald-400';
}

export default function ClothingCard({
  item,
  category,
  lastWornText,
  daysAgo,
  wearCount,
  isWornToday,
  onSelect,
  onWearToday,
  compact = false,
}: ClothingCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all group">
      {/* Image */}
      <div
        onClick={onSelect}
        className="aspect-square bg-zinc-800 relative cursor-pointer"
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${compact ? 'text-2xl' : 'text-4xl'}`}>
            {category.icon}
          </div>
        )}

        {/* Days Badge */}
        <div
          className={`absolute top-1 right-1 px-1.5 py-0.5 rounded-full font-medium bg-zinc-950/80 ${getDaysColor(daysAgo)} ${
            compact ? 'text-[8px]' : 'text-[10px]'
          }`}
        >
          {lastWornText}
        </div>

        {/* Today Worn Badge */}
        {isWornToday && (
          <div className={`absolute top-1 left-1 bg-emerald-500 text-zinc-950 px-1.5 py-0.5 rounded-full font-medium ${
            compact ? 'text-[8px]' : 'text-[10px]'
          }`}>
            ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className={compact ? 'p-1.5' : 'p-3'}>
        <h3 className={`font-medium truncate mb-0.5 ${compact ? 'text-[10px]' : 'text-sm mb-1'}`}>
          {item.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className={`text-zinc-500 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
            {wearCount}回
          </span>

          {!isWornToday ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWearToday();
              }}
              className={`bg-emerald-500/20 text-emerald-400 rounded-md font-medium hover:bg-emerald-500/30 transition-colors ${
                compact ? 'px-1.5 py-0.5 text-[8px]' : 'px-2.5 py-1 text-[10px]'
              }`}
            >
              {compact ? '着る' : '今日着る'}
            </button>
          ) : (
            <span className={`text-emerald-400 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
              <Check className={compact ? 'w-3 h-3 inline' : 'w-3.5 h-3.5 inline'} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
