'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_HISTORY_KEY } from './TarotHistoryPanel';
import { getCardImageUrl } from '@/lib/data/tarot-deck';

function computeStats(history) {
  const cardCount  = {};
  const suitCount  = { wands: 0, cups: 0, swords: 0, pentacles: 0, major: 0 };
  let   upright = 0, reversed = 0, total = 0;

  for (const entry of history) {
    for (const draw of entry.draws ?? []) {
      const { card, reversed: rev } = draw;
      if (!card?.id) continue;
      cardCount[card.id] = { card, count: (cardCount[card.id]?.count ?? 0) + 1 };
      const suit = card.arcana === 'major' ? 'major' : (card.suit ?? 'major');
      if (suitCount[suit] !== undefined) suitCount[suit]++;
      rev ? reversed++ : upright++;
      total++;
    }
  }

  const topCards = Object.values(cardCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { topCards, suitCount, upright, reversed, total };
}

const SUIT_INFO = {
  major:     { label: 'Major Arcana', color: '#fbbf24', emoji: '✨' },
  wands:     { label: 'Gậy',          color: '#f97316', emoji: '🔥' },
  cups:      { label: 'Cốc',          color: '#60a5fa', emoji: '💧' },
  swords:    { label: 'Kiếm',         color: '#a78bfa', emoji: '🌬️' },
  pentacles: { label: 'Tiền',         color: '#4ade80', emoji: '🌿' },
};

export default function TarotStats({ open, onClose }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(TAROT_HISTORY_KEY);
      const history = raw ? JSON.parse(raw) : [];
      setStats(history.length ? computeStats(history) : null);
    } catch (_) { setStats(null); }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-x-3 top-6 bottom-6 z-50 max-w-md mx-auto flex flex-col
            bg-[#08071c] border border-indigo-600/40 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-700/30">
              <h3 className="text-indigo-100 font-semibold">📊 Thống Kê Lá Bài Của Bạn</h3>
              <button onClick={onClose} className="text-indigo-400 hover:text-indigo-200 transition-colors p-2 text-lg">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!stats ? (
                <div className="text-center py-16 text-indigo-500">
                  <p className="text-3xl mb-3">📊</p>
                  <p className="text-sm">Chưa có đủ dữ liệu.</p>
                  <p className="text-xs mt-1">Rút ít nhất một lần để xem thống kê.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Tổng quan */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Tổng lượt rút', value: stats.total, color: 'text-indigo-200' },
                      { label: 'Lá xuôi',        value: `${stats.total ? Math.round(stats.upright / stats.total * 100) : 0}%`, color: 'text-green-400' },
                      { label: 'Lá ngược',       value: `${stats.total ? Math.round(stats.reversed / stats.total * 100) : 0}%`, color: 'text-amber-400' },
                    ].map(s => (
                      <div key={s.label} className="rounded-2xl bg-indigo-950/60 border border-indigo-700/25 p-3 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-indigo-500 text-xs mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Top 5 lá hay ra nhất */}
                  {stats.topCards.length > 0 && (
                    <div>
                      <h4 className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-3">⭐ Lá hay ra nhất</h4>
                      <div className="space-y-2">
                        {stats.topCards.map(({ card, count }, rank) => (
                          <motion.div key={card.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: rank * 0.06 }}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-700/20">
                            <span className="text-indigo-500 text-xs w-4 text-center font-bold">{rank + 1}</span>
                            <div className="w-8 h-13 shrink-0 rounded bg-[#fbf6ec] p-0.5">
                              <img src={getCardImageUrl(card)} alt={card.nameVn}
                                className="w-full h-full object-contain" draggable={false} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-indigo-200 text-xs font-medium truncate">{card.nameVn}</p>
                              <p className="text-indigo-500 text-[10px]">{card.nameEn}</p>
                            </div>
                            <span className="text-amber-400 text-xs font-bold shrink-0">{count}×</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Phân bố theo bộ */}
                  {stats.total > 0 && (
                    <div>
                      <h4 className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-3">🃏 Phân bố theo bộ</h4>
                      <div className="space-y-2">
                        {Object.entries(SUIT_INFO).map(([key, info]) => {
                          const count = stats.suitCount[key] ?? 0;
                          const pct   = Math.round(count / stats.total * 100);
                          return (
                            <div key={key}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-indigo-300 text-xs">{info.emoji} {info.label}</span>
                                <span className="text-indigo-400 text-xs">{count} ({pct}%)</span>
                              </div>
                              <div className="h-1.5 bg-indigo-900/60 rounded-full overflow-hidden">
                                <motion.div className="h-full rounded-full"
                                  style={{ background: info.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: 0.1 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
