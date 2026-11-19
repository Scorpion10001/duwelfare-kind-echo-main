import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const MOODS = [
  { emoji: "😄", label: "Great", color: "from-emerald-300 to-teal-300", message: "Love that for you! If you spot something that could make campus better, we'd love to hear it.", cta: "Share an idea", kind: "suggestion" as const },
  { emoji: "🙂", label: "Okay", color: "from-sky-300 to-cyan-300", message: "Glad you're doing okay. Small things add up, so tell us if anything's bugging you.", cta: "Report something small", kind: "report" as const },
  { emoji: "😐", label: "Meh", color: "from-amber-300 to-yellow-300", message: "Some days are like that. Want to tell us what's weighing on you? It's anonymous.", cta: "Talk to us", kind: "report" as const },
  { emoji: "😟", label: "Stressed", color: "from-orange-300 to-rose-300", message: "That sounds heavy. You don't have to carry it alone, and no one will know it's you.", cta: "Reach the welfare team", kind: "report" as const },
  { emoji: "😢", label: "Struggling", color: "from-violet-300 to-fuchsia-300", message: "Thank you for being honest. Please reach out to someone you trust too. We're here whenever you're ready.", cta: "Get support now", kind: "report" as const },
];

type Props = { onAction: (kind: "report" | "suggestion", personal: boolean) => void };

export function MoodCheckin({ onAction }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const mood = selected === null ? null : MOODS[selected];

  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-widest text-primary">Quick check-in</p>
      <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">How are you feeling today?</h2>
      <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
        {MOODS.map((item, index) => (
          <motion.button
            key={item.label}
            type="button"
            onClick={() => setSelected(index)}
            whileHover={{ scale: 1.12, rotate: -4 }}
            whileTap={{ scale: 0.92 }}
            aria-pressed={selected === index}
            className={`flex w-[4.6rem] flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-xs font-bold transition-colors ${selected === index ? "border-primary bg-calm" : "border-transparent bg-muted/60 hover:bg-calm"}`}
          >
            <span className="text-3xl">{item.emoji}</span>
            {item.label}
          </motion.button>
        ))}
      </div>
      <div aria-live="polite" className="mt-5 min-h-[7.5rem]">
        <AnimatePresence mode="wait">
          {mood ? (
            <motion.div
              key={mood.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`rounded-2xl bg-gradient-to-br p-5 text-slate-800 ${mood.color}`}
            >
              <p className="text-base font-semibold leading-7">{mood.message}</p>
              <Button
                type="button"
                className="mt-3 rounded-full bg-white/90 font-bold text-slate-800 hover:bg-white"
                onClick={() => onAction(mood.kind, selected !== null && selected >= 3)}
              >
                {mood.cta}
              </Button>
            </motion.div>
          ) : (
            <p className="rounded-2xl bg-muted/50 p-5 text-sm text-muted-foreground">
              Tap a face. Nothing is saved or sent. This is just for you.
            </p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
