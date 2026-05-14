import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, CalendarDays, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useRequireStudent } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/my-reservations")({
  head: () => ({
    meta: [
      { title: "My Reservations - Campus Resource Hub" },
      {
        name: "description",
        content: "View the status of your equipment reservation requests.",
      },
    ],
  }),
  component: MyReservationsPage,
});

function MyReservationsPage() {
  const { student, ready } = useRequireStudent();
  const { data: reservations, isLoading, isError } = useQuery({
    queryKey: ["reservations", "student", student?.id],
    queryFn: () => api.reservations.byStudent(Number(student!.id)),
    enabled: !!student?.id,
  });

  if (!ready || !student) return null;

  const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleDateString() : "Awaiting approval";

  return (
    <PageShell title="My Reservations" subtitle="Track the status of your borrowing requests">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Signed in student
          </div>
          <div className="mt-2 text-lg font-semibold text-foreground">
            {student.fullName || "Student"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{student.email}</p>
        </div>
        <Link
          to="/borrow"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft transition hover:translate-y-[-1px]"
        >
          Borrow new equipment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-border bg-card/60" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="font-display text-lg font-semibold text-destructive">
            Could not load your reservations
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Please check your connection and try again.
          </p>
        </div>
      ) : (reservations ?? []).length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="You have not requested any resources yet"
          description="Head over to the Borrow page to make your first reservation request."
          action={
            <Link
              to="/borrow"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Borrow equipment <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(reservations ?? []).map((r) => {
            const overdue = r.status === "OVERDUE";
            const pending = r.status === "PENDING";
            const approved = r.status === "APPROVED";
            const rejected = r.status === "REJECTED";
            return (
              <article
                key={r.id}
                className={`rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-elevated ${
                  overdue
                    ? "border-destructive/40 bg-destructive/5"
                    : pending
                      ? "border-amber-500/30 bg-amber-500/5"
                      : approved
                        ? "border-sky-500/30 bg-sky-500/5"
                        : rejected
                          ? "border-border bg-muted/30"
                          : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Reservation #{r.id}
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold leading-tight">
                      {r.resourceName}
                    </h3>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> Request start
                    </dt>
                    <dd className="mt-1 font-medium">{formatDate(r.startDate)}</dd>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> Requested end
                    </dt>
                    <dd className="mt-1 font-medium">{formatDate(r.endDate)}</dd>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> Expected return
                    </dt>
                    <dd className={`mt-1 font-medium ${overdue ? "text-destructive" : ""}`}>
                      {formatDate(r.expectedReturnDate)}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <dt className="text-muted-foreground">Requested duration</dt>
                    <dd className="mt-1 font-medium">
                      {r.weekdayDurationDays} weekday{r.weekdayDurationDays === 1 ? "" : "s"}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <dt className="text-muted-foreground">Calendar span</dt>
                    <dd className="mt-1 font-medium">
                      {r.durationDays} day{r.durationDays === 1 ? "" : "s"}
                    </dd>
                  </div>
                  {r.checkoutDate && (
                    <div className="col-span-2 rounded-lg bg-secondary/60 p-3">
                      <dt className="text-muted-foreground">Approved checkout</dt>
                      <dd className="mt-1 font-medium">{formatDate(r.checkoutDate)}</dd>
                    </div>
                  )}
                  {r.actualReturnDate && (
                    <div className="col-span-2 rounded-lg bg-success/10 p-3">
                      <dt className="text-success/80">Returned on</dt>
                      <dd className="mt-1 font-medium text-success">
                        {new Date(r.actualReturnDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>

                {r.purpose && (
                  <div className="mt-3 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Purpose:</span> {r.purpose}
                  </div>
                )}

                {pending && (
                  <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700">
                    This request is waiting for admin approval. Checkout and return dates will be confirmed once staff approve it.
                  </div>
                )}
                {approved && (
                  <div className="mt-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-700">
                    This request has been approved and scheduled. The equipment is reserved for your selected start date.
                  </div>
                )}
                {overdue && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    This item is overdue. Please return it to the staff office.
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
