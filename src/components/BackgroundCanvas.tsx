import React, { useEffect, useRef } from 'react';

interface BackgroundCanvasProps {
  particleDensity?: 'low' | 'medium' | 'high' | 'ultra';
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ particleDensity = 'high' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const countMap = {
      low: 35,
      medium: 70,
      high: 120,
      ultra: 200,
    };

    const numParticles = countMap[particleDensity] || 100;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
      pulse: number;
    }> = [];

    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#34d399'];

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.7 + 0.3,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let gridOffset = 0;

    const render = () => {
      ctx.fillStyle = '#030712'; // Deep slate blue black
      ctx.fillRect(0, 0, width, height);

      // Draw perspective background grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1;

      gridOffset = (gridOffset + 0.3) % 40;

      // Vertical perspective lines
      const cx = width / 2;
      const cy = height * 0.3;

      for (let x = -width; x < width * 2; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(cx + (x - cx) * 0.2, cy);
        ctx.stroke();
      }

      // Horizontal moving grid lines
      for (let y = height; y > cy; y -= 35) {
        const lineY = y - (gridOffset % 35);
        if (lineY > cy) {
          ctx.beginPath();
          ctx.moveTo(0, lineY);
          ctx.lineTo(width, lineY);
          ctx.stroke();
        }
      }

      // Atmospheric gradient glows
      const radialGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.8);
      radialGrad.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
      radialGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      radialGrad.addColorStop(1, 'rgba(3, 7, 18, 0)');
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw floating glowing particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.03;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.radius * 4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [particleDensity]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};
