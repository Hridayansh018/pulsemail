"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

import {
    signOut,
  signOut as supaSignOut,
} from "@/lib/AUth"; // <-- ensure this path exists


const links = [
  { href: "/home", label: "Home" },
//   { href: "/connection", label: "Connection" },
  { href: "/history", label: "History" },
//   { href: "/auth", label: "Auth" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogOut = async () => {
    try {
        await signOut();
        router.replace('/auth')
    } catch(err){
        console.log('error logging out')
    }
  }

  return (
    <nav className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className="
          flex items-center gap-6
          rounded-full border border-white/20 bg-white/10 px-6 py-2
          shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md
        "
      >
        {links.map(({ href, label }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm font-medium transition ${
                active
                  ? "text-white"
                  : "text-white/80 hover:text-white"
              }`}
              
            >
              {label}
            </Link>
          );
        })}
        <button className="text-sm font-medium transition-colors duration-300 text-white/80 hover:text-white hover:bg-red-500 rounded-2xl px-3 p-1" onClick={handleLogOut}>Log Out</button>
      </div>
    </nav>
  );
}
