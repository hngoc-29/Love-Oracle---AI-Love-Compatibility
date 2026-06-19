import { generateProphecy as localGenerate } from './prophecy-generator.js';

async function fetchWithTimeout(url, opts, ms=20000) {
  const c=new AbortController(); const t=setTimeout(()=>c.abort(),ms);
  try{return await fetch(url,{...opts,signal:c.signal});}finally{clearTimeout(t);}
}

function getSystemPrompt(tone) {
  const td = {
    'hai-huoc':'Vui tươi, hài hước, duyên dáng. Dùng so sánh bất ngờ, tự nhiên.',
    'nghiem-tuc':'Chân thành, sâu sắc, ít ẩn dụ bay bổng.',
    'tho-mong':'Thơ mộng, huyền bí, đầy hình ảnh lãng mạn.',
  }[tone]??'Thơ mộng, huyền bí.';
  return `Bạn là Tiên Tri Tình Yêu, nói bằng tiếng Việt. ${td}
Quy tắc: 350-450 từ, văn xuôi không có tiêu đề/gạch đầu dòng, gọi tên hai người xuyên suốt, BẮT BUỘC đề cập thiên can (Can), địa chi (con giáp), ngũ hành và cung hoàng đạo của hai người một cách tự nhiên, không liệt kê khô khan.`;
}

function buildPrompt(personA, personB, analysis) {
  const z  = analysis.zodiac;
  const bd = analysis.breakdown;
  const zA = z?.personA, zB = z?.personB;

  const eastLines = zA && zB ? `
Tử Vi Phương Đông:
  ${personA.name}: Can ${zA.stem.name} (${zA.stem.meaning.split('—')[0].trim()}), Năm ${zA.branch.animal} ${zA.branch.emoji}, Ngũ Hành ${zA.nguHanh.name} ${zA.nguHanh.emoji}
  ${personB.name}: Can ${zB.stem.name} (${zB.stem.meaning.split('—')[0].trim()}), Năm ${zB.branch.animal} ${zB.branch.emoji}, Ngũ Hành ${zB.nguHanh.name} ${zB.nguHanh.emoji}
  Ngũ Hành: ${bd?.nguHanh?.label ?? ''}
  Con Giáp: ${bd?.chi?.label ?? ''}` : '';

  const westLines = zA && zB ? `
Chiêm Tinh Tây:
  ${personA.name}: ${zA.sign.name} ${zA.sign.symbol} (${zA.sign.element})
  ${personB.name}: ${zB.sign.name} ${zB.sign.symbol} (${zB.sign.element})
  Góc cung: ${bd?.aspect?.name ?? ''} — ${bd?.aspect?.meaning ?? ''}` : '';

  const numLines = zA && zB ? `
Thần Số Học:
  ${personA.name}: Số Đường Đời ${zA.lifePath} — ${zA.lifePathMeaning}
  ${personB.name}: Số Đường Đời ${zB.lifePath} — ${zB.lifePathMeaning}` : '';

  return `Tên: ${personA.name} & ${personB.name}
Tương hợp: ${analysis.score}/100 — ${analysis.level.label}
${eastLines}${westLines}${numLines}
Cá tính ${personA.name}: ${analysis.traits?.personA?.join(', ') ?? ''}
Cá tính ${personB.name}: ${analysis.traits?.personB?.join(', ') ?? ''}
Nguyên tố tình yêu: ${analysis.element?.label} — ${analysis.element?.desc}
Màu tình yêu: ${analysis.loveColor?.name} — ${analysis.loveColor?.meaning}
Biểu tượng: ${analysis.destinySymbol?.name} — ${analysis.destinySymbol?.meaning}
Điểm mạnh: ${analysis.strength}
Thử thách: ${analysis.conflict}

Hãy nói lời tiên tri.`;
}

async function tryGroq(pA,pB,an,tone){
  if(!process.env.GROQ_API_KEY) throw new Error('no key');
  const r=await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.GROQ_API_KEY}`},
    body:JSON.stringify({model:'llama-3.1-8b-instant',max_tokens:700,temperature:0.85,messages:[
      {role:'system',content:getSystemPrompt(tone)},{role:'user',content:buildPrompt(pA,pB,an)}
    ]}),
  },15000);
  if(!r.ok) throw new Error(`Groq ${r.status}`);
  const d=await r.json(); return d.choices[0]?.message?.content?.trim()??'';
}

async function tryGemini(pA,pB,an,tone){
  if(!process.env.GEMINI_API_KEY) throw new Error('no key');
  const prompt=`${getSystemPrompt(tone)}\n\n${buildPrompt(pA,pB,an)}`;
  const url='https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
  const r=await fetchWithTimeout(url,{
    method:'POST',headers:{'Content-Type':'application/json','X-goog-api-key':process.env.GEMINI_API_KEY||''},
    body:JSON.stringify({contents:[{parts:[{text:prompt}]}]}),
  },25000);
  if(!r.ok) throw new Error(`Gemini ${r.status}`);
  const d=await r.json();
  if(d.candidates?.[0]){const c=d.candidates[0];if(c.output)return c.output.trim();if(Array.isArray(c.content))return c.content.map(p=>p.text||'').join('').trim();}
  return '';
}

export async function generateProphecy(personA, personB, analysis, tone='tho-mong') {
  if(process.env.GROQ_API_KEY){
    try{const t=await tryGroq(personA,personB,analysis,tone);if(t.length>100){console.log('[AI] Groq ✓');return t;}}
    catch(e){console.warn('[AI] Groq:',e.message);}
  }
  if(process.env.GEMINI_API_KEY){
    try{const t=await tryGemini(personA,personB,analysis,tone);if(t.length>100){console.log('[AI] Gemini ✓');return t;}}
    catch(e){console.warn('[AI] Gemini:',e.message);}
  }
  console.log('[AI] Local ✓');
  return localGenerate(personA,personB,analysis,tone);
}
