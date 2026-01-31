# My Closet アプリ - セットアップガイド（初学者向け）

このガイドでは、クローゼット管理アプリを一から公開するまでの手順を説明します。

---

## 全体の流れ

```
Step 1: Supabase（データベース）の準備    ← 約15分
Step 2: ローカルで動作確認                ← 約5分
Step 3: GitHubにアップロード              ← 約5分
Step 4: Vercelでデプロイ（公開）          ← 約5分
```

所要時間: 約30分

※ メール＋パスワード認証はSupabaseに内蔵されているので、Google Cloud Consoleの設定は不要です！

---

## Step 1: Supabase（データベース）の準備

Supabaseは、データベースとファイル保存を無料で提供してくれるサービスです。

### 1-1. Supabaseアカウント作成

1. https://supabase.com にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインアップ（または新規登録）

### 1-2. プロジェクト作成

1. 「New project」をクリック
2. 以下を入力:
   - **Name**: `closet-app`（好きな名前でOK）
   - **Database Password**: 強いパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
3. 「Create new project」をクリック
4. 2分ほど待つ（プロジェクトが作成される）

### 1-3. APIキーをメモ

1. 左メニューの「Project Settings」（歯車アイコン）をクリック
2. 「General」をクリック
3. **Project ID** をメモ → URLは `https://[Project ID].supabase.co` になります
4. 左メニューの「API Keys」をクリック
5. **Publishable key**（`sb_publishable_...`で始まる）をコピー

```
📝 メモ例:
SUPABASE_URL=https://eliaufoemibwbfnqjulw.supabase.co
SUPABASE_ANON_KEY=sb_publishable_SS4UWSHFIVuQFhUUJDNzdQ_0zx5X...
```

### 1-4. データベーステーブル作成

1. 左メニューの「SQL Editor」をクリック
2. 「New query」をクリック
3. 以下のSQLをコピー＆ペースト:

```sql
-- clothesテーブル（服のデータ）
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

-- wear_historyテーブル（着用履歴）
CREATE TABLE wear_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clothing_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, clothing_id, date)
);

-- インデックス（検索を高速化）
CREATE INDEX idx_clothes_user_id ON clothes(user_id);
CREATE INDEX idx_wear_history_user_id ON wear_history(user_id);
CREATE INDEX idx_wear_history_clothing_id ON wear_history(clothing_id);

-- RLS（セキュリティ）を有効化
ALTER TABLE clothes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wear_history ENABLE ROW LEVEL SECURITY;

-- clothesテーブルのポリシー
CREATE POLICY "Users can view own clothes" ON clothes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own clothes" ON clothes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own clothes" ON clothes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own clothes" ON clothes FOR DELETE USING (auth.uid() = user_id);

-- wear_historyテーブルのポリシー
CREATE POLICY "Users can view own history" ON wear_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON wear_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON wear_history FOR DELETE USING (auth.uid() = user_id);
```

4. 「Run」ボタン（または Ctrl+Enter）をクリック
5. 「Success」と表示されればOK

### 1-5. Storageバケット作成（画像保存用）

1. 左メニューの「Storage」をクリック
2. 「New bucket」をクリック
3. 以下を入力:
   - **Name**: `clothing-images`
   - **Public bucket**: ✅ ONにする（重要！）
4. 「Create bucket」をクリック

### 1-6. Storageポリシー設定

1. 作成した「clothing-images」バケットをクリック
2. 上部の「Policies」タブをクリック
3. 「New policy」をクリック

**ポリシー1: アップロード許可**
1. 「Create policy from scratch」を選択
2. 以下を入力:
   - **Policy name**: `Users can upload to own folder`
   - **Allowed operation**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**:
   ```sql
   (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
3. 「Save policy」をクリック

**ポリシー2: 読み取り許可**
1. 「New policy」→「Create policy from scratch」
2. 以下を入力:
   - **Policy name**: `Public read access`
   - **Allowed operation**: `SELECT`
   - **Target roles**: `anon`, `authenticated`（両方選択）
   - **Policy definition**:
   ```sql
   bucket_id = 'clothing-images'
   ```
3. 「Save policy」をクリック

**ポリシー3: 削除許可**
1. 「New policy」→「Create policy from scratch」
2. 以下を入力:
   - **Policy name**: `Users can delete own images`
   - **Allowed operation**: `DELETE`
   - **Target roles**: `authenticated`
   - **Policy definition**:
   ```sql
   (bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1])
   ```
3. 「Save policy」をクリック

### 1-7. メール認証の確認（任意）

デフォルトで有効になっていますが、確認する場合：

1. 左メニューの「Authentication」→「Providers」
2. 「Email」をクリック
3. 「Enable Email provider」がONになっていることを確認

⚠️ **注意**: Supabaseの無料プランでは、メール送信は**1時間に6通まで**の制限があります。開発中は問題ありませんが、本格運用時は別途メールサービス（Resendなど）の設定が必要です。

---

## Step 2: ローカルで動作確認

### 2-1. プロジェクトを展開

1. ダウンロードした `closet-app.zip` を展開
2. ターミナル（コマンドプロンプト）で展開したフォルダに移動:
   ```bash
   cd closet-app
   ```

### 2-2. 環境変数ファイル作成

1. `.env.local.example` をコピーして `.env.local` を作成:
   ```bash
   cp .env.local.example .env.local
   ```
   （Windowsの場合: `copy .env.local.example .env.local`）

2. `.env.local` をテキストエディタで開き、メモした値を入力:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://あなたのProjectID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...（長い文字列）
   ```

### 2-3. 依存パッケージをインストール

```bash
npm install
```

### 2-4. 開発サーバーを起動

```bash
npm run dev
```

### 2-5. ブラウrm -rf .nextザで確認

1. ブラウザで http://localhost:3000 を開く
2. ログイン画面が表示されればOK！
3. 「新規登録」でアカウントを作成してテスト
   - 確認メールが届くので、リンクをクリックして認証完了

---

## Step 3: GitHubにアップロード

### 3-1. GitHubリポジトリ作成

1. https://github.com にアクセス
2. 右上の「＋」→「New repository」
3. 以下を入力:
   - **Repository name**: `closet-app`
   - **Public** または **Private** を選択
4. 「Create repository」をクリック

### 3-2. コードをアップロード

ターミナルで以下を実行:

```bash
# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# コミット
git commit -m "Initial commit"

# メインブランチを設定
git branch -M main

# GitHubリポジトリを追加（URLは自分のものに置き換え）
git remote add origin https://github.com/あなたのユーザー名/closet-app.git

# アップロード
git push -u origin main
```

---

## Step 4: Vercelでデプロイ（公開）

### 4-1. Vercelアカウント作成

1. https://vercel.com にアクセス
2. 「Sign Up」→「Continue with GitHub」
3. GitHubアカウントでログイン

### 4-2. プロジェクトをインポート

1. Vercelダッシュボードで「Add New...」→「Project」
2. 「Import Git Repository」から `closet-app` を選択
3. 「Import」をクリック

### 4-3. 環境変数を設定

「Environment Variables」セクションで以下を追加:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` |

※ `.env.local` に書いた値と同じものを入力

### 4-4. デプロイ

1. 「Deploy」をクリック
2. 1〜2分待つ
3. デプロイ完了！表示されるURLをメモ
   - 例: `https://closet-app-xxxxx.vercel.app`

### 4-5. Supabaseにリダイレクト先を追加

1. Supabaseダッシュボードに戻る
2. 左メニュー「Authentication」→「URL Configuration」
3. 「Redirect URLs」に以下を追加:
   - `https://closet-app-xxxxx.vercel.app/**`（デプロイしたURL）
4. 「Save」をクリック

---

## 🎉 完成！

デプロイしたURLにアクセスして、新規登録・ログインできれば成功です！

### 動作確認チェックリスト

- [ ] ログイン画面が表示される
- [ ] 新規登録ができる
- [ ] 確認メールが届く
- [ ] ログインできる
- [ ] 服を登録できる
- [ ] 写真をアップロードできる
- [ ] 「今日着る」ボタンが動作する
- [ ] 着用履歴が表示される
- [ ] ログアウトできる

---

## トラブルシューティング

### 新規登録しても確認メールが届かない

→ 迷惑メールフォルダを確認してください。また、Supabaseの無料プランは1時間に6通までの制限があります。

### ログインしても画面が変わらない

→ ブラウザのキャッシュをクリアして、再度試してください。

### 「Invalid login credentials」エラーが出る

→ メールアドレスまたはパスワードが間違っています。新規登録した場合は、確認メールのリンクをクリックしたか確認してください。

### 画像がアップロードできない

→ Supabaseの「Storage」でバケット名が `clothing-images` か確認。また、「Public bucket」がONになっているか確認。

### データが保存されない

→ Supabaseの「Table Editor」でテーブルが作成されているか確認。clothesテーブルとwear_historyテーブルが存在するか確認。

---

## サポート

困ったことがあれば、以下を確認してください:

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Next.js公式ドキュメント](https://nextjs.org/docs)
- [Vercel公式ドキュメント](https://vercel.com/docs)
