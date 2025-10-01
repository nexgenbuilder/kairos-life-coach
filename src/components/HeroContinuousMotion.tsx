import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";

interface HeroContinuousMotionProps {
  intensity?: "low" | "med" | "high";
}

export function HeroContinuousMotion({
  intensity = "med",
}: HeroContinuousMotionProps) {
  const shouldReduceMotion = useReducedMotion();

  const particleCount = useMemo(() => {
    if (shouldReduceMotion) return 0;
    const counts = { low: 16, med: 28, high: 48 }; // Optimized counts
    return counts[intensity];
  }, [intensity, shouldReduceMotion]);

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }).map((_, i) => ({
        id: i,
        x: Math.random() * 40 - 20,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 3,
      })),
    [particleCount]
  );

  const orbAmplitude = { low: 50, med: 70, high: 90 }[intensity];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Ambient gradient shift */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0"
          animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(20deg)", "hue-rotate(0deg)"] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        />
      )}

      {/* Floating orbs - Enhanced with more movement */}
      {/* Orb 1: Top-left, figure-8 pattern */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ 
          background: "rgba(99,102,241,0.22)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, orbAmplitude * 1.5, orbAmplitude * 0.5, -orbAmplitude * 0.8, 0],
                y: [0, -orbAmplitude * 1.2, orbAmplitude * 0.6, -orbAmplitude * 0.4, 0],
                scale: [1, 1.15, 0.9, 1.1, 1],
                opacity: [0.22, 0.3, 0.18, 0.28, 0.22],
              }
        }
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Orb 2: Bottom-right, circular motion */}
      <motion.div
        aria-hidden
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
        style={{ 
          background: "rgba(217,70,239,0.18)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -orbAmplitude * 1.8, -orbAmplitude * 0.6, orbAmplitude * 0.4, 0],
                y: [0, orbAmplitude * 1.4, -orbAmplitude * 0.8, orbAmplitude * 0.5, 0],
                scale: [1, 0.85, 1.2, 0.95, 1],
                opacity: [0.18, 0.25, 0.15, 0.22, 0.18],
              }
        }
        transition={{
          duration: 11,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 0.8,
        }}
      />
      {/* Orb 3: Center-left, diagonal sweep */}
      <motion.div
        aria-hidden
        className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full blur-3xl"
        style={{ 
          background: "rgba(147,51,234,0.15)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, orbAmplitude * 1.2, -orbAmplitude * 1.6, orbAmplitude * 0.7, 0],
                y: [0, orbAmplitude * 1.8, orbAmplitude * 0.4, -orbAmplitude * 0.6, 0],
                rotate: [0, 120, 240, 360],
                scale: [1, 1.25, 0.8, 1.1, 1],
                opacity: [0.15, 0.22, 0.12, 0.2, 0.15],
              }
        }
        transition={{
          duration: 12,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1.5,
        }}
      />
      {/* Orb 4: Right-center, wave motion */}
      <motion.div
        aria-hidden
        className="absolute top-2/3 right-1/4 h-72 w-72 rounded-full blur-3xl"
        style={{ 
          background: "rgba(59,130,246,0.16)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -orbAmplitude * 1.4, orbAmplitude * 1.9, -orbAmplitude * 0.5, 0],
                y: [0, -orbAmplitude * 1.1, orbAmplitude * 1.3, orbAmplitude * 0.3, 0],
                rotate: [0, -120, -240, -360],
                scale: [1, 0.9, 1.2, 0.95, 1],
                opacity: [0.16, 0.24, 0.14, 0.2, 0.16],
              }
        }
        transition={{
          duration: 9,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 2.2,
        }}
      />
      {/* Orb 5: Top-right, spiral pattern */}
      <motion.div
        aria-hidden
        className="absolute top-1/3 right-1/3 h-56 w-56 rounded-full blur-3xl"
        style={{ 
          background: "rgba(168,85,247,0.14)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, orbAmplitude * 1.6, -orbAmplitude * 0.9, orbAmplitude * 1.1, 0],
                y: [0, orbAmplitude * 0.8, orbAmplitude * 1.7, -orbAmplitude * 1.2, 0],
                rotate: [0, 180, 270, 360],
                scale: [1, 1.3, 0.85, 1.15, 1],
                opacity: [0.14, 0.21, 0.11, 0.18, 0.14],
              }
        }
        transition={{
          duration: 10.5,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 3.5,
        }}
      />
      {/* Orb 6: Bottom-center, pendulum motion */}
      <motion.div
        aria-hidden
        className="absolute bottom-1/4 left-1/2 h-88 w-88 rounded-full blur-3xl"
        style={{ 
          background: "rgba(124,58,237,0.17)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, orbAmplitude * 2.1, -orbAmplitude * 2.1, 0],
                y: [0, -orbAmplitude * 0.6, -orbAmplitude * 0.6, 0],
                rotate: [0, 45, -45, 0],
                scale: [1, 1.1, 1.1, 1],
                opacity: [0.17, 0.26, 0.26, 0.17],
              }
        }
        transition={{
          duration: 11.5,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 4.5,
        }}
      />

      {/* Time rings - Subtle and off-center */}
      {!shouldReduceMotion && (
        <div className="absolute left-[45%] top-[55%] -translate-x-1/2 -translate-y-1/2 w-[35vmin] h-[35vmin] opacity-20">
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/30"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 42, ease: "linear", repeat: Infinity }}
            style={{ willChange: "transform" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-secondary/20"
            animate={{ rotate: [360, 0] }}
            transition={{ duration: 56, ease: "linear", repeat: Infinity }}
            style={{ willChange: "transform" }}
          />
        </div>
      )}

      {/* Particle drift (hidden on mobile) */}
      {!shouldReduceMotion && (
        <div className="hidden md:block absolute inset-0 flex items-center justify-center">
          <div className="relative w-[40vmin] h-[40vmin]">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute w-[2px] h-[2px] rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                style={{
                  left: "50%",
                  top: "50%",
                  willChange: "transform, opacity",
                  transform: "translate3d(0, 0, 0)", // GPU acceleration
                }}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-30, -60, -100],
                  x: p.x,
                  scale: [0.8, 1, 0.9],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
