import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { ArrowRight, GraduationCap } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/")({
  component: StudentEntryPage,
});

type StudentLoginValues = {
  email: string;
  password: string;
};

function StudentEntryPage() {
  const { student, loginStudent, logoutStudent } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<StudentLoginValues>({
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-[1.1fr_0.9fr]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft">
            <GraduationCap className="h-3.5 w-3.5 text-accent" />
            Student authentication
          </div>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            Enter the student portal.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Sign in with your student profile to access borrowing tools, request TEK-UP equipment,
            and track your reservations independently from the administration dashboard.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">
              Student access
            </div>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Request cameras, kits, and lab equipment before taking them.</li>
              <li>Track your active, returned, and overdue reservations.</li>
              <li>Keep a separate experience from the administration tools.</li>
            </ul>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-elevated md:p-8">
          <h2 className="font-display text-2xl font-semibold">Student sign in</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your TEK-UP email and password to continue.
          </p>

          {student && (
            <div className="mt-4 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm">
              <p className="font-medium text-foreground">
                You are already signed in as {student.fullName}.
              </p>
              <p className="mt-1 text-muted-foreground">
                Continue to your portal or sign out to use another student account.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" onClick={() => navigate({ to: "/borrow" })}>
                  Continue as {student.username}
                </Button>
                <Button type="button" variant="outline" onClick={logoutStudent}>
                  Sign out first
                </Button>
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                TEK-UP email
              </Label>
              <Input
                type="email"
                placeholder="yourname@tek-up.tn"
                {...register("email", { required: "TEK-UP email is required" })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Enter your password"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleSubmit(async (values) => {
                try {
                  const auth = await api.auth.studentLogin({
                    email: values.email.trim().toLowerCase(),
                    password: values.password,
                  });
                  const loggedStudent = auth.user;

                  loginStudent({
                    id: String(loggedStudent.id),
                    username: loggedStudent.username,
                    fullName:
                      loggedStudent.displayName ||
                      loggedStudent.profile?.fullName ||
                      loggedStudent.username,
                    email: loggedStudent.email,
                    token: auth.token,
                  });
                  navigate({ to: "/borrow", replace: true });
                } catch {
                  setError("password", { message: "Invalid email or password" });
                }
              })}
            >
              Enter student dashboard
            </Button>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            Administrators should use the separate admin login at{" "}
            <span className="font-medium text-foreground">/admin/auth</span>.
          </div>
        </section>
      </div>
    </div>
  );
}
