import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ClipboardList, CalendarDays, AlertTriangle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useRole } from "@/lib/role";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/my-reservations")({
  head: () => ({
    meta: [
      { title: "My Reservations — Campus Resource Hub" },
      {
        name: "description",
        content: "View the status of your equipment reservation requests.",
      },
    ],
  }),
  component: MyReservationsPage,
});

function MyReservationsPage() {
  const { studentId, setStudentId } = useRole();
  const [pendingId, setPendingId] = useState<string>(studentId);

  useEffect(() => {
    setPendingId(studentId);
  }, [studentId]);

  const { data: students } = useQuery({ queryKey: ["students"], queryFn: api.students.list });

  const { data: reservations, isLoading, isError } = useQuery({
    queryKey: ["reservations", "student", studentId],
    queryFn: () => api.reservations.byStudent(Number(studentId)),
    enabled: !!studentId,
  });

  const activeStudent = (students ?? []).find((s) => String(s.id) === studentId);

  return (
    <PageShell title="My Reservations" subtitle="Track the status of your borrowing requests">
      {/* Identity panel */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Viewing reservations for
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Select value={pendingId} onValueChange={setPendingId}>
              <SelectTrigger className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select your student profile…" />
              </SelectTrigger>
              <SelectContent>
                {(students ?? []).map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.profile?.fullName || s.username}
                    {s.profile?.department ? ` · ${s.profile.department}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setStudentId(pendingId)} disabled={!pendingId}>
              Load
            </Button>
          </div>
          {activeStudent && (
            <p className="mt-2 text-xs text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">
                {activeStudent.profile?.fullName || activeStudent.username}
              </span>
            </p>
          )}
        </div>
        <Link
          to="/borrow"
          className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-soft transition hover:translate-y-[-1px]"
        >
          Borrow new equipment <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {!studentId ? (
        <EmptyState
          icon={ClipboardList}
          title="Select your student profile"
          description="Choose your profile above to view your reservation history."
        />
      ) : isLoading ? (
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
            return (
              <article
                key={r.id}
                className={`rounded-2xl border bg-card p-5 shadow-soft transition hover:shadow-elevated ${
                  overdue ? "border-destructive/40 bg-destructive/5" : "border-border"
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
                      <CalendarDays className="h-3 w-3" /> Checkout
                    </dt>
                    <dd className="mt-1 font-medium">
                      {new Date(r.checkoutDate).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-3">
                    <dt className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="h-3 w-3" /> Expected return
                    </dt>
                    <dd className={`mt-1 font-medium ${overdue ? "text-destructive" : ""}`}>
                      {new Date(r.expectedReturnDate).toLocaleDateString()}
                    </dd>
                  </div>
                  {r.actualReturnDate && (
                    <div className="col-span-2 rounded-lg bg-success/10 p-3">
                      <dt className="text-success/80">Returned on</dt>
                      <dd className="mt-1 font-medium text-success">
                        {new Date(r.actualReturnDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>

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
