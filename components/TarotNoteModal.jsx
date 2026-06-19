'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_HISTORY_KEY } from './TarotHistoryPanel';

export default function TarotNoteModal({ entryId, onClose }) {
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!entryId) return;
    try {
      const raw  = localStorage.getItem(TAROT_HISTORY_KEY);
      const arr  = raw ? JSON.parse(raw) : [];
      const entry = arr.find(e => e.id === entryId);
      setNote(entry?.note ?? '');
    } catch (_) {}
    setSaved(false);
  }, [entryId]);

  function save() {
    try {
      const raw = localStorage.getItem(TAROT_HISTORY_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      const idx = arr.findIndex(e => e.id === entryId);
      if (idx >= 0) { arr[idx].note = note; localStorage.setItem(TAROT_HISTORY_KEY, JSON.stringify(arr)); }
      setSaved(true);
      setTimeout(onClose, 800);
    } catch (_) {}
  }

  return (
    <AnimatePresence>
      {entryId != null && (
        <>
          <motion.div className="fixed inset-0 bg-black/60 z-[70] backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div onClick={e => e.stopPropagation()}
            className="fixed inset-x-5 top-1/2 z-[70] max-w-md mx-auto -translate-y-1/2
              bg-[#08071c] border border-indigo-600/40 rounded-3xl shadow-2xl p-5"
            initial={{ opacity: 0, scale: 0.9, y: -20 }} animate={{ opacity: 1, scale: 1, y: '-50%' }} exit={{ opacity: 0, scale: 0.9 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-indigo-100 font-semibold">📝 Ghi Chú Của Bạn</h3>
              <button onClick={onClose} className="text-indigo-400 hover:text-indigo-200 text-lg p-1">✕</button>
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value.slice(0, 500))}
              placeholder="Viết cảm nhận, suy nghĩ hoặc điều bạn muốn ghi nhớ về lần bói này..."
              rows={6}
              className="w-full bg-indigo-900/40 border border-indigo-500/30 rounded-xl px-4 py-3
                text-indigo-100 placeholder-indigo-500 focus:outline-none focus:border-indigo-400
                text-sm resize-none mb-2 transition-colors" />
            <div className="flex items-center justify-between">
              <span className="text-indigo-600 text-xs">{note.length}/500</span>
              <motion.button onClick={save} whileTap={{ scale: 0.95 }}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: saved ? 'rgba(74,222,128,0.3)' : 'linear-gradient(135deg,#4f46e5,#d97706)' }}>
                {saved ? '✅ Đã lưu' : '💾 Lưu'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
