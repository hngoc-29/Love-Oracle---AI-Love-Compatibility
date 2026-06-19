import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { drawSpread, listSpreads, deriveYesNo } from '@/lib/tarot-engine';
import { generateTarotReading } from '@/lib/tarot-ai-writer';
import { kvGetJson, kvSetJson } from '@/lib/cloudflare-kv';
import { buildAstrologyContext, formatAstrologyForPrompt } from '@/lib/astrology-context';

const rateLimits = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60_000;
const SHARE_TTL  = 60 * 60 * 24 * 90; // 90 ngày

function checkRate(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

const VALID_SPREADS = new Set(listSpreads().map(s => s.id));

export async function POST(request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    if (!checkRate(ip)) {
      return NextResponse.json(
        { error: 'Tiên Tri cần nghỉ một chút — thử lại sau 1 phút nhé 🔮' },
        { status: 429 }
      );
    }

    const {
      spreadId = 'love3',
      question = '',
      tone = 'tho-mong',
      personDob = null,   // { name, day, month, year } — cho chế độ kết hợp chiêm tinh
    } = await request.json();

    if (!VALID_SPREADS.has(spreadId)) {
      return NextResponse.json({ error: 'Kiểu trải bài này chưa khả dụng.' }, { status: 400 });
    }
    if (question.length > 200) {
      return NextResponse.json({ error: 'Câu hỏi quá dài, hãy hỏi ngắn gọn hơn.' }, { status: 400 });
    }

    const { spread, draws } = drawSpread(spreadId);

    // Xác định mode để AI writer dùng đúng prompt
    const isYesNo   = spreadId === 'yesno';
    const isCombined = !!personDob && !isYesNo;
    const mode = isYesNo ? 'yesno' : isCombined ? 'combined' : 'tarot';

    // Tính verdict Có/Không trước khi gọi AI (không cần AI cho bước này)
    const yesNoVerdict = isYesNo ? deriveYesNo(draws[0].card, draws[0].reversed) : null;

    // Xây ngữ cảnh chiêm tinh nếu người dùng cung cấp ngày sinh
    let astrologyCtx = null;
    let astrologyData = null;
    if (isCombined) {
      try {
        astrologyData = buildAstrologyContext(personDob);
        astrologyCtx  = formatAstrologyForPrompt(astrologyData);
      } catch (_) {}
    }

    const reading = await generateTarotReading(
      spread, draws, question?.trim(), tone,
      { mode, astrologyCtx }
    );

    const result = {
      spread,
      draws: draws.map(d => ({ position: d.position, card: d.card, reversed: d.reversed })),
      question: question?.trim() || null,
      tone,
      mode,
      reading,
      yesNoVerdict,
      astrologyData,
      drawnAt: Date.now(),
    };

    let shareId = null;
    try {
      const id = nanoid(10);
      const ok = await kvSetJson(`tarot:${id}`, result, SHARE_TTL);
      if (ok) shareId = id;
    } catch (e) {
      console.error('[TarotRoute] KV save failed:', e.message);
    }

    return NextResponse.json({ ...result, shareId });
  } catch (err) {
    console.error('[TarotRoute]', err);
    return NextResponse.json(
      { error: 'Tiên Tri gặp phải sự xáo trộn bất ngờ. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id || !/^[A-Za-z0-9_-]{6,30}$/.test(id)) {
      return NextResponse.json({ error: 'ID không hợp lệ.' }, { status: 400 });
    }
    const result = await kvGetJson(`tarot:${id}`);
    if (!result) {
      return NextResponse.json({ error: 'Không tìm thấy kết quả này (có thể đã hết hạn).' }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('[TarotRoute GET]', err);
    return NextResponse.json({ error: 'Không thể tải kết quả.' }, { status: 500 });
  }
}
