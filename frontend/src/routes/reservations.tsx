import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Search,
  CalendarCheck,
  CornerDownLeft,
  Send,
  CheckCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Reservation, ReservationStatus, Resource, Student } from "@/lib/types";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { SmartPagination } from "@/components/SmartPagination";
import { StatusBadge } from "@/components/StatusBadge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/reservations")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/reservations" });
  },
  component: () => null,
});

const STATUSES: (ReservationStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "REJECTED",
  "APPROVED",
  "ACTIVE",
  "RETURNED",
  "OVERDUE",
];
const PAGE_SIZE = 8;
type SortKey = "startDate" | "endDate" | "status" | "studentName" | "resourceName";
type SortDirection = "asc" | "desc";

export function ReservationsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">("ALL");
  const [studentFilter, setStudentFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [alerting, setAlerting] = useState<Reservation | null>(null);

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations", statusFilter],
    queryFn: () =>
      statusFilter === "ALL" ? api.reservations.list() : api.reservations.byStatus(statusFilter),
  });
  const { data: students } = useQuery({ queryKey: ["students"], queryFn: api.students.list });
  const { data: resources } = useQuery({ queryKey: ["resources"], queryFn: api.resources.list });

  const filtered = useMemo(() => {
    let list = reservations ?? [];
    if (studentFilter !== "ALL") {
      list = list.filter((reservation) => String(reservation.studentId) === studentFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (reservation) =>
          reservation.resourceName.toLowerCase().includes(q) ||
          reservation.studentName.toLowerCase().includes(q),
      );
    }
    // Sorting is done after filtering so the table header order always matches what is visible.
    return [...list].sort((a, b) => compareReservations(a, b, sortKey, sortDirection));
  }, [reservations, studentFilter, search, sortKey, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginatedReservations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, studentFilter, search, sortKey, sortDirection]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const returnMut = useMutation({
    mutationFn: (id: number) => api.reservations.markReturned(id),
    onSuccess: () => {
      toast.success("Marked as returned");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const approveMut = useMutation({
    mutationFn: (id: number) => api.reservations.approve(id),
    onSuccess: (reservation) => {
      if (reservation.status === "REJECTED") {
        toast.error("Reservation rejected because the selected dates are no longer available");
      } else {
        toast.success("Reservation approved");
      }
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["resources", "available"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => api.reservations.remove(id),
    onSuccess: () => {
      toast.success("Reservation deleted");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const alertMut = useMutation({
    mutationFn: ({ reservationId, message }: { reservationId: number; message?: string }) =>
      api.notifications.sendReturnAlert(reservationId, { message }),
    onSuccess: () => {
      toast.success("Return alert sent to the student");
      qc.invalidateQueries({ queryKey: ["notifications"] });
      setAlerting(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell
      title="Reservations"
      subtitle="Review requests, approve borrowing, and track returns"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-9"
          />
        </div>
        <Select value={studentFilter} onValueChange={setStudentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All students" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All students</SelectItem>
            {(students ?? []).map((student) => (
              <SelectItem key={student.id} value={String(student.id)}>
                {student.profile?.fullName || student.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="ml-auto gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> New reservation
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              statusFilter === status
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No reservations"
          description="Create one to start tracking equipment usage."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
          <div className="hidden grid-cols-[1.8fr_1.4fr_1fr_1fr_1fr_auto] gap-4 border-b border-border bg-secondary/50 px-6 py-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground md:grid">
            <SortableHeader
              label="Resource"
              sortValue="resourceName"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={(value) => handleSort(value)}
            />
            <SortableHeader
              label="Student"
              sortValue="studentName"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={(value) => handleSort(value)}
            />
            <SortableHeader
              label="Start"
              sortValue="startDate"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={(value) => handleSort(value)}
            />
            <SortableHeader
              label="End / Return"
              sortValue="endDate"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={(value) => handleSort(value)}
            />
            <SortableHeader
              label="Status"
              sortValue="status"
              activeSort={sortKey}
              direction={sortDirection}
              onSort={(value) => handleSort(value)}
            />
            <div></div>
          </div>
          <div className="divide-y divide-border">
            {paginatedReservations.map((reservation) => (
              <ReservationRow
                key={reservation.id}
                reservation={reservation}
                onApprove={() => approveMut.mutate(reservation.id)}
                onReturn={() => returnMut.mutate(reservation.id)}
                onDelete={() => setConfirmId(reservation.id)}
                onAlert={() => setAlerting(reservation)}
              />
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} reservations
            </p>
            <SmartPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}

      <NewReservationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        students={students ?? []}
        resources={resources ?? []}
      />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this reservation?"
        onConfirm={() => {
          if (confirmId) removeMut.mutate(confirmId);
          setConfirmId(null);
        }}
      />
      <AdminAlertDialog
        open={alerting !== null}
        onOpenChange={(open) => !open && setAlerting(null)}
        reservation={alerting}
        onSubmit={(message) => {
          if (!alerting) return;
          alertMut.mutate({ reservationId: alerting.id, message });
        }}
        isSubmitting={alertMut.isPending}
      />
    </PageShell>
  );

  function handleSort(value: SortKey) {
    if (sortKey === value) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(value);
    setSortDirection(value === "startDate" || value === "endDate" ? "desc" : "asc");
  }
}

function SortableHeader({
  label,
  sortValue,
  activeSort,
  direction,
  onSort,
}: {
  label: string;
  sortValue: SortKey;
  activeSort: SortKey;
  direction: SortDirection;
  onSort: (value: SortKey) => void;
}) {
  const active = activeSort === sortValue;
  // The icon makes table sorting visible without adding another filter control.
  const Icon = !active ? ArrowUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(sortValue)}
      className={`inline-flex w-fit items-center gap-1.5 rounded-md text-left transition hover:text-foreground ${
        active ? "text-foreground" : ""
      }`}
    >
      {label}
      <Icon className="h-3 w-3" />
    </button>
  );
}

function compareReservations(
  a: Reservation,
  b: Reservation,
  sortKey: SortKey,
  direction: SortDirection,
) {
  const factor = direction === "asc" ? 1 : -1;
  const aValue = reservationSortValue(a, sortKey);
  const bValue = reservationSortValue(b, sortKey);

  if (typeof aValue === "number" && typeof bValue === "number") {
    return (aValue - bValue) * factor;
  }
  return String(aValue).localeCompare(String(bValue)) * factor;
}

function reservationSortValue(reservation: Reservation, sortKey: SortKey) {
  if (sortKey === "startDate") return new Date(reservation.startDate).getTime();
  if (sortKey === "endDate") {
    // Approved reservations use expectedReturnDate; pending requests still have the calculated endDate.
    return new Date(reservation.expectedReturnDate ?? reservation.endDate).getTime();
  }
  return reservation[sortKey].toLowerCase();
}

function ReservationRow({
  reservation,
  onApprove,
  onReturn,
  onDelete,
  onAlert,
}: {
  reservation: Reservation;
  onApprove: () => void;
  onReturn: () => void;
  onDelete: () => void;
  onAlert: () => void;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 px-6 py-4 md:grid-cols-[1.8fr_1.4fr_1fr_1fr_1fr_auto] md:gap-4">
      <div>
        <div className="font-medium">{reservation.resourceName}</div>
        <div className="text-[11px] text-muted-foreground md:hidden">{reservation.studentName}</div>
      </div>
      <div className="hidden text-sm md:block">{reservation.studentName}</div>
      <div className="hidden text-xs text-muted-foreground md:block">
        {new Date(reservation.startDate).toLocaleDateString()}
      </div>
      <div className="hidden text-xs text-muted-foreground md:block">
        {new Date(reservation.expectedReturnDate ?? reservation.endDate).toLocaleDateString()}
      </div>
      <div>
        <StatusBadge status={reservation.status} />
      </div>
      <div className="flex justify-end gap-1.5">
        {reservation.status === "PENDING" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onApprove}
            className="gap-1.5 text-primary hover:text-primary"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Approve
          </Button>
        )}
        {reservation.status === "OVERDUE" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onAlert}
            className="gap-1.5 text-amber-700 hover:text-amber-700"
          >
            <Send className="h-3.5 w-3.5" /> Alert
          </Button>
        )}
        {reservation.status !== "RETURNED" &&
          reservation.status !== "PENDING" &&
          reservation.status !== "APPROVED" &&
          reservation.status !== "REJECTED" && (
            <Button size="sm" variant="ghost" onClick={onReturn} className="gap-1.5">
              <CornerDownLeft className="h-3.5 w-3.5" /> Return
            </Button>
          )}
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

type NewValues = {
  studentId: string;
  resourceId: string;
  startDate: string;
  durationDays: string;
  purpose: string;
};
type AlertValues = { message: string };

function NewReservationDialog({
  open,
  onOpenChange,
  students,
  resources,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  resources: Resource[];
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewValues>({
    defaultValues: {
      studentId: "",
      resourceId: "",
      startDate: new Date().toISOString().slice(0, 10),
      durationDays: "7",
      purpose: "",
    },
  });

  const mut = useMutation({
    mutationFn: (values: NewValues) =>
      api.reservations.create({
        studentId: Number(values.studentId),
        resourceId: Number(values.resourceId),
        startDate: values.startDate,
        durationDays: Number(values.durationDays),
        purpose: values.purpose,
      }),
    onSuccess: () => {
      toast.success("Reservation created");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">New reservation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mut.mutate(values))} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Student
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("studentId", { required: "Required" })}
            >
              <option value="">Select a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.profile?.fullName || student.username}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-xs text-destructive">{errors.studentId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Resource
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("resourceId", { required: "Required" })}
            >
              <option value="">Select a resource...</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.assetCode})
                </option>
              ))}
            </select>
            {errors.resourceId && (
              <p className="text-xs text-destructive">{errors.resourceId.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Purpose
            </Label>
            <Input placeholder="Optional staff note" {...register("purpose")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Start date
            </Label>
            <Input type="date" {...register("startDate", { required: "Required" })} />
            {errors.startDate && (
              <p className="text-xs text-destructive">{errors.startDate.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Duration (calendar days)
            </Label>
            <Input
              type="number"
              min={1}
              max={31}
              {...register("durationDays", {
                required: "Required",
                validate: (value) => {
                  const number = Number(value);
                  if (Number.isNaN(number) || number < 1) return "Minimum 1 day";
                  if (number > 31) return "Maximum 31 days";
                  return true;
                },
              })}
            />
            {errors.durationDays && (
              <p className="text-xs text-destructive">{errors.durationDays.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminAlertDialog({
  open,
  onOpenChange,
  reservation,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reservation: Reservation | null;
  onSubmit: (message: string) => void;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, reset } = useForm<AlertValues>({
    values: {
      message: reservation?.resourceName
        ? `Please return ${reservation.resourceName} as soon as possible because the borrowing deadline has passed.`
        : "",
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) reset({ message: "" });
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Send return alert</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => onSubmit(values.message))} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Alert message
            </Label>
            <Input {...register("message")} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send alert"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
