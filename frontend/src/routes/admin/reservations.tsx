import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/auth";
import { ReservationsPage } from "@/routes/reservations";

export const Route = createFileRoute("/admin/reservations")({
  beforeLoad: () => {
    if (!hasAdminSession()) {
      throw redirect({ to: "/admin/auth" });
    }
  },
  component: ReservationsPage,
});
