'use client';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import CrystalBall from './CrystalBall';
import LoveForm from './LoveForm';
import LoadingAnimation from './LoadingAnimation';
import ResultCard from './ResultCard';
import StarryBackground from './StarryBackground';
import HistoryPanel, { saveToHistory } from './HistoryPanel';
import { encodeShareState, decodeShareState } from '@/lib/share-codec';

const PHASES = { HOME: 'home', FORM: 'form', LOADING: 'loading', RESULT: 'result' };
const MAX_RETRIES = 1;

// Đồng bộ URL với cặp đang xem — để F5/tải lại trang KHÔNG mất kết quả,
// dù người dùng vào từ link chia sẻ hay tự điền form.
function syncUrl(personA, personB, tone) {
  try {
    const payload = encodeShareState({
      a:{name:personA.name,day:personA.day,month:personA.month,year:personA.year},
      b:{name:personB.name,day:personB.day,month:personB.month,year:personB.year},
      t: tone ?? 'tho-mong',
    });
    window.history.replaceState({}, '', `${window.location.pathname}?s=${payload}`);
  } catch {}
}

function clearUrl() {
  try { window.history.replaceState({}, '', window.location.pathname); } catch {}
}

export default function OracleApp() {
  const [phase, setPhase]             = useState(PHASES.HOME);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadStart, setLoadStart]     = useState(null);
  const prefillRef = useRef(null);

  // ── URL share param on mount — giữ nguyên query, không xoá ──────────────────
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('s');
      if (!s) return;
      const { a, b, t } = decodeShareState(s);
      prefillRef.current = { personA: a, personB: b, tone: t ?? 'tho-mong' };
      handleAnalyze({ personA: a, personB: b, tone: t ?? 'tho-mong' }, 0, { fromUrl: true });
    } catch (_) {}
  }, []);

  // ── Analyze ────────────────────────────────────────────────────────────────
  async function handleAnalyze(params, attempt = 0, opts = {}) {
    setError('');
    setLoadStart(Date.now());
    setPhase(PHASES.LOADING);

    const minDelay = new Promise(res => setTimeout(res, 3000));

    try {
      const [response] = await Promise.all([
        fetch('/api/love-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(30000),
        }),
        minDelay,
      ]);

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Tiên Tri im lặng. Vui lòng thử lại.');
      }

      const data = await response.json();
      saveToHistory(data);
      setResult(data);
      setPhase(PHASES.RESULT);
      // Không cần re-sync nếu vừa vào từ URL (đã đúng sẵn) — nhưng vẫn an toàn
      // nếu gọi lại, vì payload tạo ra giống nhau cho cùng một cặp.
      syncUrl(params.personA, params.personB, params.tone);
    } catch (e) {
      if (attempt < MAX_RETRIES && (e.name === 'TimeoutError' || e.name === 'AbortError' || e.message.includes('fetch'))) {
        return handleAnalyze(params, attempt + 1, opts);
      }
      setError(e.message);
      setPhase(PHASES.FORM);
      if (opts.fromUrl) clearUrl();
    }
  }

  function handleReset() { setResult(null); setError(''); setPhase(PHASES.FORM); clearUrl(); }

  function handleRerun() {
    if (!result) return;
    const salt = Math.floor(Math.random() * 999983) + 1;
    handleAnalyze({ personA: result.personA, personB: result.personB, tone: result.tone ?? 'tho-mong', rerun: true, salt });
  }

  function handleReplay(entry) {
    setHistoryOpen(false);
    handleAnalyze({ personA: entry.personA, personB: entry.personB, tone: entry.tone ?? 'tho-mong' });
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <StarryBackground theme="love" />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 py-8">
        <AnimatePresence mode="wait">

          {/* HOME */}
          {phase === PHASES.HOME && (
            <motion.div key="home"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center min-h-screen gap-8 text-center w-full">

              {/* Back to main home */}
              <Link href="/"
                className="absolute top-5 left-4 flex items-center gap-1.5 text-violet-500 hover:text-violet-300
                  text-sm transition-colors px-3 py-2 rounded-xl hover:bg-violet-900/30">
                ← Trang chủ
              </Link>

              <motion.div animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                <CrystalBall size={220} glowing pulsing />
              </motion.div>

              <div className="space-y-3">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="text-5xl sm:text-6xl font-bold tracking-tight"
                  style={{ background: 'linear-gradient(135deg,#ffd6e8,#f472b6,#be185d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Tiên Tri Tình Yêu
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-violet-300 text-base max-w-sm mx-auto">
                  Cung hoàng đạo & vũ trụ sẽ tiết lộ bí mật giữa hai tâm hồn
                </motion.p>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                className="flex flex-col items-center gap-3 w-full max-w-xs">
                <motion.button onClick={() => setPhase(PHASES.FORM)}
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(236,72,153,0.5)' }} whileTap={{ scale: 0.97 }}
                  className="w-full px-10 py-4 rounded-2xl text-white font-semibold text-lg tracking-wide"
                  style={{ background: 'linear-gradient(135deg,#be185d,#ec4899,#f472b6)', boxShadow: '0 0 25px rgba(236,72,153,0.3)' }}>
                  ✨ Bắt Đầu Xem Bói
                </motion.button>

                <button onClick={() => setHistoryOpen(true)}
                  className="flex items-center gap-2 text-violet-400 hover:text-violet-200 text-sm transition-colors px-4 py-2.5 rounded-xl w-full justify-center
                    border border-violet-700/30 hover:border-violet-500/40">
                  🕐 Lịch sử xem bói
                </button>

                <p className="text-violet-500 text-xs">Chỉ để giải trí · Kết quả mang tính huyền bí</p>
              </motion.div>

              {['💫', '🌙', '⭐', '🔮', '✨'].map((r, i) => (
                <motion.span key={i} className="fixed text-xl pointer-events-none select-none"
                  style={{ left: `${10 + i * 20}%`, top: `${20 + (i % 3) * 25}%`, opacity: 0.2 }}
                  animate={{ y: [0, -20, 0], opacity: [0.15, 0.35, 0.15], rotate: [0, 15, 0] }}
                  transition={{ duration: 3 + i * 0.7, repeat: Infinity, delay: i * 0.5, ease: 'easeInOut' }}>
                  {r}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* FORM */}
          {phase === PHASES.FORM && (
            <motion.div key="form"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }} className="w-full max-w-lg mx-auto pt-12 pb-8">

              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setPhase(PHASES.HOME)}
                  className="flex items-center gap-1.5 text-violet-400 hover:text-violet-200 text-sm transition-colors py-2">
                  ← Quay lại
                </button>
                <button onClick={() => setHistoryOpen(true)}
                  className="text-violet-400 hover:text-violet-200 text-sm transition-colors flex items-center gap-1 py-2">
                  🕐 Lịch sử
                </button>
              </div>

              <div className="flex justify-center mb-6">
                <CrystalBall size={100} glowing />
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="mb-4 p-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm text-center">
                  {error}
                </motion.div>
              )}

              <LoveForm onSubmit={handleAnalyze} loading={false} />
            </motion.div>
          )}

          {/* LOADING */}
          {phase === PHASES.LOADING && (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-screen w-full">
              <LoadingAnimation startTime={loadStart} />
            </motion.div>
          )}

          {/* RESULT */}
          {phase === PHASES.RESULT && result && (
            <motion.div key="result"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-2xl mx-auto pt-8">
              <div className="flex justify-end mb-2">
                <button onClick={() => setHistoryOpen(true)}
                  className="text-violet-400 hover:text-violet-200 text-xs transition-colors flex items-center gap-1 px-3 py-2
                    rounded-xl border border-violet-700/30 hover:border-violet-500/40">
                  🕐 Lịch sử
                </button>
              </div>
              <ResultCard data={result} onReset={handleReset} onRerun={handleRerun} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} onReplay={handleReplay} />
    </>
  );
}
