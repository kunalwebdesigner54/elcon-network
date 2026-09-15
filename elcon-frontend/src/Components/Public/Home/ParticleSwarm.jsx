import { useEffect, useRef } from 'react';

const LINK_DISTANCE = 165;

const createParticles = (width, height) => {
  const count = Math.max(70, Math.min(120, Math.round((width * height) / 12500)));

  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    radius: 1.2 + Math.random() * 1.65,
    opacity: 0.58 + Math.random() * 0.36,
  }));
};

export default function ParticleSwarm() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles = [];
    let frameId;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let pointer = { x: 0, y: 0, active: false };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(bounds.width, 1);
      height = Math.max(bounds.height, 1);
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = createParticles(width, height);
    };

    const trackPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      const isInside = event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom;

      pointer = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        active: isInside,
      };
    };

    const draw = (shouldMove) => {
      context.clearRect(0, 0, width, height);

      if (shouldMove) {
        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (pointer.active) {
            const distanceToPointer = Math.hypot(pointer.x - particle.x, pointer.y - particle.y);
            if (distanceToPointer < 220) {
              const pullStrength = (1 - distanceToPointer / 220) * 0.0022;
              particle.vx += (pointer.x - particle.x) * pullStrength;
              particle.vy += (pointer.y - particle.y) * pullStrength;
            }
          }

          particle.vx = Math.max(-1.1, Math.min(1.1, particle.vx));
          particle.vy = Math.max(-1.1, Math.min(1.1, particle.vy));

          if (particle.x < 0 || particle.x > width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > height) particle.vy *= -1;
          particle.x = Math.max(0, Math.min(width, particle.x));
          particle.y = Math.max(0, Math.min(height, particle.y));
        });
      }

      for (let first = 0; first < particles.length; first += 1) {
        for (let second = first + 1; second < particles.length; second += 1) {
          const a = particles[first];
          const b = particles[second];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance >= LINK_DISTANCE) continue;

          const nearPointer = pointer.active
            && (Math.hypot(a.x - pointer.x, a.y - pointer.y) < 220
              || Math.hypot(b.x - pointer.x, b.y - pointer.y) < 220);
          const opacity = (1 - distance / LINK_DISTANCE) * (nearPointer ? 0.95 : 0.72);
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.strokeStyle = `rgba(216, 180, 254, ${opacity})`;
          context.lineWidth = 1;
          context.stroke();
        }
      }

      particles.forEach((particle, index) => {
        const color = index % 3 === 0 ? '147, 197, 253' : '255, 255, 255';
        const closeToPointer = pointer.active && Math.hypot(particle.x - pointer.x, particle.y - pointer.y) < 220;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius + (closeToPointer ? 1.15 : 0), 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, ${closeToPointer ? 1 : particle.opacity})`;
        context.fill();
      });

      if (pointer.active) {
        context.beginPath();
        context.arc(pointer.x, pointer.y, 3.5, 0, Math.PI * 2);
        context.fillStyle = 'rgba(255, 255, 255, 0.95)';
        context.fill();
      }
    };

    const animate = () => {
      draw(true);
      frameId = window.requestAnimationFrame(animate);
    };

    const setMotion = () => {
      window.cancelAnimationFrame(frameId);
      if (reduceMotion.matches) {
        draw(false);
      } else {
        animate();
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    setMotion();
    window.addEventListener('pointermove', trackPointer);
    reduceMotion.addEventListener('change', setMotion);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      window.removeEventListener('pointermove', trackPointer);
      reduceMotion.removeEventListener('change', setMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className="home-banner-particle-canvas" aria-hidden="true" />;
}
