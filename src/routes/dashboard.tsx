import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageShell } from "@/components/PageShell";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Users, Boxes, Tags, CalendarCheck, AlertTriangle, PackageCheck,
  ArrowUpRight, Plus, Search,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Campus Resource Hub" },
      { name: "description", content: "Live overview of students, resources, and reservations." },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  icon: Icon, label, value, accent, hint,
}: { icon: React.ElementType; label: string; value: number | string; accent: string; hint?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated">
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl ${accent}`} />
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="mt-5 font-display text-3xl font-semibold tabular-nums">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function DashboardPage() {
  const summary = useQuery({ queryKey: ["dashboard"], queryFn: api.dashboard.summary });
  const reservations = useQuery({ queryKey: ["reservations"], queryFn: api.reservations.list });
  const overdue = useQuery({ queryKey: ["reservations", "overdue"], queryFn: api.reservations.overdue });

  const recent = (reservations.data ?? []).slice(0, 6);

  return (
    <PageShell title="Dashboard" subtitle="Overview of campus inventory & activity">
      {/* Welcome */}
      <div
        className="relative mb-8 overflow-hidden rounded-3xl border border-border p-6 text-primary-foreground md:p-8"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest opacity-80">Welcome back</div>
            <h2 className="mt-2 font-display text-3xl font-semibold leading-tight md:text-4xl">
              Manage your campus equipment, in one elegant view.
            </h2>
            <p className="mt-3 text-sm opacity-90">
              {summary.data
                ? `${summary.data.availableUnits} units available · ${summary.data.activeReservations} active reservations`
                : "Loading live stats…"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/reservations" className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-foreground shadow-soft hover:translate-y-[-1px] transition">
              <Plus className="h-4 w-4" /> New reservation
            </Link>
            <Link to="/resources" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-white/20 transition">
              <Search className="h-4 w-4" /> Browse resources
            </Link>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={Users} label="Students" value={summary.data?.totalStudents ?? "—"} accent="bg-primary" />
        <StatCard icon={Boxes} label="Resources" value={summary.data?.totalResources ?? "—"} accent="bg-accent" />
        <StatCard icon={Tags} label="Tags" value={summary.data?.totalTags ?? "—"} accent="bg-primary/80" />
        <StatCard icon={CalendarCheck} label="Active" value={summary.data?.activeReservations ?? "—"} accent="bg-success" />
        <StatCard icon={AlertTriangle} label="Overdue" value={summary.data?.overdueReservations ?? "—"} accent="bg-destructive" />
        <StatCard icon={PackageCheck} label="Available" value={summary.data?.availableUnits ?? "—"} accent="bg-foreground" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent reservations */}
        <div className="rounded-2xl border border-border bg-card shadow-soft lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="font-display text-lg font-semibold">Recent reservations</h3>
              <p className="text-xs text-muted-foreground">Latest checkouts across the campus</p>
            </div>
            <Link to="/reservations" className="text-xs font-medium text-accent hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-border">
            {recent.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">No reservations yet.</div>
            )}
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.resourceName}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.studentName} · expected {new Date(r.expectedReturnDate).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 shadow-soft">
          <div className="flex items-center gap-2 border-b border-destructive/20 px-6 py-4">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="font-display text-lg font-semibold text-destructive">Overdue items</h3>
          </div>
          <div className="divide-y divide-destructive/15">
            {(overdue.data ?? []).length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-muted-foreground">All clear. 🎉</div>
            )}
            {(overdue.data ?? []).slice(0, 6).map((r) => (
              <div key={r.id} className="px-6 py-3 text-sm">
                <div className="font-medium">{r.resourceName}</div>
                <div className="text-xs text-muted-foreground">
                  {r.studentName} · due {new Date(r.expectedReturnDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
