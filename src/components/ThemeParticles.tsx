import { useEffect, useRef } from 'react';

interface ThemeParticlesProps {
  activeTheme: string;
  isDarkMode: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  shape: 'circle' | 'square' | 'leaf';
  rotation?: number;
  rotationSpeed?: number;
}

export default function ThemeParticles({ activeTheme, isDarkMode }: ThemeParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    const maxParticles = 65;

    // Resize handler
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle styling configuration based on theme
    const getThemeConfig = () => {
      switch (activeTheme) {
        case 'cyber':
          return {
            colors: isDarkMode ? ['#ff4a00', '#e21b22', '#ff8400'] : ['#ff4a00', '#dc2626', '#888888'],
            shape: 'square' as const,
            speedY: isDarkMode ? -1.2 : -0.6,
            speedX: 0.3,
            sizeRange: [2, 5],
            opacityRange: isDarkMode ? [0.15, 0.45] : [0.08, 0.2]
          };
        case 'onepiece':
          return {
            colors: ['#a12b18', '#6e543f', '#3e2616', '#dfc499'],
            shape: 'circle' as const,
            speedY: 0.1,
            speedX: 0.9, // horizontal wind
            sizeRange: [2, 6],
            opacityRange: [0.12, 0.35]
          };
        case 'forest':
          return {
            colors: isDarkMode ? ['#81c784', '#2e7d32', '#a5d6a7'] : ['#2e7d32', '#558b2f', '#a5d6a7'],
            shape: 'leaf' as const,
            speedY: isDarkMode ? -0.2 : 0.4, // float up like fireflies vs fall down like leaves
            speedX: 0.4,
            sizeRange: [3, 8],
            opacityRange: isDarkMode ? [0.2, 0.55] : [0.1, 0.3]
          };
        case 'nordic':
          return {
            colors: isDarkMode ? ['#818cf8', '#a5b4fc', '#4f46e5'] : ['#4f46e5', '#94a3b8', '#cbd5e1'],
            shape: 'circle' as const,
            speedY: 0.5, // gentle snow fall
            speedX: 0.2,
            sizeRange: [2, 6],
            opacityRange: isDarkMode ? [0.15, 0.45] : [0.1, 0.25]
          };
        case 'latte':
          return {
            colors: isDarkMode ? ['#c2410c', '#6e543f', '#78716c'] : ['#c2410c', '#e7dfd5', '#6e543f'],
            shape: 'circle' as const,
            speedY: -0.4, // rising steam
            speedX: 0.2,
            sizeRange: [2, 5],
            opacityRange: [0.1, 0.3]
          };
        case 'harmonia':
        case 'celestial':
          return {
            colors: ['#f3e3ae', '#c9a84f', '#f4e7c3', '#c8434f', '#ffffff'],
            shape: 'circle' as const,
            speedY: -0.3, // rising celestial starlight
            speedX: 0.2,
            sizeRange: [2, 6],
            opacityRange: [0.2, 0.65]
          };
        default:
          return {
            colors: ['#888888'],
            shape: 'circle' as const,
            speedY: -0.2,
            speedX: 0.2,
            sizeRange: [2, 4],
            opacityRange: [0.1, 0.2]
          };
      }
    };

    const config = getThemeConfig();

    // Instantiate a particle
    const createParticle = (initY = false): Particle => {
      const colors = config.colors;
      const size = Math.random() * (config.sizeRange[1] - config.sizeRange[0]) + config.sizeRange[0];
      
      // Starting position
      let x = Math.random() * canvas.width;
      let y = Math.random() * canvas.height;

      if (initY) {
        // Pushed to borders depending on motion direction
        if (config.speedY < 0) {
          y = canvas.height + size + 10;
        } else if (config.speedY > 0) {
          y = -size - 10;
        }
      }

      return {
        x,
        y,
        vx: (Math.random() - 0.5) * config.speedX * 2 + (config.speedX * 0.5),
        vy: (Math.random() - 0.5) * 0.4 + config.speedY,
        size,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * (config.opacityRange[1] - config.opacityRange[0]) + config.opacityRange[0],
        shape: config.shape,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };
    };

    // Populate initial batch
    particles = Array.from({ length: maxParticles }, () => createParticle(false));

    // Listen to mouse
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

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      particles.forEach((p, idx) => {
        // Move particle
        p.x += p.vx;
        p.y += p.vy;
        if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
          p.rotation += p.rotationSpeed;
        }

        // Mouse influence
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 180) {
            const force = (180 - dist) / 180; // normalized force
            const angle = Math.atan2(dy, dx);
            // Push away gently
            p.x += Math.cos(angle) * force * 2.5;
            p.y += Math.sin(angle) * force * 2.5;
          }
        }

        // Bounds check
        const isOutOfBounds = 
          p.x < -50 || 
          p.x > canvas.width + 50 || 
          (config.speedY < 0 && p.y < -50) || 
          (config.speedY > 0 && p.y > canvas.height + 50) ||
          p.y < -100 || 
          p.y > canvas.height + 100;

        if (isOutOfBounds) {
          particles[idx] = createParticle(true);
          return;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;

        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) {
          ctx.rotate(p.rotation);
        }

        if (p.shape === 'square') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        } else if (p.shape === 'leaf') {
          // Leaf shape path
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 1.3, p.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Circle/Dot
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanups
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [activeTheme, isDarkMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        display: 'block'
      }}
    />
  );
}
