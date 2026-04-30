import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasAdminSession } from "@/lib/auth";
import { StudentsPage } from "@/routes/students";

export const Route = createFileRoute("/admin/students")({
  beforeLoad: () => {
    if (!hasAdminSession()) {
      throw redirect({ to: "/admin/auth" });
    }
  },
  component: StudentsPage,
});
