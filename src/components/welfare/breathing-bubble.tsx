import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const PHASES = [
  { label: "Breathe in…", seconds: 4, scale: 1.45 },
  { label: "Hold…", seconds: 2, scale: 1.45 },
  { label: "Breathe out…", seconds: 4, scale: 1 },
] as const;

export function BreathingBubble() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setPhase((current) => (current + 1) % PHASES.length), PHASES[phase].seconds * 1000);
    return () => window.clearTimeout(id);
  }, [running, phase]);

  const current = PHASES[phase];

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br from-sky-400 via-teal-400 to-violet-400 p-8 text-center text-white shadow-lg">
      <p className="text-xs font-extrabold uppercase tracking-widest text-white/80">Take a moment</p>
      <h2 className="mt-1 font-display text-2xl font-bold">Breathe with the bubble</h2>
      <div className="my-8 grid size-44 place-items-center">
        <motion.div
          animate={{ scale: running ? current.scale : 1 }}
          transition={{ duration: running ? current.seconds : 0.6, ease: "easeInOut" }}
          className="grid size-28 place-items-center rounded-full bg-white/30 shadow-[0_0_60px_rgba(255,255,255,0.7)] backdrop-blur"
        >
          <span className="px-2 text-sm font-bold">{running ? current.label : "Ready?"}</span>
        </motion.div>
      </div>
      <Button
        type="button"
        onClick={() => {
          setPhase(0);
          setRunning((value) => !value);
        }}
        className="rounded-full bg-white px-6 font-bold text-teal-700 hover:bg-white/90"
      >
        {running ? "Stop" : "Start"}
      </Button>
    </div>
  );
}
