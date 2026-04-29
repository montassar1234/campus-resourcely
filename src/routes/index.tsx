import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Camera, Cpu, Projector, Sparkles, ShieldCheck, Zap, GraduationCap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold">Resource Hub</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Campus</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-8 text-sm md:flex">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#equipment" className="text-muted-foreground hover:text-foreground">Equipment</a>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-soft transition hover:bg-primary/90"
          >
            Open dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--gradient-warm)" }}
      >
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full opacity-30 blur-3xl"
             style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Built for university labs & media studios
            </div>
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Reserve campus equipment <span className="italic text-accent">elegantly</span>.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Campus Resource Hub is a unified platform for students and staff to book cameras,
              Arduino kits, projectors, and lab devices — with live availability, smart tagging,
              and overdue tracking baked in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/borrow"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-elevated transition hover:translate-y-[-1px] hover:bg-accent/90"
              >
                Borrow equipment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elevated transition hover:translate-y-[-1px] hover:bg-primary/90"
              >
                Staff dashboard
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 text-sm">
              {[
                { k: "98%", v: "On-time returns" },
                { k: "12+", v: "Equipment types" },
                { k: "<2 min", v: "Avg. checkout" },
              ].map((s) => (
                <div key={s.v}>
                  <div className="font-display text-2xl font-semibold text-foreground">{s.k}</div>
                  <div className="text-xs text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card stack */}
          <div className="relative">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Today's reservations
                </div>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">LIVE</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { name: "Sony A7 III", who: "L. Hassan", tag: "Camera", color: "bg-primary/10 text-primary" },
                  { name: "Arduino Mega Kit", who: "M. Diop", tag: "Electronics", color: "bg-accent/15 text-accent" },
                  { name: "Epson Projector", who: "S. Ndiaye", tag: "AV", color: "bg-warning/30 text-foreground" },
                ].map((r) => (
                  <div key={r.name} className="flex items-center justify-between rounded-xl border border-border bg-background/60 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">Reserved by {r.who}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.color}`}>{r.tag}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-70">Available now</div>
                  <div className="font-display text-2xl font-semibold">142 units</div>
                </div>
                <Zap className="h-6 w-6 opacity-80" />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-border bg-card p-4 shadow-elevated md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/15 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Zero-loss tracking</div>
                  <div className="text-[10px] text-muted-foreground">Asset codes & overdue alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-widest text-accent">Features</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
            Everything your lab manager wishes they had.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Camera, title: "Smart catalog", desc: "Tag-based search across cameras, kits, and lab devices with live availability counts." },
            { icon: Cpu, title: "Instant reservations", desc: "Book in seconds. Expected return dates auto-flag overdue items in a single click." },
            { icon: Projector, title: "Audit-ready", desc: "Every checkout, return, and overdue event is logged against a unique asset code." },
          ].map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-elevated">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div
          className="relative overflow-hidden rounded-3xl px-8 py-14 text-primary-foreground md:px-14 md:py-20"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-3xl font-semibold leading-tight md:text-4xl">
              Ready to manage your campus inventory?
            </h2>
            <p className="mt-4 text-base opacity-90">
              Open the staff dashboard and start tracking students, resources, and reservations in real time.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-medium text-foreground shadow-elevated transition hover:translate-y-[-1px]"
              >
                Open dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur transition hover:bg-white/20"
              >
                Browse resources
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Campus Resource Hub — Academic project.</div>
          <div>Spring Boot REST · React · TanStack</div>
        </div>
      </footer>
    </div>
  );
}
