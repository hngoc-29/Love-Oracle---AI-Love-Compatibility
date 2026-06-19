'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getCardImageUrl } from '@/lib/data/tarot-deck';

export const TAROT_HISTORY_KEY = 'tarot_oracle_history';
const MAX_HISTORY = 10;

export function saveTarotHistory(result) {
  try {
    const raw = localStorage.getItem(TAROT_HISTORY_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    const entry = {
      id: Date.now(),
      timestamp: Date.now(),
      spread: result.spread,
      draws: result.draws,
      question: result.question,
      tone: result.tone ?? 'tho-mong',
      reading: result.reading,
      shareId: result.shareId ?? null,
    };
    const updated = [entry, ...arr].slice(0, MAX_HISTORY);
    localStorage.setItem(TAROT_HISTORY_KEY, JSON.stringify(updated));
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

export default function TarotHistoryPanel({ open, onClose, onReplay, onNote }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(TAROT_HISTORY_KEY);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch (_) { setHistory([]); }
  }, [open]);

  function clear() {
    localStorage.removeItem(TAROT_HISTORY_KEY);
    setHistory([]);
  }

  function deleteOne(id) {
    setHistory(prev => {
      const next = prev.filter(e => e.id !== id);
      try { localStorage.setItem(TAROT_HISTORY_KEY, JSON.stringify(next)); } catch (_) {}
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
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-[#0d0820] border-l border-indigo-700/40 shadow-2xl flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-700/30">
              <div>
                <h2 className="text-indigo-100 font-semibold">Lịch sử rút bài</h2>
                <p className="text-indigo-400 text-xs">{history.length} / {MAX_HISTORY} lần gần nhất</p>
              </div>
              <div className="flex gap-2">
                {history.length > 0 && (
                  <button onClick={clear} className="text-indigo-500 hover:text-red-400 text-xs px-2 py-1 rounded-lg
                    border border-indigo-700/30 hover:border-red-500/30 transition-colors">
                    Xóa hết
                  </button>
                )}
                <button onClick={onClose} className="text-indigo-400 hover:text-indigo-200 transition-colors p-1">✕</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-16 text-indigo-500">
                  <p className="text-3xl mb-3">🎴</p>
                  <p className="text-sm">Chưa có lịch sử nào.</p>
                  <p className="text-xs mt-1">Kết quả sẽ được lưu sau khi rút bài.</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {history.map(entry => (
                    <motion.div key={entry.id} layout
                      className="p-4 rounded-2xl border border-indigo-700/30 bg-indigo-950/50 cursor-pointer
                                 hover:border-indigo-500/50 transition-all group relative"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      whileHover={{ scale: 1.01 }} onClick={() => onReplay(entry)}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(entry.id); }}
                        className="absolute top-3 right-10 w-7 h-7 flex items-center justify-center rounded-full
                          text-indigo-500 hover:text-red-300 hover:bg-red-900/30 transition-colors text-sm
                          opacity-60 group-hover:opacity-100"
                        aria-label="Xóa">
                        🗑
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onNote?.(entry.id); }}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full
                          transition-colors text-sm opacity-60 group-hover:opacity-100
                          text-indigo-500 hover:text-amber-300 hover:bg-amber-900/20"
                        aria-label="Ghi chú">
                        {entry.note ? '📝' : '✏️'}
                      </button>
                      <div className="flex items-start justify-between gap-2 pr-8">
                        <div className="flex-1 min-w-0">
                          <p className="text-indigo-100 text-sm font-medium truncate">{entry.spread?.name}</p>
                          {entry.question && (
                            <p className="text-indigo-400 text-xs mt-0.5 truncate italic">&ldquo;{entry.question}&rdquo;</p>
                          )}
                        </div>
                        <div className="flex shrink-0 -space-x-3">
                          {entry.draws?.slice(0, 3).map((d, i) => (
                            <div key={i} className="w-6 h-10 rounded bg-[#fbf6ec] border border-indigo-700/40 p-0.5 shadow-sm">
                              <img src={getCardImageUrl(d.card)} alt="" className="w-full h-full object-contain"
                                style={{ transform: d.reversed ? 'rotate(180deg)' : 'none' }} draggable={false} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-900/60 text-indigo-300 border border-indigo-700/30 truncate max-w-[10rem]">
                          {entry.draws?.map(d => d.card.nameVn).join(' · ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-indigo-500">{TONE_LABEL[entry.tone]}</span>
                        <span className="text-xs text-indigo-600 ml-auto">{timeAgo(entry.timestamp)}</span>
                      </div>
                      {entry.note && (
                        <p className="text-amber-500/70 text-xs mt-1.5 line-clamp-1 italic">📝 {entry.note}</p>
                      )}
                      <p className="text-indigo-500 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
