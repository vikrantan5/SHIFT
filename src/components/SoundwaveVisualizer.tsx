import { useEffect, useRef, useState } from 'react';

interface SoundwaveVisualizerProps {
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  showFrequency?: boolean;
}

export default function SoundwaveVisualizer({
  isActive = false,
  size = 'medium',
  showFrequency = false
}: SoundwaveVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [frequency, setFrequency] = useState<number>(18500);

  const sizeMap = {
    small: 200,
    medium: 300,
    large: 400,
  };

  const canvasSize = sizeMap[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let phase = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numRings = 5;
      const maxRadius = Math.min(centerX, centerY) - 20;

      for (let i = 0; i < numRings; i++) {
        const progress = i / numRings;
        const radius = maxRadius * progress;
        const alpha = isActive ? (1 - progress) * 0.6 : (1 - progress) * 0.3;
        const pulseOffset = isActive ? Math.sin(phase + i * 0.5) * 10 : 0;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + pulseOffset, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        const gradient = ctx.createRadialGradient(
          centerX, centerY, radius * 0.8,
          centerX, centerY, radius
        );
        gradient.addColorStop(0, `rgba(6, 182, 212, ${alpha * 0.1})`);
        gradient.addColorStop(1, `rgba(168, 85, 247, ${alpha * 0.05})`);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      if (isActive) {
        const numWaves = 12;
        for (let i = 0; i < numWaves; i++) {
          const angle = (i / numWaves) * Math.PI * 2;
          const waveLength = 30 + Math.sin(phase * 2 + i) * 10;
          const startX = centerX + Math.cos(angle) * 40;
          const startY = centerY + Math.sin(angle) * 40;
          const endX = centerX + Math.cos(angle) * (40 + waveLength);
          const endY = centerY + Math.sin(angle) * (40 + waveLength);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 + Math.sin(phase + i) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
      ctx.fillStyle = isActive
        ? `rgba(6, 182, 212, ${0.8 + Math.sin(phase * 3) * 0.2})`
        : 'rgba(6, 182, 212, 0.4)';
      ctx.fill();

      ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      phase += isActive ? 0.05 : 0.02;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, canvasSize]);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setFrequency(18000 + Math.random() * 2000);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="drop-shadow-2xl"
      />
      {showFrequency && (
        <div className="absolute bottom-0 text-cyan-400 text-sm font-mono">
          {isActive ? `${frequency.toFixed(0)} Hz` : 'Standby'}
        </div>
      )}
    </div>
  );
}
