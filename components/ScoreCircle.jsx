'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function ScoreCircle({ score, level }) {
  const [displayed, setDisplayed] = useState(0);
  const circumference = 2 * Math.PI * 54;

  useEffect(() => {
    const controls = animate(0, score, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: v => setDisplayed(Math.round(v)),
    });
    return controls.stop;
  }, [score]);

  const offset = circumference - (displayed / 100) * circumference;

  const scoreColor = score >= 80 ? '#f9a8d4' : score >= 60 ? '#a78bfa' : score >= 40 ? '#818cf8' : '#93c5fd';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          {/* Background track */}
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(109,40,217,0.25)" strokeWidth="8" />
          {/* Progress arc */}
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke={scoreColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white" style={{ textShadow: `0 0 20px ${scoreColor}` }}>
            {displayed}
          </span>
          <span className="text-violet-300 text-xs">/ 100</span>
        </div>
      </div>

      <div className="text-center">
        <span className="text-2xl">{level.emoji}</span>
        <p className="text-violet-200 font-semibold mt-1">{level.label}</p>
      </div>
    </div>
  );
}
