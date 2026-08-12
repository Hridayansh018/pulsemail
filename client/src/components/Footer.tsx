import { FaXTwitter, FaInstagram } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";

const socials = [
  { href: "https://x.com/hridayansh018", icon: FaXTwitter, label: "X (Twitter)" },
  { href: "https://www.linkedin.com/in/hridayansh-awasthi-0095a12b6", icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://www.instagram.com/__hridayansh/", icon: FaInstagram, label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-white/5 bg-surface-container-lowest">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row md:px-16">
        <span className="mono-label font-bold normal-case text-primary">
          © 2024 PulseMail. Precision Engineering.
        </span>

        <div className="flex items-center gap-4">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
