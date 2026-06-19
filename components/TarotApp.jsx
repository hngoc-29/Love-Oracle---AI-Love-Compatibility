'use client';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import StarryBackground from './StarryBackground';
import TarotCard, { CardBack } from './TarotCard';
import TarotLibrary from './TarotLibrary';
import TarotHistoryPanel, { saveTarotHistory } from './TarotHistoryPanel';
import TarotStats from './TarotStats';
import TarotNoteModal from './TarotNoteModal';
import TarotQuiz from './TarotQuiz';
import { encodeShareState, decodeShareState } from '@/lib/share-codec';
import { crossCopy } from '@/lib/clipboard';
import { getCardById } from '@/lib/data/tarot-deck';
import { getSpread, YES_NO_LABELS } from '@/lib/tarot-engine';

const PHASES = { SPREAD: 'spread', QUESTION: 'question', SHUFFLE: 'shuffle', REVEAL: 'reveal' };

const SPREAD_CARDS = [
  { id: 'love3',    emoji: '💞', title: 'Trải Bài Tình Yêu',           desc: 'Bạn — Người Ấy — Mối Quan Hệ',     available: true },
  { id: 'single',   emoji: '🌟', title: 'Lá Bài Hôm Nay',              desc: 'Rút nhanh một lá cho ngày của bạn',  available: true },
  { id: 'classic3', emoji: '⏳', title: 'Quá Khứ · Hiện Tại · Tương Lai', desc: 'Trải bài kinh điển 3 lá',          available: true },
  { id: 'yesno',    emoji: '🎯', title: 'Có hay Không?',                desc: 'Câu trả lời nhanh cho một câu hỏi', available: true },
  { id: 'celtic10', emoji: '✦',  title: 'Celtic Cross',                 desc: 'Trải bài 10 lá — phân tích sâu',   available: true },
  { id: 'combined', emoji: '🔮', title: 'Tarot + Chiêm Tinh',           desc: 'Kết hợp lá bài với cung & vận mệnh', available: true, isCombined: true },
];

// Mã hoá/giải mã một kết quả rút bài thành query "?r=" — gồm cả phần lời giải
// (reading) đã sinh ra, để khi tải lại trang hoặc mở link chia sẻ, KHÔNG gọi
// lại AI và KHÔNG rút lại bài (giữ đúng nguyên bộ bài đã ra cho phiên đó).
//
// Ưu tiên dùng "shareId" ngắn (do server tạo bằng nanoid, lưu trong Cloudflare
// KV 90 ngày) để link gọn — vd /tarot?r=k3F9xQa2pL. Nếu KV chưa cấu hình
// (server trả shareId=null), mới rơi về nhúng toàn bộ kết quả vào URL như cũ
// (dài hơn nhưng không cần hạ tầng ngoài). Phân biệt 2 dạng bằng độ dài: ID
// ngắn luôn dưới 30 ký tự, trong khi bản nhúng đầy đủ luôn dài hơn nhiều.
const SHORT_ID_RE = /^[A-Za-z0-9_-]{6,30}$/;

function encodeReading(result) {
  return encodeShareState({
    s: result.spread.id,
    d: result.draws.map(dr => ({ c: dr.card.id, r: dr.reversed })),
    q: result.question || null,
    t: result.tone,
    x: result.reading,
  });
}
function decodeReadingInline(str) {
  const { s, d, q, t, x } = decodeShareState(str);
  const spread = getSpread(s);
  const draws = d.map((entry, i) => ({
    position: spread.positions[i],
    card: getCardById(entry.c),
    reversed: entry.r,
  }));
  if (draws.some(dr => !dr.card)) throw new Error('invalid card reference');
  return { spread, draws, question: q, tone: t, reading: x, drawnAt: Date.now() };
}
// Thử ID ngắn trước (gọi server); nếu không phải ID ngắn hợp lệ hoặc server
// không có (KV hết hạn / chưa cấu hình lúc tạo link), thử giải mã inline.
async function resolveSharedReading(r) {
  if (SHORT_ID_RE.test(r)) {
    const res = await fetch(`/api/tarot-reading?id=${encodeURIComponent(r)}`);
    if (res.ok) return await res.json();
    // rơi xuống thử decode inline phía dưới, đề phòng trường hợp hiếm ID ngắn
    // trùng định dạng nhưng thực ra là chuỗi mã hoá rất ngắn (gần như không xảy ra)
  }
  return decodeReadingInline(r);
}
function syncTarotUrl(result) {
  try {
    const r = result.shareId ?? encodeReading(result);
    window.history.replaceState({}, '', `${window.location.pathname}?r=${r}`);
  } catch {}
}
function clearTarotUrl() {
  try { window.history.replaceState({}, '', window.location.pathname); } catch {}
}

const TONES = [
  { id: 'tho-mong',   emoji: '💜', label: 'Thơ Mộng' },
  { id: 'hai-huoc',   emoji: '😄', label: 'Hài Hước' },
  { id: 'nghiem-tuc', emoji: '🎯', label: 'Nghiêm Túc' },
];

function useTarotTypewriter(text, speed = 3) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const raf = useRef(null); const idx = useRef(0); const last = useRef(0);
  useEffect(() => {
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
  }, [text, speed]);
  return { displayed, done };
}

// Tách riêng để state gõ-chữ không kéo theo re-render toàn bộ cây kết quả.
// Lọc bỏ ký tự markdown lạc (đề phòng AI lỡ dùng **dù đã yêu cầu không dùng).
function ReadingText({ text }) {
  const clean = (text ?? '').replace(/\*\*/g, '');
  const { displayed, done } = useTarotTypewriter(clean, 3);
  const paragraphs = displayed.split(/\n\n+/).filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((p, i) => <p key={i} className="text-indigo-100 text-sm leading-relaxed">{p}</p>)}
      {!done && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }}
        className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-middle" />}
    </div>
  );
}

function ShuffleAnimation() {
  const cards = [0, 1, 2, 3, 4, 5, 6];
  const mid = 3;
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-40 h-56">
        {cards.map(i => {
          const d = i - mid;
          const fanRotate = d * 11;
          const fanX = d * 23;
          const fanY = -Math.abs(d) * 7;
          return (
            <motion.div key={i} className="absolute inset-x-0 top-0 mx-auto w-28 h-48 rounded-xl overflow-hidden shadow-lg"
              style={{ zIndex: mid - Math.abs(d) }}
              animate={{
                rotate: [0, fanRotate, fanRotate, 0, 0],
                x: [0, fanX, fanX, 0, 0],
                y: [0, fanY, fanY, 0, 0],
              }}
              transition={{
                duration: 2.1, repeat: Infinity, delay: i * 0.045,
                times: [0, 0.28, 0.5, 0.74, 1], ease: 'easeInOut',
              }}>
              <CardBack className="w-full h-full" />
            </motion.div>
          );
        })}
      </div>
      <motion.p className="text-indigo-300 text-sm" animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.6, repeat: Infinity }}>
        Đang xáo bài và lắng nghe vũ trụ...
      </motion.p>
    </div>
  );
}

export default function TarotApp() {
  const [phase, setPhase]         = useState(PHASES.SPREAD);
  const [spreadId, setSpreadId]   = useState('love3');
  const [question, setQuestion]   = useState('');
  const [tone, setTone]           = useState('tho-mong');
  const [personDob, setPersonDob] = useState({ name: '', day: '', month: '', year: '' });
  const [result, setResult]       = useState(null);
  const [flipped, setFlipped]     = useState([false, false, false]);
  const [error, setError]         = useState('');
  const [toast, setToast]         = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [statsOpen,   setStatsOpen]   = useState(false);
  const [quizOpen,    setQuizOpen]    = useState(false);
  const [noteEntryId, setNoteEntryId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [focusOrigin, setFocusOrigin]   = useState({ x: 0, y: 0 });
  const closeTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  // ── Khôi phục từ link chia sẻ / phiên trước — KHÔNG rút lại bài, KHÔNG gọi AI ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('r');
    if (!r) return;
    (async () => {
      try {
        const decoded = await resolveSharedReading(r);
        setResult(decoded);
        setFlipped(decoded.draws.map(() => true));
        setSpreadId(decoded.spread.id);
        setPhase(PHASES.REVEAL);
      } catch (_) { clearTarotUrl(); }
    })();
  }, []);

  async function handleDraw() {
    setError('');
    setPhase(PHASES.SHUFFLE);
    setFlipped([]);

    // 'combined' là chế độ frontend-only — backend thực ra dùng 'love3' spread
    // nhưng gửi thêm personDob để AI viết lời giải kết hợp chiêm tinh.
    const actualSpreadId = spreadId === 'combined' ? 'love3' : spreadId;
    const body = {
      spreadId: actualSpreadId,
      question,
      tone,
      ...(spreadId === 'combined' && personDob.name ? {
        personDob: {
          name: personDob.name,
          day: parseInt(personDob.day),
          month: parseInt(personDob.month),
          year: parseInt(personDob.year),
        }
      } : {}),
    };

    const minDelay = new Promise(res => setTimeout(res, spreadId === 'yesno' ? 2000 : 3000));
    try {
      const [response] = await Promise.all([
        fetch('/api/tarot-reading', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        }),
        minDelay,
      ]);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Tiên Tri im lặng. Vui lòng thử lại.');
      }
      const data = await response.json();
      // Lưu lại spreadId thật (kể cả 'combined') vào result để lịch sử hiển thị đúng
      data.clientSpreadId = spreadId;
      setResult(data);
      // Yes/No: tự lật hết ngay (chỉ 1 lá, không cần bước lật tương tác)
      setFlipped(data.draws.map(() => spreadId === 'yesno'));
      saveTarotHistory(data);
      syncTarotUrl(data);
      setPhase(PHASES.REVEAL);
    } catch (e) {
      setError(e.message);
      setPhase(PHASES.QUESTION);
    }
  }

  function handleFlip(i) {
    setFlipped(prev => prev.map((v, idx) => idx === i ? true : v));
  }

  function flipAll() {
    if (!result) return;
    result.draws.forEach((_, i) => setTimeout(() => handleFlip(i), i * 350));
  }

  // Chạm vào 1 lá: phóng to ra giữa màn hình. Nếu lá CHƯA lật — lật ngay khi
  // đã phóng to, xem một chút rồi tự thu nhỏ về đúng vị trí cũ. Nếu lá ĐÃ lật
  // rồi — chỉ phóng to để xem rõ hơn (ảnh + ý nghĩa), người dùng tự đóng lại.
  // Chạm vào 1 lá: phóng to ra giữa màn hình. Nếu lá CHƯA lật, tự lật khi đã
  // phóng to xong. Lá ở lại giữa màn hình cho đến khi người dùng tự đóng
  // (chạm nền / nút ✕) — KHÔNG tự đóng, để có đủ thời gian đọc ý nghĩa.
  function handleCardTap(i, e) {
    if (focusedIndex !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    setFocusOrigin({ x: cx - window.innerWidth / 2, y: cy - window.innerHeight / 2 });
    setFocusedIndex(i);
    clearTimeout(closeTimerRef.current);
    if (!flipped[i]) {
      closeTimerRef.current = setTimeout(() => handleFlip(i), 380);
    }
  }

  function closeFocused() {
    clearTimeout(closeTimerRef.current);
    setFocusedIndex(null);
  }

  function reset() {
    setPhase(PHASES.SPREAD);
    setResult(null);
    setQuestion('');
    setError('');
    clearTarotUrl();
  }

  function replay(entry) {
    setHistoryOpen(false);
    setResult(entry);
    setFlipped(entry.draws.map(() => true));
    setSpreadId(entry.spread.id);
    setPhase(PHASES.REVEAL);
    syncTarotUrl(entry);
  }

  function handleShareLink() {
    if (!result) return;
    crossCopy(window.location.href).then(ok => showToast(ok ? '✅ Đã sao chép link!' : '❌ Không thể sao chép'));
  }

  function handleShareText() {
    if (!result) return;
    const cardNames = result.draws.map(d => d.card.nameVn).join(' · ');
    const txt = `🎴 ${result.spread.name}: ${cardNames}\n${window.location.href}`;
    if (navigator.share) navigator.share({ title: 'Bài Tarot — Tiên Tri', text: txt }).catch(() => {});
    else crossCopy(txt).then(ok => showToast(ok ? '✅ Đã sao chép!' : '❌ Không thể sao chép'));
  }

  const allFlipped = result && flipped.length > 0 && flipped.every(Boolean);
  const selectedSpreadInfo = SPREAD_CARDS.find(s => s.id === spreadId) ?? SPREAD_CARDS[0];

  return (
    <>
      <StarryBackground theme="tarot" />
      <main className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        <AnimatePresence mode="wait">

          {/* SPREAD SELECT */}
          {phase === PHASES.SPREAD && (
            <motion.div key="spread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-md mx-auto pt-8">
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="text-indigo-400 hover:text-indigo-200 text-sm transition-colors px-3 py-2 rounded-xl hover:bg-indigo-900/30">
                  ← Trang chủ
                </Link>
                <button onClick={() => setHistoryOpen(true)}
                  className="text-indigo-400 hover:text-indigo-200 text-sm transition-colors flex items-center gap-1 px-3 py-2 rounded-xl border border-indigo-700/30 hover:border-indigo-500/40">
                  🕐 Lịch sử
                </button>
              </div>

              <div className="text-center mb-8">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-6xl mb-3">🎴</motion.div>
                <h1 className="text-3xl font-bold mb-2"
                  style={{ background: 'linear-gradient(135deg,#c7d2fe,#a5b4fc,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Bài Tarot
                </h1>
                <p className="text-indigo-400 text-sm">Chọn một cách trải bài để bắt đầu</p>
              </div>

              <div className="space-y-3 mb-6">
                {SPREAD_CARDS.map(s => (
                  <button key={s.id} disabled={!s.available}
                    onClick={() => { setSpreadId(s.id); setPhase(PHASES.QUESTION); }}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center gap-4 transition-all
                      ${s.available
                        ? 'border-amber-500/35 bg-indigo-900/30 hover:border-amber-400/60 hover:bg-indigo-900/50 active:scale-[0.98]'
                        : 'border-indigo-800/20 bg-indigo-950/30 opacity-50 cursor-not-allowed'}`}>
                    <span className="text-3xl">{s.emoji}</span>
                    <div className="flex-1">
                      <p className="text-indigo-100 font-medium text-sm">{s.title}</p>
                      <p className="text-indigo-400 text-xs mt-0.5">{s.desc}</p>
                    </div>
                    {!s.available && <span className="text-xs text-indigo-500 border border-indigo-700/30 rounded-full px-2 py-1 shrink-0">Sắp ra mắt</span>}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 mb-2">
                <button onClick={() => setLibraryOpen(true)}
                  className="py-3 rounded-2xl text-xs font-medium border border-indigo-700/30 text-indigo-300
                    hover:bg-indigo-900/30 hover:border-indigo-500/40 transition-all flex flex-col items-center gap-1">
                  <span>📖</span> Tra Cứu
                </button>
                <button onClick={() => setStatsOpen(true)}
                  className="py-3 rounded-2xl text-xs font-medium border border-indigo-700/30 text-indigo-300
                    hover:bg-indigo-900/30 hover:border-indigo-500/40 transition-all flex flex-col items-center gap-1">
                  <span>📊</span> Thống Kê
                </button>
                <button onClick={() => setQuizOpen(true)}
                  className="py-3 rounded-2xl text-xs font-medium border border-indigo-700/30 text-indigo-300
                    hover:bg-indigo-900/30 hover:border-indigo-500/40 transition-all flex flex-col items-center gap-1">
                  <span>🎮</span> Đố Vui
                </button>
              </div>

              <p className="text-indigo-600 text-xs text-center mt-4">Chỉ để giải trí · Số phận là do bạn viết</p>
            </motion.div>
          )}

          {/* QUESTION */}
          {phase === PHASES.QUESTION && (
            <motion.div key="question" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-md mx-auto pt-8">
              <button onClick={() => setPhase(PHASES.SPREAD)}
                className="text-indigo-400 hover:text-indigo-200 text-sm transition-colors mb-6 px-1">← Chọn lại kiểu trải bài</button>

              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{selectedSpreadInfo.emoji}</div>
                <h2 className="text-indigo-100 text-xl font-semibold mb-1">{selectedSpreadInfo.title}</h2>
                <p className="text-indigo-400 text-sm">{selectedSpreadInfo.desc}</p>
              </div>

              {/* Form nhập ngày sinh cho chế độ kết hợp chiêm tinh */}
              {spreadId === 'combined' && (
                <div className="mb-5 p-4 rounded-2xl bg-indigo-950/50 border border-amber-500/25">
                  <p className="text-amber-300 text-xs font-medium mb-3 uppercase tracking-wide">🔮 Thông tin của bạn (để tính chiêm tinh)</p>
                  <input type="text" placeholder="Tên của bạn" value={personDob.name}
                    onChange={e => setPersonDob(p => ({ ...p, name: e.target.value.slice(0, 30) }))}
                    className="w-full bg-indigo-900/40 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-indigo-100
                      placeholder-indigo-500 focus:outline-none focus:border-amber-400/50 text-sm mb-2" />
                  <div className="grid grid-cols-3 gap-2">
                    {[['day','Ngày','1-31'],['month','Tháng','1-12'],['year','Năm','1900+']].map(([field, label, ph]) => (
                      <div key={field}>
                        <p className="text-indigo-500 text-xs mb-1">{label}</p>
                        <input type="number" placeholder={ph} value={personDob[field]}
                          onChange={e => setPersonDob(p => ({ ...p, [field]: e.target.value }))}
                          className="w-full bg-indigo-900/40 border border-indigo-500/30 rounded-xl px-3 py-2 text-indigo-100
                            placeholder-indigo-500 focus:outline-none focus:border-amber-400/50 text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm text-center">{error}</div>
              )}

              <label className="text-indigo-400 text-xs mb-1.5 block">Điều bạn đang thắc mắc (không bắt buộc)</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value.slice(0, 200))}
                placeholder="Ví dụ: Mối quan hệ này có nên tiếp tục không?"
                rows={3}
                className="w-full bg-indigo-900/40 border border-indigo-500/30 rounded-xl px-4 py-3 text-indigo-100
                  placeholder-indigo-500 focus:outline-none focus:border-indigo-400 transition-colors text-sm resize-none mb-2" />
              <p className="text-indigo-600 text-xs text-right mb-5">{question.length}/200</p>

              <p className="text-indigo-400 text-xs mb-2 text-center uppercase tracking-wide">Giọng diễn giải</p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {TONES.map(t => (
                  <button key={t.id} onClick={() => setTone(t.id)}
                    className={`py-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-0.5
                      ${tone === t.id ? 'border-indigo-400 bg-indigo-800/50' : 'border-indigo-700/40 bg-indigo-950/30 hover:border-indigo-500/60'}`}>
                    <span>{t.emoji}</span>
                    <span className={`text-xs ${tone === t.id ? 'text-indigo-100' : 'text-indigo-400'}`}>{t.label}</span>
                  </button>
                ))}
              </div>

              <motion.button onClick={handleDraw} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full py-4 rounded-2xl font-semibold text-white text-base"
                style={{ background: 'linear-gradient(135deg,#3730a3,#6d28d9,#d97706)', boxShadow: '0 0 30px rgba(217,119,6,0.25)' }}>
                🔮 Rút Bài Ngay
              </motion.button>
            </motion.div>
          )}

          {/* SHUFFLE */}
          {phase === PHASES.SHUFFLE && (
            <motion.div key="shuffle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-[70vh] w-full">
              <ShuffleAnimation />
            </motion.div>
          )}

          {/* REVEAL */}
          {phase === PHASES.REVEAL && result && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto pt-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-indigo-200 font-semibold text-lg">{result.spread.name}</h2>
                <button onClick={() => setHistoryOpen(true)}
                  className="text-indigo-400 hover:text-indigo-200 text-xs transition-colors flex items-center gap-1 px-3 py-2 rounded-xl border border-indigo-700/30 hover:border-indigo-500/40">
                  🕐 Lịch sử
                </button>
              </div>

              {result.question && (
                <p className="text-indigo-400 text-sm text-center italic mb-6">&ldquo;{result.question}&rdquo;</p>
              )}

              {/* YES/NO — verdict banner lớn + 1 lá */}
              {result.yesNoVerdict && (() => {
                const vd = YES_NO_LABELS[result.yesNoVerdict];
                const d  = result.draws[0];
                return (
                  <div className="flex flex-col items-center gap-6 mb-8">
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                      className="text-center">
                      <div className="text-6xl font-bold mb-1" style={{ color: vd.color, textShadow: `0 0 40px ${vd.glow}` }}>
                        {vd.vi}
                      </div>
                    </motion.div>
                    <motion.div className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      style={{ visibility: focusedIndex === 0 ? 'hidden' : 'visible' }}>
                      <TarotCard card={d.card} faceUp={flipped[0]} reversed={d.reversed} size="md"
                        delay={0.15} onClick={(e) => handleCardTap(0, e)} />
                      <p className="text-indigo-300 text-xs font-medium">{d.position.label}</p>
                      {flipped[0] && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-indigo-100 text-xs text-center max-w-[8rem]">
                          {d.card.nameVn}{d.reversed && <span className="text-amber-400"> (Ngược)</span>}
                        </motion.p>
                      )}
                    </motion.div>
                  </div>
                );
              })()}

              {/* CELTIC CROSS — 10-card positional grid */}
              {!result.yesNoVerdict && result.draws.length === 10 && (
                <div className="relative mb-6 mx-auto" style={{ width: 320, height: 380 }}>
                  {/* Layout vị trí Celtic Cross truyền thống: cột trái (7-10), nhóm trung tâm (1-6) */}
                  {[
                    // [i, left%, top%] — tính từ góc trên-trái của container
                    [0,  32, 34],  // 1 - hiện tại (giữa)
                    [1,  32, 34],  // 2 - thách thức (chéo, xử lý riêng bên dưới)
                    [2,  32,  5],  // 3 - phía trên
                    [3,  32, 63],  // 4 - phía dưới
                    [4,   4, 34],  // 5 - quá khứ (trái)
                    [5,  60, 34],  // 6 - tương lai (phải)
                    [6,  75,  5],  // 7 - bản thân
                    [7,  75, 30],  // 8 - môi trường
                    [8,  75, 55],  // 9 - hi vọng
                    [9,  75, 78],  // 10 - kết quả
                  ].map(([i, leftPct, topPct]) => {
                    const d = result.draws[i];
                    const isCross = i === 1; // lá thách thức xoay 90°
                    return (
                      <motion.div key={i}
                        className="absolute flex flex-col items-center"
                        style={{
                          left: `${leftPct}%`, top: `${topPct}%`,
                          transform: isCross ? 'rotate(90deg)' : undefined,
                          visibility: focusedIndex === i ? 'hidden' : 'visible',
                        }}
                        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.08 * i, duration: 0.4 }}>
                        <TarotCard card={d.card} faceUp={flipped[i]} reversed={d.reversed} size="sm"
                          delay={0.08 * i} onClick={(e) => handleCardTap(i, e)} />
                        {!isCross && (
                          <p className="text-indigo-400 text-[9px] text-center mt-0.5 leading-tight max-w-[56px]">
                            {d.position.label}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Standard flex grid for all other spreads (1, 3 cards etc.) */}
              {!result.yesNoVerdict && result.draws.length !== 10 && (
              <div className="flex justify-center gap-4 sm:gap-8 mb-6 flex-wrap">
                {result.draws.map((d, i) => {
                  const mid = (result.draws.length - 1) / 2;
                  const fromCenter = (mid - i) * 46;
                  return (
                    <motion.div key={i} className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, x: fromCenter, y: -36, rotate: (mid - i) * -14, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                      style={{ visibility: focusedIndex === i ? 'hidden' : 'visible' }}
                      transition={{ delay: 0.15 + i * 0.16, duration: 0.55, ease: [0.21, 0.8, 0.32, 1] }}>
                      <TarotCard card={d.card} faceUp={flipped[i]} reversed={d.reversed} size="md"
                        delay={0.15 + i * 0.16} onClick={(e) => handleCardTap(i, e)} />
                      <p className="text-indigo-300 text-xs font-medium">{d.position.label}</p>
                      {flipped[i] && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="text-indigo-100 text-xs text-center max-w-[8rem]">
                          {d.card.nameVn}{d.reversed && <span className="text-amber-400"> (Ngược)</span>}
                        </motion.p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              )}

              {!allFlipped && (
                <div className="flex justify-center mb-8">
                  <button onClick={flipAll}
                    className="px-6 py-3 rounded-2xl text-sm font-medium border border-indigo-500/40 text-indigo-300
                      hover:bg-indigo-900/40 active:scale-95 transition-all">
                    {result.draws.length > 1 ? '👆 Chạm từng lá hoặc nhấn để lật tất cả' : '👆 Chạm vào lá hoặc nhấn để lật'}
                  </button>
                </div>
              )}

              {/* Ý nghĩa từng lá — hiện ngay khi lá đó được lật, không cần chờ lật hết */}
              <AnimatePresence>
                {flipped.some(Boolean) && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-indigo-500/20 bg-indigo-950/40 backdrop-blur-sm p-5 space-y-3 mb-4">
                    <h3 className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-1 uppercase tracking-wider">
                      <span>📜</span>Ý Nghĩa Từng Lá
                    </h3>
                    <AnimatePresence mode="popLayout">
                      {result.draws.map((d, i) => flipped[i] && (
                        <motion.div key={i} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                          className="flex gap-3">
                          <span className="text-indigo-400 text-xs font-semibold whitespace-nowrap pt-0.5 w-28 shrink-0">{d.position.label}</span>
                          <div>
                            <p className="text-indigo-200 text-xs font-medium mb-0.5">{d.card.nameVn} {d.reversed && <span className="text-amber-400">(Ngược)</span>}</p>
                            <p className="text-indigo-300 text-xs leading-relaxed">{d.reversed ? d.card.reversed : d.card.upright}</p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {allFlipped && (
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/40 backdrop-blur-sm p-5">
                      <h3 className="flex items-center gap-2 text-indigo-300 font-semibold text-sm mb-3 uppercase tracking-wider">
                        <span>🌙</span>Lời Giải
                      </h3>
                      <ReadingText text={result.reading} />
                      <div className="mt-4 pt-4 border-t border-indigo-700/30">
                        <span className="text-indigo-500 text-xs italic">🔮 Chỉ để giải trí — số phận của bạn là do chính bạn viết</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <motion.button onClick={handleShareLink} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="py-3.5 rounded-2xl text-sm font-medium text-indigo-200 border border-indigo-500/40 bg-indigo-900/30">
                        📋 Sao Chép Link
                      </motion.button>
                      <motion.button onClick={handleShareText} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="py-3.5 rounded-2xl text-sm font-medium text-indigo-200 border border-indigo-500/40 bg-indigo-900/30">
                        📤 Chia Sẻ
                      </motion.button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-8">
                      <motion.button onClick={() => setPhase(PHASES.QUESTION)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="py-4 rounded-2xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#3730a3,#4f46e5)' }}>
                        🔄 Rút Lại
                      </motion.button>
                      <motion.button onClick={reset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="py-4 rounded-2xl text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg,#4f46e5,#d97706)' }}>
                        🎴 Kiểu Trải Khác
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {focusedIndex !== null && result && (
          <motion.div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeFocused}>
            <motion.div onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-4 max-w-xs"
              initial={{ x: focusOrigin.x, y: focusOrigin.y, scale: 0.7, opacity: 0 }}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              exit={{ x: focusOrigin.x, y: focusOrigin.y, scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <TarotCard card={result.draws[focusedIndex].card} faceUp={flipped[focusedIndex]}
                reversed={result.draws[focusedIndex].reversed} size="lg" />
              <div className="text-center">
                <p className="text-indigo-300 text-xs font-medium mb-1">{result.draws[focusedIndex].position.label}</p>
                {flipped[focusedIndex] && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <p className="text-indigo-100 text-sm font-semibold mb-1.5">
                      {result.draws[focusedIndex].card.nameVn}
                      {result.draws[focusedIndex].reversed && <span className="text-amber-400"> (Ngược)</span>}
                    </p>
                    <p className="text-indigo-300 text-xs leading-relaxed px-1">
                      {result.draws[focusedIndex].reversed
                        ? result.draws[focusedIndex].card.reversed
                        : result.draws[focusedIndex].card.upright}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
            <button onClick={closeFocused} aria-label="Đóng"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-indigo-900/70 border border-indigo-500/40
                text-indigo-200 flex items-center justify-center text-lg active:scale-90 transition-transform">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div key="toast" initial={{ opacity: 0, y: 16, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 8, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[100] px-5 py-2.5 rounded-full text-sm font-medium
              bg-indigo-900 border border-indigo-500/50 text-indigo-100 shadow-xl pointer-events-none whitespace-nowrap">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <TarotLibrary open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <TarotHistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onReplay={replay}
        onNote={(id) => { setHistoryOpen(false); setNoteEntryId(id); }} />
      <TarotStats open={statsOpen} onClose={() => setStatsOpen(false)} />
      <TarotQuiz  open={quizOpen}  onClose={() => setQuizOpen(false)} />
      <TarotNoteModal entryId={noteEntryId} onClose={() => setNoteEntryId(null)} />
    </>
  );
}
