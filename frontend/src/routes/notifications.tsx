import { createFileRoute } from "@tanstack/react-router";
import { useRequireStudent } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
import { NotificationsPanel } from "@/components/NotificationsPanel";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - TEK-UP Resource Hub" },
      {
        name: "description",
        content: "View reminders and return alerts for your borrowed equipment.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { student, ready } = useRequireStudent();

  if (!ready || !student) return null;

  return (
    <PageShell title="Notifications" subtitle="Return reminders and alerts from administration">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <NotificationsPanel />
      </div>
    </PageShell>
  );
}
