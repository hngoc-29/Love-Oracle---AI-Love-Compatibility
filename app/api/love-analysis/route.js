import { NextResponse } from 'next/server';
import { analyzeCompatibility } from '@/lib/love-engine';
import { generateProphecy } from '@/lib/ai-writer';
import { generateAdvice } from '@/lib/love-advice';
import { createLoveCacheKey } from '@/lib/hash';
import { kvGetJson, kvSetJson } from '@/lib/cloudflare-kv';

const rateLimits = new Map();
const RATE_LIMIT = 15;
const RATE_WINDOW = 60_000;
const CACHE_TTL = 60 * 60 * 24; // 1 ngày

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

const DAYS_IN_MONTH = [0,31,29,31,30,31,30,31,31,30,31,30,31];
const CUR_YEAR = new Date().getFullYear();

function validatePerson(p, label) {
  if (!p?.name?.trim()) return `Tên của ${label} cũng không biết mà đòi yêu người ta 😤`;
  if (!p.day) return `Ngày sinh của ${label} cũng không biết mà đòi yêu người ta 😤`;
  if (!p.month) return `Tháng sinh của ${label} cũng không biết mà đòi yêu người ta 😤`;
  if (!p.year) return `Năm sinh của ${label} cũng không biết mà đòi yêu người ta 😤`;
  if (p.month < 1 || p.month > 12) return `Tháng sinh của ${label} không hợp lệ.`;
  if (p.year < 1900 || p.year > CUR_YEAR) return `Năm sinh của ${label} không hợp lệ.`;
  if (p.day < 1 || p.day > DAYS_IN_MONTH[p.month]) return `Ngày sinh của ${label} không hợp lệ.`;
  return null;
}

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

    const { personA, personB, tone = 'tho-mong', rerun = false, salt = 0 } =
      await request.json();

    const errA = validatePerson(personA, 'người thứ nhất');
    if (errA) return NextResponse.json({ error: errA }, { status: 400 });

    const errB = validatePerson(personB, 'người thứ hai');
    if (errB) return NextResponse.json({ error: errB }, { status: 400 });

    const cacheKey = createLoveCacheKey(personA, personB, tone);

    if (!rerun) {
      const cached = await kvGetJson(cacheKey);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }

    const analysis = analyzeCompatibility(personA, personB, salt);

    const [prophecy, advice] = await Promise.all([
      generateProphecy(personA, personB, analysis, tone),
      Promise.resolve(generateAdvice(personA, personB, analysis, tone)),
    ]);

    const result = { personA, personB, analysis, prophecy, advice, tone, cached: false };

    await kvSetJson(cacheKey, result, CACHE_TTL, { cached: false });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Route]', err);
    return NextResponse.json(
      { error: 'Tiên Tri gặp phải sự xáo trộn bất ngờ. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}