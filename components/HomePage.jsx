'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CrystalBall from './CrystalBall';
import StarryBackground from './StarryBackground';

const GAMES = [
  {
    emoji: '💜',
    title: 'Xem Bói Tình Yêu',
    desc: 'Khám phá mức độ tương hợp theo cung hoàng đạo, con số đường đời & vũ trụ',
    badge: '✨ Đang mở',
    badgeStyle: { background: 'rgba(190,24,93,0.3)', color: '#fbcfe8', borderColor: 'rgba(236,72,153,0.4)' },
    cardStyle: {
      background: 'linear-gradient(135deg,rgba(157,23,77,0.25),rgba(236,72,153,0.15))',
      borderColor: 'rgba(236,72,153,0.4)',
    },
    href: '/boi',
    available: true,
  },
  {
    emoji: '🎴',
    title: 'Bài Tarot',
    desc: 'Rút bài & nhận thông điệp từ vũ trụ về tình yêu, sự nghiệp và cuộc sống',
    badge: '✨ Đang mở',
    badgeStyle: { background: 'rgba(67,56,202,0.35)', color: '#fde9ae', borderColor: 'rgba(217,119,6,0.4)' },
    cardStyle: {
      background: 'linear-gradient(135deg,rgba(49,46,129,0.3),rgba(180,83,9,0.15))',
      borderColor: 'rgba(217,119,6,0.35)',
    },
    href: '/tarot',
    available: true,
  },
];

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <StarryBackground theme="home" />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-10">

        {/* Header — crystal ball + title */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <CrystalBall size={160} glowing pulsing />
          </motion.div>

          <div>
            <h1
              className="text-5xl sm:text-6xl font-bold tracking-tight mb-2"
              style={{
                background: 'linear-gradient(135deg,#e9d5ff,#f9a8d4,#c4b5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              ✨ Tiên Tri
            </h1>
            <p className="text-violet-400 text-base">Chọn hành trình huyền bí của bạn</p>
          </div>
        </motion.div>

        {/* Game cards */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md"
        >
          {GAMES.map((game, i) => {
            const inner = (
              <>
                <span className="text-5xl mb-3 block">{game.emoji}</span>
                <h3 className="text-violet-100 font-bold text-lg mb-1.5">{game.title}</h3>
                <p className="text-violet-400 text-xs leading-relaxed mb-4">{game.desc}</p>
                <span
                  className="inline-block text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={game.badgeStyle}
                >
                  {game.badge}
                </span>
              </>
            );

            if (game.available) {
              return (
                <motion.button
                  key={i}
                  onClick={() => router.push(game.href)}
                  whileHover={{ scale: 1.03, boxShadow: '0 0 44px rgba(167,139,250,0.35)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col items-center text-center p-6 rounded-2xl border transition-all"
                  style={game.cardStyle}
                >
                  {inner}
                </motion.button>
              );
            }

            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-2xl border opacity-50 cursor-not-allowed"
                style={game.cardStyle}
              >
                {inner}
              </div>
            );
          })}
        </motion.div>

        {/* Floating runes */}
        {['💫', '🌙', '⭐', '🔮', '✨'].map((r, i) => (
          <motion.span
            key={i}
            className="fixed text-xl pointer-events-none select-none"
            style={{ left: `${8 + i * 20}%`, top: `${18 + (i % 3) * 24}%`, opacity: 0.2 }}
            animate={{ y: [0, -18, 0], opacity: [0.12, 0.3, 0.12], rotate: [0, 12, 0] }}
            transition={{ duration: 3.2 + i * 0.6, repeat: Infinity, delay: i * 0.45, ease: 'easeInOut' }}
          >
            {r}
          </motion.span>
        ))}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-violet-600 text-xs text-center"
        >
          Chỉ để giải trí · Số phận là do bạn viết
        </motion.p>
      </main>
    </>
  );
}
