"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Home,
  Box,
  ShoppingBag,
  Camera,
  Shirt,
  Sun,
  Moon,
  LogIn,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/studio", label: "3D Studio", icon: Box },
  { href: "/shopper", label: "AI Shopper", icon: ShoppingBag },
  { href: "/tryon", label: "AR Try-On", icon: Camera },
  { href: "/wardrobe", label: "Wardrobe", icon: Shirt },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState<"noir" | "ivory">("noir");

  useEffect(() => {
    const saved =
      (localStorage.getItem("fashion-theme") as "noir" | "ivory") || "noir";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "noir" ? "ivory" : "noir";
    setTheme(next);
    localStorage.setItem("fashion-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <Link href="/" className="text-base font-bold tracking-tight">
          ATELIER<span className="text-[var(--accent)]">.AI</span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={logout}
              className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium"
            >
              <LogOut className="h-3.5 w-3.5 text-[var(--accent)]" />
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1.5 text-xs font-medium"
            >
              <LogIn className="h-3.5 w-3.5 text-[var(--accent)]" />
              Sign In
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-xs font-medium"
          >
            {theme === "noir" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            {theme === "noir" ? "Ivory" : "Noir"}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col justify-between border-r border-[var(--border)] bg-[var(--surface)] p-5 shrink-0">
        <div>
          <Link href="/" className="block mb-8 px-2">
            <h1 className="text-xl font-bold tracking-tight">
              ATELIER<span className="text-[var(--accent)]">.AI</span>
            </h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Virtual Fashion Platform
            </p>
          </Link>

          <nav className="flex flex-col gap-1.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2.5">
          {/* Account Block */}
          {user ? (
            <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold">{user.full_name}</p>
                <p className="truncate text-[10px] text-[var(--muted)]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="ml-2 rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)] transition"
            >
              <LogIn className="h-3.5 w-3.5 text-[var(--accent)]" />
              Sign In / Sign Up
            </Link>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-medium hover:bg-[var(--surface-hover)] transition"
          >
            <span className="flex items-center gap-2">
              {theme === "noir" ? (
                <Sun className="h-4 w-4 text-[var(--accent)]" />
              ) : (
                <Moon className="h-4 w-4 text-[var(--accent)]" />
              )}
              {theme === "noir" ? "Switch to Ivory" : "Switch to Noir"}
            </span>
            <span className="uppercase tracking-wider text-[10px] text-[var(--muted)]">
              {theme}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-5 md:p-10">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden border-t border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
                active ? "text-[var(--accent)]" : "text-[var(--muted)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}