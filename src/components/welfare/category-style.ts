import {
  BookOpen,
  Bus,
  HandHeart,
  HeartHandshake,
  House,
  Lightbulb,
  Shield,
  Utensils,
  type LucideIcon,
} from "lucide-react";

type CategoryStyle = { icon: LucideIcon; gradient: string; chip: string; emoji: string };

const STYLES: Record<string, CategoryStyle> = {
  house: {
    icon: House,
    gradient: "from-sky-400 to-cyan-400",
    chip: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200",
    emoji: "🏠",
  },
  utensils: {
    icon: Utensils,
    gradient: "from-amber-400 to-orange-400",
    chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
    emoji: "🍲",
  },
  shield: {
    icon: Shield,
    gradient: "from-emerald-400 to-teal-400",
    chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
    emoji: "🛡️",
  },
  bus: {
    icon: Bus,
    gradient: "from-indigo-400 to-violet-400",
    chip: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200",
    emoji: "🚌",
  },
  "hand-heart": {
    icon: HandHeart,
    gradient: "from-rose-400 to-pink-400",
    chip: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
    emoji: "🤝",
  },
  "heart-handshake": {
    icon: HeartHandshake,
    gradient: "from-fuchsia-400 to-purple-400",
    chip: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/20 dark:text-fuchsia-200",
    emoji: "💜",
  },
  "book-open": {
    icon: BookOpen,
    gradient: "from-lime-400 to-green-400",
    chip: "bg-lime-100 text-lime-700 dark:bg-lime-500/20 dark:text-lime-200",
    emoji: "📚",
  },
};

export const SUGGESTION_STYLE: CategoryStyle = {
  icon: Lightbulb,
  gradient: "from-yellow-400 to-amber-400",
  chip: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200",
  emoji: "💡",
};

export function categoryStyle(icon: string): CategoryStyle {
  return STYLES[icon] ?? STYLES["heart-handshake"];
}
