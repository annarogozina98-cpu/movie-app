"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Хотим посмотреть" },
  { href: "/watched", label: "Посмотрели" },
  { href: "/recommendations", label: "Рекомендации ИИ" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-card bg-surface p-1">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`whitespace-nowrap rounded-[7px] px-3.5 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-marquee text-bg"
                : "text-muted hover:bg-surface2 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
