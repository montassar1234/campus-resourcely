import { Bell, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationsPanel } from "@/components/NotificationsPanel";
import { api } from "@/lib/api";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { student, admin, logoutStudent, logoutAdmin } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const name = isAdmin
    ? admin?.displayName || admin?.username || "Admin"
    : student?.fullName || "Student";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const email = isAdmin ? "admin@campus.edu" : student?.email || "student@campus.edu";
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "student", student?.id],
    queryFn: () => api.notifications.byStudent(Number(student!.id)),
    enabled: !!student?.id && !isAdmin,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });
  const unreadCount = (notificationsQuery.data ?? []).filter(
    (notification) => !notification.read,
  ).length;

  const handleLogout = () => {
    if (isAdmin) {
      logoutAdmin();
      navigate({ to: "/admin/auth" });
      return;
    }
    logoutStudent();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <div className="hidden md:block">
        <h1 className="font-display text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <button
              aria-label="Notifications"
              className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary sm:flex"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                </>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={10} className="w-[420px] p-4">
            <NotificationsPanel compact onNavigate={() => setNotificationsOpen(false)} />
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium">{name}</div>
            <div className="text-[10px] text-muted-foreground">{email}</div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
