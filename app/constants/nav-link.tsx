import {
  Book,
  Heart,
  Star,
  Bookmark,
  Sun,
  List,
  Calculator,
  Timer,
} from "lucide-react";

const muslimLinks: {
  title: string;
  href: string;
  description: string;
  icon: SVGSVGElement;
}[] = [
  {
    title: "Al Qur'an",
    href: "/muslim/quran",
    description: "Temukan ketenangan melalui ayat-ayat Al Qur'an.",
    icon: Book,
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
    icon: Star,
  },
  {
    title: "Tahlil",
    href: "/muslim/tahlil",
    description: "Doakan yang tercinta dengan tahlil penuh makna.",
    icon: Bookmark,
  },
  {
    title: "Do'a",
    href: "/muslim/doa",
    description: "Awali hari dengan doa untuk keberkahan hidup.",
    icon: Sun,
  },
];

const toolsLinks: {
  title: string;
  href: string;
  description: string;
  icon: SVGSVGElement;
}[] = [
  {
    title: "Daily tasks",
    href: "/tools/daily-tasks",
    description: "Daily tasks with pomodoro",
    icon: List,
  },
  {
    title: "Kalkulator",
    href: "/tools/calculator",
    description: "Simple Kalkulator",
    icon: Calculator,
  },
  {
    title: "Pomodoro",
    href: "/tools/pomodoro",
    description: "Simple Pomodoro",
    icon: Timer,
  },
];

export { muslimLinks, toolsLinks };
