import { createFileRoute } from "@tanstack/react-router";
import { useRequireAdmin } from "@/lib/auth";
import { StudentsPage } from "@/routes/students";

export const Route = createFileRoute("/admin/students")({
  component: AdminStudentsRoute,
});

function AdminStudentsRoute() {
  const { admin, ready } = useRequireAdmin();
  if (!ready || !admin) return null;
  return <StudentsPage />;
}
