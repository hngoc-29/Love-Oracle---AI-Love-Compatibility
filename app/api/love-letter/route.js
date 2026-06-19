import { NextResponse } from 'next/server';
import { generateLoveLetter } from '@/lib/love-letter-generator';

export async function POST(request) {
  try {
    const { personA, personB, analysis, tone = 'tho-mong' } = await request.json();
    if (!personA?.name || !personB?.name || !analysis)
      return NextResponse.json({ error: 'Thiếu dữ liệu.' }, { status: 400 });

    // Try AI if keys available
    if (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY) {
      try {
        const toneDesc = tone === 'hai-huoc'   ? 'hài hước và duyên dáng'
                       : tone === 'nghiem-tuc' ? 'chân thành và nghiêm túc'
                       : 'lãng mạn và thơ mộng';

        const zA = analysis.zodiac?.personA;
        const zB = analysis.zodiac?.personB;
        const zodiacContext = zA && zB
          ? `${personA.name} mang cung ${zA.sign.name} (${zA.sign.element}), Can ${zA.stem.name} Chi ${zA.branch.name} (năm ${zA.branch.animal}); ${personB.name} mang cung ${zB.sign.name} (${zB.sign.element}), Can ${zB.stem.name} Chi ${zB.branch.name} (năm ${zB.branch.animal}).`
          : '';

        // NOTE: Không đề cập điểm số trong thư tình
        const prompt = `Hãy viết một bức thư tình ngắn (khoảng 200-250 từ) bằng tiếng Việt, từ ${personA.name} gửi cho ${personB.name}.
Tone: ${toneDesc}.
Thông tin: nguyên tố tình yêu ${analysis.element.label}, màu tình yêu ${analysis.loveColor.name}. ${zodiacContext}
Quy tắc: TUYỆT ĐỐI không đề cập điểm số hay phần trăm. Đề cập cung hoàng đạo một cách tự nhiên. Viết chân thực, không sáo rỗng. Ký tên là ${personA.name} ở cuối.`;

        const url = process.env.GROQ_API_KEY
          ? 'https://api.groq.com/openai/v1/chat/completions'
          : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

        const headers = process.env.GROQ_API_KEY
          ? { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
          : { 'Content-Type': 'application/json', 'X-goog-api-key': process.env.GEMINI_API_KEY || '' };

        const body = process.env.GROQ_API_KEY
          ? JSON.stringify({ model: 'llama-3.1-8b-instant', max_tokens: 500, messages: [{ role: 'user', content: prompt }] })
          : JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] });

        const controller = new AbortController();
        setTimeout(() => controller.abort(), 15000);
        const res = await fetch(url, { method: 'POST', headers, body, signal: controller.signal });

        if (res.ok) {
          const data = await res.json();
          let text = '';
          if (process.env.GROQ_API_KEY) {
            text = data.choices[0]?.message?.content?.trim();
          } else if (data.candidates?.[0]) {
            const c = data.candidates[0];
            if (Array.isArray(c.content)) text = c.content.map(p => p.text || '').join('').trim();
            else if (c.output) text = (c.output || '').trim();
          }
          if (text?.length > 50) return NextResponse.json({ letter: text });
        } else {
          console.warn('[LoveLetter] AI fetch failed', res.status);
        }
      } catch (e) { console.warn('[LoveLetter] AI error:', e.message); }
    }

    // Template fallback
    const letter = generateLoveLetter(personA, personB, analysis, tone);
    return NextResponse.json({ letter });
  } catch (err) {
    return NextResponse.json({ error: 'Lỗi sinh thư tình.' }, { status: 500 });
  }
}
