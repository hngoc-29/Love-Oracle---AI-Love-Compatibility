'use client';

import { motion } from 'framer-motion';

export default function CrystalBall({ size = 200, glowing = false, pulsing = false }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow */}
      {glowing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(167,139,250,0.4) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Crystal ball SVG */}
      <motion.svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        animate={pulsing ? { scale: [1, 1.04, 1] } : {}}
        transition={pulsing ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
      >
        <defs>
          <radialGradient id="ballGrad" cx="38%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e8d5ff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#a78bfa" stopOpacity="0.8" />
            <stop offset="70%" stopColor="#7c3aed" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#3b0764" stopOpacity="1" />
          </radialGradient>

          <radialGradient id="innerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0e6ff" stopOpacity="0.6" />
            <stop offset="60%" stopColor="#c4b5fd" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="shineGrad" cx="35%" cy="28%" r="35%">
            <stop offset="0%" stopColor="white" stopOpacity="0.75" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stand base */}
        <ellipse cx="100" cy="185" rx="42" ry="8" fill="#1e1035" opacity="0.7" />
        <path d="M 72 175 Q 100 190 128 175 L 122 168 Q 100 180 78 168 Z" fill="#2d1a54" />
        <path d="M 78 168 Q 100 178 122 168 L 118 162 Q 100 172 82 162 Z" fill="#3d2570" />

        {/* Ball */}
        <circle cx="100" cy="95" r="82" fill="url(#ballGrad)" />

        {/* Swirling inner nebula */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 95px' }}
        >
          <ellipse cx="85" cy="90" rx="38" ry="18" fill="none"
            stroke="#c4b5fd" strokeWidth="1.5" strokeOpacity="0.4" />
          <ellipse cx="115" cy="100" rx="30" ry="14" fill="none"
            stroke="#a78bfa" strokeWidth="1" strokeOpacity="0.3" />
        </motion.g>

        <motion.g
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ transformOrigin: '100px 95px' }}
        >
          <ellipse cx="100" cy="95" rx="50" ry="25" fill="none"
            stroke="#7c3aed" strokeWidth="0.8" strokeOpacity="0.25" />
        </motion.g>

        {/* Stars inside */}
        {[[80, 75], [120, 85], [95, 115], [108, 68], [75, 102], [125, 108]].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx} cy={cy} r="1.5"
            fill="white"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.4, 0.8] }}
            transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, delay: i * 0.25 }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
        ))}

        {/* Inner glow overlay */}
        <circle cx="100" cy="95" r="82" fill="url(#innerGlow)" />

        {/* Shine highlight */}
        <ellipse cx="76" cy="65" rx="22" ry="14" fill="url(#shineGrad)" />

        {/* Small shimmer */}
        <motion.ellipse
          cx="125" cy="118" rx="8" ry="5"
          fill="white" opacity="0.15"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}
