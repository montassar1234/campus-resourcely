import type { ReservationStatus } from "@/lib/types";
import { CheckCircle2, Clock, AlertTriangle, Hourglass, XCircle } from "lucide-react";

const styles: Record<ReservationStatus, string> = {
  PENDING: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  REJECTED: "bg-muted text-muted-foreground border-border",
  APPROVED: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  ACTIVE: "bg-primary/10 text-primary border-primary/20",
  RETURNED: "bg-success/15 text-success border-success/30",
  OVERDUE: "bg-destructive/10 text-destructive border-destructive/30",
};

const icons: Record<ReservationStatus, React.ElementType> = {
  PENDING: Hourglass,
  REJECTED: XCircle,
  APPROVED: Clock,
  ACTIVE: Clock,
  RETURNED: CheckCircle2,
  OVERDUE: AlertTriangle,
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  const Icon = icons[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${styles[status]}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}
