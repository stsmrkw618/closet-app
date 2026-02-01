'use client';

import { useState } from 'react';
import { Trophy, ChevronDown, Loader2 } from 'lucide-react';
import { ClothingItem, CategoryId } from '@/types';
import { useCloset, CATEGORIES } from '@/hooks/useCloset';

type PeriodType = 'all' | 'year' | 'month' | 'week';

interface RankingViewProps {
  clothes: ClothingItem[];
  loading: boolean;
}

interface RankedItem {
  item: ClothingItem;
  wearCount: number;
  tier: 1 | 2 | 3;
  rank: number;
}

const TIER_STYLES = {
  1: {
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    label: 'Tier 1',
    badge: 'bg-amber-500 text-zinc-950',
  },
  2: {
    bg: 'bg-zinc-500/20',
    border: 'border-zinc-500/50',
    text: 'text-zinc-300',
    label: 'Tier 2',
    badge: 'bg-zinc-400 text-zinc-950',
  },
  3: {
    bg: 'bg-orange-900/20',
    border: 'border-orange-900/50',
    text: 'text-orange-700',
    label: 'Tier 3',
    badge: 'bg-orange-800 text-zinc-200',
  },
};

const PERIOD_LABELS: Record<PeriodType, string> = {
  all: '全期間',
  year: '過去1年',
  month: '過去1ヶ月',
  week: '過去1週間',
};

function getDateRange(period: PeriodType): { start?: string; end?: string } {
  if (period === 'all') return {};

  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  switch (period) {
    case 'year':
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    default:
      return {};
  }

  return { start: start.toISOString().split('T')[0], end };
}

function calculateTier(rank: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 3;
  const percentile = (rank - 1) / total;
  if (percentile < 0.1) return 1; // 上位10%未満
  if (percentile < 0.3) return 2; // 上位10%以上30%未満
  return 3; // 上位30%以上
}

export default function RankingView({ clothes, loading }: RankingViewProps) {
  const [period, setPeriod] = useState<PeriodType>('all');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const { getWearCountInRange, getCategoryInfo } = useCloset();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  const { start, end } = getDateRange(period);

  // カテゴリでフィルタリング
  const filteredClothes =
    selectedCategory === 'all'
      ? clothes
      : clothes.filter((c) => c.category === selectedCategory);

  // 着用回数でランキング作成
  const rankedItems: RankedItem[] = filteredClothes
    .map((item) => ({
      item,
      wearCount: getWearCountInRange(item.id, start, end),
    }))
    .sort((a, b) => b.wearCount - a.wearCount)
    .map((data, index, arr) => ({
      ...data,
      rank: index + 1,
      tier: calculateTier(index + 1, arr.length),
    }));

  // Tierごとにグループ化
  const tier1Items = rankedItems.filter((r) => r.tier === 1);
  const tier2Items = rankedItems.filter((r) => r.tier === 2);
  const tier3Items = rankedItems.filter((r) => r.tier === 3);

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold">着用ランキング</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
            className="flex items-center gap-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 hover:border-zinc-700"
          >
            {PERIOD_LABELS[period]}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showPeriodMenu && (
            <div className="absolute top-full left-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-1 z-50">
              {Object.entries(PERIOD_LABELS).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => {
                    setPeriod(id as PeriodType);
                    setShowPeriodMenu(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-xs whitespace-nowrap ${
                    period === id
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

        <span className="text-xs text-zinc-500">{rankedItems.length}着</span>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-500 text-zinc-950 font-medium'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          すべて
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-emerald-500 text-zinc-950 font-medium'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {rankedItems.length === 0 ? (
        <div className="text-center py-16">
          <Trophy className="w-12 h-12 mx-auto mb-3 text-zinc-700" />
          <p className="text-zinc-500 text-sm">該当する服がありません</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tier 1 */}
          {tier1Items.length > 0 && (
            <TierSection
              tier={1}
              items={tier1Items}
              getCategoryInfo={getCategoryInfo}
            />
          )}

          {/* Tier 2 */}
          {tier2Items.length > 0 && (
            <TierSection
              tier={2}
              items={tier2Items}
              getCategoryInfo={getCategoryInfo}
            />
          )}

          {/* Tier 3 */}
          {tier3Items.length > 0 && (
            <TierSection
              tier={3}
              items={tier3Items}
              getCategoryInfo={getCategoryInfo}
            />
          )}
        </div>
      )}
    </>
  );
}

function TierSection({
  tier,
  items,
  getCategoryInfo,
}: {
  tier: 1 | 2 | 3;
  items: RankedItem[];
  getCategoryInfo: (id: CategoryId) => { icon: string; label: string };
}) {
  const style = TIER_STYLES[tier];

  return (
    <div className={`rounded-xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${style.badge}`}>
          {style.label}
        </span>
        <span className="text-xs text-zinc-500">
          上位{tier === 1 ? '10%' : tier === 2 ? '10-30%' : '30%以上'}
        </span>
      </div>

      <div className="space-y-2">
        {items.map((rankedItem) => {
          const category = getCategoryInfo(rankedItem.item.category);
          return (
            <div
              key={rankedItem.item.id}
              className="flex items-center gap-3 bg-zinc-950/50 rounded-lg p-2"
            >
              {/* Rank */}
              <div className={`w-6 text-center text-sm font-bold ${style.text}`}>
                {rankedItem.rank}
              </div>

              {/* Image */}
              <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                {rankedItem.item.image_url ? (
                  <img
                    src={rankedItem.item.image_url}
                    alt={rankedItem.item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg">
                    {category.icon}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {rankedItem.item.name}
                </div>
                <div className="text-[10px] text-zinc-500">
                  {category.label}
                </div>
              </div>

              {/* Count */}
              <div className="text-right">
                <div className={`text-sm font-bold ${style.text}`}>
                  {rankedItem.wearCount}回
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
