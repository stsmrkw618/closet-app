'use client';

import { useRef, useState } from 'react';
import { X, Upload, Loader2, ImageIcon } from 'lucide-react';
import { CategoryId } from '@/types';
import { CATEGORIES } from '@/hooks/useCloset';

interface AddFormProps {
  onAdd: (
    item: {
      name: string;
      category: CategoryId;
      color: string;
      notes: string;
      acquired_date?: string;
      price?: number | null;
    },
    imageFile: File | null
  ) => Promise<void>;
  onClose: () => void;
}

export default function AddForm({ onAdd, onClose }: AddFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('tshirt');
  const [color, setColor] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [acquiredDate, setAcquiredDate] = useState('');
  const [price, setPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // プレビュー用にURLを作成
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);
      
      // ファイルサイズを表示
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`Selected image: ${file.name} (${sizeMB}MB)`);
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await onAdd(
        {
          name,
          category,
          color,
          notes,
          acquired_date: acquiredDate || undefined,
          price: price ? parseInt(price, 10) : null,
        },
        imageFile
      );

      // クリーンアップ
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    } catch (err) {
      console.error('Error adding item:', err);
      setError('登録に失敗しました。もう一度お試しください。');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold">服を登録</h2>
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-zinc-200"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Image Upload */}
        <div>
          <label className="block text-xs text-zinc-400 mb-2">
            写真 <span className="text-zinc-600">（1MB以下に自動圧縮）</span>
          </label>
          
          {imagePreview ? (
            <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden">
              <img
                src={imagePreview}
                alt="プレビュー"
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 rounded-full text-zinc-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <X className="w-4 h-4" />
              </button>
              {imageFile && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-zinc-900/80 rounded text-[10px] text-zinc-400">
                  {(imageFile.size / 1024 / 1024).toFixed(2)}MB
                </div>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="aspect-video bg-zinc-900 rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer flex flex-col items-center justify-center"
            >
              <ImageIcon className="w-8 h-8 text-zinc-600 mb-2" />
              <span className="text-sm text-zinc-500">
                タップして写真を選択
              </span>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            disabled={isSubmitting}
          />
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs text-zinc-400 mb-2">名前 *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: 黒のバンドTシャツ"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            disabled={isSubmitting}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs text-zinc-400 mb-2">カテゴリ</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                disabled={isSubmitting}
                className={`px-3 py-2.5 rounded-lg text-xs transition-all ${
                  category === cat.id
                    ? 'bg-emerald-500 text-zinc-950 font-medium'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                } disabled:opacity-50`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs text-zinc-400 mb-2">色</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="例: 黒、ネイビー"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
            disabled={isSubmitting}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-zinc-400 mb-2">メモ</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="例: 裏返し保管、プリント注意"
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
            disabled={isSubmitting}
          />
        </div>

        {/* Acquired Date & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">手に入れた日</label>
            <input
              type="date"
              value={acquiredDate}
              onChange={(e) => setAcquiredDate(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-2">対価（円）</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="例: 3000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="w-full bg-emerald-500 text-zinc-950 py-3.5 rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              登録中...
            </>
          ) : (
            '登録する'
          )}
        </button>
      </div>
    </>
  );
}
