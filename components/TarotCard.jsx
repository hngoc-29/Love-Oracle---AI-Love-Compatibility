'use client';
import { motion } from 'framer-motion';
import { getCardImageUrl } from '@/lib/data/tarot-deck';

// Mặt sau lá bài — thiết kế gốc của dự án (không sao chép bộ bài nào).
export function CardBack({ className }) {
  return (
    <svg viewBox="0 0 300 500" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cb-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#140c30" />
          <stop offset="55%" stopColor="#1c1455" />
          <stop offset="100%" stopColor="#0d0a26" />
        </linearGradient>
        <radialGradient id="cb-glow" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="rgba(251,191,36,0.30)" />
          <stop offset="100%" stopColor="rgba(251,191,36,0)" />
        </radialGradient>
      </defs>
      <rect width="300" height="500" rx="18" fill="url(#cb-bg)" />
      <rect x="10" y="10" width="280" height="480" rx="12" fill="none" stroke="rgba(251,211,141,0.35)" strokeWidth="2" />
      <rect x="18" y="18" width="264" height="464" rx="8" fill="none" stroke="rgba(251,211,141,0.18)" strokeWidth="1" />
      <circle cx="150" cy="210" r="120" fill="url(#cb-glow)" />
      {/* Vòng tròn ngôi sao 8 cánh trung tâm */}
      <g stroke="rgba(251,191,36,0.85)" strokeWidth="1.5" fill="none">
        <circle cx="150" cy="210" r="58" />
        <circle cx="150" cy="210" r="40" />
      </g>
      <g fill="rgba(251,191,36,0.9)">
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * 45) * Math.PI / 180;
          const x = 150 + 58 * Math.cos(a), y = 210 + 58 * Math.sin(a);
          return <circle key={i} cx={x} cy={y} r="3" />;
        })}
      </g>
      {/* Trăng lưỡi liềm — 2 vòng tròn lệch tâm + fill-rule evenodd để tạo lưỡi liềm thật
          (cách dùng 1 path với 2 cung nối nhau từng không tạo được vùng có thể tô màu) */}
      <path fillRule="evenodd" fill="rgba(224,231,255,0.92)" d="
        M150,177 a33,33 0 0,1 0,66 a33,33 0 0,1 0,-66 Z
        M165,180 a30,30 0 0,1 0,60 a30,30 0 0,1 0,-60 Z" />
      {/* Tia sao quanh viền */}
      <g fill="rgba(199,210,254,0.5)">
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * 30) * Math.PI / 180;
          const r = 200;
          const x = 150 + r * Math.cos(a), y = 250 + r * Math.sin(a) * 0.92;
          if (y < 40 || y > 460) return null;
          return <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.4} />;
        })}
      </g>
      <text x="150" y="410" textAnchor="middle" fontSize="13" letterSpacing="3"
        fill="rgba(251,211,141,0.6)" fontFamily="serif">TIÊN TRI</text>
      <text x="150" y="430" textAnchor="middle" fontSize="9" letterSpacing="4"
        fill="rgba(251,211,141,0.4)" fontFamily="serif">T A R O T</text>
    </svg>
  );
}

/**
 * faceUp: lá đang lật mặt trước hay chưa
 * reversed: nếu mặt trước hiển thị, có xoay 180° không (ý nghĩa "lá ngược")
 * onFlip: callback khi animation lật xong (tuỳ chọn)
 */
export default function TarotCard({ card, faceUp = false, reversed = false, size = 'md', delay = 0, onClick, highlight = false }) {
  const dims = {
    sm: 'w-16 h-28',
    md: 'w-28 h-48 sm:w-32 sm:h-56',
    lg: 'w-36 h-60 sm:w-44 sm:h-[19rem]',
  }[size] ?? 'w-28 h-48';

  return (
    <motion.div
      className={`relative ${dims} cursor-pointer`}
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ duration: 0.6, delay, ease: 'easeInOut' }}
      >
        {/* Back */}
        <div className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}>
          <CardBack className="w-full h-full" />
        </div>

        {/* Front */}
        <div
          className={`absolute inset-0 rounded-xl overflow-hidden shadow-lg bg-[#fbf6ec] flex items-center justify-center p-1.5
            ${highlight ? 'ring-2 ring-amber-400/70' : ''}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <img
            src={getCardImageUrl(card)}
            alt={card.nameVn}
            className="w-full h-full object-contain"
            style={{ transform: reversed ? 'rotate(180deg)' : 'none' }}
            draggable={false}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
