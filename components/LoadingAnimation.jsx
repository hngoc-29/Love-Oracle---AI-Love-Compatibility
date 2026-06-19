'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import CrystalBall from './CrystalBall';

const MESSAGES = [
  'Các vì sao đang kết nối...',
  'Đang đọc năng lượng giữa hai tâm hồn...',
  'Quả cầu pha lê đang tiết lộ bí mật...',
  'Đang tham khảo cuộn sách tình yêu cổ đại...',
  'Đang dệt những sợi chỉ của số phận...',
];

export default function LoadingAnimation({ startTime }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [dots,   setDots]   = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const msgT  = setInterval(() => setMsgIdx(i => (i + 1) % MESSAGES.length), 1400);
    const dotsT = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    const secT  = setInterval(() => {
      const s = Math.floor((Date.now() - (startTime ?? Date.now())) / 1000);
      setElapsed(s);
      if (s >= 12 && !retrying) setRetrying(true);
    }, 1000);
    return () => { clearInterval(msgT); clearInterval(dotsT); clearInterval(secT); };
  }, [startTime, retrying]);

  return (
    <motion.div className="flex flex-col items-center justify-center gap-8 py-12"
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.5 }}>

      <div className="relative">
        {[0,60,120,180,240,300].map((deg, i) => (
          <motion.div key={i} className="absolute w-2 h-2 rounded-full"
            style={{ background: i%2===0?'#c4b5fd':'#f9a8d4', top:'50%', left:'50%', marginTop:-4, marginLeft:-4 }}
            animate={{ x: Math.cos((deg+360)*Math.PI/180)*120, y: Math.sin((deg+360)*Math.PI/180)*120, rotate:360, opacity:[0.4,1,0.4] }}
            transition={{ duration:3, repeat:Infinity, delay:i*0.15, ease:'linear' }} />
        ))}
        <CrystalBall size={180} glowing pulsing />
      </div>

      <motion.div className="w-24 h-24 rounded-full border-2 border-violet-400/30"
        style={{ borderTopColor:'#a78bfa', borderRightColor:'#f9a8d4' }}
        animate={{ rotate: 360 }} transition={{ duration:1.8, repeat:Infinity, ease:'linear' }} />

      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.p key={msgIdx} className="text-violet-200 text-lg font-medium tracking-wide"
            initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }} transition={{ duration:0.4 }}>
            {MESSAGES[msgIdx]}{dots}
          </motion.p>
        </AnimatePresence>

        <AnimatePresence>
          {retrying && (
            <motion.p initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="text-violet-400 text-sm">
              Đang thử lại với nguồn dự phòng... ({elapsed}s)
            </motion.p>
          )}
          {!retrying && elapsed > 0 && (
            <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
              className="text-violet-500/60 text-xs">
              {elapsed}s
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {[0,1,2,3,4].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-violet-400"
            animate={{ scale:[0.6,1.2,0.6], opacity:[0.3,1,0.3] }}
            transition={{ duration:1.2, repeat:Infinity, delay:i*0.18 }} />
        ))}
      </div>
    </motion.div>
  );
}
