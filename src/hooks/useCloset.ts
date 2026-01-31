'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { compressImage, generateFileName } from '@/lib/imageCompression';
import { ClothingItem, WearRecord, CategoryId, Category } from '@/types';
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

export function useCloset() {
  const { user } = useAuth();
  const [clothes, setClothes] = useState<ClothingItem[]>([]);
  const [wearHistory, setWearHistory] = useState<WearRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setClothes([]);
      setWearHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: clothesData, error: clothesError } = await supabase
        .from('clothes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (clothesError) throw clothesError;

      const { data: historyData, error: historyError } = await supabase
        .from('wear_history')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (historyError) throw historyError;

      setClothes((clothesData as ClothingItem[]) || []);
      setWearHistory((historyData as WearRecord[]) || []);
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

      if (error) {
        console.error('Error deleting image:', error);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  const addItem = async (
    item: {
      name: string;
      category: CategoryId;
      color: string;
      notes: string;
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

  const updateItem = async (
    id: string,
    updates: {
      name?: string;
      category?: CategoryId;
      color?: string | null;
      notes?: string | null;
    }
  ): Promise<ClothingItem | null> => {
    if (!user) return null;

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('clothes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const updatedItem = data as ClothingItem;
      setClothes((prev) =>
        prev.map((c) => (c.id === id ? updatedItem : c))
      );
      return updatedItem;
    } catch (err) {
      console.error('Error updating item:', err);
      setError('服の更新に失敗しました');
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

      await supabase
        .from('wear_history')
        .delete()
        .eq('clothing_id', id)
        .eq('user_id', user.id);

      setClothes((prev) => prev.filter((c) => c.id !== id));
      setWearHistory((prev) => prev.filter((h) => h.clothing_id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('服の削除に失敗しました');
      return false;
    }
  };

  const wearToday = async (clothingId: string): Promise<boolean> => {
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
        .insert({
          user_id: user.id,
          clothing_id: clothingId,
          date: date,
        })
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
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[6];
  };

  const getItemHistory = (itemId: string): WearRecord[] => {
    return wearHistory
      .filter((h) => h.clothing_id === itemId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return {
    clothes,
    wearHistory,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    wearToday,
    wearOnDate,
    removeWearRecord,
    getLastWornDate,
    getDaysAgo,
    getWearCount,
    isWornToday,
    getCategoryInfo,
    getItemHistory,
    refetch: fetchData,
  };
}