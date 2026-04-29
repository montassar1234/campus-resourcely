import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RoleSwitch } from "./RoleSwitch";
import { useRole } from "@/lib/role";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { role } = useRole();
  const initials = role === "student" ? "ST" : "AS";
  const name = role === "student" ? "Student" : "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger />
      <div className="hidden md:block">
        <h1 className="font-display text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <RoleSwitch />
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
          <span className="hidden text-xs font-medium sm:inline">{name}</span>
        </div>
      </div>
    </header>
  );
}
