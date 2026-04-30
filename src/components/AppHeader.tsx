import { Bell, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { student, admin, logoutStudent, logoutAdmin } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const name = isAdmin ? admin?.username || "Admin" : student?.fullName || "Student";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const email = isAdmin ? "admin@campus.edu" : student?.email || "student@campus.edu";

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
        <button
          aria-label="Notifications"
          className="relative hidden h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:bg-secondary sm:flex"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 py-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-semibold text-primary-foreground">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium">{name}</div>
            <div className="text-[10px] text-muted-foreground">{email}</div>
          </div>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
