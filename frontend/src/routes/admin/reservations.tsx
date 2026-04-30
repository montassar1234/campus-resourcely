import { createFileRoute } from "@tanstack/react-router";
import { useRequireAdmin } from "@/lib/auth";
import { ReservationsPage } from "@/routes/reservations";

export const Route = createFileRoute("/admin/reservations")({
  component: AdminReservationsRoute,
});

function AdminReservationsRoute() {
  const { admin, ready } = useRequireAdmin();
  if (!ready || !admin) return null;
  return <ReservationsPage />;
}
