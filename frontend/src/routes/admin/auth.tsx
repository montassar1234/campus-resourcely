import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useAuth, hasAdminSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginValues = {
  username: string;
  password: string;
};

export const Route = createFileRoute("/admin/auth")({
  beforeLoad: () => {
    if (hasAdminSession()) {
      throw redirect({ to: "/admin/dashboard" });
    }
  },
  component: AdminAuthPage,
});

function AdminAuthPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    defaultValues: { username: "admin", password: "" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[1fr_0.95fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Admin authentication
          </div>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            Secure access for administration.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Staff members manage students, resources, tags, and reservations from a dedicated
            dashboard separated from the student experience.
          </p>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-elevated md:p-8">
          <h2 className="font-display text-2xl font-semibold">Admin sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the demo credentials below to unlock the administration area.
          </p>

          <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/40 p-4 text-xs text-muted-foreground">
            Demo credentials: <span className="font-medium text-foreground">admin</span> / <span className="font-medium text-foreground">admin123</span>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit((values) => {
              const username = values.username.trim();
              const password = values.password.trim();

              if (username !== "admin" || password !== "admin123") {
                setError("password", { message: "Invalid admin credentials" });
                return;
              }
              loginAdmin({ username });
              navigate({ to: "/admin/dashboard" });
            })}
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Username
              </Label>
              <Input {...register("username", { required: "Username is required" })} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  className="pl-9"
                  {...register("password", { required: "Password is required" })}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full">
              Enter admin dashboard
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
