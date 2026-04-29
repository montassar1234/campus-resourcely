import type { ReservationStatus } from "@/lib/types";
import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const styles: Record<ReservationStatus, string> = {
  ACTIVE: "bg-primary/10 text-primary border-primary/20",
  RETURNED: "bg-success/15 text-success border-success/30",
  OVERDUE: "bg-destructive/10 text-destructive border-destructive/30",
};

const icons: Record<ReservationStatus, React.ElementType> = {
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
