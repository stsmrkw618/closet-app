'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage, generateFileName } from '@/lib/imageCompression';
import { ClothingItem, WearRecord, RefreshRecord, CategoryId, Category, FreshnessLevel } from '@/types';
import { useAuth } from './useAuth';

export const CATEGORIES: Category[] = [
  { id: 'tshirt', label: 'Tシャツ', icon: '👕' },
  { id: 'shirt', label: 'シャツ', icon: '👔' },
  { id: 'sweater', label: 'ニット/スウェット', icon: '🧶' },
  { id: 'jacket', label: 'ジャケット/アウター', icon: '🧥' },
  { id: 'pants', label: 'パンツ', icon: '👖' },
  { id: 'shorts', label: 'ショーツ', icon: '🩳' },
  { id: 'shoes', label: '靴', icon: '👟' },
  { id: 'other', label: 'その他', icon: '📦' },
];

// ====================================
// カテゴリ別フレッシュネス閾値設定
// ====================================
// null = バッジ非表示（フレッシュネス対象外）
interface FreshnessThreshold {
  moderate: number; // この回数以上で黄ドット
  stale: number;    // この回数以上で赤ドット
}

const FRESHNESS_THRESHOLDS: Record<CategoryId, FreshnessThreshold | null> = {
  tshirt:  { moderate: 1, stale: 4 },  // 緑:0回, 黄:1-3回, 赤:4回以上
  shirt:   { moderate: 1, stale: 4 },
  sweater: { moderate: 1, stale: 4 },
  jacket:  null,                         // 非表示
  pants:   { moderate: 1, stale: 8 },   // 緑:0回, 黄:1-7回, 赤:8回以上
  shorts:  { moderate: 1, stale: 4 },
  shoes:   null,                         // 非表示
  other:   null,                         // 非表示
};

export function useCloset() {
  const { user } = useAuth();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [wearHistory, setWearHistory] = useState<WearRecord[]>([]);
  const [refreshHistory, setRefreshHistory] = useState<RefreshRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データ取得
  const fetchData = useCallback(async () => {
    if (!user) {
      setClothes([]);
      setWearHistory([]);
      setRefreshHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 服データ＋着用履歴（必須）
      const [clothesRes, historyRes] = await Promise.all([
        supabase
          .from('clothes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('wear_history')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
      ]);

      if (clothesRes.error) throw clothesRes.error;
      if (historyRes.error) throw historyRes.error;

      setClothes((clothesRes.data as ClothingItem[]) || []);
      setWearHistory((historyRes.data as WearRecord[]) || []);

      // リフレッシュ履歴（テーブル未作成でも他データに影響させない）
      try {
        const refreshRes = await supabase
          .from('refresh_history')
          .select('*')
          .eq('user_id', user.id)
          .order('refreshed_at', { ascending: false });
        if (!refreshRes.error) {
          setRefreshHistory((refreshRes.data as RefreshRecord[]) || []);
        } else {
          console.warn('refresh_history not available:', refreshRes.error.message);
          setRefreshHistory([]);
        }
      } catch {
        console.warn('refresh_history table may not exist yet');
        setRefreshHistory([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====================================
  // 画像アップロード/削除
  // ====================================
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    try {
      const compressedFile = await compressImage(file);
      const fileName = generateFileName(user.id, file.name);
      const { error: uploadError } = await supabase.storage
        .from('clothing-images')
        .upload(fileName, compressedFile, {
          contentType: 'image/jpeg',
          upsert: false,
        });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage
        .from('clothing-images')
        .getPublicUrl(fileName);
      return publicUrl;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw new Error('画像のアップロードに失敗しました');
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!user || !imageUrl) return;
    try {
      const urlParts = imageUrl.split('/clothing-images/');
      if (urlParts.length < 2) return;
      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from('clothing-images')
        .remove([filePath]);
      if (error) console.error('Error deleting image:', error);
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  // ====================================
  // 服の追加/削除
  // ====================================
  const addItem = async (
    item: {
      name: string;
      category: CategoryId;
      color: string;
      notes: string;
      acquired_date?: string;
      price?: number | null;
    },
    imageFile: File | null
  ): Promise<ClothingItem | null> => {
    if (!user) return null;
    try {
      setError(null);
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const { data, error: insertError } = await supabase
        .from('clothes')
        .insert({
          user_id: user.id,
          name: item.name,
          category: item.category,
          color: item.color || null,
          image_url: imageUrl,
          notes: item.notes || null,
          acquired_date: item.acquired_date || null,
          price: item.price ?? null,
        })
        .select()
        .single();
      if (insertError) throw insertError;
      const newItem = data as ClothingItem;
      setClothes((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error('Error adding item:', err);
      setError('服の登録に失敗しました');
      return null;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      setError(null);
      const item = clothes.find((c) => c.id === id);
      const { error: deleteError } = await supabase
        .from('clothes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      if (item?.image_url) {
        await deleteImage(item.image_url);
      }
      // 着用履歴削除
      await supabase.from('wear_history').delete().eq('clothing_id', id).eq('user_id', user.id);
      // リフレッシュ履歴削除（テーブル未作成でもエラーにしない）
      try {
        await supabase.from('refresh_history').delete().eq('clothing_id', id).eq('user_id', user.id);
      } catch {}

      setClothes((prev) => prev.filter((c) => c.id !== id));
      setWearHistory((prev) => prev.filter((h) => h.clothing_id !== id));
      setRefreshHistory((prev) => prev.filter((r) => r.clothing_id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('服の削除に失敗しました');
      return false;
    }
  };

  // ====================================
  // 着用記録
  // ====================================
  const wearToday = async (clothingId: string): Promise<boolean> => {
    if (!user) return false;
    const today = new Date().toISOString().split('T')[0];
    return wearOnDate(clothingId, today);
  };

  const wearOnDate = async (clothingId: string, date: string): Promise<boolean> => {
    if (!user) return false;
    const existing = wearHistory.find(
      (h) => h.clothing_id === clothingId && h.date === date
    );
    if (existing) return true;
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('wear_history')
        .insert({ user_id: user.id, clothing_id: clothingId, date })
        .select()
        .single();
      if (insertError) throw insertError;
      setWearHistory((prev) => [data as WearRecord, ...prev]);
      return true;
    } catch (err) {
      console.error('Error recording wear:', err);
      setError('着用記録の保存に失敗しました');
      return false;
    }
  };

  const removeWearRecord = async (recordId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('wear_history')
        .delete()
        .eq('id', recordId)
        .eq('user_id', user.id);
      if (deleteError) throw deleteError;
      setWearHistory((prev) => prev.filter((h) => h.id !== recordId));
      return true;
    } catch (err) {
      console.error('Error removing wear record:', err);
      setError('着用記録の削除に失敗しました');
      return false;
    }
  };

  // ====================================
  // リフレッシュ（洗濯）記録
  // ====================================
  const refreshItem = async (clothingId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      setError(null);
      const { data, error: insertError } = await supabase
        .from('refresh_history')
        .insert({
          user_id: user.id,
          clothing_id: clothingId,
          refreshed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (insertError) throw insertError;
      setRefreshHistory((prev) => [data as RefreshRecord, ...prev]);
      return true;
    } catch (err) {
      console.error('Error recording refresh:', err);
      setError('リフレッシュ記録の保存に失敗しました。Supabaseでrefresh_historyテーブルを作成してください。');
      return false;
    }
  };

  // 最後のリフレッシュ日時を取得
  const getLastRefreshDate = (itemId: string): Date | null => {
    const records = refreshHistory.filter((r) => r.clothing_id === itemId);
    if (records.length === 0) return null;
    return new Date(Math.max(...records.map((r) => new Date(r.refreshed_at).getTime())));
  };

  // リフレッシュ後の着用回数を計算
  const getWearsSinceRefresh = (itemId: string): number => {
    const lastRefresh = getLastRefreshDate(itemId);
    if (!lastRefresh) {
      // 一度もリフレッシュしていない → 全着用回数
      return wearHistory.filter((h) => h.clothing_id === itemId).length;
    }
    const refreshDate = lastRefresh.toISOString().split('T')[0];
    return wearHistory.filter(
      (h) => h.clothing_id === itemId && h.date > refreshDate
    ).length;
  };

  // フレッシュネスレベルを判定
  const getFreshnessLevel = (itemId: string, category: CategoryId): FreshnessLevel => {
    const threshold = FRESHNESS_THRESHOLDS[category];
    if (threshold === null || threshold === undefined) return 'hidden';

    const wearsSinceRefresh = getWearsSinceRefresh(itemId);
    if (wearsSinceRefresh < threshold.moderate) return 'fresh';
    if (wearsSinceRefresh < threshold.stale) return 'moderate';
    return 'stale';
  };

  // リフレッシュ待ちアイテム数を取得（吹き出し用）
  const getStaleItemCount = (): number => {
    return clothes.filter((item) => {
      const level = getFreshnessLevel(item.id, item.category);
      return level === 'stale';
    }).length;
  };

  // ====================================
  // ユーティリティ
  // ====================================
  const getLastWornDate = (itemId: string): Date | null => {
    const records = wearHistory.filter((h) => h.clothing_id === itemId);
    if (records.length === 0) return null;
    return new Date(Math.max(...records.map((r) => new Date(r.date).getTime())));
  };

  const getDaysAgo = (date: Date | null): number => {
    if (!date) return Infinity;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diff = now.getTime() - target.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getWearCount = (itemId: string): number => {
    return wearHistory.filter((h) => h.clothing_id === itemId).length;
  };

  const isWornToday = (itemId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return wearHistory.some((h) => h.clothing_id === itemId && h.date === today);
  };

  const getCategoryInfo = (categoryId: CategoryId): Category => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[7]; // 'other'
  };

  const getItemHistory = (itemId: string): WearRecord[] => {
    return wearHistory
      .filter((h) => h.clothing_id === itemId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // 服の情報を更新
  const updateItem = async (
    id: string,
    updates: {
      name?: string;
      category?: CategoryId;
      color?: string | null;
      notes?: string | null;
      acquired_date?: string | null;
      price?: number | null;
    }
  ): Promise<boolean> => {
    if (!user) return false;
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('clothes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);
      if (updateError) throw updateError;
      setClothes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );
      return true;
    } catch (err) {
      console.error('Error updating item:', err);
      setError('服の更新に失敗しました');
      return false;
    }
  };

  // 指定期間内の着用回数を取得
  const getWearCountInRange = (itemId: string, startDate?: string, endDate?: string): number => {
    return wearHistory.filter((h) => {
      if (h.clothing_id !== itemId) return false;
      if (startDate && h.date < startDate) return false;
      if (endDate && h.date > endDate) return false;
      return true;
    }).length;
  };

  // 連続記録日数（現在のストリーク）を計算
  const getCurrentStreak = (): number => {
    if (wearHistory.length === 0) return 0;

    // ユニークな日付を取得してソート
    const uniqueDates = Array.from(new Set(wearHistory.map((h) => h.date))).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    if (uniqueDates.length === 0) return 0;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // 今日か昨日から始まっていない場合はストリークなし
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
      return 0;
    }

    let streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // ストリークからレベルを計算（1日ごとに+1レベル）
  const getLevel = (): number => {
    const streak = getCurrentStreak();
    // 連続記録日数 = レベル（最低1）
    return Math.max(1, streak);
  };

  return {
    clothes,
    wearHistory,
    refreshHistory,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    wearToday,
    wearOnDate,
    removeWearRecord,
    refreshItem,
    getLastRefreshDate,
    getWearsSinceRefresh,
    getFreshnessLevel,
    getStaleItemCount,
    getLastWornDate,
    getDaysAgo,
    getWearCount,
    getWearCountInRange,
    isWornToday,
    getCategoryInfo,
    getItemHistory,
    getCurrentStreak,
    getLevel,
    refetch: fetchData,
  };
}
