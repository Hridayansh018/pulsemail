import React from "react";
import Link from "next/link";
import { MdDataObject, MdRocketLaunch, MdQueryStats } from "react-icons/md";

const steps = [
  {
    n: "01",
    icon: MdDataObject,
    title: "Import",
    text: "Ingest high-volume contact data via CSV. Map your columns and validate every address before send.",
  },
  {
    n: "02",
    icon: MdRocketLaunch,
    title: "Send",
    text: "Execute personalized campaigns through your own SMTP connection with per-recipient content.",
  },
  {
    n: "03",
    icon: MdQueryStats,
    title: "Track",
    text: "Review every dispatch in a full campaign history with recipient counts and delivery outcomes.",
  },
];

const Hero = () => {
  return (
    <section
      id="top"
      className="mx-auto mt-[120px] flex w-full max-w-[1280px] flex-col gap-20 px-5 md:px-16"
    >
      {/* Hero */}
      <div className="flex flex-col items-center gap-8 border-b border-white/5 py-16 text-center md:py-20">
        <div className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="mono-label tracking-widest text-primary">System Operational</span>
        </div>

        <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tighter text-on-background md:text-7xl lg:text-[80px] lg:leading-[90px]">
          Precision Email Delivery.
          <br />
          <span className="text-primary">Engineered</span> for Scale.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-on-surface-variant">
          A high-performance pipeline for modern teams. Import, personalize, and deliver
          bulk email through your own connection — with stark, brutal efficiency.
        </p>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <Link href="/auth" className="btn-primary rounded-full px-8 py-3">
            Deploy Now
          </Link>
          <a href="#features" className="btn-outline rounded-full px-8 py-3">
            Read Documentation
          </a>
        </div>
      </div>

      {/* The Pipeline */}
      <div className="flex flex-col gap-8 pb-4">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <h2 className="text-3xl font-semibold tracking-tight text-primary md:text-5xl">
            The Pipeline
          </h2>
          <span className="mono-label text-on-surface-variant">v2.4 Core Loop</span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map(({ n, icon: Icon, title, text }) => (
            <div key={n} className="glass-panel group relative rounded-lg p-6">
              <div className="mono-label absolute right-6 top-6 text-on-surface-variant">{n}</div>
              <Icon className="mb-4 h-9 w-9 text-primary" />
              <h3 className="mb-2 text-2xl font-semibold tracking-tight text-primary">{title}</h3>
              <p className="text-on-surface-variant">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
