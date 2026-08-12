"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MdHome, MdHistory, MdLogout } from "react-icons/md";
import { signOut } from "@/lib/AUth";

const links = [
  { href: "/home", label: "Home", icon: MdHome },
  { href: "/history", label: "History", icon: MdHistory },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (err) {
      console.log("error logging out");
    }
  };

  return (
    <>
      {/* Top app bar */}
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-surface/80 px-5 backdrop-blur-md md:px-16">
        <Link href="/home" className="text-2xl font-bold tracking-tighter text-primary">
          PulseMail
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`mono-label flex items-center gap-2 normal-case transition-opacity hover:opacity-80 ${
                  active ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleLogOut}
            className="mono-label flex items-center gap-2 normal-case text-on-surface-variant transition-opacity hover:opacity-80"
          >
            <MdLogout className="h-[18px] w-[18px]" />
            Logout
          </button>
        </nav>
      </header>

      {/* Bottom floating pill (mobile only) */}
      <nav className="fixed bottom-8 left-1/2 z-50 flex w-max -translate-x-1/2 items-center gap-10 rounded-full border border-white/10 bg-white/5 px-6 py-3 shadow-lg backdrop-blur-xl md:hidden">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={`transition-all active:scale-90 ${
                active ? "scale-110 text-primary" : "text-on-surface-variant hover:text-primary/80"
              }`}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
        <button
          onClick={handleLogOut}
          aria-label="Logout"
          className="text-on-surface-variant transition-all hover:text-primary/80 active:scale-90"
        >
          <MdLogout className="h-6 w-6" />
        </button>
      </nav>
    </>
  );
}
