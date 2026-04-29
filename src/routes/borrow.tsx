import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, Package, PackageSearch, Sparkles, ShieldCheck, Clock } from "lucide-react";
import { api } from "@/lib/api";
import type { Resource } from "@/lib/types";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { ReservationRequestDialog } from "@/components/ReservationRequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/borrow")({
  head: () => ({
    meta: [
      { title: "Borrow Equipment — Campus Resource Hub" },
      {
        name: "description",
        content: "Browse available campus equipment and submit a reservation request.",
      },
    ],
  }),
  component: BorrowPage,
});

function BorrowPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: resources, isLoading, isError, refetch } = useQuery({
    queryKey: ["resources", "available"],
    queryFn: api.resources.available,
  });
  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: api.tags.list });

  const filtered = useMemo(() => {
    let list = resources ?? [];
    if (activeTag) list = list.filter((r) => r.tags?.some((t) => t.name === activeTag));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.assetCode.toLowerCase().includes(q),
      );
    }
    return list;
  }, [resources, activeTag, search]);

  return (
    <PageShell title="Borrow Equipment" subtitle="Browse and request available campus resources">
      {/* Hero */}
      <section
        className="relative mb-8 overflow-hidden rounded-3xl border border-border p-6 text-primary-foreground md:p-10"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" /> Student Portal
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">
            Borrow university equipment in a few clicks.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed opacity-90 md:text-base">
            Browse what's available right now, then submit a quick reservation request. A staff
            member will review and confirm before you take any resource off campus.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5" /> Request before borrowing
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              <Clock className="h-3.5 w-3.5" /> Return on time, every time
            </span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment…"
            className="pl-9"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          {filtered.length} item{filtered.length === 1 ? "" : "s"} available
        </div>
      </div>

      {(tags ?? []).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              activeTag === null
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            All
          </button>
          {tags!.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTag(t.name)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeTag === t.name
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-display text-lg font-semibold text-destructive">
            Could not load equipment
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
          <Button onClick={() => refetch()} className="mt-4" variant="outline">
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No equipment is currently available"
          description="Try clearing filters or check back later — items may free up after returns."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-success">
                  {r.quantity > 0 ? `${r.quantity} available` : "Unavailable"}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold leading-tight">{r.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono">{r.assetCode}</span>
                <span>·</span>
                <span>{r.type}</span>
              </div>
              {r.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto pt-5">
                <Button
                  className="w-full"
                  disabled={r.quantity <= 0}
                  onClick={() => {
                    setSelected(r);
                    setDialogOpen(true);
                  }}
                >
                  Request Resource
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ReservationRequestDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resource={selected}
      />
    </PageShell>
  );
}
