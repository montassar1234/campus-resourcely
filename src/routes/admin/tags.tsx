import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/auth";
import { TagsPage } from "@/routes/tags";

export const Route = createFileRoute("/admin/tags")({
  beforeLoad: () => {
    if (!hasAdminSession()) {
      throw redirect({ to: "/admin/auth" });
    }
  },
  component: TagsPage,
});
