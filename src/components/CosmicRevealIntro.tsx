import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useSpaceBranding } from "@/hooks/useSpaceBranding";

export function CosmicRevealIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"void" | "buildup" | "fade">("void");
  const shouldReduceMotion = useReducedMotion();
  const { brandColors } = useSpaceBranding();

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("buildup"), 500),
      setTimeout(() => setPhase("fade"), 2000),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.3,
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
              willChange: "opacity",
              transform: "translate3d(0, 0, 0)", // GPU acceleration
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
          background: `radial-gradient(600px 500px at 50% 50%, ${
            brandColors?.primary || "rgba(99,102,241,0.2)"
          }, rgba(0,0,0,0.75) 50%, rgba(0,0,0,0.95) 100%)`,
          transform: "translate3d(0, 0, 0)", // GPU acceleration
        }}
      />

      {/* Center logo with Heart icon */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={
          phase === "buildup"
            ? { scale: 1, opacity: 1 }
            : { scale: 0.85, opacity: 0 }
        }
        transition={{
          duration: 0.8,
          ease: [0.2, 1, 0.3, 1],
        }}
      >
        {/* Bloom glow */}
        <motion.div
          aria-hidden
          className="absolute -inset-32 blur-3xl"
          initial={{ opacity: 0 }}
          animate={
            phase === "buildup" ? { opacity: [0, 0.5] } : { opacity: 0 }
          }
          transition={{
            delay: 0.3,
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
            phase === "buildup"
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
          initial={{ opacity: 0 }}
          animate={
            phase === "buildup" ? { opacity: 1 } : { opacity: 0 }
          }
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          Kairos
        </motion.h1>

        <motion.p
          className="mt-4 text-lg md:text-xl text-white/85"
          initial={{ opacity: 0, y: 10 }}
          animate={
            phase === "buildup"
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
