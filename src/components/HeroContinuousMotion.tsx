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

  // Viewport-relative amplitude for responsive movement
  const orbAmplitude = { low: 8, med: 12, high: 16 }[intensity]; // in vw/vh units

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Ambient gradient shift */}
      {!shouldReduceMotion && (
        <motion.div
          className="absolute inset-0"
          animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(20deg)", "hue-rotate(0deg)"] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
        />
      )}

      {/* Floating orbs - Contained within hero section */}
      {/* Orb 1: Top-left quadrant, figure-8 pattern */}
      <motion.div
        aria-hidden
        className="absolute top-[20%] left-[15%] h-64 w-64 md:h-80 md:w-80 rounded-full blur-3xl"
        style={{ 
          background: "rgba(99,102,241,0.25)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [`0vw`, `${orbAmplitude}vw`, `${orbAmplitude * 0.5}vw`, `-${orbAmplitude * 0.8}vw`, `0vw`],
                y: [`0vh`, `-${orbAmplitude * 0.8}vh`, `${orbAmplitude * 0.6}vh`, `-${orbAmplitude * 0.3}vh`, `0vh`],
                scale: [1, 1.1, 0.95, 1.05, 1],
                opacity: [0.25, 0.32, 0.2, 0.28, 0.25],
              }
        }
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
      />
      {/* Orb 2: Bottom-right quadrant, circular motion */}
      <motion.div
        aria-hidden
        className="absolute bottom-[20%] right-[15%] h-72 w-72 md:h-96 md:w-96 rounded-full blur-3xl"
        style={{ 
          background: "rgba(217,70,239,0.22)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [`0vw`, `-${orbAmplitude}vw`, `-${orbAmplitude * 0.5}vw`, `${orbAmplitude * 0.4}vw`, `0vw`],
                y: [`0vh`, `${orbAmplitude * 0.8}vh`, `-${orbAmplitude * 0.6}vh`, `${orbAmplitude * 0.4}vh`, `0vh`],
                scale: [1, 0.9, 1.15, 0.95, 1],
                opacity: [0.22, 0.28, 0.18, 0.24, 0.22],
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
        className="absolute top-[35%] left-[25%] h-56 w-56 md:h-64 md:w-64 rounded-full blur-3xl"
        style={{ 
          background: "rgba(147,51,234,0.2)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [`0vw`, `${orbAmplitude * 0.9}vw`, `-${orbAmplitude}vw`, `${orbAmplitude * 0.5}vw`, `0vw`],
                y: [`0vh`, `${orbAmplitude}vh`, `${orbAmplitude * 0.3}vh`, `-${orbAmplitude * 0.5}vh`, `0vh`],
                rotate: [0, 120, 240, 360],
                scale: [1, 1.15, 0.85, 1.08, 1],
                opacity: [0.2, 0.26, 0.15, 0.22, 0.2],
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
        className="absolute top-[60%] right-[25%] h-60 w-60 md:h-72 md:w-72 rounded-full blur-3xl"
        style={{ 
          background: "rgba(59,130,246,0.21)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [`0vw`, `-${orbAmplitude * 0.9}vw`, `${orbAmplitude}vw`, `-${orbAmplitude * 0.4}vw`, `0vw`],
                y: [`0vh`, `-${orbAmplitude * 0.7}vh`, `${orbAmplitude * 0.8}vh`, `${orbAmplitude * 0.2}vh`, `0vh`],
                rotate: [0, -120, -240, -360],
                scale: [1, 0.92, 1.12, 0.97, 1],
                opacity: [0.21, 0.27, 0.17, 0.23, 0.21],
              }
        }
        transition={{
          duration: 9,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 2.2,
        }}
      />
      {/* Orb 5: Top-right quadrant, spiral pattern */}
      <motion.div
        aria-hidden
        className="absolute top-[25%] right-[30%] h-52 w-52 md:h-56 md:w-56 rounded-full blur-3xl"
        style={{ 
          background: "rgba(168,85,247,0.19)",
          transform: "translate3d(0, 0, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [`0vw`, `${orbAmplitude}vw`, `-${orbAmplitude * 0.6}vw`, `${orbAmplitude * 0.7}vw`, `0vw`],
                y: [`0vh`, `${orbAmplitude * 0.5}vh`, `${orbAmplitude}vh`, `-${orbAmplitude * 0.8}vh`, `0vh`],
                rotate: [0, 180, 270, 360],
                scale: [1, 1.2, 0.88, 1.1, 1],
                opacity: [0.19, 0.25, 0.14, 0.21, 0.19],
              }
        }
        transition={{
          duration: 10.5,
          ease: "easeInOut",
          repeat: Infinity,
          delay: 3.5,
        }}
      />
      {/* Orb 6: Center, pendulum motion */}
      <motion.div
        aria-hidden
        className="absolute top-[50%] left-[50%] h-64 w-64 md:h-80 md:w-80 rounded-full blur-3xl"
        style={{ 
          background: "rgba(124,58,237,0.23)",
          transform: "translate3d(-50%, -50%, 0)",
          willChange: "transform, opacity"
        }}
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [`0vw`, `${orbAmplitude * 1.2}vw`, `-${orbAmplitude * 1.2}vw`, `0vw`],
                y: [`0vh`, `-${orbAmplitude * 0.4}vh`, `-${orbAmplitude * 0.4}vh`, `0vh`],
                rotate: [0, 45, -45, 0],
                scale: [1, 1.08, 1.08, 1],
                opacity: [0.23, 0.3, 0.3, 0.23],
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
