import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Users as UsersIcon,
} from "lucide-react";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/students")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/students" });
  },
  component: () => null,
});

type FormValues = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  department: string;
  level: string;
};

export function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["students", search],
    queryFn: () => (search ? api.students.search(search) : api.students.list()),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => api.students.remove(id),
    onSuccess: () => {
      toast.success("Student deleted");
      qc.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setDialogOpen(true);
  };

  return (
    <PageShell title="Students" subtitle="Manage student accounts and profiles">
      <div className="mb-6 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, email..."
            className="pl-9"
          />
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add student
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="No students yet"
          description="Create the first student account to get started."
          action={
            <Button onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" /> Add student
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data!.map((student) => (
            <div
              key={student.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-base font-semibold text-primary-foreground">
                  {(student.profile?.fullName || student.username).slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-base font-semibold">
                    {student.profile?.fullName || student.username}
                  </div>
                  <div className="text-xs text-muted-foreground">@{student.username}</div>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> {student.email}
                </div>
                {student.profile?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5" /> {student.profile.phone}
                  </div>
                )}
                {student.profile?.department && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5" /> {student.profile.department}
                  </div>
                )}
                {student.profile?.level && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5" /> Level {student.profile.level}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end gap-1.5 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEdit(student)}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmId(student.id)}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <StudentFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this student?"
        description="This will permanently remove the student and their profile. Reservations linked to them may be affected."
        onConfirm={() => {
          if (confirmId) removeMut.mutate(confirmId);
          setConfirmId(null);
        }}
      />
    </PageShell>
  );
}

function StudentFormDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Student | null;
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    values: editing
      ? {
          username: editing.username,
          email: editing.email,
          password: "",
          fullName: editing.profile?.fullName ?? "",
          phone: editing.profile?.phone ?? "",
          department: editing.profile?.department ?? "",
          level: editing.profile?.level ?? "",
        }
      : {
          username: "",
          email: "",
          password: "",
          fullName: "",
          phone: "",
          department: "",
          level: "",
        },
  });

  const mut = useMutation({
    mutationFn: (values: FormValues) => {
      const payload: Partial<Student> = {
        username: values.username,
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
        profile: {
          fullName: values.fullName,
          phone: values.phone,
          department: values.department,
          level: values.level,
        },
      };
      return editing ? api.students.update(editing.id, payload) : api.students.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Student updated" : "Student created");
      qc.invalidateQueries({ queryKey: ["students"] });
      onOpenChange(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">
            {editing ? "Edit student" : "New student"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mut.mutate(values))} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Username" error={errors.username?.message}>
              <Input {...register("username", { required: "Required" })} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                {...register("email", {
                  required: "Required",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                })}
              />
            </Field>
          </div>
          <Field
            label={editing ? "New password (leave empty to keep)" : "Password"}
            error={errors.password?.message}
          >
            <Input
              type="password"
              {...register(
                "password",
                editing
                  ? {}
                  : { required: "Required", minLength: { value: 6, message: "Min 6 chars" } },
              )}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Full name" error={errors.fullName?.message}>
              <Input {...register("fullName", { required: "Required" })} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <Input
                {...register("phone", {
                  required: "Required",
                  minLength: { value: 8, message: "Min 8 characters" },
                })}
              />
            </Field>
            <Field label="Department" error={errors.department?.message}>
              <Input
                {...register("department", { required: "Required" })}
                placeholder="e.g. Computer Science"
              />
            </Field>
            <Field label="Level" error={errors.level?.message}>
              <Input {...register("level", { required: "Required" })} placeholder="e.g. L3, M1" />
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
