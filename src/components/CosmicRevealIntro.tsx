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
};

const buildParticles = (count: number): Particle[] =>
  Array.from({ length: count }).map((_, i) => ({
    id: i,
    size: Math.floor(Math.random() * 4) + 2,
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
    delay: Math.random() * 0.3,
    duration: 1.8 + Math.random() * 1.0,
  }));

export function CosmicRevealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"void" | "buildup" | "explosion" | "fade">("void");
  const shouldReduceMotion = useReducedMotion();
  const { brandColors } = useSpaceBranding();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("buildup"), 800),
      setTimeout(() => setPhase("explosion"), 2200),
      setTimeout(() => setPhase("fade"), 3500),
      setTimeout(() => onComplete(), 5000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const particles = useMemo(
    () => buildParticles(shouldReduceMotion ? 30 : 60), // Optimized from 90
    [shouldReduceMotion]
  );

  const shards = useMemo(
    () => buildParticles(shouldReduceMotion ? 8 : 18), // Optimized from 22
    [shouldReduceMotion]
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 100 }).map((_, i) => ({ // Optimized from 150
        id: i,
        size: Math.random() * 2 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2,
        opacity: Math.random() * 0.6 + 0.4,
      })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: "#000000" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      onAnimationComplete={() => {
        if (phase === "fade") onComplete();
      }}
    >
      {/* Starfield background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              width: star.size,
              height: star.size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              willChange: "opacity, transform",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, star.opacity, star.opacity, 0] }}
            transition={{
              duration: 3,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Radial gradient backdrop */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(800px 600px at 50% 50%, ${
            brandColors?.primary || "rgba(99,102,241,0.25)"
          }, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.95) 100%)`,
        }}
      />

      {/* Camera shake wrapper */}
      <motion.div
        className="absolute inset-0"
        animate={
          !shouldReduceMotion && phase === "explosion"
            ? { x: [0, 4, -4, 2, -2, 0], y: [0, -3, 3, -2, 2, 0] }
            : {}
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Swirling particles (buildup phase) */}
      {(phase === "buildup" || phase === "explosion") && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[70vmin] h-[70vmin]">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute block rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                style={{
                  width: p.size,
                  height: p.size,
                  left: "50%",
                  top: "50%",
                  willChange: "transform, opacity",
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: [0, 1, 0], scale: [0.6, 1, 0.5] }
                    : phase === "buildup"
                    ? {
                        x: [0, p.x * 0.15],
                        y: [0, p.y * 0.15],
                        rotate: [0, p.x * 2],
                        opacity: [0, 1],
                        scale: [0.6, 1],
                      }
                    : {
                        x: [p.x * 0.15, p.x * 2.2],
                        y: [p.y * 0.15, p.y * 1.8],
                        rotate: [p.x * 2, p.x * 4 + 180],
                        opacity: [1, 1, 0],
                        scale: [1, 1.1, 0.4],
                      }
                }
                transition={{
                  duration: phase === "buildup" ? 1.2 : p.duration,
                  delay: p.delay * 0.1,
                  ease: phase === "explosion" ? "easeOut" : "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Confetti shards (explosion phase) */}
      {phase === "explosion" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[70vmin] h-[70vmin]">
            {shards.map((s) => (
              <motion.span
                key={`shard-${s.id}`}
                className="absolute block"
                style={{
                  width: 3,
                  height: 12 + s.size * 3,
                  left: "50%",
                  top: "50%",
                  background: `linear-gradient(180deg, rgba(255,255,255,0.9), ${
                    brandColors?.primary || "rgba(99,102,241,0.8)"
                  })`,
                  transformOrigin: "center",
                  willChange: "transform, opacity",
                }}
                initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
                animate={
                  shouldReduceMotion
                    ? { opacity: [0, 1, 0] }
                    : {
                        x: [0, s.x * 0.5, s.x * 1.6],
                        y: [0, s.y * 0.3, s.y * 2.0 + 100],
                        rotate: [0, s.x * 90, s.x * 180 + s.y * 90],
                        opacity: [0, 1, 0],
                      }
                }
                transition={{
                  duration: 2.0 + s.duration * 0.3,
                  delay: s.delay * 0.2,
                  ease: [0.2, 1, 0.3, 1],
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expanding shockwave rings */}
      {phase === "explosion" && (
        <>
          <motion.div
            aria-hidden
            className="absolute w-[25vmin] h-[25vmin] rounded-full border-2 border-white/70"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0 }
                : { scale: [0.2, 1.5, 3.0], opacity: [0, 1, 0] }
            }
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{
              boxShadow: `0 0 80px ${brandColors?.primary || "rgba(99,102,241,0.6)"}`,
              filter: "blur(1px)",
            }}
          />
          <motion.div
            aria-hidden
            className="absolute w-[20vmin] h-[20vmin] rounded-full border border-white/50"
            initial={{ scale: 0.3, opacity: 0 }}
            animate={
              shouldReduceMotion
                ? { opacity: 0 }
                : { scale: [0.3, 2.0, 4.5], opacity: [0, 0.8, 0] }
            }
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.1 }}
            style={{ boxShadow: "0 0 60px rgba(255,255,255,0.4)" }}
          />
        </>
      )}

      {/* Impact flash */}
      {phase === "explosion" && (
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 0 } : { opacity: [0, 0.9, 0] }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ mixBlendMode: "screen" }}
        />
      )}

      {/* Center logo with Heart icon */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={
          phase === "explosion"
            ? { scale: [0.85, 1.1, 1], opacity: 1 }
            : { scale: 0.85, opacity: phase === "void" ? 0 : 1 }
        }
        transition={{
          duration: phase === "explosion" ? 1.0 : 0.8,
          ease: [0.2, 1, 0.3, 1],
          times: phase === "explosion" ? [0, 0.5, 1] : undefined,
        }}
      >
        {/* Bloom glow */}
        <motion.div
          aria-hidden
          className="absolute -inset-32 blur-3xl"
          initial={{ opacity: 0 }}
          animate={
            phase === "explosion"
              ? { opacity: [0, 1, 0.6], scale: [0.8, 1.2, 1] }
              : { opacity: phase === "buildup" ? [0, 0.5] : 0 }
          }
          transition={{
            delay: phase === "explosion" ? 0 : 0.3,
            duration: 1.5,
            ease: "easeOut",
          }}
          style={{
            background: `conic-gradient(from 180deg at 50% 50%, ${
              brandColors?.primary || "rgba(99,102,241,0)"
            }, ${brandColors?.primary || "rgba(99,102,241,0.8)"}, ${
              brandColors?.secondary || "rgba(168,85,247,0.7)"
            }, ${brandColors?.primary || "rgba(99,102,241,0)"})`,
          }}
        />

        {/* Heart icon */}
        <motion.div
          className="mb-6 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={
            phase === "buildup" || phase === "explosion"
              ? { scale: 1, rotate: 0 }
              : { scale: 0, rotate: -180 }
          }
          transition={{ duration: 0.8, ease: [0.2, 1, 0.3, 1] }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${
                brandColors?.primary || "hsl(248 53% 58%)"
              }, ${brandColors?.secondary || "hsl(262 83% 58%)"})`,
            }}
          >
            <Heart className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        {/* Kairos wordmark */}
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold tracking-tight text-white"
          initial={{ textShadow: "0 0 0 rgba(255,255,255,0)" }}
          animate={
            phase === "explosion"
              ? {
                  textShadow: [
                    "0 0 0 rgba(255,255,255,0)",
                    "0 0 60px rgba(255,255,255,1)",
                    "0 0 24px rgba(255,255,255,0.6)",
                  ],
                }
              : {}
          }
          transition={{ duration: 1.6, ease: "easeInOut" }}
        >
          Kairos
        </motion.h1>

        <motion.p
          className="mt-4 text-lg md:text-xl text-white/85"
          initial={{ opacity: 0, y: 10 }}
          animate={
            phase === "buildup" || phase === "explosion"
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 10 }
          }
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          Private Beta • AI‑Powered Life OS
        </motion.p>
      </motion.div>

      {/* Skip button */}
      <motion.button
        onClick={onComplete}
        className="absolute bottom-8 right-8 text-white/60 hover:text-white text-sm transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Skip →
      </motion.button>
    </motion.div>
  );
}
