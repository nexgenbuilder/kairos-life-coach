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
    const counts = { low: 24, med: 40, high: 64 };
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

  const orbAmplitude = { low: 12, med: 18, high: 24 }[intensity];

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

      {/* Floating orbs */}
      <motion.div
        aria-hidden
        className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: "rgba(99,102,241,0.22)" }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, orbAmplitude * 0.75, 0],
                y: [0, -orbAmplitude, 0],
              }
        }
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute bottom-0 right-0 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "rgba(217,70,239,0.18)" }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -orbAmplitude, 0],
                y: [0, orbAmplitude, 0],
              }
        }
        transition={{
          duration: 16,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 1.2,
        }}
      />

      {/* Time rings */}
      {!shouldReduceMotion && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[52vmin] h-[52vmin] opacity-50">
          <motion.div
            className="absolute inset-0 rounded-full border border-primary/35"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 42, ease: "linear", repeat: Infinity }}
            style={{ willChange: "transform" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-secondary/25"
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
