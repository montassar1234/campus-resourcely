import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, CheckCircle2, ClipboardList, MailWarning } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";
import { SmartPagination } from "@/components/SmartPagination";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const PAGE_SIZE = 6;

export function NotificationsPanel({
  audience = "student",
  compact = false,
  onNavigate,
}: {
  audience?: "admin" | "student";
  compact?: boolean;
  onNavigate?: () => void;
}) {
  const { student, admin } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const isAdminFeed = audience === "admin";
  const queryKey = ["notifications", audience, student?.id] as const;

  const notificationsQuery = useQuery({
    queryKey,
    queryFn: () =>
      isAdminFeed ? api.notifications.admin() : api.notifications.byStudent(Number(student!.id)),
    enabled: isAdminFeed ? !!admin : !!student?.id,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const markReadMut = useMutation({
    mutationFn: (id: number) => api.notifications.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  const markAllMut = useMutation({
    mutationFn: () =>
      isAdminFeed ? api.notifications.markAllAdminRead() : api.notifications.markAllRead(Number(student!.id)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey });
    },
  });

  const notifications = useMemo(() => notificationsQuery.data ?? [], [notificationsQuery.data]);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const totalPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [audience, student?.id]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages));
  }, [totalPages]);

  const items = useMemo(() => {
    if (compact) {
      return notifications.slice(0, 5);
    }

    const start = (page - 1) * PAGE_SIZE;
    return notifications.slice(start, start + PAGE_SIZE);
  }, [compact, notifications, page]);

  const firstItemIndex = notifications.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItemIndex = compact ? items.length : Math.min(page * PAGE_SIZE, notifications.length);

  if ((isAdminFeed && !admin) || (!isAdminFeed && !student)) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        Notifications are available after signing in.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg font-semibold">Notifications</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "Everything is up to date"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={unreadCount === 0 || markAllMut.isPending}
          onClick={() => markAllMut.mutate()}
        >
          {markAllMut.isPending ? "Marking..." : "Mark all as read"}
        </Button>
      </div>

      {notificationsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`space-y-3 pr-2 ${
              compact ? "max-h-[260px] overflow-y-scroll" : "max-h-[520px] overflow-y-auto"
            }`}
          >
            {items.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                compact={compact}
                onMarkRead={() => markReadMut.mutate(notification.id)}
                isMarking={markReadMut.isPending}
              />
            ))}
          </div>
          {!compact && (
            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {firstItemIndex}-{lastItemIndex} of {notifications.length} notifications
              </p>
              <SmartPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-end border-t border-border pt-3">
          {!isAdminFeed && (
            <Link
              to="/notifications"
              onClick={onNavigate}
              className="text-sm font-medium text-accent hover:underline"
            >
              View all notifications
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  compact,
  onMarkRead,
  isMarking,
}: {
  notification: Notification;
  compact: boolean;
  onMarkRead: () => void;
  isMarking: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        notification.read ? "border-border bg-secondary/20" : "border-accent/30 bg-accent/5"
      }`}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <NotificationIcon type={notification.type} />
            {notificationLabel(notification.type)}
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">
            {notification.resourceName}
          </div>
          <p className={`mt-1 text-sm text-muted-foreground ${compact ? "line-clamp-2" : ""}`}>
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Sent on {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && (
          <button
            type="button"
            onClick={onMarkRead}
            disabled={isMarking}
            className="rounded-full border border-border px-3 py-1 text-xs font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
  if (type === "ADMIN_RETURN_ALERT") {
    return <MailWarning className="h-3.5 w-3.5 text-destructive" />;
  }
  if (type === "RESERVATION_REQUESTED") {
    return <ClipboardList className="h-3.5 w-3.5 text-accent" />;
  }
  if (type === "RESERVATION_APPROVED") {
    return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  }
  if (type === "RESERVATION_REJECTED") {
    return <MailWarning className="h-3.5 w-3.5 text-destructive" />;
  }
  return <BellRing className="h-3.5 w-3.5 text-accent" />;
}

function notificationLabel(type: Notification["type"]) {
  if (type === "RESERVATION_REQUESTED") return "New request";
  if (type === "RESERVATION_APPROVED") return "Approved";
  if (type === "RESERVATION_REJECTED") return "Rejected";
  if (type === "ADMIN_RETURN_ALERT") return "Admin alert";
  return "Auto reminder";
}
