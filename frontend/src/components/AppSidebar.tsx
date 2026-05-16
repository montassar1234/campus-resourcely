import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Tags,
  Boxes,
  CalendarCheck,
  GraduationCap,
  PackageSearch,
  ClipboardList,
  Bell,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

const studentItems = [
  { title: "Borrow Equipment", url: "/borrow", icon: PackageSearch },
  { title: "My Reservations", url: "/my-reservations", icon: ClipboardList },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const adminItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/admin/students", icon: Users },
  { title: "Resources", url: "/admin/resources", icon: Boxes },
  { title: "Tags", url: "/admin/tags", icon: Tags },
  { title: "Reservations", url: "/admin/reservations", icon: CalendarCheck },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { student, admin } = useAuth();
  const isAdmin = pathname.startsWith("/admin");
  const homeUrl = isAdmin ? "/admin/dashboard" : "/borrow";

  const primary = isAdmin ? adminItems : studentItems;
  const primaryLabel = isAdmin ? "Admin Workspace" : "Student Portal";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to={homeUrl} className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold text-sidebar-foreground">
              Resource Hub
            </span>
            <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              TEK-UP
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{primaryLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => {
                const active =
                  item.url === "/"
                    ? pathname === "/"
                    : pathname === item.url || pathname.startsWith(`${item.url}/`);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary-foreground text-xs font-semibold">
            {isAdmin ? "AD" : "ST"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-sidebar-foreground">
              {isAdmin ? admin?.username || "Admin Staff" : student?.fullName || "Student"}
            </span>
            <span className="text-[10px] text-sidebar-foreground/60">
              {isAdmin ? "admin@tek-up.tn" : student?.email || "student@tek-up.tn"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
