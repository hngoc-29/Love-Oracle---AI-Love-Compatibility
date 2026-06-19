'use client';

import { useEffect, useRef } from 'react';

// Giảm số lượng so với bản trước (160→70 sao, 25→12 hạt) và cache gradient
// thay vì tạo lại mỗi khung hình — đây là nguồn chính gây giật/lag trên mobile,
// vì createRadialGradient/createLinearGradient khá tốn và trước đây bị gọi
// lại 60 lần/giây vô thời hạn dù nền trời không hề thay đổi.
const STAR_COUNT = 70;
const PARTICLE_COUNT = 12;

// 3 sắc thái riêng cho 3 khu vực — cùng một "vũ trụ sao" nhưng đổi tâm trạng:
// home = trung tính (mặc định), love = ấm/hồng (đam mê), tarot = lạnh/vàng kim (huyền bí cổ xưa).
const THEMES = {
  home: {
    bg: ['#0a0314', '#0f0a2e', '#1a0533'],
    moonGlow: 'rgba(253,230,138,0.12)', moonBody: '#fef9c3', moonShadow: '#0f0a2e',
    star: [255, 255, 255],
    particleA: [196, 181, 253], particleB: [249, 168, 212],
  },
  love: {
    bg: ['#190512', '#2d0a28', '#3a0f30'],
    moonGlow: 'rgba(251,113,160,0.16)', moonBody: '#ffe1ec', moonShadow: '#2d0a28',
    star: [255, 241, 245],
    particleA: [251, 168, 200], particleB: [232, 121, 249],
  },
  tarot: {
    bg: ['#04030d', '#0a0a26', '#120b30'],
    moonGlow: 'rgba(251,191,36,0.15)', moonBody: '#fde9ae', moonShadow: '#0a0a26',
    star: [226, 232, 255],
    particleA: [165, 180, 252], particleB: [251, 191, 36],
  },
};

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function StarryBackground({ theme = 'home' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const palette = THEMES[theme] ?? THEMES.home;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    let animId;
    let stars = [];
    let particles = [];
    let bgGradient = null;
    let moonGlow = null;
    let moonX = 0, moonY = 0;

    function buildCachedGradients() {
      bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, palette.bg[0]);
      bgGradient.addColorStop(0.4, palette.bg[1]);
      bgGradient.addColorStop(1, palette.bg[2]);

      moonX = canvas.width * 0.82;
      moonY = canvas.height * 0.12;
      moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 90);
      moonGlow.addColorStop(0, palette.moonGlow);
      moonGlow.addColorStop(1, 'transparent');
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildCachedGradients();
    }

    function initStars() {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: randomBetween(0.3, 2.2),
        opacity: randomBetween(0.3, 1),
        twinkleSpeed: randomBetween(0.005, 0.02),
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      }));

      particles = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: randomBetween(1, 3),
        vx: randomBetween(-0.15, 0.15),
        vy: randomBetween(-0.25, -0.05),
        opacity: randomBetween(0.2, 0.6),
        isA: Math.random() > 0.5,
      }));
    }

    function draw(t) {
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Moon (glow cached, only the two solid arcs are redrawn — both cheap)
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(moonX, moonY, 32, 0, Math.PI * 2);
      ctx.fillStyle = palette.moonBody;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(moonX + 12, moonY - 4, 26, 0, Math.PI * 2);
      ctx.fillStyle = palette.moonShadow;
      ctx.fill();

      // Stars
      const [sr, sg, sb] = palette.star;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.opacity += star.twinkleSpeed * star.twinkleDir;
        if (star.opacity >= 1) { star.twinkleDir = -1; star.opacity = 1; }
        if (star.opacity <= 0.2) { star.twinkleDir = 1; star.opacity = 0.2; }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sr},${sg},${sb},${star.opacity})`;
        ctx.fill();
      }

      // Floating particles
      const [ar, ag, ab] = palette.particleA;
      const [br_, bg_, bb] = palette.particleB;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.opacity += Math.sin(t * 0.001 + p.x) * 0.003;
        p.opacity = Math.max(0.1, Math.min(0.7, p.opacity));

        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isA ? `rgba(${ar},${ag},${ab},${p.opacity})` : `rgba(${br_},${bg_},${bb},${p.opacity})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    let resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); initStars(); }, 150);
    }

    resize();
    initStars();
    animId = requestAnimationFrame(draw);

    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
