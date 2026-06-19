'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import ScoreCircle from './ScoreCircle';
import { getZodiacCompatLabel } from '@/lib/zodiac';
import { encodeShareState } from '@/lib/share-codec';
import { crossCopy } from '@/lib/clipboard';

// ─── UI atoms ────────────────────────────────────────────────────────────────
function Tag({ children, color='violet' }) {
  const s={ violet:'bg-violet-900/50 text-violet-200 border-violet-500/30', pink:'bg-pink-900/40 text-pink-200 border-pink-500/30' };
  return <span className={`inline-block text-xs px-2.5 py-1 rounded-full border ${s[color]} font-medium`}>{children}</span>;
}
function Section({ title, emoji, children, delay=0 }) {
  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay,duration:0.5}}
      className="rounded-2xl border border-violet-500/20 bg-violet-950/40 backdrop-blur-sm p-5">
      <h3 className="flex items-center gap-2 text-violet-300 font-semibold text-sm mb-3 uppercase tracking-wider">
        <span>{emoji}</span>{title}
      </h3>
      {children}
    </motion.div>
  );
}

// ─── Typewriter — isolated leaf component ──────────────────────────────────
// Trước đây state "displayed" nằm ở component cha ResultCard, nên mỗi lần
// gõ thêm vài ký tự (~60 lần/giây) lại re-render TOÀN BỘ cây kết quả (mọi
// Section, ZodiacSection, các nút...) — đây là nguyên nhân chính gây giật/lag
// khi xem kết quả. Tách riêng ra component lá này để chỉ chính nó re-render.
function ProphecyTypewriter({ text, cached, speed = 3 }) {
  const [displayed, setDisplayed] = useState(cached ? text : '');
  const [done, setDone] = useState(!!cached);
  const raf = useRef(null); const idx = useRef(0); const last = useRef(0);

  useEffect(() => {
    if (cached) { setDisplayed(text); setDone(true); return; }
    if (!text) return;
    idx.current = 0; last.current = 0; setDisplayed(''); setDone(false);
    function step(ts) {
      if (ts - last.current >= speed) {
        idx.current += 5; setDisplayed(text.slice(0, idx.current)); last.current = ts;
        if (idx.current >= text.length) { setDone(true); return; }
      }
      raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [text, speed, cached]);

  const paragraphs = displayed.split(/\n\n+/).filter(Boolean);

  return (
    <>
      <div className="space-y-3">{paragraphs.map((p,i)=>(<p key={i} className="text-violet-100 text-sm leading-relaxed">{p}</p>))}</div>
      {!done&&<motion.span animate={{opacity:[1,0]}} transition={{duration:0.6,repeat:Infinity}}
        className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle"/>}
    </>
  );
}

// ─── Cross-browser copy — extracted to lib/clipboard.js (also used by TarotApp) ──

// ─── Letter cache helpers ─────────────────────────────────────────────────────
function letterKey(personA, personB, tone, v) {
  return `love_letter_${personA.name}_${personB.name}_${tone}_v${v}`.replace(/\s+/g,'_');
}
function loadCachedLetter(k) {
  try { const d=JSON.parse(localStorage.getItem(k)||'null'); return d?.letter??null; } catch{return null;}
}
function cacheLetter(k, letter) {
  try { localStorage.setItem(k, JSON.stringify({letter,ts:Date.now()})); } catch{}
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARE CARD — 3 TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════
function rrect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

// Template 0: Vũ Trụ (Cosmic Dark)
function drawVuTru(canvas, {personA,personB,analysis}) {
  const ctx=canvas.getContext('2d'); const W=1080,H=1080; canvas.width=W;canvas.height=H;
  const accent=analysis.loveColor?.hex??'#E8476A';
  const g=ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0,'#070214');g.addColorStop(0.5,'#0e092b');g.addColorStop(1,'#080618');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Stars
  for(let i=0;i<80;i++){
    const x=Math.random()*W,y=Math.random()*H,r=Math.random()*2+0.5;
    ctx.globalAlpha=Math.random()*0.7+0.2;ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
  // Hexagon
  const hx=W/2,hy=H/2,hR=480;
  ctx.strokeStyle=accent+'33';ctx.lineWidth=1.5;ctx.beginPath();
  for(let i=0;i<6;i++){const a=(i*60-90)*Math.PI/180;
    i===0?ctx.moveTo(hx+hR*Math.cos(a),hy+hR*Math.sin(a)):ctx.lineTo(hx+hR*Math.cos(a),hy+hR*Math.sin(a));}
  ctx.closePath();ctx.stroke();
  // Glows
  let rg=ctx.createRadialGradient(0,0,0,0,0,420);rg.addColorStop(0,accent+'22');rg.addColorStop(1,'transparent');
  ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  rg=ctx.createRadialGradient(W,H,0,W,H,380);rg.addColorStop(0,'rgba(139,92,246,0.15)');rg.addColorStop(1,'transparent');
  ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  // Badge
  ctx.textAlign='center';
  ctx.fillStyle=accent+'1a';rrect(ctx,W/2-160,58,320,52,26);ctx.fill();
  ctx.strokeStyle=accent+'44';ctx.lineWidth=1;rrect(ctx,W/2-160,58,320,52,26);ctx.stroke();
  ctx.fillStyle='#e9d5ff';ctx.font='500 20px sans-serif';ctx.fillText('✨  TIÊN TRI TÌNH YÊU  ✨',W/2,90);
  // Names
  const ng=ctx.createLinearGradient(W/2-270,0,W/2+270,0);
  ng.addColorStop(0,'#f0e6ff');ng.addColorStop(0.45,'#f9a8d4');ng.addColorStop(1,'#c4b5fd');
  ctx.fillStyle=ng;ctx.font='bold 68px sans-serif';ctx.fillText(`${personA.name}  &  ${personB.name}`,W/2,224);
  // Zodiac line
  const z=analysis.zodiac;
  if(z){
    ctx.fillStyle='rgba(196,181,253,0.55)';ctx.font='26px sans-serif';
    ctx.fillText(`${z.personA.sign.symbol} ${z.personA.sign.name}   ✦   ${z.personB.sign.symbol} ${z.personB.sign.name}`,W/2,264);
    ctx.fillText(`${z.personA.branch.emoji} ${z.personA.stem.name}${z.personA.branch.name}   •   ${z.personB.branch.emoji} ${z.personB.stem.name}${z.personB.branch.name}`,W/2,302);
  }
  // Score heart
  const hcx=W/2,hcy=460,hcR=220;
  ctx.fillStyle=accent+'18';ctx.strokeStyle=accent+'2a';ctx.lineWidth=24;
  ctx.beginPath();
  ctx.moveTo(hcx,hcy+hcR*0.46);
  ctx.bezierCurveTo(hcx+hcR*0.9,hcy-hcR*0.18,hcx+hcR*0.35,hcy-hcR*0.84,hcx,hcy-hcR*0.18);
  ctx.bezierCurveTo(hcx-hcR*0.35,hcy-hcR*0.84,hcx-hcR*0.9,hcy-hcR*0.18,hcx,hcy+hcR*0.46);
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#f9a8d4';ctx.font='bold 110px sans-serif';ctx.fillText(`${analysis.score}`,hcx,hcy+20);
  ctx.fillStyle='rgba(233,213,255,0.5)';ctx.font='24px sans-serif';ctx.fillText('% tương hợp',hcx,hcy+68);
  // Level badge
  ctx.fillStyle='rgba(139,92,246,0.18)';rrect(ctx,W/2-190,574,380,56,28);ctx.fill();
  ctx.strokeStyle='rgba(167,139,250,0.4)';ctx.lineWidth=1;rrect(ctx,W/2-190,574,380,56,28);ctx.stroke();
  ctx.fillStyle='#e9d5ff';ctx.font='bold 30px sans-serif';ctx.fillText(`${analysis.level.emoji}  ${analysis.level.label}`,W/2,611);
  // Divider
  ctx.strokeStyle='rgba(167,139,250,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(80,658);ctx.lineTo(W-80,658);ctx.stroke();
  ctx.beginPath();ctx.moveTo(W/2,668);ctx.lineTo(W/2,880);ctx.stroke();
  // Stats
  const stats=[
    {x:270,y:718,l:'Ngũ Hành',v:analysis.breakdown?.nguHanh?.label?.split('—')[0].replace(/[^\w\sÀ-ỹĐđ]/gu,'').trim()??''},
    {x:270,y:826,l:'Con Giáp', v:analysis.breakdown?.chi?.label?.split('—')[0].replace(/[^\w\sÀ-ỹĐđ]/gu,'').trim()??''},
    {x:810,y:718,l:'Màu Tình Yêu',v:analysis.loveColor?.name??''},
    {x:810,y:826,l:'Con Số May Mắn',v:`✦  ${analysis.luckyNumber}  ✦`},
  ];
  stats.forEach(s=>{
    ctx.fillStyle='rgba(167,139,250,0.55)';ctx.font='20px sans-serif';ctx.fillText(s.l,s.x,s.y);
    ctx.fillStyle='#e9d5ff';ctx.font='bold 26px sans-serif';ctx.fillText(s.v,s.x,s.y+36);
  });
  // Numerology
  if(z){
    ctx.fillStyle='rgba(233,213,255,0.35)';ctx.font='19px sans-serif';
    ctx.fillText(`Số Đường Đời: ${personA.name} = ${z.personA.lifePath}  ·  ${personB.name} = ${z.personB.lifePath}`,W/2,900);
  }
  // Footer dots
  ctx.fillStyle=accent;[-60,-30,0,30,60].forEach(dx=>{ctx.beginPath();ctx.arc(W/2+dx,952,4,0,Math.PI*2);ctx.fill();});
  ctx.fillStyle='rgba(167,139,250,0.25)';ctx.font='18px sans-serif';
  ctx.fillText('🔮 Chỉ để giải trí — số phận là do bạn viết',W/2,H-20);
}

// Template 1: Tử Vi (Eastern / Gold)
function drawTuVi(canvas, {personA,personB,analysis}) {
  const ctx=canvas.getContext('2d'); const W=1080,H=1080; canvas.width=W;canvas.height=H;
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#1a0808');g.addColorStop(0.5,'#1f0e0e');g.addColorStop(1,'#150606');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Grid
  ctx.strokeStyle='rgba(218,165,32,0.06)';ctx.lineWidth=1;
  for(let x=0;x<W;x+=54){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=54){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  // Big Chinese chars background
  const z=analysis.zodiac;
  if(z){
    ctx.globalAlpha=0.07;ctx.fillStyle='#daa520';ctx.font='bold 220px sans-serif';
    ctx.textAlign='center';
    ctx.fillText(z.personA.stem.char,W/4,480);
    ctx.fillText(z.personB.stem.char,3*W/4,480);
  }
  ctx.globalAlpha=1;ctx.textAlign='center';
  // Dragon outline circle
  ctx.strokeStyle='rgba(218,165,32,0.25)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(W/2,H/2,460,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(W/2,H/2,380,0,Math.PI*2);ctx.stroke();
  // Header
  ctx.fillStyle='rgba(218,165,32,0.9)';ctx.font='bold 26px sans-serif';
  ctx.fillText('紫 微 — TỬ VI TÌNH DUYÊN — 紫 微',W/2,72);
  ctx.strokeStyle='rgba(218,165,32,0.35)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(80,88);ctx.lineTo(W-80,88);ctx.stroke();
  // Names
  const grad=ctx.createLinearGradient(W/2-250,0,W/2+250,0);
  grad.addColorStop(0,'#ffd700');grad.addColorStop(0.5,'#ffe566');grad.addColorStop(1,'#ffd700');
  ctx.fillStyle=grad;ctx.font='bold 64px sans-serif';
  ctx.fillText(`${personA.name}  ✦  ${personB.name}`,W/2,200);
  // Can Chi cards — each person
  const drawPersonCard=(px,name,zp)=>{
    ctx.fillStyle='rgba(218,165,32,0.08)';rrect(ctx,px-170,230,340,220,16);ctx.fill();
    ctx.strokeStyle='rgba(218,165,32,0.3)';ctx.lineWidth=1;rrect(ctx,px-170,230,340,220,16);ctx.stroke();
    ctx.fillStyle='rgba(218,165,32,0.7)';ctx.font='18px sans-serif';ctx.fillText(name,px,258);
    // Big char
    ctx.fillStyle='#ffd700';ctx.font='bold 64px sans-serif';ctx.fillText(zp.stem.char+zp.branch.char,px,340);
    ctx.fillStyle='rgba(255,215,0,0.8)';ctx.font='20px sans-serif';
    ctx.fillText(`${zp.stem.name}${zp.branch.name} — ${zp.branch.animal} ${zp.branch.emoji}`,px,376);
    ctx.fillStyle='rgba(255,215,0,0.5)';ctx.font='17px sans-serif';ctx.fillText(`Ngũ Hành: ${zp.nguHanh.name} ${zp.nguHanh.emoji}`,px,406);
    ctx.fillText(`${zp.sign.symbol} ${zp.sign.name}`,px,432);
  };
  if(z){drawPersonCard(W/4,personA.name,z.personA);drawPersonCard(3*W/4,personB.name,z.personB);}
  // Score circle
  ctx.strokeStyle='rgba(218,165,32,0.5)';ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(W/2,520,130,0,Math.PI*2);ctx.stroke();
  const sc=ctx.createRadialGradient(W/2,520,0,W/2,520,130);
  sc.addColorStop(0,'rgba(218,165,32,0.25)');sc.addColorStop(1,'rgba(139,0,0,0.1)');
  ctx.fillStyle=sc;ctx.beginPath();ctx.arc(W/2,520,130,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffd700';ctx.font='bold 90px sans-serif';ctx.fillText(`${analysis.score}`,W/2,540);
  ctx.fillStyle='rgba(255,215,0,0.55)';ctx.font='20px sans-serif';ctx.fillText('%  tương hợp',W/2,574);
  // Level
  ctx.fillStyle='rgba(218,165,32,0.15)';rrect(ctx,W/2-200,668,400,52,26);ctx.fill();
  ctx.strokeStyle='rgba(218,165,32,0.4)';ctx.lineWidth=1;rrect(ctx,W/2-200,668,400,52,26);ctx.stroke();
  ctx.fillStyle='#ffd700';ctx.font='bold 28px sans-serif';ctx.fillText(`${analysis.level.emoji}  ${analysis.level.label}`,W/2,703);
  // Ngũ Hành relation
  ctx.strokeStyle='rgba(218,165,32,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(80,730);ctx.lineTo(W-80,730);ctx.stroke();
  if(analysis.breakdown?.nguHanh){
    ctx.fillStyle='rgba(218,165,32,0.6)';ctx.font='22px sans-serif';ctx.fillText('Ngũ Hành:',W/2,770);
    ctx.fillStyle='#ffe566';ctx.font='bold 26px sans-serif';ctx.fillText(analysis.breakdown.nguHanh.label,W/2,806);
  }
  if(analysis.breakdown?.chi){
    ctx.fillStyle='rgba(218,165,32,0.6)';ctx.font='22px sans-serif';ctx.fillText('Con Giáp:',W/2,850);
    ctx.fillStyle='#ffe566';ctx.font='bold 26px sans-serif';ctx.fillText(analysis.breakdown.chi.label,W/2,886);
  }
  if(z){
    ctx.fillStyle='rgba(218,165,32,0.4)';ctx.font='20px sans-serif';
    ctx.fillText(`Số Đường Đời: ${z.personA.lifePath} & ${z.personB.lifePath}  •  Số Vận Mệnh: ${z.personA.destinyNum} & ${z.personB.destinyNum}`,W/2,936);
  }
  ctx.fillStyle='rgba(218,165,32,0.2)';ctx.font='17px sans-serif';ctx.fillText('Chiêm Tinh · Thần Số · Tử Vi — Chỉ để giải trí',W/2,H-18);
}

// Template 2: Hoa Lệ (Elegant Light)
function drawHoaLe(canvas, {personA,personB,analysis}) {
  const ctx=canvas.getContext('2d'); const W=1080,H=1080; canvas.width=W;canvas.height=H;
  const g=ctx.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#1a0b2e');g.addColorStop(0.4,'#2d1154');g.addColorStop(1,'#1a082a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Watercolor circles
  const circles=[
    {x:200,y:200,r:300,c:'rgba(236,72,153,0.1)'},{x:W-200,y:200,r:280,c:'rgba(139,92,246,0.12)'},
    {x:W/2,y:H/2,r:420,c:'rgba(167,139,250,0.07)'},{x:200,y:H-180,r:260,c:'rgba(244,114,182,0.1)'},
    {x:W-200,y:H-200,r:290,c:'rgba(109,40,217,0.1)'},
  ];
  circles.forEach(c=>{
    const rg=ctx.createRadialGradient(c.x,c.y,0,c.x,c.y,c.r);
    rg.addColorStop(0,c.c);rg.addColorStop(1,'transparent');
    ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);
  });
  // Petal dots
  ctx.fillStyle='rgba(255,255,255,0.15)';
  for(let i=0;i<6;i++){const a=i*60*Math.PI/180,r=440;ctx.beginPath();ctx.arc(W/2+r*Math.cos(a),H/2+r*Math.sin(a),4,0,Math.PI*2);ctx.fill();}
  // Thin elegant border
  ctx.strokeStyle='rgba(233,213,255,0.12)';ctx.lineWidth=1;
  rrect(ctx,40,40,W-80,H-80,32);ctx.stroke();
  rrect(ctx,55,55,W-110,H-110,28);ctx.stroke();
  ctx.textAlign='center';
  // Logo
  ctx.fillStyle='rgba(233,213,255,0.4)';ctx.font='italic 22px sans-serif';
  ctx.fillText('✦  Tiên Tri Tình Yêu  ✦',W/2,95);
  // Thin rule
  ctx.strokeStyle='rgba(233,213,255,0.15)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2-180,112);ctx.lineTo(W/2+180,112);ctx.stroke();
  // Names
  const ng=ctx.createLinearGradient(W/2-220,0,W/2+220,0);
  ng.addColorStop(0,'#f9a8d4');ng.addColorStop(0.5,'#e9d5ff');ng.addColorStop(1,'#c4b5fd');
  ctx.fillStyle=ng;ctx.font='300 72px sans-serif';ctx.fillText(`${personA.name}`,W/2,210);
  ctx.fillStyle='rgba(233,213,255,0.35)';ctx.font='italic 36px sans-serif';ctx.fillText('&',W/2,260);
  ctx.fillStyle=ng;ctx.font='300 72px sans-serif';ctx.fillText(`${personB.name}`,W/2,326);
  // Zodiac elegant line
  const z=analysis.zodiac;
  if(z){
    ctx.fillStyle='rgba(196,181,253,0.5)';ctx.font='italic 22px sans-serif';
    ctx.fillText(`${z.personA.sign.symbol} ${z.personA.sign.name}  ·  ${z.personB.sign.symbol} ${z.personB.sign.name}`,W/2,368);
    ctx.fillText(`Can ${z.personA.stem.name} ${z.personA.stem.emoji}  ·  Can ${z.personB.stem.name} ${z.personB.stem.emoji}`,W/2,400);
  }
  // Score elegant display
  ctx.strokeStyle='rgba(233,213,255,0.18)';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(W/2,560,160,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(W/2,560,148,0,Math.PI*2);ctx.stroke();
  const sr=ctx.createRadialGradient(W/2,560,0,W/2,560,148);
  sr.addColorStop(0,'rgba(109,40,217,0.35)');sr.addColorStop(1,'rgba(109,40,217,0.05)');
  ctx.fillStyle=sr;ctx.beginPath();ctx.arc(W/2,560,148,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f9a8d4';ctx.font='300 96px sans-serif';ctx.fillText(`${analysis.score}`,W/2,585);
  ctx.fillStyle='rgba(233,213,255,0.45)';ctx.font='italic 22px sans-serif';ctx.fillText('% tương hợp',W/2,628);
  // Level
  ctx.fillStyle='#e9d5ff';ctx.font='italic bold 30px sans-serif';ctx.fillText(`${analysis.level.emoji}  ${analysis.level.label}`,W/2,694);
  // Thin rule
  ctx.strokeStyle='rgba(233,213,255,0.1)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2-200,716);ctx.lineTo(W/2+200,716);ctx.stroke();
  // Key insights
  const lines=[
    analysis.breakdown?.nguHanh?.label?.split('—')[0].trim()??'',
    analysis.breakdown?.chi?.label?.split('—')[0].trim()??'',
    analysis.breakdown?.aspect?.name?`Cung: ${analysis.breakdown.aspect.name}`:'',
    z?`Số ĐĐ: ${z.personA.lifePath} & ${z.personB.lifePath}`:'',
  ].filter(Boolean);
  lines.forEach((l,i)=>{
    ctx.fillStyle=`rgba(196,181,253,${0.6-i*0.08})`;ctx.font='italic 22px sans-serif';
    ctx.fillText(l,W/2,752+i*38);
  });
  // Colour blob
  const hex=analysis.loveColor?.hex??'#E8476A';
  ctx.fillStyle=hex+'30';ctx.beginPath();ctx.arc(W/2,940,28,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=hex;ctx.beginPath();ctx.arc(W/2,940,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(233,213,255,0.4)';ctx.font='italic 19px sans-serif';
  ctx.fillText(`Màu tình yêu: ${analysis.loveColor?.name??''}  ·  Con số may mắn: ${analysis.luckyNumber}`,W/2,998);
  ctx.fillStyle='rgba(167,139,250,0.2)';ctx.font='italic 17px sans-serif';
  ctx.fillText('Chỉ để giải trí · Số phận là do bạn viết',W/2,H-22);
}

const TEMPLATES = [
  { id:0, name:'Vũ Trụ',  emoji:'🌌', draw:drawVuTru  },
  { id:1, name:'Tử Vi',   emoji:'☯️', draw:drawTuVi   },
  { id:2, name:'Hoa Lệ',  emoji:'🌸', draw:drawHoaLe  },
];

// ─── Love Letter Modal with cache + regenerate ─────────────────────────────
function LoveLetterModal({ open, onClose, personA, personB, analysis, tone, showToast }) {
  const [letter,  setLetter]  = useState('');
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState(0);
  const [fromCache, setFromCache] = useState(false);

  useEffect(()=>{
    if(!open) return;
    setLoading(true); setFromCache(false);
    const k = letterKey(personA, personB, tone, version);
    const cached = loadCachedLetter(k);
    if(cached){ setLetter(cached); setLoading(false); setFromCache(true); return; }

    fetch('/api/love-letter',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({personA,personB,analysis,tone}),
    }).then(r=>r.json()).then(d=>{
      const t=d.letter??'';
      setLetter(t); setLoading(false);
      if(t) cacheLetter(k,t);
    }).catch(()=>setLoading(false));
  },[open,version]);

  function handleRegenerate() { setVersion(v=>v+1); }

  async function handleCopy(){
    const ok=await crossCopy(letter);
    showToast(ok?'✅ Đã sao chép thư!':'❌ Không thể sao chép');
  }

  return (
    <AnimatePresence>
    {open&&(
      <>
        <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>
        <motion.div className="fixed inset-x-3 top-6 bottom-6 z-50 max-w-lg mx-auto flex flex-col
          bg-[#0d0720] border border-violet-600/40 rounded-3xl shadow-2xl overflow-hidden"
          initial={{opacity:0,scale:0.92,y:30}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.92,y:30}}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-violet-700/30">
            <div>
              <h3 className="text-violet-100 font-semibold">💌 Thư Tình</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-violet-400 text-xs">Từ {personA.name} gửi {personB.name}</p>
                {fromCache && <span className="text-violet-600 text-xs">· đã lưu</span>}
                {version>0 && <span className="text-violet-500 text-xs">· bản #{version+1}</span>}
              </div>
            </div>
            <button onClick={onClose} className="text-violet-400 hover:text-violet-200 transition-colors p-2 text-lg">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex items-center justify-center h-full text-violet-400 gap-3">
                <motion.span animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:'linear'}} className="text-2xl">🔮</motion.span>
                Đang viết thư...
              </div>
            ) : (
              <pre className="text-violet-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">{letter}</pre>
            )}
          </div>
          {!loading&&letter&&(
            <div className="p-4 border-t border-violet-700/30 space-y-2">
              <button onClick={handleRegenerate}
                className="w-full py-3 rounded-xl text-sm font-medium bg-violet-900/50 border border-violet-500/40
                  text-violet-200 hover:bg-violet-800/60 transition-colors active:scale-95 flex items-center justify-center gap-2">
                🔄 Viết lại (bản mới)
              </button>
              <div className="grid grid-cols-2 gap-2">
                {typeof navigator!=='undefined'&&navigator.share?(
                  <button onClick={()=>navigator.share({title:`Thư tình từ ${personA.name}`,text:letter}).catch(()=>{})}
                    className="py-2.5 rounded-xl text-sm font-medium bg-violet-800/40 border border-violet-500/30
                      text-violet-200 hover:bg-violet-700/50 transition-colors active:scale-95">
                    📤 Chia sẻ
                  </button>
                ):<div/>}
                <button onClick={handleCopy}
                  className="py-2.5 rounded-xl text-sm font-medium border border-violet-500/40
                    text-violet-300 hover:bg-violet-900/40 transition-colors active:scale-95">
                  📋 Sao chép
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </>
    )}
    </AnimatePresence>
  );
}

// ─── Share Image Picker ───────────────────────────────────────────────────────
function ShareImagePicker({ data, open, onClose, showToast }) {
  const [selected, setSelected] = useState(0);
  const [previews, setPreviews] = useState({});

  // Vẽ canvas đã chọn TRƯỚC (người dùng thấy ngay), rồi mới vẽ 2 mẫu còn lại
  // cách nhau một khung hình — tránh đứng hình do vẽ cả 3 canvas 1080x1080
  // (mỗi cái có gradient + ~70 sao + text wrap) liền một lúc trên luồng chính.
  useEffect(()=>{
    if(!open) return;
    setPreviews({});
    let cancelled = false;
    const order = [selected, ...TEMPLATES.map(t=>t.id).filter(id=>id!==selected)];

    function renderOne(i) {
      if (cancelled || i >= order.length) return;
      const id = order[i];
      const tmpl = TEMPLATES.find(t=>t.id===id);
      const c = document.createElement('canvas');
      tmpl.draw(c, data);
      const url = c.toDataURL('image/png', 0.85);
      if (cancelled) return;
      setPreviews(prev => ({ ...prev, [id]: url }));
      requestAnimationFrame(() => renderOne(i + 1));
    }
    renderOne(0);
    return () => { cancelled = true; };
  },[open]);

  function handleDownload(){
    const tmpl=TEMPLATES[selected];
    const canvas=document.createElement('canvas');
    tmpl.draw(canvas,data);
    canvas.toBlob(blob=>{
      const safe=`${data.personA.name}-${data.personB.name}`.replace(/\s+/g,'_');
      const a=document.createElement('a');
      a.href=URL.createObjectURL(blob);
      a.download=`${safe}-${tmpl.name}.png`;
      a.click();
      showToast?.('✅ Đã tải ảnh!');
    },'image/png');
  }

  return (
    <AnimatePresence>
    {open&&(
      <>
        <motion.div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose}/>
        <motion.div className="fixed inset-x-3 top-8 bottom-8 z-50 max-w-lg mx-auto flex flex-col
          bg-[#0d0720] border border-violet-600/40 rounded-3xl shadow-2xl overflow-hidden"
          initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-violet-700/30">
            <h3 className="text-violet-100 font-semibold">🖼️ Chọn Mẫu Ảnh</h3>
            <button onClick={onClose} className="text-violet-400 hover:text-violet-200 transition-colors p-2 text-lg">✕</button>
          </div>
          {/* Template picker */}
          <div className="flex gap-2 px-4 pt-4">
            {TEMPLATES.map(t=>(
              <button key={t.id} onClick={()=>setSelected(t.id)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all active:scale-95
                  ${selected===t.id
                    ?'bg-violet-700/60 border-violet-400/60 text-violet-100'
                    :'bg-violet-900/30 border-violet-700/30 text-violet-400 hover:border-violet-500/50'}`}>
                {t.emoji} {t.name}
              </button>
            ))}
          </div>
          {/* Preview */}
          <div className="flex-1 overflow-y-auto p-4">
            {previews[selected]
              ? <img src={previews[selected]} alt="Preview" className="w-full rounded-xl border border-violet-700/30"/>
              : <div className="aspect-square rounded-xl bg-violet-900/30 border border-violet-700/30 flex items-center justify-center">
                  <motion.span animate={{rotate:360}} transition={{duration:1.5,repeat:Infinity,ease:'linear'}} className="text-3xl">🔮</motion.span>
                </div>
            }
          </div>
          <div className="p-4 border-t border-violet-700/30">
            <button onClick={handleDownload}
              className="w-full py-3.5 rounded-2xl text-base font-semibold text-white active:scale-95 transition-all
                flex items-center justify-center gap-2"
              style={{background:'linear-gradient(135deg,#be185d,#ec4899,#f472b6)'}}>
              ⬇️ Tải xuống
            </button>
          </div>
        </motion.div>
      </>
    )}
    </AnimatePresence>
  );
}

// ─── Zodiac Section ───────────────────────────────────────────────────────────
// Tách ra ngoài render — trước đây khai báo bên trong ZodiacSection nên mỗi
// lần component cha re-render lại tạo ra một "PersonBox" hoàn toàn mới,
// gây re-render/reconcile lãng phí (ESLint react-hooks/static-components).
function PersonBox({ person, zp, side }) {
  return (
    <div className="rounded-xl p-3 border border-violet-700/30 bg-violet-900/20 space-y-2">
      <p className={`font-semibold text-sm ${side==='a'?'text-pink-300':'text-violet-300'}`}>{person.name}</p>
      {/* Western */}
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none">{zp.sign.symbol}</span>
        <div><p className="text-violet-100 text-sm font-medium leading-tight">{zp.sign.name}</p>
          <p className="text-violet-500 text-xs">{zp.sign.ruling}</p></div>
      </div>
      {/* Can Chi */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-violet-500">Can Chi</span>
        <span className="text-violet-200 font-semibold">{zp.stem.name}{zp.branch.name}</span>
        <span className="text-lg">{zp.branch.emoji}</span>
      </div>
      {/* Ngũ Hành */}
      <div className="flex items-center gap-1.5">
        <span className="text-base">{zp.nguHanh.emoji}</span>
        <span className="text-violet-200 text-xs font-medium">Ngũ Hành {zp.nguHanh.name}</span>
        <span className={`text-xs ${zp.stem.polarity==='dương'?'text-amber-400':'text-sky-400'}`}>({zp.stem.polarity})</span>
      </div>
      {/* Life path */}
      <div className="flex items-center gap-1.5">
        <span className="text-violet-500 text-xs">Số ĐĐ</span>
        <span className="text-violet-100 font-bold text-base">{zp.lifePath}</span>
        {[11,22,33].includes(zp.lifePath)&&<span className="text-yellow-400 text-xs">✦ Thần Số</span>}
      </div>
      <p className="text-violet-500 text-xs leading-snug">{zp.lifePathMeaning}</p>
    </div>
  );
}

function ZodiacSection({ personA, personB, analysis, delay }) {
  const z=analysis.zodiac; const bd=analysis.breakdown;
  if(!z) return null;
  const {label,emoji}=getZodiacCompatLabel(bd?.zodiacElem??bd?.zodiacElemScore??60);

  return (
    <Section title="Chiêm Tinh & Tử Vi" emoji="⭐" delay={delay}>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <PersonBox person={personA} zp={z.personA} side="a"/>
        <PersonBox person={personB} zp={z.personB} side="b"/>
      </div>
      {/* Compatibility breakdown */}
      <div className="space-y-2">
        {[
          bd?.nguHanh && { icon:'🌿', label:'Ngũ Hành', val:bd.nguHanh.label, score:bd.nguHanh.score },
          bd?.chi     && { icon:'🐉', label:'Con Giáp',  val:bd.chi.label,     score:bd.chi.score },
          bd?.can     && { icon:'☯️',  label:'Thiên Can', val:bd.can.label,     score:bd.can.score },
          bd?.aspect  && { icon:'✦',   label:'Cung Sao',  val:`${bd.aspect.name} — ${bd.aspect.meaning}`, score:bd.aspect.score },
        ].filter(Boolean).map((row,i)=>(
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-violet-900/25 border border-violet-700/25">
            <span className="text-base mt-0.5 shrink-0">{row.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-violet-400 text-xs font-semibold uppercase tracking-wide">{row.label}</span>
                <span className={`text-xs font-bold ${row.score>=75?'text-green-400':row.score>=60?'text-amber-400':'text-red-400'}`}>{row.score}</span>
              </div>
              <p className="text-violet-200 text-xs leading-snug">{row.val}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 p-3 rounded-xl bg-violet-900/30 border border-violet-700/30 text-center">
        <p className="text-violet-400 text-xs uppercase tracking-wider mb-1">Cung hoàng đạo Tây phương</p>
        <p className="text-violet-100 text-sm font-semibold">
          {z.personA.sign.name} {z.personA.sign.symbol} + {z.personB.sign.name} {z.personB.sign.symbol}
        </p>
        <p className="text-violet-300 text-sm mt-0.5">{emoji} {label}</p>
      </div>
    </Section>
  );
}

// ─── Main ResultCard ──────────────────────────────────────────────────────────
export default function ResultCard({ data, onReset, onRerun }) {
  const { personA, personB, analysis, prophecy, advice, tone='tho-mong' } = data;
  const [showLetter,     setShowLetter]     = useState(false);
  const [showImgPicker,  setShowImgPicker]  = useState(false);
  const [toast, setToast] = useState('');
  const showToast = useCallback((msg)=>{ setToast(msg); setTimeout(()=>setToast(''),2500); },[]);

  async function copyWithToast(text, msg='✅ Đã sao chép!') {
    const ok=await crossCopy(text); showToast(ok?msg:'❌ Không thể sao chép');
  }
  function handleShareLink() {
    try {
      const payload = encodeShareState({
        a:{name:personA.name,day:personA.day,month:personA.month,year:personA.year},
        b:{name:personB.name,day:personB.day,month:personB.month,year:personB.year},t:tone,
      });
      copyWithToast(`${window.location.origin}/boi?s=${payload}`,'✅ Đã sao chép link!');
    }catch{ showToast('❌ Không thể tạo link'); }
  }
  function handleShareText() {
    const txt=`✨ Tiên Tri Tình Yêu: ${personA.name} & ${personB.name} — ${analysis.score}% tương hợp ${analysis.level.emoji}\n${window.location.origin}/boi`;
    if(navigator.share) navigator.share({title:'Tiên Tri Tình Yêu',text:txt}).catch(()=>{});
    else copyWithToast(txt);
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.6}}
      className="w-full max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} className="text-center py-4">
        <p className="text-violet-400 text-sm uppercase tracking-widest mb-1">Tiên Tri Đã Lên Tiếng</p>
        <h2 className="text-2xl font-bold text-white">{personA.name} <span className="text-pink-400">&</span> {personB.name}</h2>
        {analysis.zodiac&&<p className="text-violet-500 text-xs mt-1">
          {analysis.zodiac.personA.sign.symbol} {analysis.zodiac.personA.sign.name}
          &nbsp;✦&nbsp;
          {analysis.zodiac.personB.sign.symbol} {analysis.zodiac.personB.sign.name}
          &nbsp;·&nbsp;Can {analysis.zodiac.personA.stem.name} & Can {analysis.zodiac.personB.stem.name}
        </p>}
      </motion.div>

      {/* Score */}
      <Section title="Mức Độ Tương Hợp" emoji="💫" delay={0.1}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreCircle score={analysis.score} level={analysis.level}/>
          <div className="flex-1 grid grid-cols-2 gap-3 w-full">
            {[
              {l:'Màu Tình Yêu', content:<div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full border border-white/20 shrink-0" style={{background:analysis.loveColor.hex}}/><span className="text-violet-100 text-sm font-medium">{analysis.loveColor.name}</span></div>, sub:analysis.loveColor.meaning},
              {l:'Con Số May Mắn', content:<span className="text-3xl font-bold text-pink-300">{analysis.luckyNumber}</span>},
              {l:'Nguyên Tố', content:<span className="text-lg">{analysis.element.emoji} {analysis.element.label}</span>, sub:analysis.element.desc},
              {l:'Biểu Tượng', content:<><span className="text-2xl">{analysis.destinySymbol.symbol}</span><span className="text-violet-200 text-xs">{analysis.destinySymbol.name}</span></>},
            ].map((c,i)=>(
              <div key={i} className="flex flex-col gap-1.5 p-3 rounded-xl bg-violet-900/30">
                <span className="text-violet-400 text-xs uppercase tracking-wide">{c.l}</span>
                {c.content}
                {c.sub&&<span className="text-violet-400 text-xs">{c.sub}</span>}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <ZodiacSection personA={personA} personB={personB} analysis={analysis} delay={0.15}/>

      {/* Personalities */}
      <Section title="Năng Lượng Cá Nhân" emoji="✨" delay={0.2}>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-pink-300 font-medium text-sm mb-2">{personA.name}</p>
            <div className="flex flex-wrap gap-1.5">{analysis.traits.personA.map(t=><Tag key={t} color="pink">{t}</Tag>)}</div></div>
          <div><p className="text-violet-300 font-medium text-sm mb-2">{personB.name}</p>
            <div className="flex flex-wrap gap-1.5">{analysis.traits.personB.map(t=><Tag key={t}>{t}</Tag>)}</div></div>
        </div>
      </Section>

      {/* Insights */}
      <Section title="Thấu Hiểu Mối Quan Hệ" emoji="🔮" delay={0.3}>
        <div className="space-y-3 text-sm">
          {[['💪 Điểm Mạnh',analysis.strength],['🌊 Giao Tiếp',analysis.communicationStyle],
            ['💞 Cảm Xúc',analysis.emotionalConnection],['🌱 Thử Thách',analysis.conflict],
            ['🌟 Tiềm Năng',analysis.futurePotential]].map(([l,v])=>(
            <div key={l} className="flex gap-3">
              <span className="text-violet-400 text-xs font-semibold whitespace-nowrap pt-0.5 w-32 shrink-0">{l}</span>
              <span className="text-violet-200 text-xs leading-relaxed">{v}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Date ideas */}
      <Section title="Cuộc Phiêu Lưu Cùng Nhau" emoji="🌹" delay={0.35}>
        <ul className="space-y-2">{analysis.dateIdeas.map((d,i)=>(
          <li key={i} className="flex items-start gap-2 text-sm text-violet-200">
            <span className="text-pink-400 mt-0.5">✦</span><span>{d}</span>
          </li>
        ))}</ul>
      </Section>

      {advice?.length>0&&(
        <Section title="Lời Khuyên Tình Yêu" emoji="💡" delay={0.38}>
          <ul className="space-y-3">{advice.map((a,i)=>(
            <li key={i} className="flex items-start gap-3 text-sm text-violet-200">
              <span className="text-violet-400 shrink-0 font-bold">{i+1}.</span>
              <span className="leading-relaxed">{a}</span>
            </li>
          ))}</ul>
        </Section>
      )}

      {/* Prophecy */}
      <Section title="Lời Tiên Tri" emoji="🌙" delay={0.4}>
        <ProphecyTypewriter text={prophecy} cached={!!data?.cached} />
        <div className="mt-4 pt-4 border-t border-violet-700/30">
          <span className="text-violet-500 text-xs italic">🔮 Chỉ để giải trí — số phận của bạn là do chính bạn viết</span>
        </div>
      </Section>

      {/* Action buttons */}
      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6}}
        className="grid grid-cols-2 gap-2 pb-2">
        {[
          {icon:'🔗',label:'Chia sẻ',  fn:handleShareText,  cls:'border-violet-500/40 text-violet-300 hover:bg-violet-900/40'},
          {icon:'📎',label:'Copy link', fn:handleShareLink,  cls:'border-violet-500/40 text-violet-300 hover:bg-violet-900/40'},
          {icon:'🖼️',label:'Lưu ảnh',  fn:()=>setShowImgPicker(true), cls:'border-pink-500/40 text-pink-300 hover:bg-pink-900/20'},
          {icon:'💌',label:'Thư tình', fn:()=>setShowLetter(true), cls:'border-rose-500/40 text-rose-300 hover:bg-rose-900/20'},
        ].map(b=>(
          <button key={b.label} onClick={b.fn}
            className={`py-3.5 rounded-xl text-sm font-medium border ${b.cls} active:scale-95 transition-all flex items-center justify-center gap-1.5`}>
            {b.icon} {b.label}
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-2 gap-3 pb-8">
        <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}
          onClick={onRerun} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
          className="py-4 rounded-2xl text-sm font-medium text-white" style={{background:'linear-gradient(135deg,#9d174d,#be185d)'}}>
          🔄 Xem Lại Cặp Này
        </motion.button>
        <motion.button initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.75}}
          onClick={onReset} whileHover={{scale:1.02}} whileTap={{scale:0.98}}
          className="py-4 rounded-2xl text-sm font-medium text-white" style={{background:'linear-gradient(135deg,#be185d,#ec4899)'}}>
          🔮 Xem Bói Mới
        </motion.button>
      </div>

      <LoveLetterModal open={showLetter} onClose={()=>setShowLetter(false)}
        personA={personA} personB={personB} analysis={analysis} tone={tone} showToast={showToast}/>
      <ShareImagePicker data={data} open={showImgPicker} onClose={()=>setShowImgPicker(false)} showToast={showToast}/>

      <AnimatePresence>
        {toast&&(
          <motion.div key="toast" initial={{opacity:0,y:16,x:'-50%'}} animate={{opacity:1,y:0,x:'-50%'}} exit={{opacity:0,y:8,x:'-50%'}}
            className="fixed bottom-6 left-1/2 z-[100] px-5 py-2.5 rounded-full text-sm font-medium
              bg-violet-900 border border-violet-500/50 text-violet-100 shadow-xl pointer-events-none whitespace-nowrap">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
