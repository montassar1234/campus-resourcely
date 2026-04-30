import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/auth";
import { ResourcesPage } from "@/routes/resources";

export const Route = createFileRoute("/admin/resources")({
  beforeLoad: () => {
    if (!hasAdminSession()) {
      throw redirect({ to: "/admin/auth" });
    }
  },
  component: ResourcesPage,
});
