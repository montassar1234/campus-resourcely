import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  eachDayOfInterval,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isEqual,
  isSameDay,
  parseISO,
  startOfToday,
} from "date-fns";
import { CalendarClock, CalendarRange, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";
import { api } from "@/lib/api";
import type { Reservation, Resource } from "@/lib/types";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";

type FormValues = {
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
  const { student } = useAuth();
  const today = useMemo(() => startOfToday(), []);
  const earliestReservationDate = useMemo(() => addDays(today, 2), [today]);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [showTwoMonths, setShowTwoMonths] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      purpose: "",
      agreement: false,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      purpose: "",
      agreement: false,
    });
    setSelectedRange(undefined);
    setRangeError(null);
    contentRef.current?.scrollTo({ top: 0 });
  }, [open, reset]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1200px)");
    const syncLayout = () => setShowTwoMonths(mediaQuery.matches);
    syncLayout();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncLayout);
      return () => mediaQuery.removeEventListener("change", syncLayout);
    }

    mediaQuery.addListener(syncLayout);
    return () => mediaQuery.removeListener(syncLayout);
  }, []);

  const reservationsQuery = useQuery({
    queryKey: ["reservations", "resource", resource?.id],
    queryFn: () => api.reservations.byResource(Number(resource!.id)),
    enabled: open && !!resource?.id,
  });

  const blockingReservations = useMemo(
    () =>
      (reservationsQuery.data ?? []).filter((reservation) =>
        ["APPROVED", "ACTIVE", "OVERDUE"].includes(reservation.status),
      ),
    [reservationsQuery.data],
  );

  const disabledDates = useMemo(() => {
    if (!resource) return [];

    const list: Date[] = [];
    for (let offset = 0; offset < 120; offset += 1) {
      const day = addDays(today, offset);
      const concurrentReservations = blockingReservations.filter((reservation) =>
        overlapsDay(day, reservation),
      ).length;

      if (concurrentReservations >= resource.quantity) {
        list.push(day);
      }
    }
    return list;
  }, [blockingReservations, resource, today]);

  /** Inclusive calendar days from start through end (used for API + availability overlap). */
  const calendarHoldDays = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    return differenceInCalendarDays(selectedRange.to, selectedRange.from) + 1;
  }, [selectedRange]);

  /** Weekdays only; weekends in between are not counted toward the student limit or duration label. */
  const weekdayDurationDays = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return 0;
    return countWeekdaysInclusive(selectedRange.from, selectedRange.to);
  }, [selectedRange]);

  const agreement = watch("agreement");

  const selectionBlocked = useMemo(() => {
    if (!selectedRange?.from || !selectedRange?.to) return false;
    return selectedRangeHasConflict(selectedRange, disabledDates);
  }, [selectedRange, disabledDates]);

  const handleRangeSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range || (!range.from && !range.to)) {
        setRangeError(null);
        setSelectedRange(range);
        return;
      }

      if (range.from && isWeekend(range.from)) {
        setRangeError("Start and end must be weekdays (Monday-Friday).");
        return;
      }
      if (range.to && isWeekend(range.to)) {
        setRangeError("Start and end must be weekdays (Monday-Friday).");
        return;
      }

      // With excludeDisabled, react-day-picker may emit a new partial range (clicked day as sole
      // `from`) when the intended end crosses fully booked days. Keep the original start and
      // surface a clear error instead of moving the anchor.
      if (range.from && !range.to && selectedRange?.from && !selectedRange.to) {
        const endCandidate = range.from;
        const anchor = selectedRange.from;

        if (isSameDay(endCandidate, anchor)) {
          setRangeError(null);
          setSelectedRange({ from: anchor, to: anchor });
          return;
        }

        if (isAfter(endCandidate, anchor)) {
          if (
            rangeIntervalIncludesBlockedOrTooEarlyDay(
              anchor,
              endCandidate,
              earliestReservationDate,
              disabledDates,
            )
          ) {
            setRangeError(
              "That range would cross fully booked days. Choose an end date that does not include those dates.",
            );
            return;
          }

          setRangeError(null);
          setSelectedRange({ from: anchor, to: endCandidate });
          return;
        }

        setRangeError(null);
        setSelectedRange(range);
        return;
      }

      setRangeError(null);
      setSelectedRange(range);
    },
    [selectedRange, earliestReservationDate, disabledDates],
  );

  useEffect(() => {
    if (!selectedRange?.from) {
      setRangeError(null);
      return;
    }

    if (!selectedRange.to) {
      return;
    }

    if (selectedRangeHasConflict(selectedRange, disabledDates)) {
      setRangeError("The selected range includes unavailable days. Please choose another window.");
      return;
    }

    if (weekdayDurationDays > 7) {
      setRangeError(
        "Student reservations cannot exceed 7 weekdays (Saturday and Sunday are not counted).",
      );
      return;
    }

    setRangeError(null);
  }, [selectedRange, disabledDates, weekdayDurationDays]);

  const mut = useMutation({
    mutationFn: (values: FormValues) => {
      if (!student) {
        throw new Error("You must be connected as a student before borrowing equipment.");
      }
      if (!resource) {
        throw new Error("Please choose a resource first.");
      }
      if (!selectedRange?.from || !selectedRange?.to) {
        throw new Error("Please select both a start date and an end date.");
      }
      if (selectionBlocked) {
        throw new Error("The selected date range is not available for this equipment.");
      }

      return api.reservations.createStudentRequest({
        studentId: Number(student.id),
        resourceId: Number(resource.id),
        startDate: format(selectedRange.from, "yyyy-MM-dd"),
        durationDays: calendarHoldDays,
        purpose: values.purpose,
      });
    },
    onSuccess: () => {
      toast.success("Reservation request sent for admin approval.");
      qc.invalidateQueries({ queryKey: ["resources"] });
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      onOpenChange(false);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to submit request"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(95vw,860px)] max-w-[860px] overflow-hidden border-border/80 p-0">
        <div
          ref={contentRef}
          className="max-h-[88vh] overflow-y-auto bg-[linear-gradient(180deg,rgba(249,243,232,0.96),rgba(255,252,247,0.98))]"
        >
          <div className="space-y-5 p-4 sm:p-6 md:p-7">
            <DialogHeader className="space-y-3 text-left">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-accent sm:text-[11px]">
                <Sparkles className="h-3.5 w-3.5" /> Reservation request
              </div>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <DialogTitle className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                    {resource
                      ? `Choose dates for ${resource.name}`
                      : "Choose your reservation dates"}
                  </DialogTitle>
                  <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                    Pick your start and end dates from the equipment calendar. Requests must start
                    at least 2 days from now. Start and end must be weekdays; your range may include
                    weekends in between. The limit is 7 weekdays (Saturday and Sunday are not
                    counted); the calendar can span more days when weekends fall in between. Every
                    request is reviewed before pickup.
                  </DialogDescription>
                </div>

                <div className="w-full max-w-[260px] rounded-3xl border border-border/80 bg-white/90 p-4 shadow-soft">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                        Resource
                      </div>
                      <div className="mt-2 font-display text-xl leading-tight text-foreground">
                        {resource ? resource.name : "Selected resource"}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {resource
                          ? `${resource.assetCode} - ${resource.type}`
                          : "Open a resource first"}
                      </p>
                    </div>
                    <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {resource?.quantity ?? 0} free
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="rounded-[30px] border border-border/80 bg-white/80 p-4 shadow-soft sm:p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="max-w-md">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Availability calendar
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Gray dates are fully booked. The earliest student start date is{" "}
                    {format(earliestReservationDate, "PPP")}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Selected
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" /> Full
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted" /> Weekend (not counted)
                  </span>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-3xl border border-border/70 bg-background/90 p-2 sm:p-3">
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleRangeSelect}
                  excludeDisabled
                  disabled={[{ before: earliestReservationDate }, ...disabledDates]}
                  modifiers={{ weekend: isWeekend }}
                  modifiersClassNames={{
                    weekend: "bg-muted/40 text-muted-foreground opacity-80",
                  }}
                  numberOfMonths={showTwoMonths ? 2 : 1}
                  className="mx-auto max-w-full"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <InfoCard
                icon={<CalendarClock className="h-3.5 w-3.5" />}
                label="Start date"
                value={
                  selectedRange?.from ? format(selectedRange.from, "PPP") : "Choose from calendar"
                }
              />
              <InfoCard
                icon={<CalendarRange className="h-3.5 w-3.5" />}
                label="End date"
                value={selectedRange?.to ? format(selectedRange.to, "PPP") : "Choose from calendar"}
              />
              <InfoCard
                label="Duration"
                value={
                  weekdayDurationDays > 0
                    ? `${weekdayDurationDays} weekday${weekdayDurationDays === 1 ? "" : "s"}`
                    : "--"
                }
                note={
                  calendarHoldDays > weekdayDurationDays
                    ? `${calendarHoldDays} calendar days including weekends - max 7 weekdays`
                    : "Maximum 7 weekdays (weekends between dates are not counted)"
                }
              />
            </div>

            {rangeError && (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {rangeError}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-1.5 rounded-[28px] border border-border/80 bg-white/80 p-4 shadow-soft sm:p-5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Purpose <span className="normal-case text-muted-foreground/70">(optional)</span>
                </Label>
                <Textarea
                  rows={4}
                  placeholder="Describe how you plan to use this equipment."
                  {...register("purpose")}
                />
              </div>

              <div className="rounded-[28px] border border-accent/20 bg-accent/5 p-4 text-sm text-muted-foreground shadow-soft sm:p-5">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-accent" /> What happens next?
                </div>
                <p className="mt-2 leading-relaxed">
                  Your request appears in the admin dashboard. Once approved, the equipment is held
                  for your selected booking window.
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-[28px] border border-border/80 bg-white/80 p-4 shadow-soft sm:p-5">
              <Checkbox
                checked={agreement}
                onCheckedChange={(value) =>
                  setValue("agreement", value === true, { shouldValidate: true })
                }
                className="mt-0.5"
              />
              <input
                type="hidden"
                {...register("agreement", {
                  validate: (value) => value === true || "Please accept the booking policy",
                })}
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                I understand that this is a reservation request, not an immediate checkout. Staff
                approval is required before pickup, and I will return the equipment in good
                condition.
              </span>
            </label>
            {errors.agreement && (
              <p className="-mt-2 text-xs text-destructive">{errors.agreement.message as string}</p>
            )}

            <DialogFooter className="border-t border-border/70 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit((values) => mut.mutate(values))}
                disabled={
                  mut.isPending ||
                  selectionBlocked ||
                  reservationsQuery.isLoading ||
                  !selectedRange?.from ||
                  !selectedRange?.to ||
                  !!rangeError
                }
              >
                {mut.isPending ? "Sending..." : "Request reservation"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoCard({
  icon,
  label,
  value,
  note,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-[28px] border border-border/80 bg-white/80 p-4 shadow-soft">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-lg font-medium leading-snug text-foreground">{value}</div>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

function isWeekend(d: Date) {
  const w = d.getDay();
  return w === 0 || w === 6;
}

function countWeekdaysInclusive(from: Date, to: Date) {
  const [start, end] = isBefore(from, to) ? [from, to] : [to, from];
  return eachDayOfInterval({ start, end }).filter((d) => !isWeekend(d)).length;
}

function dayIsBlockedOrTooEarly(day: Date, earliestReservationDate: Date, disabledDates: Date[]) {
  if (isBefore(day, earliestReservationDate)) return true;
  return disabledDates.some((blocked) => isSameDay(blocked, day));
}

function rangeIntervalIncludesBlockedOrTooEarlyDay(
  from: Date,
  to: Date,
  earliestReservationDate: Date,
  disabledDates: Date[],
) {
  const [start, end] = isBefore(from, to) ? [from, to] : [to, from];
  return eachDayOfInterval({ start, end }).some((day) =>
    dayIsBlockedOrTooEarly(day, earliestReservationDate, disabledDates),
  );
}

function overlapsDay(day: Date, reservation: Reservation) {
  const reservationStart = parseISO(reservation.startDate);
  const reservationEnd = addDays(reservationStart, reservation.durationDays - 1);
  return !isBefore(day, reservationStart) && !isBefore(reservationEnd, day);
}

function selectedRangeHasConflict(range: DateRange, disabledDates: Date[]) {
  if (!range.from || !range.to) return false;

  const requestedDates = eachDayOfInterval({ start: range.from, end: range.to });
  return requestedDates.some((date) =>
    disabledDates.some((disabledDate) => isEqual(disabledDate, date)),
  );
}
