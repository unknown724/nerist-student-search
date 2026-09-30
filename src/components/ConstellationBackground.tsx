import { useEffect, useRef } from 'react';

interface ConstellationBackgroundProps {
  /** Container-relative — rendered as position:absolute inside its parent */
  className?: string;
  /** Node count (default: 60) */
  nodeCount?: number;
  /** Max connection distance in px (default: 120) */
  connectionDistance?: number;
  /** Node color (default: rgba(201,168,79,0.6)) */
  nodeColor?: string;
  /** Line color (default: rgba(201,168,79,0.12)) */
  lineColor?: string;
}

interface StarNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export default function ConstellationBackground({
  className = '',
  nodeCount = 55,
  connectionDistance = 110,
  nodeColor = 'rgba(201,168,79,0.55)',
  lineColor = 'rgba(201,168,79,0.08)',
}: ConstellationBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<StarNode[]>([]);
  const animIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    resize();

    // Seed nodes
    if (nodesRef.current.length === 0) {
      for (let i = 0; i < nodeCount; i++) {
        nodesRef.current.push({
          x: Math.random() * (w || 400),
          y: Math.random() * (h || 800),
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.4 + 0.3,
          twinkleSpeed: Math.random() * 0.015 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
    }

    const nodes = nodesRef.current;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Update positions
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Wrap around edges
        if (n.x < -10) n.x = w + 10;
        if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        if (n.y > h + 10) n.y = -10;

        // Gentle twinkle
        n.twinklePhase += n.twinkleSpeed;
        n.alpha = 0.3 + Math.sin(n.twinklePhase) * 0.25;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const opacity = (1 - dist / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/, `${opacity})`);
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor.replace(/[\d.]+\)$/, `${n.alpha})`);
        ctx.fill();

        // Subtle glow
        if (n.radius > 1.2) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 3, 0, Math.PI * 2);
          ctx.fillStyle = nodeColor.replace(/[\d.]+\)$/, `${n.alpha * 0.1})`);
          ctx.fill();
        }
      }

      animIdRef.current = requestAnimationFrame(render);
    };

    render();

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animIdRef.current);
      resizeObserver.disconnect();
    };
  }, [nodeCount, connectionDistance, nodeColor, lineColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.7,
      }}
    />
  );
}
