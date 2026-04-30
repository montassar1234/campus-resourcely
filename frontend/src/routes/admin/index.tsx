import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  beforeLoad: () => {
    throw redirect({ to: hasAdminSession() ? "/admin/dashboard" : "/admin/auth" });
  },
  component: () => null,
});
