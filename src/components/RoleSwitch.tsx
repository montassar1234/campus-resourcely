import { GraduationCap, ShieldCheck } from "lucide-react";
import { useRole } from "@/lib/role";
import { useNavigate } from "@tanstack/react-router";

export function RoleSwitch() {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const switchTo = (r: "student" | "staff") => {
    if (r === role) return;
    setRole(r);
    navigate({ to: r === "student" ? "/borrow" : "/dashboard" });
  };

  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-xs font-medium">
      <button
        onClick={() => switchTo("student")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
          role === "student"
            ? "bg-accent text-accent-foreground shadow-soft"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <GraduationCap className="h-3.5 w-3.5" /> Student
      </button>
      <button
        onClick={() => switchTo("staff")}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
          role === "staff"
            ? "bg-primary text-primary-foreground shadow-soft"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5" /> Staff
      </button>
    </div>
  );
}
