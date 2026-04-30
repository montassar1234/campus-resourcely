import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/auth";
import { DashboardPage } from "@/routes/dashboard";

export const Route = createFileRoute("/admin/dashboard")({
  beforeLoad: () => {
    if (!hasAdminSession()) {
      throw redirect({ to: "/admin/auth" });
    }
  },
  component: DashboardPage,
});
