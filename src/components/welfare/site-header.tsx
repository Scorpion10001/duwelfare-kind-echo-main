import { Link } from "@tanstack/react-router";
import { motion, useScroll, useSpring } from "framer-motion";
import { HeartHandshake, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("duwelfare-theme", next ? "dark" : "light");
    } catch {
      /* storage can be blocked; the theme still changes for this visit */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid size-10 place-items-center rounded-full bg-calm text-primary transition-transform hover:rotate-12 hover:scale-110"
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

export function SiteHeader() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="group flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 via-teal-400 to-emerald-400 text-white shadow-md transition-transform group-hover:rotate-6 group-hover:scale-110">
            <HeartHandshake className="size-5" />
          </span>
          <span className="text-gradient">Duwelfare</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-bold sm:gap-2">
          <Link
            to="/track"
            className="rounded-full px-3 py-2 text-foreground/80 transition-colors hover:bg-calm hover:text-primary"
          >
            Track a report
          </Link>
          <Link
            to="/admin"
            className="rounded-full px-3 py-2 text-foreground/80 transition-colors hover:bg-calm hover:text-primary"
          >
            Staff login
          </Link>
          <ThemeToggle />
        </nav>
      </div>
      <motion.div
        style={{ scaleX: progress }}
        className="h-1 origin-left bg-gradient-to-r from-sky-400 via-teal-400 to-violet-400"
      />
    </header>
  );
}
