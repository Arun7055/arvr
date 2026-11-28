import Link from "next/link";
import { ArrowUpRight, Layers, Cpu, CloudSun, ShieldCheck } from "lucide-react";

const WORKFLOW = [
  {
    step: "01",
    title: "Describe or Capture",
    body: "Type a fabric prompt, set a budget in ₹, or snap photos of your existing closet. No 3D modeling skills or studio lighting required.",
  },
  {
    step: "02",
    title: "AI Material & Style Reasoning",
    body: "Fast LLM inference translates natural language into PBR surface parameters, color-coordinated outfits, and weather-appropriate layering.",
  },
  {
    step: "03",
    title: "Real-Time Browser Rendering",
    body: "Everything renders client-side—interactive 3D garments and webcam AR overlays run directly on your laptop or phone with zero GPU wait.",
  },
];

const HIGHLIGHTS = [
  {
    icon: Layers,
    label: "Digital Fabric Twins",
    value: "Live PBR control over roughness, sheen, weave, and custom decals.",
  },
  {
    icon: Cpu,
    label: "Client-Side AR",
    value: "Live webcam try-on runs locally in your browser—video never leaves your device.",
  },
  {
    icon: CloudSun,
    label: "Weather-Aware Closet",
    value: "Pulls live local temperature, humidity, and rain data to plan daily outfits.",
  },
  {
    icon: ShieldCheck,
    label: "Installable PWA",
    value: "Works as a full desktop web studio and installs as a native-feel app on mobile.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-12">
      {/* Editorial Hero */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 md:p-14">
        <span className="inline-block rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 text-[11px] font-mono tracking-wider text-[var(--muted)]">
          ATELIER.AI — VIRTUAL FASHION ENGINE
        </span>

        <h1 className="mt-5 max-w-3xl text-3xl md:text-5xl font-bold tracking-tight leading-[1.12]">
          From fabric physics to daily outfits—engineered for the browser.
        </h1>

        <p className="mt-4 max-w-2xl text-sm md:text-base text-[var(--muted)] leading-relaxed">
          Most virtual fashion tools lock you behind heavy downloads or slow cloud renders.
          Atelier.AI combines real-time 3D material synthesis, constraint-based styling, and
          on-device AR into one lightweight workspace.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-fg)] hover:opacity-90 transition"
          >
            Launch 3D Studio
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/shopper"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-5 py-2.5 text-sm font-semibold hover:bg-[var(--surface-hover)] transition"
          >
            Open AI Shopper
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">How the Platform Works</h2>
          <p className="text-xs text-[var(--muted)]">
            A three-stage pipeline connecting language reasoning to live visual output.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WORKFLOW.map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6"
            >
              <span className="text-xs font-mono font-bold text-[var(--accent)]">
                STEP {item.step}
              </span>
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Under the Hood */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">
        <h2 className="text-base font-semibold tracking-tight mb-5">Built for Real-World Use</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3.5">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-2.5 text-[var(--accent)]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">{label}</h3>
                <p className="mt-1 text-xs text-[var(--muted)] leading-relaxed">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}