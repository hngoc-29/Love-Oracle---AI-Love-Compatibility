import { generateLocalTarotReading } from './tarot-local-reading.js';

async function fetchWithTimeout(url, opts, ms = 20000) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...opts, signal: c.signal }); } finally { clearTimeout(t); }
}

function getSystemPrompt(tone, mode = 'tarot') {
  const td = {
    'hai-huoc':   'Vui tươi, hài hước, duyên dáng. Dùng so sánh bất ngờ, tự nhiên.',
    'nghiem-tuc': 'Chân thành, sâu sắc, ít ẩn dụ bay bổng, tập trung lời khuyên thực tế.',
    'tho-mong':   'Thơ mộng, huyền bí, đầy hình ảnh ẩn dụ.',
  }[tone] ?? 'Thơ mộng, huyền bí.';

  if (mode === 'yesno') {
    return `Bạn là Tiên Tri Tarot, nói bằng tiếng Việt. ${td}
Quy tắc: 80-150 từ, văn xuôi ngắn gọn, giải thích tại sao lá bài dẫn đến kết quả Có/Không/Có thể, không dùng markdown/tiêu đề/gạch đầu dòng, không tiết lộ là AI.`;
  }

  if (mode === 'combined') {
    return `Bạn là Tiên Tri, kết hợp cả Tarot và chiêm tinh phương Đông, nói bằng tiếng Việt. ${td}
Quy tắc: 300-450 từ, văn xuôi liền mạch, PHẢI nhắc cả lá bài lẫn thông tin chiêm tinh (cung, ngũ hành, số chủ đạo), không dùng markdown/tiêu đề/gạch đầu dòng/dấu **, không tiết lộ là AI, kết thúc bằng một gợi ý hành động.`;
  }

  return `Bạn là Tiên Tri Tarot, nói bằng tiếng Việt. ${td}
Quy tắc: 250-400 từ, văn xuôi liền mạch không dùng tiêu đề/gạch đầu dòng/in đậm/markdown (chỉ viết chữ thường, không dấu **), PHẢI nhắc tên từng lá bài và vị trí của nó trong cách diễn giải, không khẳng định chắc chắn tương lai, không tiết lộ là AI, kết thúc bằng một gợi ý hành động nhẹ nhàng — không phải lời tiên đoán cố định.`;
}

function buildPrompt(spread, draws, question, astrologyCtx = null) {
  const cardLines = draws.map(({ position, card, reversed }) =>
    `${position.label}: ${card.nameVn} (${card.nameEn})${reversed ? ' — NGƯỢC' : ' — XUÔI'}\n  Nghĩa: ${reversed ? card.reversed : card.upright}\n  Từ khoá: ${card.keywords.join(', ')}`
  ).join('\n\n');

  const astroSection = astrologyCtx
    ? `\nThông tin chiêm tinh:\n${astrologyCtx}\n`
    : '';

  return `Kiểu trải bài: ${spread.name}
${question ? `Câu hỏi: "${question}"\n` : ''}${astroSection}
Các lá đã rút:\n${cardLines}

Hãy viết lời giải${astrologyCtx ? ' kết hợp tarot và chiêm tinh' : ' bài tarot'}, liên kết các lá theo đúng vị trí${question ? ' và hướng về câu hỏi đã nêu' : ''}.`;
}

async function tryGroq(spread, draws, question, tone, mode, astrologyCtx) {
  if (!process.env.GROQ_API_KEY) throw new Error('no key');
  const r = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant', max_tokens: mode === 'yesno' ? 250 : 700, temperature: 0.9,
      messages: [
        { role: 'system', content: getSystemPrompt(tone, mode) },
        { role: 'user',   content: buildPrompt(spread, draws, question, astrologyCtx) },
      ],
    }),
  }, 15000);
  if (!r.ok) throw new Error(`Groq ${r.status}`);
  const d = await r.json();
  return d.choices[0]?.message?.content?.trim() ?? '';
}

async function tryGemini(spread, draws, question, tone, mode, astrologyCtx) {
  if (!process.env.GEMINI_API_KEY) throw new Error('no key');
  const prompt = `${getSystemPrompt(tone, mode)}\n\n${buildPrompt(spread, draws, question, astrologyCtx)}`;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  const r = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-goog-api-key': process.env.GEMINI_API_KEY || '' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  }, 25000);
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const d = await r.json();
  if (d.candidates?.[0]) {
    const c = d.candidates[0];
    if (c.output) return c.output.trim();
    if (Array.isArray(c.content)) return c.content.map(p => p.text || '').join('').trim();
  }
  return '';
}

export async function generateTarotReading(spread, draws, question, tone = 'tho-mong', { mode = 'tarot', astrologyCtx = null } = {}) {
  if (process.env.GROQ_API_KEY) {
    try {
      const t = await tryGroq(spread, draws, question, tone, mode, astrologyCtx);
      if (t.length > 80) { console.log('[Tarot AI] Groq ✓'); return t; }
    } catch (e) { console.warn('[Tarot AI] Groq:', e.message); }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const t = await tryGemini(spread, draws, question, tone, mode, astrologyCtx);
      if (t.length > 80) { console.log('[Tarot AI] Gemini ✓'); return t; }
    } catch (e) { console.warn('[Tarot AI] Gemini:', e.message); }
  }
  console.log('[Tarot AI] Local ✓');
  return generateLocalTarotReading(spread, draws, question);
}
