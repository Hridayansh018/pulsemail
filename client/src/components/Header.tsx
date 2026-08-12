"use client";
import Link from "next/link";
import { useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";

const navLinks = [
  { href: "#top", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-5 md:px-16">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpen((v) => !v)}
            className="text-primary transition-opacity hover:opacity-80 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <MdClose className="h-6 w-6" /> : <MdMenu className="h-6 w-6" />}
          </button>
          <Link href="#top" className="text-2xl font-bold tracking-tighter text-primary">
            PulseMail
          </Link>
        </div>

        <nav className="hidden gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={label}
              href={href}
              className="mono-label text-on-surface-variant transition-colors hover:text-primary"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/auth" className="btn-primary rounded-full text-sm">
            Login
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/5 px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="mono-label rounded-lg px-2 py-2 text-on-surface-variant transition-colors hover:bg-white/5 hover:text-primary"
              >
                {label}
              </a>
            ))}
            <Link href="/auth" onClick={() => setOpen(false)} className="btn-primary mt-2 w-full rounded-full text-sm">
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
