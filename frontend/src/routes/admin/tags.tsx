import { createFileRoute } from "@tanstack/react-router";
import { useRequireAdmin } from "@/lib/auth";
import { TagsPage } from "@/routes/tags";

export const Route = createFileRoute("/admin/tags")({
  component: AdminTagsRoute,
});

function AdminTagsRoute() {
  const { admin, ready } = useRequireAdmin();
  if (!ready || !admin) return null;
  return <TagsPage />;
}
