import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // 環境変数からパスワードを取得（サーバー側のみ）
    const secretCode = process.env.ACCESS_CODE || 'murasaki';

    if (code?.toLowerCase() === secretCode.toLowerCase()) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}
