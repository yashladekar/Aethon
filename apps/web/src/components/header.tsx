"use client";
import Link from "next/link";
import type { Route } from "next";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links: ReadonlyArray<{ to: Route; label: string }> = [
    { to: "/", label: "Home" },
    { to: "/roadmaps", label: "Roadmaps" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/ai", label: "AI Chat" },
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} href={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
