import { useEffect, useRef } from 'react';

interface GoldenPendulumCanvasProps {
  isDarkMode?: boolean;
  isSwarmMode: boolean;
  setIsSwarmMode: (val: boolean) => void;
  speedMultiplier: number;
  setSpeedMultiplier: (val: number) => void;
  isPaused: boolean;
  setIsPaused: (val: boolean) => void;
  isPoincare: boolean;
  setIsPoincare: (val: boolean) => void;
  onGenesis: () => void;
  genesisTrigger: number;
}

interface ConstellationNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface Point2D {
  x: number;
  y: number;
}

interface PendulumState {
  a1: number;
  a2: number;
  p1: number;
  p2: number;
  color: string;
  trail: Point2D[];
}

// ---------------------------------------------------------------------
// HAMILTONIAN DOUBLE PENDULUM RK4 PHYSICS ENGINE (FABLE SHOWCASE SPEC)
// m1=m2=1 kg, l1=l2=1 m, g=9.81 m/s², fixed RK4 integration
// ---------------------------------------------------------------------
const G_ACC = 9.81;

function d4(a1: number, a2: number, p1: number, p2: number) {
  const d = a1 - a2;
  const cosD = Math.cos(d);
  const sinD = Math.sin(d);
  const den = 16.0 - 9.0 * cosD * cosD;

  const da1 = (6.0 * (2.0 * p1 - 3.0 * cosD * p2)) / den;
  const da2 = (6.0 * (8.0 * p2 - 3.0 * cosD * p1)) / den;

  const dp1 = -0.5 * (da1 * da2 * sinD + 3.0 * G_ACC * Math.sin(a1));
  const dp2 = -0.5 * (-da1 * da2 * sinD + G_ACC * Math.sin(a2));

  return { da1, da2, dp1, dp2 };
}

function simulatePendulumStepRK4(p: PendulumState, dt: number) {
  const k1 = d4(p.a1, p.a2, p.p1, p.p2);

  const k2 = d4(
    p.a1 + 0.5 * dt * k1.da1,
    p.a2 + 0.5 * dt * k1.da2,
    p.p1 + 0.5 * dt * k1.dp1,
    p.p2 + 0.5 * dt * k1.dp2
  );

  const k3 = d4(
    p.a1 + 0.5 * dt * k2.da1,
    p.a2 + 0.5 * dt * k2.da2,
    p.p1 + 0.5 * dt * k2.dp1,
    p.p2 + 0.5 * dt * k2.dp2
  );

  const k4 = d4(
    p.a1 + dt * k3.da1,
    p.a2 + dt * k3.da2,
    p.p1 + dt * k3.dp1,
    p.p2 + dt * k3.dp2
  );

  p.a1 += (dt / 6.0) * (k1.da1 + 2.0 * k2.da1 + 2.0 * k3.da1 + k4.da1);
  p.a2 += (dt / 6.0) * (k1.da2 + 2.0 * k2.da2 + 2.0 * k3.da2 + k4.da2);
  p.p1 += (dt / 6.0) * (k1.dp1 + 2.0 * k2.dp1 + 2.0 * k3.dp1 + k4.dp1);
  p.p2 += (dt / 6.0) * (k1.dp2 + 2.0 * k2.dp2 + 2.0 * k3.dp2 + k4.dp2);
}

export default function GoldenPendulumCanvas({
  isDarkMode = true,
  isSwarmMode,
  speedMultiplier,
  isPaused,
  isPoincare,
  genesisTrigger
}: GoldenPendulumCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  const speedRef = useRef(speedMultiplier);
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Persistent Constellation Nodes Ref
  const nodesRef = useRef<ConstellationNode[]>([]);

  // Double Pendulum Simulation State Ref (Primary + Swarm Members)
  const pendulumsRef = useRef<{
    primary: PendulumState;
    swarm: PendulumState[];
  }>({
    primary: {
      a1: 2.2, // FABLE Showcase default initial pose
      a2: 2.9,
      p1: 0,
      p2: 0,
      color: '#e07a5f',
      trail: []
    },
    swarm: []
  });

  // Re-seed chaotic pendulum parameters on GENESIS trigger or initial setup
  const seedPendulums = () => {
    // FABLE Showcase chaos release pose: random around base (2.2, 2.9)
    const baseA1 = 2.2 + (Math.random() - 0.5) * 0.6;
    const baseA2 = 2.9 + (Math.random() - 0.5) * 0.6;

    pendulumsRef.current.primary = {
      a1: baseA1,
      a2: baseA2,
      p1: 0,
      p2: 0,
      color: '#e07a5f',
      trail: []
    };

    const swarmColors = ['#f3e3ae', '#c9a84f', '#d0525e', '#caa64e', '#e2a04e', '#47bfff'];
    pendulumsRef.current.swarm = swarmColors.map((color, idx) => {
      // Butterfly effect micro-epsilon offset (10^-5 rad apart)
      const eps = (idx + 1) * 1e-4 * (idx % 2 === 0 ? 1 : -1);
      return {
        a1: baseA1,
        a2: baseA2 + eps,
        p1: 0,
        p2: 0,
        color,
        trail: []
      };
    });
  };

  // Re-trigger seed on Genesis
  useEffect(() => {
    seedPendulums();
  }, [genesisTrigger]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initialize Constellation Nodes ONCE if empty
    if (nodesRef.current.length === 0) {
      const nodeCount = 110;
      for (let i = 0; i < nodeCount; i++) {
        const isLeft = Math.random() < 0.6;
        const x = isLeft ? Math.random() * (canvas.width * 0.55) : Math.random() * canvas.width;
        nodesRef.current.push({
          x,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2.0 + 1.2,
          alpha: Math.random() * 0.6 + 0.35
        });
      }
    }

    const maxTrailPoints = 320;

    const render = () => {
      const pivotX = canvas.width / 2;
      const pivotY = canvas.height * 0.56;

      const r1 = Math.min(canvas.width, canvas.height) * 0.17;
      const r2 = Math.min(canvas.width, canvas.height) * 0.19;

      // 1. UPDATE PHYSICS (IF NOT PAUSED)
      if (!isPausedRef.current) {
        const subSteps = 8;
        const dt = (0.0014 * speedRef.current) / subSteps; // Ultra-smooth FABLE RK4 timestep

        const activePendulums = isSwarmMode 
          ? [pendulumsRef.current.primary, ...pendulumsRef.current.swarm]
          : [pendulumsRef.current.primary];

        for (let s = 0; s < subSteps; s++) {
          activePendulums.forEach(p => {
            simulatePendulumStepRK4(p, dt);
          });
        }

        // Record Tip Trail Positions
        activePendulums.forEach(p => {
          const x1 = pivotX + r1 * Math.sin(p.a1);
          const y1 = pivotY + r1 * Math.cos(p.a1);
          const x2 = x1 + r2 * Math.sin(p.a2);
          const y2 = y1 + r2 * Math.cos(p.a2);

          if (isPoincare) {
            p.trail.push({ x: x2, y: y2 });
            while (p.trail.length > maxTrailPoints) {
              p.trail.shift();
            }
          } else {
            p.trail = [];
          }
        });
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ----------------------------------------------------
      // 2. LEFT AMBIENT GOLD SPOTLIGHT (Matches Image 1 & 2)
      // ----------------------------------------------------
      ctx.save();
      const leftSpotlight = ctx.createRadialGradient(
        canvas.width * 0.15,
        canvas.height * 0.45,
        10,
        canvas.width * 0.15,
        canvas.height * 0.45,
        canvas.width * 0.58
      );
      leftSpotlight.addColorStop(0, 'rgba(201, 168, 79, 0.35)');
      leftSpotlight.addColorStop(0.35, 'rgba(160, 105, 30, 0.16)');
      leftSpotlight.addColorStop(0.7, 'rgba(100, 65, 20, 0.04)');
      leftSpotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = leftSpotlight;
      ctx.beginPath();
      ctx.arc(canvas.width * 0.15, canvas.height * 0.45, canvas.width * 0.58, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // ----------------------------------------------------
      // 3. CONSTELLATION NETWORK BACKGROUND (Continuous smooth drift)
      // ----------------------------------------------------
      const nodes = nodesRef.current;
      const maxConnectDist = 140;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // Draw Constellation Star Node
        ctx.save();
        ctx.globalAlpha = n.alpha;
        ctx.fillStyle = '#f3e3ae';
        ctx.shadowColor = '#c9a84f';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Connect nearby nodes with golden mesh lines
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n.x - n2.x;
          const dy = n.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDist) {
            const lineAlpha = (1 - dist / maxConnectDist) * 0.28;
            ctx.save();
            ctx.globalAlpha = lineAlpha;
            ctx.strokeStyle = '#c9a84f';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // ----------------------------------------------------
      // 4. CELESTIAL GUIDELINE RINGS AROUND SEAL
      // ----------------------------------------------------
      ctx.save();
      ctx.strokeStyle = 'rgba(201, 168, 79, 0.22)';
      ctx.lineWidth = 1.0;
      ctx.setLineDash([4, 6]);

      // Outer Ring
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, r1 + r2 + 55, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Ring
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, r1 + 25, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ----------------------------------------------------
      // 5. SMOOTH POINCARÉ TRAIL ARCS (Exact match to Image 1)
      // ----------------------------------------------------
      const activePendulums = isSwarmMode 
        ? [pendulumsRef.current.primary, ...pendulumsRef.current.swarm]
        : [pendulumsRef.current.primary];

      activePendulums.forEach(p => {
        if (p.trail.length > 2) {
          ctx.save();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = isSwarmMode ? 1.8 : 2.4;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          ctx.beginPath();
          for (let i = 0; i < p.trail.length; i++) {
            const pt = p.trail[i];
            if (i === 0) {
              ctx.moveTo(pt.x, pt.y);
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
          ctx.stroke();
          ctx.restore();
        }
      });

      // ----------------------------------------------------
      // 6. DRAW PENDULUM RODS & GOLDEN BOBS
      // ----------------------------------------------------
      const primary = pendulumsRef.current.primary;
      const x1 = pivotX + r1 * Math.sin(primary.a1);
      const y1 = pivotY + r1 * Math.cos(primary.a1);
      const x2 = x1 + r2 * Math.sin(primary.a2);
      const y2 = y1 + r2 * Math.cos(primary.a2);

      // Rod 1
      ctx.save();
      const rod1Grad = ctx.createLinearGradient(pivotX, pivotY, x1, y1);
      rod1Grad.addColorStop(0, 'rgba(201, 168, 79, 0.85)');
      rod1Grad.addColorStop(0.5, 'rgba(243, 227, 174, 1.0)');
      rod1Grad.addColorStop(1, 'rgba(201, 168, 79, 0.85)');

      ctx.strokeStyle = rod1Grad;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#c9a84f';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(pivotX, pivotY);
      ctx.lineTo(x1, y1);
      ctx.stroke();

      // Joint 1 Node
      ctx.fillStyle = '#f3e3ae';
      ctx.strokeStyle = '#c9a84f';
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#f3e3ae';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x1, y1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Rod 2
      ctx.save();
      const rod2Grad = ctx.createLinearGradient(x1, y1, x2, y2);
      rod2Grad.addColorStop(0, 'rgba(243, 227, 174, 1.0)');
      rod2Grad.addColorStop(1, 'rgba(201, 168, 79, 0.85)');

      ctx.strokeStyle = rod2Grad;
      ctx.lineWidth = 2.0;
      ctx.shadowColor = '#c9a84f';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Golden Tip Bob
      ctx.shadowColor = '#f3e3ae';
      ctx.shadowBlur = 20;

      const bobGrad = ctx.createRadialGradient(x2 - 2, y2 - 2, 2, x2, y2, 10);
      bobGrad.addColorStop(0, '#ffffff');
      bobGrad.addColorStop(0.35, '#f3e3ae');
      bobGrad.addColorStop(0.75, '#c9a84f');
      bobGrad.addColorStop(1, '#8d6f2c');

      ctx.fillStyle = bobGrad;
      ctx.beginPath();
      ctx.arc(x2, y2, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isSwarmMode, speedMultiplier, isPaused, isPoincare, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}

