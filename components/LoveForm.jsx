'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { getZodiacSign, getSignIndex, getZodiacAspect } from '@/lib/zodiac';

const CUR_YEAR = new Date().getFullYear();
const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                 'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const YEARS  = Array.from({ length: CUR_YEAR - 1899 }, (_, i) => CUR_YEAR - i);

const ELEMENT_COLOR = {
  fire:  { text:'text-orange-300',  ring:'rgba(251,146,60,0.5)',  glow:'rgba(251,146,60,0.15)'  },
  water: { text:'text-sky-300',     ring:'rgba(56,189,248,0.5)',  glow:'rgba(56,189,248,0.15)'  },
  earth: { text:'text-amber-300',   ring:'rgba(217,180,80,0.5)',  glow:'rgba(217,180,80,0.15)'  },
  air:   { text:'text-violet-300',  ring:'rgba(167,139,250,0.5)', glow:'rgba(167,139,250,0.15)' },
};

const TONES = [
  { id: 'tho-mong',   emoji: '💜', label: 'Thơ Mộng',   desc: 'Huyền bí, lãng mạn' },
  { id: 'hai-huoc',   emoji: '😄', label: 'Hài Hước',   desc: 'Vui tươi, dí dỏm' },
  { id: 'nghiem-tuc', emoji: '🎯', label: 'Nghiêm Túc', desc: 'Chân thành, thực tế' },
];

function getError(field, label) {
  const map = {
    name:  `Tên của ${label} cũng không biết mà đòi yêu người ta 😤`,
    day:   `Ngày sinh của ${label} cũng không biết mà đòi yêu người ta 😤`,
    month: `Tháng sinh của ${label} cũng không biết mà đòi yêu người ta 😤`,
    year:  `Năm sinh của ${label} cũng không biết mà đòi yêu người ta 😤`,
  };
  return map[field] ?? `Vui lòng nhập đầy đủ thông tin cho ${label}.`;
}

// Mũi tên nhỏ thay cho mũi tên gốc của <select> (đã bị ẩn bởi appearance-none) —
// nếu không có gì thay thế, ô chọn nhìn không khác gì một ô text thường.
function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
      <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DobSegment({ value, onChange, options, placeholder, flexGrow, disabled, accent }) {
  return (
    <div className="relative flex-1" style={{ flexGrow }}>
      <select value={value ?? ''} onChange={e => onChange(+e.target.value || '')}
        disabled={disabled}
        className={`w-full bg-transparent border-none rounded-none px-2.5 py-3 pr-6 text-sm
          focus:outline-none appearance-none cursor-pointer disabled:opacity-50 truncate
          ${value ? 'text-violet-100' : 'text-violet-500'}`}>
        <option value="" className="bg-[#15092e]">{placeholder}</option>
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-[#15092e]">{o.label}</option>
        ))}
      </select>
      <span className={value ? accent.text : 'text-violet-600'}><Chevron /></span>
    </div>
  );
}

function ZodiacMedallion({ sign, accent }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border self-start"
      style={{ borderColor: accent.ring, background: accent.glow }}>
      <span className="text-xl leading-none">{sign.symbol}</span>
      <div className="leading-tight">
        <p className={`text-xs font-semibold ${accent.text}`}>{sign.name}</p>
        <p className="text-violet-500 text-[10px]">{sign.ruling}</p>
      </div>
    </motion.div>
  );
}

function PersonField({ emoji, label, name, onName, dob, onDob, disabled, accentBorder }) {
  const sign = useMemo(() => {
    if (!dob.day || !dob.month) return null;
    return getZodiacSign(dob.day, dob.month);
  }, [dob.day, dob.month]);
  const accent = sign ? ELEMENT_COLOR[sign.element] : ELEMENT_COLOR.air;

  return (
    <motion.div
      className="relative flex flex-col gap-3 p-5 rounded-2xl border bg-violet-950/40 backdrop-blur-sm overflow-hidden"
      style={{ borderColor: accentBorder }}
      whileHover={{ borderColor: 'rgba(236,72,153,0.55)' }} transition={{ duration: 0.2 }}>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span className="text-violet-300 font-semibold tracking-wide text-sm uppercase">{label}</span>
        </div>
        <AnimatePresence>
          {sign && <ZodiacMedallion sign={sign} accent={accent} />}
        </AnimatePresence>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-violet-400 text-xs mb-1.5 block">Tên</label>
          <input type="text" value={name} onChange={e => onName(e.target.value)}
            placeholder="Nhập tên..." disabled={disabled} maxLength={50}
            className="w-full bg-violet-900/40 border border-violet-500/30 rounded-xl px-4 py-3
                       text-violet-100 placeholder-violet-500 focus:outline-none focus:border-violet-400
                       transition-colors text-sm disabled:opacity-50" />
        </div>
        <div>
          <label className="text-violet-400 text-xs mb-1.5 block">Ngày sinh</label>
          <div className="flex items-stretch rounded-xl border border-violet-500/30 bg-violet-900/40
            divide-x divide-violet-700/40 focus-within:border-violet-400 transition-colors">
            <DobSegment value={dob.day}   onChange={d => onDob({ ...dob, day: d })}
              options={DAYS.map(d => ({ value:d, label:d }))} placeholder="Ngày" flexGrow={1} disabled={disabled} accent={accent} />
            <DobSegment value={dob.month} onChange={m => onDob({ ...dob, month: m })}
              options={MONTHS.map((m,i) => ({ value:i+1, label:m }))} placeholder="Tháng" flexGrow={2} disabled={disabled} accent={accent} />
            <DobSegment value={dob.year}  onChange={y => onDob({ ...dob, year: y })}
              options={YEARS.map(y => ({ value:y, label:y }))} placeholder="Năm" flexGrow={1.4} disabled={disabled} accent={accent} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const EMPTY_DOB = { day: '', month: '', year: '' };

export default function LoveForm({ onSubmit, loading }) {
  const [nameA, setNameA] = useState('');
  const [dobA, setDobA]   = useState(EMPTY_DOB);
  const [nameB, setNameB] = useState('');
  const [dobB, setDobB]   = useState(EMPTY_DOB);
  const [tone, setTone]   = useState('tho-mong');
  const [error, setError] = useState('');

  const signA = dobA.day && dobA.month ? getZodiacSign(dobA.day, dobA.month) : null;
  const signB = dobB.day && dobB.month ? getZodiacSign(dobB.day, dobB.month) : null;

  // Gợi ý nhỏ về sự hòa hợp nguyên tố — chỉ để tạo cảm giác "sống" cho form,
  // điểm số thật sẽ được tính đầy đủ (Ngũ Hành + Can Chi + Số học) sau khi gửi.
  const teaser = useMemo(() => {
    if (!signA || !signB) return null;
    const idxA = getSignIndex(signA), idxB = getSignIndex(signB);
    const aspect = getZodiacAspect(idxA, idxB);
    return `${aspect.emoji} ${aspect.meaning}`;
  }, [signA, signB]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const lA = 'người thứ nhất', lB = 'người thứ hai';
    if (!nameA.trim())      return setError(getError('name', lA));
    if (!dobA.day)          return setError(getError('day', lA));
    if (!dobA.month)        return setError(getError('month', lA));
    if (!dobA.year)         return setError(getError('year', lA));
    if (!nameB.trim())      return setError(getError('name', lB));
    if (!dobB.day)          return setError(getError('day', lB));
    if (!dobB.month)        return setError(getError('month', lB));
    if (!dobB.year)         return setError(getError('year', lB));
    onSubmit({ personA: { name: nameA.trim(), ...dobA }, personB: { name: nameB.trim(), ...dobB }, tone });
  }

  const isReady = nameA.trim() && dobA.day && dobA.month && dobA.year &&
                  nameB.trim() && dobB.day && dobB.month && dobB.year;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }} className="w-full max-w-lg mx-auto">
      <div className="text-center mb-7">
        <div className="flex items-center justify-center gap-3 mb-2.5">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-violet-500/50" />
          <span className="text-violet-400 text-xs tracking-[0.2em] uppercase">Tiên Tri</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-violet-500/50" />
        </div>
        <h2 className="text-violet-100 text-2xl font-bold mb-1.5"
          style={{ background:'linear-gradient(135deg,#ffd6e8,#f472b6,#be185d)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
          Hai Tâm Hồn, Một Câu Hỏi
        </h2>
        <p className="text-violet-400 text-sm">Nhập tên và ngày sinh, để vũ trụ lên tiếng</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <PersonField emoji="💜" label="Người Thứ Nhất" accentBorder="rgba(190,24,93,0.3)"
          name={nameA} onName={setNameA} dob={dobA} onDob={setDobA} disabled={loading} />

        <div className="flex flex-col items-center gap-1.5 py-0.5">
          <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-px bg-violet-700/40" />
            <span className="text-violet-400 text-lg">💫</span>
            <div className="flex-1 h-px bg-violet-700/40" />
          </div>
          <AnimatePresence>
            {teaser && (
              <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="text-violet-400 text-xs text-center px-4">
                {teaser}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <PersonField emoji="🌹" label="Người Thứ Hai" accentBorder="rgba(236,72,153,0.3)"
          name={nameB} onName={setNameB} dob={dobB} onDob={setDobB} disabled={loading} />

        {/* Tone selector */}
        <div>
          <p className="text-violet-400 text-xs mb-2 text-center uppercase tracking-wide">Chọn giọng tiên tri</p>
          <div className="grid grid-cols-3 gap-2">
            {TONES.map(t => {
              const active = tone === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setTone(t.id)}
                  className={`relative py-3 px-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    active
                      ? 'border-violet-400 bg-violet-800/50'
                      : 'border-violet-700/40 bg-violet-950/30 hover:border-violet-500/60'
                  }`}
                  style={active ? { boxShadow: '0 0 0 1px rgba(236,72,153,0.3), 0 0 18px rgba(236,72,153,0.25)' } : undefined}>
                  <span className="text-xl leading-none">{t.emoji}</span>
                  <span className={`text-xs font-medium ${active ? 'text-violet-100' : 'text-violet-400'}`}>{t.label}</span>
                  <span className="text-[10px] text-violet-500 leading-tight">{t.desc}</span>
                  {active && (
                    <motion.span layoutId="tone-dot" className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pink-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-pink-400 text-sm text-center bg-pink-950/30 rounded-xl py-2 px-4 border border-pink-500/20">
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button type="submit" disabled={loading || !isReady}
          whileHover={isReady && !loading ? { scale: 1.02 } : {}} whileTap={isReady && !loading ? { scale: 0.98 } : {}}
          className="w-full py-4 rounded-2xl font-semibold text-white tracking-wide text-base
                     disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          style={{
            background: isReady && !loading ? 'linear-gradient(135deg,#be185d,#ec4899,#f472b6)' : 'rgba(157,23,77,0.3)',
            boxShadow:  isReady && !loading ? '0 0 30px rgba(236,72,153,0.35)' : 'none',
          }}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">🔮</motion.span>
              Đang đọc những vì sao...
            </span>
          ) : '✨ Hỏi Tiên Tri'}
        </motion.button>
      </form>
      <p className="text-violet-500 text-xs text-center mt-4">
        Chỉ để giải trí · Tiên Tri thấy, nhưng số phận là do bạn viết
      </p>
    </motion.div>
  );
}
