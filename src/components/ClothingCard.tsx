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
  size?: 'large' | 'medium' | 'small';
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
  size = 'medium',
}: ClothingCardProps) {
  const sizeConfig = {
    large: {
      imageHeight: 'aspect-square max-h-64',
      textSize: 'text-base',
      badgeSize: 'text-xs px-2 py-1',
      showDetails: true,
    },
    medium: {
      imageHeight: 'aspect-square',
      textSize: 'text-sm',
      badgeSize: 'text-[10px] px-2 py-0.5',
      showDetails: true,
    },
    small: {
      imageHeight: 'aspect-square',
      textSize: 'text-xs',
      badgeSize: 'text-[8px] px-1.5 py-0.5',
      showDetails: false,
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all group">
      {/* Image */}
      <div
        onClick={onSelect}
        className={`${config.imageHeight} bg-zinc-800 relative cursor-pointer`}
      >
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {category.icon}
          </div>
        )}

        {/* Days Badge */}
        <div
          className={`absolute top-1 right-1 rounded-full font-medium bg-zinc-950/80 ${config.badgeSize} ${getDaysColor(daysAgo)}`}
        >
          {lastWornText}
        </div>

        {/* Today Worn Badge */}
        {isWornToday && (
          <div className={`absolute top-1 left-1 bg-emerald-500 text-zinc-950 rounded-full font-medium ${config.badgeSize}`}>
            Today ✓
          </div>
        )}
      </div>

      {/* Info */}
      <div className={size === 'small' ? 'p-2' : 'p-3'}>
        <h3 className={`font-medium ${config.textSize} truncate mb-1`}>{item.name}</h3>
        
        {config.showDetails && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500">{wearCount}回着用</span>

            {!isWornToday ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onWearToday();
                }}
                className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md text-[10px] font-medium hover:bg-emerald-500/30 transition-colors"
              >
                今日着る
              </button>
            ) : (
              <span className="text-emerald-400 text-[10px]">
                <Check className="w-3.5 h-3.5 inline" />
              </span>
            )}
          </div>
        )}

        {!config.showDetails && !isWornToday && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onWearToday();
            }}
            className="w-full bg-emerald-500/20 text-emerald-400 py-1 rounded text-[10px] font-medium hover:bg-emerald-500/30 transition-colors"
          >
            着る
          </button>
        )}

        {!config.showDetails && isWornToday && (
          <div className="text-center text-emerald-400 text-[10px]">
            <Check className="w-3 h-3 inline" /> 着用済
          </div>
        )}
      </div>
    </div>
  );
}