'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAROT_DECK, getCardImageUrl } from '@/lib/data/tarot-deck';

const QUIZ_LEN = 10;

function pickRand(arr, n) {
  const pool = [...arr];
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function buildQuestions() {
  const cards = pickRand(TAROT_DECK, QUIZ_LEN);
  return cards.map(correct => {
    const type = Math.random() < 0.5 ? 'name' : 'keyword';
    // 3 lá nhiễu: khác arcana không bắt buộc, chỉ cần khác ID
    const distractors = pickRand(TAROT_DECK.filter(c => c.id !== correct.id), 3);
    const choices = pickRand([correct, ...distractors], 4);

    if (type === 'name') {
      return {
        type,
        prompt: `Lá bài này tên gì?`,
        image: getCardImageUrl(correct),
        choices: choices.map(c => c.nameVn),
        answer:  correct.nameVn,
      };
    }
    // keyword: đưa tên lá, hỏi từ khoá đúng
    const correctKw  = correct.keywords[0];
    const wrongKws   = distractors.map(c => c.keywords[0]);
    const kwChoices  = pickRand([correctKw, ...wrongKws], 4);
    return {
      type,
      prompt: `Lá "${correct.nameVn}" mang ý nghĩa nào sau đây?`,
      image: getCardImageUrl(correct),
      choices: kwChoices,
      answer: correctKw,
    };
  });
}

export default function TarotQuiz({ open, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [score,     setScore]     = useState(0);
  const [phase,     setPhase]     = useState('idle'); // idle | playing | done

  const start = useCallback(() => {
    setQuestions(buildQuestions());
    setCurrent(0); setSelected(null); setScore(0); setPhase('playing');
  }, []);

  function choose(opt) {
    if (selected !== null) return;
    setSelected(opt);
    const q = questions[current];
    if (opt === q.answer) setScore(s => s + 1);
  }

  function next() {
    setSelected(null);
    if (current + 1 >= questions.length) { setPhase('done'); return; }
    setCurrent(c => c + 1);
  }

  const q = questions[current];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-black/65 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div className="fixed inset-x-3 top-5 bottom-5 z-50 max-w-md mx-auto flex flex-col
            bg-[#08071c] border border-indigo-600/40 rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-700/30">
              <h3 className="text-indigo-100 font-semibold">🎮 Đố Vui Tarot</h3>
              <button onClick={onClose} className="text-indigo-400 hover:text-indigo-200 text-lg p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {phase === 'idle' && (
                <div className="flex flex-col items-center justify-center h-full gap-6 text-center py-8">
                  <div className="text-6xl">🎴</div>
                  <div>
                    <p className="text-indigo-100 font-semibold text-lg mb-2">Kiểm tra kiến thức Tarot</p>
                    <p className="text-indigo-400 text-sm">{QUIZ_LEN} câu · Nhận dạng lá bài & từ khoá</p>
                  </div>
                  <motion.button onClick={start} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="px-8 py-3.5 rounded-2xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#d97706)' }}>
                    Bắt Đầu
                  </motion.button>
                </div>
              )}

              {phase === 'playing' && q && (
                <AnimatePresence mode="wait">
                  <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-500 text-xs">{current + 1} / {QUIZ_LEN}</span>
                      <span className="text-amber-400 text-xs font-semibold">⭐ {score} điểm</span>
                    </div>
                    <div className="w-20 h-32 mx-auto rounded-xl bg-[#fbf6ec] p-1.5 shadow-lg">
                      <img src={q.image} alt="" className="w-full h-full object-contain" draggable={false} />
                    </div>
                    <p className="text-indigo-200 text-sm text-center font-medium">{q.prompt}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {q.choices.map(opt => {
                        let cls = 'border-indigo-700/30 bg-indigo-950/40 text-indigo-300 hover:border-indigo-500/60';
                        if (selected !== null) {
                          if (opt === q.answer)      cls = 'border-green-400/60 bg-green-900/30 text-green-300';
                          else if (opt === selected) cls = 'border-red-400/60 bg-red-900/30 text-red-300';
                          else                       cls = 'border-indigo-800/20 bg-indigo-950/20 text-indigo-600 opacity-50';
                        }
                        return (
                          <button key={opt} onClick={() => choose(opt)}
                            className={`py-2.5 px-3 rounded-xl border text-xs text-center transition-all active:scale-95 ${cls}`}>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {selected !== null && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="text-center">
                        <p className="text-indigo-400 text-xs mb-3">
                          {selected === q.answer ? '✅ Chính xác!' : `❌ Đáp án đúng: ${q.answer}`}
                        </p>
                        <button onClick={next}
                          className="px-6 py-2.5 rounded-xl text-sm font-medium border border-indigo-500/40 text-indigo-200 hover:bg-indigo-900/40 transition-all">
                          {current + 1 < QUIZ_LEN ? 'Câu tiếp →' : 'Xem kết quả'}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              {phase === 'done' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full gap-5 text-center py-8">
                  <div className="text-5xl">
                    {score >= 8 ? '🏆' : score >= 5 ? '🎯' : '📚'}
                  </div>
                  <div>
                    <p className="text-indigo-100 font-bold text-2xl mb-1">{score} / {QUIZ_LEN}</p>
                    <p className="text-indigo-400 text-sm">
                      {score >= 8 ? 'Xuất sắc! Bạn thực sự giỏi Tarot.' : score >= 5 ? 'Tốt! Tiếp tục luyện nhé.' : 'Cần luyện thêm — thư viện 78 lá chờ bạn!'}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={start}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                      style={{ background: 'linear-gradient(135deg,#4f46e5,#d97706)' }}>
                      Chơi Lại
                    </button>
                    <button onClick={onClose}
                      className="px-5 py-2.5 rounded-xl text-sm font-medium border border-indigo-500/40 text-indigo-300">
                      Đóng
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
