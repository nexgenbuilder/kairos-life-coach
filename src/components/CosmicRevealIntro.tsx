import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useSpaceBranding } from "@/hooks/useSpaceBranding";

type Particle = {
  id: number;
  size: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  type: 'star' | 'energy' | 'ray';
};

const buildParticles = (count: number): Particle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 4) + 2,
    x: Math.random() * 140 - 70,
    y: Math.random() * 140 - 70,
    delay: Math.random() * 0.5,
    duration: 1.4 + Math.random() * 1.2,
    type: i % 3 === 0 ? 'ray' : i % 2 === 0 ? 'energy' : 'star',
  }));

const LogoPieces = ({ assembled }: { assembled: boolean }) => {
  const pieces = [
    { id: 0, x: -40, y: -40, rotate: -45 },
    { id: 1, x: 40, y: -40, rotate: 45 },
    { id: 2, x: -40, y: 40, rotate: -135 },
    { id: 3, x: 40, y: 40, rotate: 135 },
  ];

  return (
    <div className="relative w-24 h-24">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute inset-0 flex items-center justify-center"
          initial={{ x: piece.x, y: piece.y, rotate: piece.rotate, opacity: 0 }}
          animate={assembled ? {
            x: 0,
            y: 0,
            rotate: 0,
            opacity: 1,
          } : {}}
          transition={{
            duration: 0.8,
            delay: 1.5 + piece.id * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <Heart className="w-12 h-12 text-white fill-white opacity-25" />
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Heart className="w-16 h-16 text-white fill-white" />
      </motion.div>
    </div>
  );
};

export function CosmicRevealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'void' | 'assembly' | 'buildup' | 'reveal' | 'fade'>('void');
  const shouldReduceMotion = useReducedMotion();
  const { brandColors } = useSpaceBranding();

  const particles = useMemo(
    () => buildParticles(shouldReduceMotion ? 30 : 120),
    [shouldReduceMotion]
  );

  const energyRings = useMemo(
    () => Array.from({ length: shouldReduceMotion ? 2 : 4 }).map((_, i) => i),
    [shouldReduceMotion]
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('assembly'), 1500),
      setTimeout(() => setPhase('buildup'), 2500),
      setTimeout(() => setPhase('reveal'), 3200),
      setTimeout(() => setPhase('fade'), 3800),
      setTimeout(onComplete, 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const primaryColor = brandColors?.primary 
    ? `hsl(${brandColors.primary})` 
    : 'hsl(var(--primary))';

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'fade' ? 0 : 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
    >
      {/* Skip button */}
      <motion.button
        onClick={onComplete}
        className="absolute top-6 right-6 z-10 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Skip
      </motion.button>

      {/* Cosmic backdrop with brand colors */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(1200px 600px at 50% 50%, ${primaryColor}15, transparent 60%, hsl(var(--background)) 100%)`,
        }}
      />

      {/* Quantum field grid */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `linear-gradient(${primaryColor}20 1px, transparent 1px), linear-gradient(90deg, ${primaryColor}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
          animate={phase === 'buildup' || phase === 'reveal' ? {
            scale: [1, 1.05, 1],
            opacity: [0.2, 0.4, 0.1],
          } : {}}
          transition={{ duration: 0.6, delay: 2.8 }}
        />
      )}

      {/* Distant stars (Phase 1) */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[80vmin] h-[80vmin]">
          {particles.filter(p => p.type === 'star').slice(0, shouldReduceMotion ? 15 : 40).map((p) => (
            <motion.span
              key={`star-${p.id}`}
              className="absolute block rounded-full bg-white/60"
              style={{ 
                width: p.size * 0.5, 
                height: p.size * 0.5, 
                left: '50%', 
                top: '50%',
                boxShadow: `0 0 ${p.size * 2}px rgba(255,255,255,0.4)`,
              }}
              initial={{ x: p.x * 0.5, y: p.y * 0.5, opacity: 0 }}
              animate={{ 
                x: p.x * 0.5, 
                y: p.y * 0.5, 
                opacity: [0, 0.8, phase === 'reveal' ? 0 : 0.8],
                scale: phase === 'reveal' ? [1, 1.5, 0.5] : 1,
              }}
              transition={{ 
                duration: 2, 
                delay: p.delay,
                opacity: { duration: phase === 'reveal' ? 0.3 : 2, delay: phase === 'reveal' ? 3.2 : p.delay },
              }}
            />
          ))}
        </div>
      </div>

      {/* Camera shake on reveal */}
      <motion.div
        className="absolute inset-0"
        animate={phase === 'reveal' && !shouldReduceMotion ? {
          x: [0, 3, -3, 2, -1, 0],
          y: [0, -2, 2, -2, 1, 0],
        } : {}}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      {/* Energy rings (Phase 3 & 4) */}
      {(phase === 'buildup' || phase === 'reveal') && (
        <div className="absolute inset-0 flex items-center justify-center">
          {energyRings.map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full border-2"
              style={{ 
                borderColor: primaryColor,
                boxShadow: `0 0 30px ${primaryColor}40`,
              }}
              initial={{ width: 100, height: 100, opacity: 0 }}
              animate={{
                width: [100, 300, 600],
                height: [100, 300, 600],
                opacity: [0, 0.8, 0],
                borderWidth: [2, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                delay: phase === 'buildup' ? 2.5 + i * 0.15 : 3.2 + i * 0.1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Explosive particles (Phase 4) */}
      {phase === 'reveal' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[90vmin] h-[90vmin]">
            {particles.map((p) => (
              <motion.span
                key={`blast-${p.id}`}
                className="absolute block rounded-full"
                style={{ 
                  width: p.size, 
                  height: p.size, 
                  left: '50%', 
                  top: '50%',
                  background: p.type === 'energy' ? primaryColor : 'white',
                  boxShadow: `0 0 ${p.size * 3}px ${p.type === 'energy' ? primaryColor : 'rgba(255,255,255,0.8)'}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                animate={shouldReduceMotion ? {
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.6],
                } : {
                  x: [0, p.x * 0.4, p.x * 2.2],
                  y: [0, p.y * 0.3, p.y * 1.8],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.2, 0.6],
                  rotate: [0, 180, 360],
                }}
                transition={{ 
                  duration: p.duration, 
                  delay: 3.2 + p.delay * 0.3, 
                  ease: 'easeOut' 
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shockwave burst (Phase 4) */}
      {phase === 'reveal' && (
        <>
          <motion.div
            className="absolute rounded-full border-4"
            style={{ 
              borderColor: primaryColor,
              boxShadow: `0 0 80px ${primaryColor}60`,
            }}
            initial={{ width: 80, height: 80, opacity: 0 }}
            animate={{
              width: [80, 400, 800],
              height: [80, 400, 800],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 3.2 }}
          />
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 3.2 }}
            style={{ mixBlendMode: 'screen' }}
          />
        </>
      )}

      {/* Center logo assembly & reveal */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: phase === 'reveal' ? [1, 1.08, 1] : 1, 
          opacity: 1,
        }}
        transition={{ 
          scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 3.2 },
          opacity: { duration: 0.8, delay: 1.2 },
        }}
      >
        {/* Dynamic aura with brand colors */}
        <motion.div
          className="absolute -inset-32 blur-3xl pointer-events-none"
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, transparent, ${primaryColor}70, hsl(var(--secondary))60, transparent)`,
          }}
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ 
            opacity: phase === 'buildup' || phase === 'reveal' ? [0, 0.8, 0.6] : 0,
            rotate: [0, 360],
          }}
          transition={{ 
            opacity: { duration: 1.2, delay: 2.5 },
            rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
          }}
        />

        {/* Logo assembly */}
        <LogoPieces assembled={phase !== 'void'} />

        {/* Wordmark */}
        <motion.h1
          className="mt-6 text-6xl md:text-8xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.span
            animate={phase === 'reveal' ? {
              textShadow: [
                '0 0 0 rgba(255,255,255,0)',
                `0 0 40px ${primaryColor}80`,
                `0 0 20px ${primaryColor}40`,
              ],
            } : {}}
            transition={{ duration: 1, delay: 3.2 }}
          >
            Kairos
          </motion.span>
        </motion.h1>

        <motion.p
          className="mt-4 text-base md:text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.7 }}
        >
          Private Beta • AI-Powered Life OS
        </motion.p>
      </motion.div>

      {/* Gravitational particle pull (Phase 2-3) */}
      {(phase === 'assembly' || phase === 'buildup') && !shouldReduceMotion && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[70vmin] h-[70vmin]">
            {particles.slice(0, 30).map((p) => (
              <motion.span
                key={`pull-${p.id}`}
                className="absolute block rounded-full bg-white/40"
                style={{ 
                  width: p.size * 0.8, 
                  height: p.size * 0.8, 
                  left: '50%', 
                  top: '50%',
                }}
                initial={{ x: p.x * 1.5, y: p.y * 1.5, opacity: 0 }}
                animate={{
                  x: [p.x * 1.5, p.x * 0.5, 0],
                  y: [p.y * 1.5, p.y * 0.5, 0],
                  opacity: [0, 0.8, 0],
                  scale: [1, 1.2, 0],
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: 1.8 + p.delay * 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
