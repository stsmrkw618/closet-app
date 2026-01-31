'use client';

import { useState } from 'react';
import { Clock, Calendar, Trash2, X, Loader2, Edit2, Check, Plus } from 'lucide-react';
import { ClothingItem, CategoryId } from '@/types';
import { useCloset, CATEGORIES } from '@/hooks/useCloset';

interface DetailViewProps {
  item: ClothingItem;
  onBack: () => void;
  onDelete: () => Promise<void>;
  onUpdate: (updatedItem: ClothingItem) => void;
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

export default function DetailView({ item, onBack, onDelete, onUpdate }: DetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWearing, setIsWearing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // 編集用の状態
  const [editName, setEditName] = useState(item.name);
  const [editCategory, setEditCategory] = useState<CategoryId>(item.category);
  const [editColor, setEditColor] = useState(item.color || '');
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    getLastWornDate,
    getDaysAgo,
    getWearCount,
    getCategoryInfo,
    getItemHistory,
    wearToday,
    wearOnDate,
    removeWearRecord,
    updateItem,
  } = useCloset();

  const category = getCategoryInfo(item.category);
  const lastWorn = getLastWornDate(item.id);
  const daysAgo = getDaysAgo(lastWorn);
  const wearCount = getWearCount(item.id);
  const history = getItemHistory(item.id);

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

  const handleWearOnDate = async () => {
    if (!selectedDate) return;
    setIsWearing(true);
    await wearOnDate(item.id, selectedDate);
    setShowDatePicker(false);
    setIsWearing(false);
  };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    
    setIsSaving(true);
    const updated = await updateItem(item.id, {
      name: editName,
      category: editCategory,
      color: editColor || null,
      notes: editNotes || null,
    });
    
    if (updated) {
      onUpdate(updated);
    }
    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setEditCategory(item.category);
    setEditColor(item.color || '');
    setEditNotes(item.notes || '');
    setIsEditing(false);
  };

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 mb-4 text-sm"
      >
        ← 戻る
      </button>

      <div className="space-y-4">
        {/* Image */}
        <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden max-h-64 mx-auto">
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
        {isEditing ? (
          /* 編集モード */
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">名前</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-xs text-zinc-400 mb-1">カテゴリ</label>
              <div className="grid grid-cols-3 gap-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setEditCategory(cat.id)}
                    className={`px-2 py-1.5 rounded text-xs transition-all ${
                      editCategory === cat.id
                        ? 'bg-emerald-500 text-zinc-950 font-medium'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-xs text-zinc-400 mb-1">色</label>
              <input
                type="text"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label className="block text-xs text-zinc-400 mb-1">メモ</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg text-sm hover:bg-zinc-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editName.trim()}
                className="flex-1 bg-emerald-500 text-zinc-950 py-2 rounded-lg text-sm font-bold hover:bg-emerald-400 disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                保存
              </button>
            </div>
          </div>
        ) : (
          /* 表示モード */
          <div>
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-bold">{item.name}</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-xs">
                {category.label}
              </span>
              {item.color && (
                <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-xs">
                  {item.color}
                </span>
              )}
            </div>

            {item.notes && (
              <p className="text-sm text-zinc-400 bg-zinc-900 rounded-lg p-2 mb-3">
                {item.notes}
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        {!isEditing && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="flex items-center gap-1 text-zinc-500 text-[10px] mb-0.5">
                <Clock className="w-3 h-3" />
                最後に着た日
              </div>
              <div className={`text-base font-bold ${getDaysColor(daysAgo)}`}>
                {formatDate(lastWorn)}
              </div>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
              <div className="flex items-center gap-1 text-zinc-500 text-[10px] mb-0.5">
                <Calendar className="w-3 h-3" />
                着用回数
              </div>
              <div className="text-base font-bold">{wearCount}回</div>
            </div>
          </div>
        )}

        {/* Recent History */}
        {!isEditing && (
          <div>
            <h3 className="text-xs font-medium mb-1.5">最近の着用</h3>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {history.slice(0, 5).map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between bg-zinc-900 rounded px-2 py-1.5 text-xs"
                >
                  <span className="text-zinc-400">{record.date}</span>
                  <button
                    onClick={() => removeWearRecord(record.id)}
                    className="text-zinc-600 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <p className="text-zinc-600 text-xs py-1">
                  まだ着用記録がありません
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {!isEditing && (
          <div className="space-y-2">
            {/* 日付選択 */}
            {showDatePicker && (
              <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-800">
                <label className="block text-xs text-zinc-400 mb-1">着用日を選択</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleWearOnDate}
                    disabled={isWearing}
                    className="bg-emerald-500 text-zinc-950 px-3 py-1.5 rounded text-sm font-bold hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isWearing ? <Loader2 className="w-4 h-4 animate-spin" /> : '登録'}
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="bg-zinc-800 text-zinc-400 px-2 py-1.5 rounded text-sm hover:bg-zinc-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleWearToday}
                disabled={isWearing}
                className="flex-1 bg-emerald-500 text-zinc-950 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isWearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '今日着る'
                )}
              </button>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="p-2.5 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700 transition-colors"
                title="過去の日付を登録"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2.5 bg-zinc-900 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Trash2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}