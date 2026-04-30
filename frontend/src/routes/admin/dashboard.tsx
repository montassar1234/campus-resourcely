import { createFileRoute } from "@tanstack/react-router";
import { useRequireAdmin } from "@/lib/auth";
import { DashboardPage } from "@/routes/dashboard";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
  const { admin, ready } = useRequireAdmin();
  if (!ready || !admin) return null;
  return <DashboardPage />;
}
