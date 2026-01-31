-- ============================================
-- My Closet - Supabase Schema Setup
-- ============================================

-- 1. clothes テーブル
CREATE TABLE clothes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. wear_history テーブル
CREATE TABLE wear_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clothing_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, clothing_id, date) -- 同じ日に同じ服の重複記録を防止
);

-- 3. インデックス
CREATE INDEX idx_clothes_user_id ON clothes(user_id);
CREATE INDEX idx_wear_history_user_id ON wear_history(user_id);
CREATE INDEX idx_wear_history_clothing_id ON wear_history(clothing_id);
CREATE INDEX idx_wear_history_date ON wear_history(date);

-- 4. RLS (Row Level Security) を有効化
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wear_history ENABLE ROW LEVEL SECURITY;

-- 5. RLS ポリシー - clothes
CREATE POLICY "Users can view own clothes"
  ON clothes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clothes"
  ON clothes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clothes"
  ON clothes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clothes"
  ON clothes FOR DELETE
  USING (auth.uid() = user_id);

-- 6. RLS ポリシー - wear_history
CREATE POLICY "Users can view own wear history"
  ON wear_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wear history"
  ON wear_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wear history"
  ON wear_history FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Storage Bucket Setup (Supabase Dashboard で実行)
-- ============================================
-- 1. "clothing-images" という名前のバケットを作成
-- 2. Public bucket として設定
-- 3. 以下のポリシーを設定:

-- Storage Policy: ユーザーは自分のフォルダにのみアップロード可能
-- バケット設定 > Policies で追加:

-- INSERT policy (アップロード許可):
-- Policy name: "Users can upload to own folder"
-- Allowed operation: INSERT
-- Policy definition:
--   (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1])

-- SELECT policy (読み取り許可 - 公開):
-- Policy name: "Public read access"
-- Allowed operation: SELECT
-- Policy definition:
--   bucket_id = 'clothing-images'

-- DELETE policy (削除許可):
-- Policy name: "Users can delete own images"
-- Allowed operation: DELETE
-- Policy definition:
--   (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1])
