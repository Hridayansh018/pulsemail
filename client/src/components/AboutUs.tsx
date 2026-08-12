import { MdSpeed, MdSecurity, MdCode, MdHistory } from "react-icons/md";

export default function About() {
  return (
    <section
      id="features"
      className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 border-t border-white/5 px-5 py-16 md:px-16 md:py-20"
    >
      <h2 className="mb-4 text-3xl font-semibold tracking-tight text-primary md:text-5xl">
        Technical Specifications
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-panel flex flex-col gap-4 rounded-xl p-6">
          <MdSpeed className="h-6 w-6 text-primary" />
          <h4 className="mono-label text-primary">Low Latency</h4>
          <p className="text-sm text-on-surface-variant">
            Pooled SMTP connections dispatch your list in a single, efficient pass.
          </p>
        </div>

        <div className="glass-panel flex flex-col gap-4 rounded-xl p-6">
          <MdSecurity className="h-6 w-6 text-primary" />
          <h4 className="mono-label text-primary">Own Your Keys</h4>
          <p className="text-sm text-on-surface-variant">
            Bring your own SMTP credentials. Nothing leaves your control.
          </p>
        </div>

        <div className="glass-panel flex flex-col gap-4 rounded-xl p-6">
          <MdHistory className="h-6 w-6 text-primary" />
          <h4 className="mono-label text-primary">Full History</h4>
          <p className="text-sm text-on-surface-variant">
            Every campaign is recorded with recipient counts and content previews.
          </p>
        </div>

        <div className="glass-panel flex flex-col gap-4 rounded-xl p-6 md:col-span-2 lg:col-span-1">
          <div className="flex w-full items-center justify-between">
            <MdCode className="h-6 w-6 text-primary" />
            <span className="mono-label text-on-surface-variant">CSV Native</span>
          </div>
          <h4 className="mono-label text-primary">Per-Recipient Content</h4>
          <p className="text-sm text-on-surface-variant">
            Map CSV columns to personalize subject and body for every address.
          </p>
        </div>
      </div>
    </section>
  );
}
