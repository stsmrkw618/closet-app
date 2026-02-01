'use client';

import { useState } from 'react';
import { Clock, Calendar, Trash2, X, Loader2, Sparkles, Tag, CalendarDays, Pencil } from 'lucide-react';
import { ClothingItem, FreshnessLevel } from '@/types';
import { useCloset } from '@/hooks/useCloset';

interface DetailViewProps {
  item: ClothingItem;
  onBack: () => void;
  onDelete: () => Promise<void>;
}

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

function getDaysColor(days: number): string {
  if (days === Infinity) return 'text-red-400';
  if (days > 30) return 'text-red-400';
  if (days > 14) return 'text-amber-400';
  if (days > 7) return 'text-yellow-400';
  return 'text-emerald-400';
}

const FRESHNESS_LABELS: Record<Exclude<FreshnessLevel, 'hidden'>, { label: string; color: string; bgColor: string }> = {
  fresh: { label: 'フレッシュ', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
  moderate: { label: 'そろそろ', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
  stale: { label: 'リフレッシュ推奨', color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

export default function DetailView({ item, onBack, onDelete }: DetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWearing, setIsWearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAcquiredDate, setEditAcquiredDate] = useState(item.acquired_date || '');
  const [editPrice, setEditPrice] = useState(item.price?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);

  const {
    getLastWornDate,
    getDaysAgo,
    getWearCount,
    getCategoryInfo,
    getItemHistory,
    wearToday,
    removeWearRecord,
    refreshItem,
    updateItem,
    getLastRefreshDate,
    getWearsSinceRefresh,
    getFreshnessLevel,
  } = useCloset();

  const category = getCategoryInfo(item.category);
  const lastWorn = getLastWornDate(item.id);
  const daysAgo = getDaysAgo(lastWorn);
  const wearCount = getWearCount(item.id);
  const history = getItemHistory(item.id);
  const freshnessLevel = getFreshnessLevel(item.id, item.category);
  const wearsSinceRefresh = getWearsSinceRefresh(item.id);
  const lastRefresh = getLastRefreshDate(item.id);

  const handleDelete = async () => {
    if (confirm('この服を削除しますか？')) {
      setIsDeleting(true);
      await onDelete();
    }
  };

  const handleWearToday = async () => {
    setIsWearing(true);
    await wearToday(item.id);
    setIsWearing(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshItem(item.id);
    setIsRefreshing(false);
  };

  const formatRefreshDate = (date: Date | null): string => {
    if (!date) return '記録なし';
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${y}/${m}/${d}`;
  };

  const handleSaveAcquisitionInfo = async () => {
    setIsSaving(true);
    await updateItem(item.id, {
      acquired_date: editAcquiredDate || null,
      price: editPrice ? parseInt(editPrice, 10) : null,
    });
    setIsSaving(false);
    setIsEditing(false);
  };

  const formatPrice = (price: number | null): string => {
    if (price === null) return '未設定';
    return `¥${price.toLocaleString()}`;
  };

  const formatAcquiredDate = (dateStr: string | null): string => {
    if (!dateStr) return '未設定';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 mb-4 text-sm"
      >
        ← 戻る
      </button>

      <div className="space-y-5">
        {/* Image */}
        <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              {category.icon}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h2 className="text-xl font-bold mb-2">{item.name}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs">
              {category.label}
            </span>
            {item.color && (
              <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs">
                {item.color}
              </span>
            )}
          </div>

          {item.notes && (
            <p className="text-sm text-zinc-400 bg-zinc-900 rounded-lg p-3 mb-4">
              {item.notes}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Clock className="w-3.5 h-3.5" />
              最後に着た日
            </div>
            <div className={`text-lg font-bold ${getDaysColor(daysAgo)}`}>
              {formatDate(lastWorn)}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              着用回数
            </div>
            <div className="text-lg font-bold">{wearCount}回</div>
          </div>
        </div>

        {/* Acquisition Info */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-medium">入手情報</span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-zinc-500 hover:text-zinc-300 p-1"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {isEditing ? (
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">手に入れた日</label>
                <input
                  type="date"
                  value={editAcquiredDate}
                  onChange={(e) => setEditAcquiredDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">対価（円）</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="例: 3000"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
                />
              </div>
              <button
                onClick={handleSaveAcquisitionInfo}
                disabled={isSaving}
                className="w-full bg-emerald-500/20 text-emerald-400 py-2 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : '保存'}
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 grid grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                  <CalendarDays className="w-3 h-3" />
                  手に入れた日
                </div>
                <div className="text-sm">{formatAcquiredDate(item.acquired_date)}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                  <Tag className="w-3 h-3" />
                  対価
                </div>
                <div className="text-sm">{formatPrice(item.price)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Freshness Section（対象カテゴリのみ表示） */}
        {freshnessLevel !== 'hidden' && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-medium">フレッシュネス</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${FRESHNESS_LABELS[freshnessLevel].bgColor} ${FRESHNESS_LABELS[freshnessLevel].color}`}>
                  {FRESHNESS_LABELS[freshnessLevel].label}
                </span>
              </div>
            </div>

            <div className="px-4 py-3 space-y-3">
              {/* リフレッシュ後の着用回数 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">リフレッシュ後</span>
                <span className={`font-bold ${FRESHNESS_LABELS[freshnessLevel].color}`}>
                  {wearsSinceRefresh}回着用
                </span>
              </div>

              {/* 前回のリフレッシュ日 */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-400">前回リフレッシュ</span>
                <span className="text-zinc-300 text-xs">
                  {formatRefreshDate(lastRefresh)}
                </span>
              </div>

              {/* リフレッシュボタン */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    リフレッシュする
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Recent History */}
        <div>
          <h3 className="text-sm font-medium mb-2">最近の着用</h3>
          <div className="space-y-1">
            {history.slice(0, 5).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between bg-zinc-900 rounded-lg px-3 py-2 text-sm"
              >
                <span className="text-zinc-400">{record.date}</span>
                <button
                  onClick={() => removeWearRecord(record.id)}
                  className="text-zinc-600 hover:text-red-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-zinc-600 text-sm py-2">
                まだ着用記録がありません
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleWearToday}
            disabled={isWearing}
            className="flex-1 bg-emerald-500 text-zinc-950 py-3 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isWearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              '今日着る'
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-3 bg-zinc-900 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
}
