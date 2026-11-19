import { motion } from "framer-motion";
import { useMemo } from "react";

const COLORS = ["#38bdf8", "#34d399", "#fbbf24", "#fb7185", "#a78bfa", "#2dd4bf"];

/** A one-shot burst of confetti. Purely decorative, so hidden from screen readers. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const items = useMemo(
    () =>
      Array.from({ length: pieces }, (_, index) => ({
        id: index,
        x: (Math.random() - 0.5) * 520,
        y: -(80 + Math.random() * 220),
        rotate: Math.random() * 540 - 270,
        size: 6 + Math.random() * 8,
        color: COLORS[index % COLORS.length],
        round: Math.random() > 0.5,
        delay: Math.random() * 0.15,
      })),
    [pieces],
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
      {items.map((piece) => (
        <motion.span
          key={piece.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: piece.x, y: [0, piece.y, piece.y + 340], opacity: [1, 1, 0], rotate: piece.rotate, scale: 1 }}
          transition={{ duration: 1.9, delay: piece.delay, ease: "easeOut" }}
          style={{ width: piece.size, height: piece.size, background: piece.color }}
          className={`absolute ${piece.round ? "rounded-full" : "rounded-[2px]"}`}
        />
      ))}
    </div>
  );
}
