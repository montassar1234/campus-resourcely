import { createFileRoute } from "@tanstack/react-router";
import { useRequireAdmin } from "@/lib/auth";
import { ResourcesPage } from "@/routes/resources";

export const Route = createFileRoute("/admin/resources")({
  component: AdminResourcesRoute,
});

function AdminResourcesRoute() {
  const { admin, ready } = useRequireAdmin();
  if (!ready || !admin) return null;
  return <ResourcesPage />;
}
