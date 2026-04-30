import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Resource } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type FormValues = {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  department: string;
  level: string;
  resourceId: string;
  purpose: string;
  agreement: boolean;
};

export function ReservationRequestDialog({
  open,
  onOpenChange,
  resource,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  resource: Resource | null;
}) {
  const qc = useQueryClient();
  const { loginStudent } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      fullName: "",
      phone: "",
      department: "",
      level: "",
      resourceId: resource ? String(resource.id) : "",
      purpose: "",
      agreement: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phone: "",
        department: "",
        level: "",
        resourceId: resource ? String(resource.id) : "",
        purpose: "",
        agreement: false,
      });
    }
  }, [open, resource, reset]);

  const agreement = watch("agreement");

  const mut = useMutation({
    mutationFn: (v: FormValues) =>
      api.reservations.createRequest({
        username: v.username,
        email: v.email,
        password: v.password,
        fullName: v.fullName,
        phone: v.phone,
        department: v.department,
        level: v.level,
        resourceId: Number(v.resourceId),
        purpose: v.purpose,
      }),
    onSuccess: (data) => {
      toast.success("Reservation request submitted successfully.");
      loginStudent({
        id: String(data.studentId),
        username: watch("username"),
        fullName: watch("fullName"),
        email: watch("email"),
      });
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["resources", "available"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to submit request"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Student request form</DialogTitle>
          <DialogDescription>
            {resource ? (
              <>
                Fill this form before taking{" "}
                <span className="font-medium text-foreground">{resource.name}</span>.
              </>
            ) : (
              "Submit your identity and request details for staff review."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name
              </Label>
              <Input
                placeholder="Aminah Bello"
                {...register("fullName", { required: "Full name is required" })}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Username
              </Label>
              <Input
                placeholder="aminah"
                {...register("username", {
                  required: "Username is required",
                  minLength: { value: 3, message: "Username must contain at least 3 characters" },
                })}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                type="email"
                placeholder="aminah@campus.edu"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </Label>
              <Input
                type="password"
                placeholder="Minimum 6 characters"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must contain at least 6 characters" },
                })}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Phone
              </Label>
              <Input
                placeholder="+234700100001"
                {...register("phone", { required: "Phone is required" })}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Department
              </Label>
              <Input
                placeholder="Computer Science"
                {...register("department", { required: "Department is required" })}
              />
              {errors.department && <p className="text-xs text-destructive">{errors.department.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Level
              </Label>
              <Input
                placeholder="Level 400"
                {...register("level", { required: "Level is required" })}
              />
              {errors.level && <p className="text-xs text-destructive">{errors.level.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Resource
              </Label>
              <Input
                value={resource ? `${resource.name} (${resource.assetCode})` : ""}
                readOnly
                className="bg-secondary/60"
              />
              <input type="hidden" {...register("resourceId", { required: true })} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Purpose <span className="normal-case text-muted-foreground/70">(optional)</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="e.g. Final year project, Media club event, Lab experiment..."
              {...register("purpose")}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary/40 p-3">
            <Checkbox
              checked={agreement}
              onCheckedChange={(v) => setValue("agreement", v === true, { shouldValidate: true })}
              className="mt-0.5"
            />
            <input
              type="hidden"
              {...register("agreement", { validate: (v) => v === true || "You must accept the terms" })}
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              I confirm that I will return the resource on time and in good condition, and that the
              information provided here is correct.
            </span>
          </label>
          {errors.agreement && (
            <p className="-mt-2 text-xs text-destructive">{errors.agreement.message as string}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Submitting..." : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
