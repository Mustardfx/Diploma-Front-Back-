import { useEffect, useRef } from 'react';

/**
 * Анимированный звёздный фон для космической темы:
 * дрейфующие частицы-звёзды с мерцанием + «созвездия» (линии между близкими).
 * Рендерится фиксированным canvas позади контента (z-index -1).
 */
export function CosmicBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; tw: number; ph: number };
    let parts: P[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.min(150, Math.floor((w * h) / 11000));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.04,
        r: Math.random() * 1.5 + 0.4,
        tw: Math.random() * 0.025 + 0.005,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const LINK = 130;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      // Линии между близкими частицами («созвездия»)
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        a.x += a.vx;
        a.y += a.vy;
        a.ph += a.tw;
        if (a.x < 0) a.x = w;
        else if (a.x > w) a.x = 0;
        if (a.y < 0) a.y = h;
        else if (a.y > h) a.y = 0;

        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            const al = (1 - d2 / (LINK * LINK)) * 0.16;
            ctx.strokeStyle = `rgba(139,92,246,${al})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Звёзды с мерцанием и свечением
      ctx.shadowColor = 'rgba(139,92,246,0.9)';
      for (const p of parts) {
        const tw = 0.5 + Math.sin(p.ph) * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,255,${0.35 + tw * 0.6})`;
        ctx.shadowBlur = 6 + tw * 6;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}
    />
  );
}
