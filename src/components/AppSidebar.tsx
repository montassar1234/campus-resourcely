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
import { useRole } from "@/lib/role";

const studentItems = [
  { title: "Borrow Equipment", url: "/borrow", icon: PackageSearch },
  { title: "My Reservations", url: "/my-reservations", icon: ClipboardList },
];

const staffItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: Users },
  { title: "Resources", url: "/resources", icon: Boxes },
  { title: "Tags", url: "/tags", icon: Tags },
  { title: "Reservations", url: "/reservations", icon: CalendarCheck },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useRole();

  const primary = role === "student" ? studentItems : staffItems;
  const secondary = role === "student" ? staffItems : studentItems;
  const primaryLabel = role === "student" ? "Student Portal" : "Workspace";
  const secondaryLabel = role === "student" ? "Staff tools" : "Student preview";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-semibold text-sidebar-foreground">
              Resource Hub
            </span>
            <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Campus
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
                const active = pathname.startsWith(item.url);
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

        <SidebarGroup>
          <SidebarGroupLabel>{secondaryLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondary.map((item) => {
                const active = pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-3 opacity-80">
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
            {role === "student" ? "ST" : "AS"}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-medium text-sidebar-foreground">
              {role === "student" ? "Student" : "Admin Staff"}
            </span>
            <span className="text-[10px] text-sidebar-foreground/60">
              {role === "student" ? "demo@campus.edu" : "staff@campus.edu"}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
