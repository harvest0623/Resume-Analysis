import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  phase: number;
  speed: number;
  life: number;
  maxLife: number;
  trail: { x: number; y: number }[];
}

interface EnergyWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
  speed: number;
}

const COLORS = [
  "99, 102, 241",
  "168, 85, 247",
  "59, 130, 246",
  "236, 72, 153",
  "34, 211, 238",
  "139, 92, 246",
  "56, 189, 248",
  "244, 114, 182",
];

interface Props {
  active?: boolean;
}

export default function CompareParticleEffect({ active = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<EnergyWave[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const mouseTrailRef = useRef<{ x: number; y: number; opacity: number }[]>([]);
  const rafRef = useRef<number>(0);
  const activeRef = useRef(active);
  const frameRef = useRef(0);

  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particleCount = Math.min(120, Math.floor(window.innerWidth / 12));

    // 多个扩散源点
    const spawnPoints = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3 },
      { x: canvas.width * 0.8, y: canvas.height * 0.3 },
      { x: canvas.width * 0.5, y: canvas.height * 0.7 },
      { x: canvas.width * 0.3, y: canvas.height * 0.6 },
      { x: canvas.width * 0.7, y: canvas.height * 0.5 },
    ];

    particlesRef.current = Array.from({ length: particleCount }, () => {
      const sp = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 150 + 30;
      return {
        x: sp.x + Math.cos(angle) * dist,
        y: sp.y + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 3.5 + 1,
        opacity: Math.random() * 0.7 + 0.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.008,
        life: Math.random(),
        maxLife: 1,
        trail: [],
      };
    });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      mouseTrailRef.current.push({ x: e.clientX, y: e.clientY, opacity: 1 });
      if (mouseTrailRef.current.length > 30) {
        mouseTrailRef.current.shift();
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleClick = (e: MouseEvent) => {
      // 点击时产生能量波
      wavesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 300,
        opacity: 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 4,
      });
    };
    window.addEventListener("click", handleClick);

    const animate = () => {
      frameRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const waves = wavesRef.current;
      const isActive = activeRef.current;
      const time = frameRef.current * 0.016;

      // === 绘制鼠标拖尾 ===
      const trail = mouseTrailRef.current;
      for (let i = 0; i < trail.length; i++) {
        trail[i].opacity -= 0.02;
        if (trail[i].opacity <= 0) continue;
        const t = trail[i];
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3 * t.opacity, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${t.opacity * 0.6})`;
        ctx.fill();

        // 拖尾光晕
        ctx.beginPath();
        ctx.arc(t.x, t.y, 12 * t.opacity, 0, Math.PI * 2);
        const tg = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, 12 * t.opacity);
        tg.addColorStop(0, `rgba(139, 92, 246, ${t.opacity * 0.3})`);
        tg.addColorStop(1, `rgba(139, 92, 246, 0)`);
        ctx.fillStyle = tg;
        ctx.fill();
      }
      mouseTrailRef.current = trail.filter(t => t.opacity > 0);

      // === 绘制能量波 ===
      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i];
        w.radius += w.speed * 0.6;
        w.opacity -= 0.005;

        if (w.opacity <= 0 || w.radius > w.maxRadius) {
          waves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${w.color}, ${w.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 内圈光晕
        ctx.beginPath();
        ctx.arc(w.x, w.y, w.radius * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${w.color}, ${w.opacity * 0.3})`;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // === 自动产生扩散波（活跃模式） ===
      if (isActive && frameRef.current % 120 === 0) {
        const sp = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
        waves.push({
          x: sp.x + (Math.random() - 0.5) * 200,
          y: sp.y + (Math.random() - 0.5) * 200,
          radius: 0,
          maxRadius: 250,
          opacity: 0.3,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          speed: 2,
        });
      }

      // === 更新和绘制粒子 ===
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.phase += p.speed;
        p.life += 0.002;
        if (p.life > p.maxLife) p.life = 0;

        // 扩散运动：粒子围绕源点做利萨如曲线运动
        const amplitude = isActive ? 100 : 60;
        const waveX = Math.sin(p.phase) * amplitude;
        const waveY = Math.cos(p.phase * 0.73 + i * 0.1) * amplitude * 0.7;

        // 找最近的源点
        let nearestSP = spawnPoints[0];
        let minDist = Infinity;
        for (const sp of spawnPoints) {
          const d = Math.hypot(p.x - sp.x, p.y - sp.y);
          if (d < minDist) { minDist = d; nearestSP = sp; }
        }

        const targetX = nearestSP.x + waveX;
        const targetY = nearestSP.y + waveY;

        p.vx += (targetX - p.x) * 0.002;
        p.vy += (targetY - p.y) * 0.002;

        // 鼠标交互：靠近时粒子被吸引或排斥
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200;
          if (isActive) {
            // 活跃模式：轻微吸引
            p.vx -= (dx / dist) * force * 0.3;
            p.vy -= (dy / dist) * force * 0.3;
          } else {
            // 普通模式：排斥
            p.vx += (dx / dist) * force * 0.6;
            p.vy += (dy / dist) * force * 0.6;
          }
        }

        // 能量波推动粒子
        for (const w of waves) {
          const wdx = p.x - w.x;
          const wdy = p.y - w.y;
          const wdist = Math.sqrt(wdx * wdx + wdy * wdy);
          if (Math.abs(wdist - w.radius) < 30) {
            const pushForce = w.opacity * 2;
            p.vx += (wdx / wdist) * pushForce;
            p.vy += (wdy / wdist) * pushForce;
          }
        }

        // 阻尼
        p.vx *= 0.99;
        p.vy *= 0.99;

        p.x += p.vx;
        p.y += p.vy;

        // 记录轨迹
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 6) p.trail.shift();

        // 生命周期脉冲
        const lifeFactor = Math.sin(p.life * Math.PI);
        const pulseRadius = p.radius + Math.sin(p.phase * 3) * 1 + lifeFactor * 2;
        const pulseOpacity = p.opacity + Math.sin(p.phase * 2) * 0.15 + lifeFactor * 0.25;

        // === 绘制粒子轨迹 ===
        if (p.trail.length > 2 && isActive) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = `rgba(${p.color}, ${Math.max(0, pulseOpacity * 0.15)})`;
          ctx.lineWidth = pulseRadius * 0.8;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // === 绘制粒子本体 ===
        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.05, Math.min(1, pulseOpacity))})`;
        ctx.fill();

        // === 绘制光晕 ===
        const glowSize = pulseRadius * (isActive ? 6 : 4);
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, pulseRadius, p.x, p.y, glowSize);
        gradient.addColorStop(0, `rgba(${p.color}, ${Math.max(0, pulseOpacity * 0.4)})`);
        gradient.addColorStop(0.4, `rgba(${p.color}, ${Math.max(0, pulseOpacity * 0.1)})`);
        gradient.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // === 绘制粒子间连线 ===
      const connectionDist = isActive ? 160 : 120;
      const connectionAlpha = isActive ? 0.3 : 0.15;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const opacity = (1 - dist / connectionDist) * connectionAlpha;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);

            // 渐变连线
            const lineGrad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            lineGrad.addColorStop(0, `rgba(${particles[i].color}, ${opacity})`);
            lineGrad.addColorStop(1, `rgba(${particles[j].color}, ${opacity})`);
            ctx.strokeStyle = lineGrad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // === 绘制源点光晕（活跃模式） ===
      if (isActive) {
        for (const sp of spawnPoints) {
          const breathe = Math.sin(time * 1.5) * 0.3 + 0.7;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, 60 * breathe, 0, Math.PI * 2);
          const spGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, 60 * breathe);
          spGrad.addColorStop(0, `rgba(99, 102, 241, ${0.08 * breathe})`);
          spGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.04 * breathe})`);
          spGrad.addColorStop(1, `rgba(99, 102, 241, 0)`);
          ctx.fillStyle = spGrad;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0 w-full h-full"
      style={{
        opacity: active ? 1 : 0.6,
        transition: "opacity 2s ease-in-out",
      }}
    />
  );
}