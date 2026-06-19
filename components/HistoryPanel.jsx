'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export const HISTORY_KEY = 'love_oracle_history';
const MAX_HISTORY = 10;

export function saveToHistory(result) {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const entry = {
      id: Date.now(),
      timestamp: Date.now(),
      personA: result.personA,
      personB: result.personB,
      score: result.analysis.score,
      level: result.analysis.level,
      tone: result.tone ?? 'tho-mong',
    };
    // Tránh trùng lặp (cùng tên + dob)
    const key = (p) => `${p.name}:${p.day}/${p.month}/${p.year}`;
    const filtered = arr.filter(e =>
      !(key(e.personA) === key(entry.personA) && key(e.personB) === key(entry.personB))
      && !(key(e.personA) === key(entry.personB) && key(e.personB) === key(entry.personA))
    );
    const updated = [entry, ...filtered].slice(0, MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (_) {}
}

const TONE_LABEL = { 'tho-mong': '💜', 'hai-huoc': '😄', 'nghiem-tuc': '🎯' };

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d} ngày trước`;
  if (h > 0) return `${h} giờ trước`;
  if (m > 0) return `${m} phút trước`;
  return 'Vừa xong';
}

export default function HistoryPanel({ open, onClose, onReplay }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch (_) { setHistory([]); }
  }, [open]);

  function clear() {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }

  function deleteOne(id) {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-[#0d0820] border-l border-violet-700/40 shadow-2xl flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-violet-700/30">
              <div>
                <h2 className="text-violet-100 font-semibold">Lịch sử xem bói</h2>
                <p className="text-violet-400 text-xs">{history.length} / {MAX_HISTORY} lần gần nhất</p>
              </div>
              <div className="flex gap-2">
                {history.length > 0 && (
                  <button onClick={clear} className="text-violet-500 hover:text-pink-400 text-xs px-2 py-1 rounded-lg
                    border border-violet-700/30 hover:border-pink-500/30 transition-colors">
                    Xóa hết
                  </button>
                )}
                <button onClick={onClose} className="text-violet-400 hover:text-violet-200 transition-colors p-1">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-16 text-violet-500">
                  <p className="text-3xl mb-3">🔮</p>
                  <p className="text-sm">Chưa có lịch sử nào.</p>
                  <p className="text-xs mt-1">Kết quả sẽ được lưu sau khi xem bói.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {history.map(entry => (
                    <motion.div key={entry.id} layout
                      className="p-4 rounded-2xl border border-violet-700/30 bg-violet-950/50 cursor-pointer
                                 hover:border-violet-500/50 transition-all group relative"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      whileHover={{ scale: 1.01 }} onClick={() => onReplay(entry)}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(entry.id); }}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full
                          text-violet-500 hover:text-pink-300 hover:bg-pink-900/30 transition-colors text-sm
                          opacity-60 group-hover:opacity-100"
                        aria-label="Xóa">
                        🗑
                      </button>
                      <div className="flex items-start justify-between gap-2 pr-8">
                        <div className="flex-1 min-w-0">
                          <p className="text-violet-100 text-sm font-medium truncate">
                            {entry.personA.name} & {entry.personB.name}
                          </p>
                          <p className="text-violet-400 text-xs mt-0.5">
                            {entry.personA.day}/{entry.personA.month}/{entry.personA.year} ·{' '}
                            {entry.personB.day}/{entry.personB.month}/{entry.personB.year}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-pink-300 font-bold text-lg leading-none">{entry.score}</p>
                          <p className="text-violet-500 text-xs">/100</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-900/60 text-violet-300 border border-violet-700/30">
                          {entry.level?.emoji} {entry.level?.label}
                        </span>
                        <span className="text-xs text-violet-500">{TONE_LABEL[entry.tone]}</span>
                        <span className="text-xs text-violet-600 ml-auto">{timeAgo(entry.timestamp)}</span>
                      </div>
                      <p className="text-violet-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Nhấn để xem lại →
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
