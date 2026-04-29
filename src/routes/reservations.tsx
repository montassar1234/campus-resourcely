import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Search, CalendarCheck, CornerDownLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { Reservation, ReservationStatus } from "@/lib/types";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/reservations")({
  head: () => ({ meta: [{ title: "Reservations — Campus Resource Hub" }] }),
  component: ReservationsPage,
});

const STATUSES: (ReservationStatus | "ALL")[] = ["ALL", "ACTIVE", "RETURNED", "OVERDUE"];

function ReservationsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">("ALL");
  const [studentFilter, setStudentFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", statusFilter],
    queryFn: () => statusFilter === "ALL" ? api.reservations.list() : api.reservations.byStatus(statusFilter),
  });
  const { data: students } = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const { data: resources } = useQuery({ queryKey: ["resources"], queryFn: api.resources.list });

  const filtered = useMemo(() => {
    let list = reservations ?? [];
    if (studentFilter !== "ALL") list = list.filter((r) => String(r.studentId) === studentFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((r) => r.resourceName.toLowerCase().includes(q) || r.studentName.toLowerCase().includes(q));
    }
    return list;
  }, [reservations, studentFilter, search]);

  const returnMut = useMutation({
    mutationFn: (id: number) => api.reservations.markReturned(id),
    onSuccess: () => { toast.success("Marked as returned"); qc.invalidateQueries({ queryKey: ["reservations"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const removeMut = useMutation({
    mutationFn: (id: number) => api.reservations.remove(id),
    onSuccess: () => { toast.success("Reservation deleted"); qc.invalidateQueries({ queryKey: ["reservations"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell title="Reservations" subtitle="Track checkouts, returns & overdue items">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className="pl-9" />
        </div>
        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All students" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All students</SelectItem>
            {(students ?? []).map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.profile?.fullName || s.username}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="ml-auto gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New reservation
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${statusFilter === s ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card hover:bg-secondary"}`}
          >{s}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl border border-border bg-card/60" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="No reservations" description="Create one to start tracking equipment usage." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:grid">
            <div>Resource</div><div>Student</div><div>Checkout</div><div>Expected</div><div>Status</div><div></div>
          </div>
          <div className="divide-y divide-border">
            {filtered.map((r) => <ReservationRow key={r.id} r={r} onReturn={() => returnMut.mutate(r.id)} onDelete={() => setConfirmId(r.id)} />)}
          </div>
        </div>
      )}

      <NewReservationDialog
        open={dialogOpen} onOpenChange={setDialogOpen}
        students={students ?? []} resources={resources ?? []}
      />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(o) => !o && setConfirmId(null)}
        title="Delete this reservation?"
        onConfirm={() => { if (confirmId) removeMut.mutate(confirmId); setConfirmId(null); }}
      />
    </PageShell>
  );
}

function ReservationRow({ r, onReturn, onDelete }: { r: Reservation; onReturn: () => void; onDelete: () => void }) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 px-6 py-4 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] md:gap-4">
      <div>
        <div className="font-medium">{r.resourceName}</div>
        <div className="text-[11px] text-muted-foreground md:hidden">{r.studentName}</div>
      </div>
      <div className="hidden text-sm md:block">{r.studentName}</div>
      <div className="hidden text-xs text-muted-foreground md:block">{new Date(r.checkoutDate).toLocaleDateString()}</div>
      <div className="hidden text-xs text-muted-foreground md:block">{new Date(r.expectedReturnDate).toLocaleDateString()}</div>
      <div><StatusBadge status={r.status} /></div>
      <div className="flex justify-end gap-1.5">
        {r.status !== "RETURNED" && (
          <Button size="sm" variant="ghost" onClick={onReturn} className="gap-1.5"><CornerDownLeft className="h-3.5 w-3.5" /> Return</Button>
        )}
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}

type NewValues = { studentId: string; resourceId: string; expectedReturnDate: string };

function NewReservationDialog({
  open, onOpenChange, students, resources,
}: { open: boolean; onOpenChange: (o: boolean) => void; students: any[]; resources: any[] }) {
  const qc = useQueryClient();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<NewValues>({
    defaultValues: { studentId: "", resourceId: "", expectedReturnDate: tomorrow },
  });

  const mut = useMutation({
    mutationFn: (v: NewValues) => api.reservations.create({
      studentId: Number(v.studentId), resourceId: Number(v.resourceId), expectedReturnDate: v.expectedReturnDate,
    }),
    onSuccess: () => {
      toast.success("Reservation created");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false); reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="font-display">New reservation</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Student</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("studentId", { required: "Required" })}>
              <option value="">Select a student…</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.profile?.fullName || s.username}</option>)}
            </select>
            {errors.studentId && <p className="text-xs text-destructive">{errors.studentId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Resource</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...register("resourceId", { required: "Required" })}>
              <option value="">Select a resource…</option>
              {resources.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.assetCode})</option>)}
            </select>
            {errors.resourceId && <p className="text-xs text-destructive">{errors.resourceId.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Expected return date</Label>
            <Input type="date" {...register("expectedReturnDate", { required: "Required" })} />
            {errors.expectedReturnDate && <p className="text-xs text-destructive">{errors.expectedReturnDate.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Creating…" : "Create"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
