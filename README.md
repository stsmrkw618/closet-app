# My Closet - クローゼット管理アプリ

服の着用履歴を管理して、眠っている服を発見するためのアプリ。

## 特徴

- 📸 **写真で服を登録** - 1MB以下に自動圧縮
- 👆 **ワンタップ着用記録** - 「今日着る」ボタンで簡単記録
- 📊 **着てない順ソート** - デフォルトで最近着てない服を上位表示
- 🔄 **複数デバイス同期** - Googleログインでどこからでもアクセス
- ☁️ **クラウド保存** - Supabaseで安全にデータ保管

## セットアップ手順

### 1. Supabase プロジェクト作成

1. [Supabase](https://supabase.com) にアクセス
2. 新規プロジェクトを作成
3. Project URL と anon key をメモ

### 2. データベーススキーマ設定

Supabase Dashboard > SQL Editor で `supabase-schema.sql` の内容を実行

### 3. Storage バケット設定

1. Supabase Dashboard > Storage
2. 「New bucket」をクリック
3. Name: `clothing-images`
4. **Public bucket: ON** にする
5. 作成後、Policies タブで以下を設定:

**INSERT policy:**
- Name: `Users can upload to own folder`
- Target roles: authenticated
- Policy:
```sql
(bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1])
```

**SELECT policy:**
- Name: `Public read access`
- Target roles: anon, authenticated
- Policy:
```sql
bucket_id = 'clothing-images'
```

**DELETE policy:**
- Name: `Users can delete own images`
- Target roles: authenticated
- Policy:
```sql
(bucket_id = 'clothing-images' AND auth.uid()::text = (storage.foldername(name))[1])
```

### 4. Google OAuth 設定

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクト作成
2. OAuth 同意画面を設定
3. 認証情報 > OAuth 2.0 クライアント ID を作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みリダイレクトURI: `https://<your-project>.supabase.co/auth/v1/callback`
4. Client ID と Client Secret をメモ
5. Supabase Dashboard > Authentication > Providers > Google
   - Client ID と Client Secret を設定
   - Enable Sign in with Google: ON

### 5. 環境変数設定

```bash
cp .env.local.example .env.local
```

`.env.local` を編集:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 6. ローカル開発

```bash
npm install
npm run dev
```

### 7. Vercel デプロイ

1. GitHubにプッシュ
2. Vercel でインポート
3. Environment Variables に以下を設定:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 8. Google OAuth リダイレクトURI追加

Vercelデプロイ後、Google Cloud Console で以下を追加:
- `https://your-app.vercel.app` を承認済みJavaScript生成元に追加

## 技術スタック

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database + Storage)
- browser-image-compression (画像圧縮)
- lucide-react (アイコン)

## 無料枠の範囲

| サービス | 無料枠 | 想定使用量 |
|---------|-------|----------|
| Vercel | 100GB帯域/月 | ✅ 余裕 |
| Supabase DB | 500MB | ✅ 服1000枚でも数MB |
| Supabase Storage | 1GB | ✅ 1枚1MBで1000枚OK |
| Supabase Auth | 50,000 MAU | ✅ 個人利用なら余裕 |

## ディレクトリ構成

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AddForm.tsx
│   ├── BottomNav.tsx
│   ├── ClothingCard.tsx
│   ├── ClosetView.tsx
│   ├── DetailView.tsx
│   ├── Header.tsx
│   ├── HistoryView.tsx
│   └── LoginScreen.tsx
├── hooks/
│   ├── useAuth.tsx
│   └── useCloset.ts
├── lib/
│   ├── imageCompression.ts
│   └── supabase.ts
└── types/
    ├── database.ts
    └── index.ts
```

## 今後の拡張案

- [ ] カレンダービュー（何日に何を着たかを視覚的に）
- [ ] コーディネート登録（トップス＋ボトムスのセット保存）
- [ ] 統計ダッシュボード（よく着る色、カテゴリ偏りなど）
- [ ] オフライン対応（PWA + IndexedDB）
