'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_DECK, SUITS, getCardImageUrl } from '@/lib/data/tarot-deck';
import TarotCard from './TarotCard';

const GROUPS = [
  { id: 'major', label: 'Major Arcana', emoji: '✨' },
  { id: 'wands', label: 'Bộ Gậy', emoji: SUITS.wands.emoji },
  { id: 'cups', label: 'Bộ Cốc', emoji: SUITS.cups.emoji },
  { id: 'swords', label: 'Bộ Kiếm', emoji: SUITS.swords.emoji },
  { id: 'pentacles', label: 'Bộ Tiền', emoji: SUITS.pentacles.emoji },
];

function CardDetail({ card, onClose }) {
  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-x-3 top-10 bottom-10 z-[60] max-w-md mx-auto flex flex-col
            bg-[#0d0720] border border-indigo-600/40 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92 }}>
            <div className="flex items-center justify-end px-4 pt-4">
              <button onClick={onClose} className="text-indigo-400 hover:text-indigo-200 transition-colors p-2 text-lg">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center">
              <img src={getCardImageUrl(card)} alt={card.nameVn}
                className="w-32 rounded-xl bg-[#fbf6ec] p-2 shadow-lg mb-4" draggable={false} />
              <h3 className="text-indigo-100 font-semibold text-lg text-center">{card.nameVn}</h3>
              <p className="text-indigo-500 text-xs mb-3">{card.nameEn}</p>
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {card.keywords.map(k => (
                  <span key={k} className="text-xs px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-900/40 text-indigo-200">{k}</span>
                ))}
              </div>
              <div className="w-full space-y-3">
                <div className="p-3 rounded-xl bg-indigo-900/30 border border-indigo-700/25">
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-1">✦ Xuôi</p>
                  <p className="text-indigo-100 text-sm leading-relaxed">{card.upright}</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-900/30 border border-indigo-700/25">
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wide mb-1">⤺ Ngược</p>
                  <p className="text-indigo-100 text-sm leading-relaxed">{card.reversed}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function TarotLibrary({ open, onClose }) {
  const [group, setGroup] = useState('major');
  const [detail, setDetail] = useState(null);

  const cards = useMemo(() => {
    if (group === 'major') return TAROT_DECK.filter(c => c.arcana === 'major');
    return TAROT_DECK.filter(c => c.suit === group);
  }, [group]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-x-3 top-6 bottom-6 z-50 max-w-2xl mx-auto flex flex-col
            bg-[#0d0720] border border-indigo-600/40 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-700/30">
              <h3 className="text-indigo-100 font-semibold">📖 Tra Cứu 78 Lá Bài</h3>
              <button onClick={onClose} className="text-indigo-400 hover:text-indigo-200 transition-colors p-2 text-lg">✕</button>
            </div>

            <div className="flex gap-2 px-4 pt-3 overflow-x-auto pb-1">
              {GROUPS.map(g => (
                <button key={g.id} onClick={() => setGroup(g.id)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all
                    ${group === g.id ? 'border-amber-400/70 bg-indigo-800/50 text-amber-100' : 'border-indigo-700/30 bg-indigo-950/30 text-indigo-400'}`}>
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {cards.map(card => (
                  <button key={card.id} onClick={() => setDetail(card)} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
                    <div className="w-full aspect-[2/3.4] rounded-lg bg-[#fbf6ec] p-1 shadow-md overflow-hidden">
                      <img src={getCardImageUrl(card)} alt={card.nameVn} className="w-full h-full object-contain" draggable={false} />
                    </div>
                    <p className="text-indigo-300 text-[11px] text-center leading-tight">{card.nameVn}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
          <CardDetail card={detail} onClose={() => setDetail(null)} />
        </>
      )}
    </AnimatePresence>
  );
}
