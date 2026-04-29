import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Resource } from "@/lib/types";
import { useRole } from "@/lib/role";
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
  studentId: string;
  resourceId: string;
  checkoutDate: string;
  expectedReturnDate: string;
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
  const { studentId: storedStudentId, setStudentId } = useRole();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  const { data: students } = useQuery({ queryKey: ["students"], queryFn: api.students.list });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      studentId: storedStudentId || "",
      resourceId: resource ? String(resource.id) : "",
      checkoutDate: today,
      expectedReturnDate: tomorrow,
      purpose: "",
      agreement: false,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        studentId: storedStudentId || "",
        resourceId: resource ? String(resource.id) : "",
        checkoutDate: today,
        expectedReturnDate: tomorrow,
        purpose: "",
        agreement: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resource]);

  const agreement = watch("agreement");

  const mut = useMutation({
    mutationFn: (v: FormValues) =>
      api.reservations.create({
        studentId: Number(v.studentId),
        resourceId: Number(v.resourceId),
        expectedReturnDate: v.expectedReturnDate,
      }),
    onSuccess: (_data, v) => {
      toast.success("Reservation request submitted successfully.");
      setStudentId(v.studentId);
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Request resource</DialogTitle>
          <DialogDescription>
            {resource ? (
              <>
                Borrowing <span className="font-medium text-foreground">{resource.name}</span> ·{" "}
                <span className="font-mono text-xs">{resource.assetCode}</span>
              </>
            ) : (
              "Submit a borrowing request for review."
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((v) => mut.mutate(v))} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Student
            </Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              {...register("studentId", { required: "Please select your student profile" })}
            >
              <option value="">Select your student profile…</option>
              {(students ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.profile?.fullName || s.username} {s.profile?.department ? `· ${s.profile.department}` : ""}
                </option>
              ))}
            </select>
            {errors.studentId && (
              <p className="text-xs text-destructive">{errors.studentId.message}</p>
            )}
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Checkout date
              </Label>
              <Input
                type="date"
                {...register("checkoutDate", { required: "Required" })}
                onChange={(e) => {
                  setValue("checkoutDate", e.target.value);
                }}
              />
              {errors.checkoutDate && (
                <p className="text-xs text-destructive">{errors.checkoutDate.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Expected return
              </Label>
              <Input
                type="date"
                {...register("expectedReturnDate", {
                  required: "Required",
                  validate: (val, formValues) =>
                    new Date(val) > new Date(formValues.checkoutDate) ||
                    "Return date must be after checkout date",
                })}
              />
              {errors.expectedReturnDate && (
                <p className="text-xs text-destructive">{errors.expectedReturnDate.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Purpose <span className="normal-case text-muted-foreground/70">(optional)</span>
            </Label>
            <Textarea
              rows={3}
              placeholder="e.g. Final year project, Media club event, Lab experiment…"
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
              I confirm that I will return the resource before the expected return date and in good
              condition.
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
              {mut.isPending ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
