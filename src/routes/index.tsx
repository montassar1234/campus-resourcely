import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { ArrowRight, BookOpenCheck, CalendarCheck2, GraduationCap, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { PageShell } from "@/components/PageShell";
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
  const { student, loginStudent } = useAuth();
  const myReservations = useQuery({
    queryKey: ["reservations", "student", student?.id],
    queryFn: () => api.reservations.byStudent(Number(student!.id)),
    enabled: !!student?.id,
  });
  const availableResources = useQuery({
    queryKey: ["resources", "available"],
    queryFn: api.resources.available,
    enabled: !!student,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<StudentLoginValues>({
    defaultValues: { email: "", password: "" },
  });

  if (student) {
    return (
      <PageShell title="Student Dashboard" subtitle="Your borrowing activity and next actions">
        <section
          className="mb-8 overflow-hidden rounded-3xl border border-border p-6 text-primary-foreground md:p-8"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest backdrop-blur">
              <GraduationCap className="h-3.5 w-3.5" /> Student workspace
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold md:text-4xl">
              Welcome back, {student.fullName}.
            </h2>
            <p className="mt-3 text-sm opacity-90 md:text-base">
              Browse available equipment, keep track of your current reservations, and make sure returns stay on schedule.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/borrow"
                className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 text-sm font-medium text-foreground shadow-soft transition hover:translate-y-[-1px]"
              >
                Borrow equipment <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/my-reservations"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-primary-foreground backdrop-blur transition hover:bg-white/20"
              >
                My reservations
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <StudentStatCard
            title="Available resources"
            value={availableResources.data?.length ?? 0}
            description="Items you can request right now"
            icon={<BookOpenCheck className="h-5 w-5" />}
          />
          <StudentStatCard
            title="My reservations"
            value={myReservations.data?.length ?? 0}
            description="All requests linked to your profile"
            icon={<CalendarCheck2 className="h-5 w-5" />}
          />
          <StudentStatCard
            title="Overdue alerts"
            value={myReservations.data?.filter((item) => item.status === "OVERDUE").length ?? 0}
            description="Items requiring urgent return"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </div>
      </PageShell>
    );
  }

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
            Sign in with your student profile to access borrowing tools, request campus equipment,
            and track your reservations independently from the administration dashboard.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-widest text-accent">Student access</div>
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
            Enter your campus email and password to continue.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleSubmit(async (values) => {
              try {
                const loggedStudent = await api.students.login({
                  email: values.email.trim().toLowerCase(),
                  password: values.password,
                });

                loginStudent({
                  id: String(loggedStudent.id),
                  username: loggedStudent.username,
                  fullName: loggedStudent.profile?.fullName || loggedStudent.username,
                  email: loggedStudent.email,
                });
              } catch {
                setError("password", { message: "Invalid email or password" });
              }
            })}
          >
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Campus email
              </Label>
              <Input
                type="email"
                placeholder="yourname@campus.edu"
                {...register("email", { required: "Campus email is required" })}
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
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" className="w-full">
              Enter student dashboard
            </Button>
          </form>

          <div className="mt-6 rounded-2xl border border-dashed border-border p-4 text-xs text-muted-foreground">
            Administrators should use the separate admin login at <span className="font-medium text-foreground">/admin/auth</span>.
          </div>
        </section>
      </div>
    </div>
  );
}

function StudentStatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-5 font-display text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{title}</div>
      <div className="mt-2 text-sm text-muted-foreground">{description}</div>
    </div>
  );
}
