import {
  Book,
  BookOpen,
  Circle,
  Activity,
  Heart,
  Bookmark,
  Sun,
  List,
  Calculator,
  Timer,
  Repeat,
  Star,
  Puzzle,
  type LucideProps,
} from "lucide-react";
import React from "react";

export type Links = {
  title: string;
  href: string;
  description: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
};

const muslimLinks: Links[] = [
  {
    title: "Bookmarks",
    href: "/tools/bookmarks",
    description: "List Bookmark ayah, doa and anymore.",
    icon: Star,
  },
  {
    title: "Al Qur'an",
    href: "/muslim/quran",
    description: "Temukan ketenangan melalui ayat-ayat Al Qur'an.",
    icon: Book,
  },
  {
    title: "Game Al Qur'an",
    href: "/muslim/quran-word-by-word",
    description: "Game susun kata setiap ayat quran",
    icon: Puzzle,
  },
  {
    title: "Sholawat",
    href: "/muslim/sholawat",
    description: "Dekatkan diri dengan Rasulullah melalui sholawat.",
    icon: Heart,
  },
  {
    title: "Dzikir",
    href: "/muslim/dzikir",
    description: "Hiasi hari dengan dzikir dan ingat Allah selalu.",
    icon: BookOpen,
  },
  {
    title: "Tahlil",
    href: "/muslim/tahlil",
    description: "Doakan yang tercinta dengan tahlil penuh makna.",
    icon: Circle,
  },
  {
    title: "Kumpulan Do'a",
    href: "/muslim/doa",
    description: "Awali hari dengan doa untuk keberkahan hidup.",
    icon: Sun,
  },
  {
    title: "Do'a Sehari-hari",
    href: "/muslim/doa-sehari-hari",
    description: "Awali hari dengan doa untuk keberkahan hidup.",
    icon: Activity,
  },
];

const toolsLinks: Links[] = [
  {
    title: "Kalkulator",
    href: "/tools/calculator",
    description: "Simple Kalkulator",
    icon: Calculator,
  },
  {
    title: "Daily tasks",
    href: "/tools/daily-tasks",
    description: "Daily tasks with pomodoro",
    icon: List,
  },
  {
    title: "Pomodoro",
    href: "/tools/pomodoro",
    description: "Simple Pomodoro",
    icon: Timer,
  },
  {
    title: "Habit",
    href: "/tools/habit",
    description: "Simple Habit tracker",
    icon: Repeat,
  },
];

export { muslimLinks, toolsLinks };
