import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Boxes, Package } from "lucide-react";
import { api } from "@/lib/api";
import type { Resource, Tag } from "@/lib/types";
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

export const Route = createFileRoute("/resources")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/resources" });
  },
  component: () => null,
});

type FormValues = {
  name: string;
  type: string;
  assetCode: string;
  quantity: number;
  tagIds: number[];
};

export function ResourcesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data: tags } = useQuery({ queryKey: ["tags"], queryFn: api.tags.list });
  const { data, isLoading } = useQuery({
    queryKey: ["resources", { activeTag }],
    queryFn: () => (activeTag ? api.resources.searchTag(activeTag) : api.resources.list()),
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (resource) =>
        resource.name.toLowerCase().includes(q) ||
        resource.type.toLowerCase().includes(q) ||
        resource.assetCode.toLowerCase().includes(q),
    );
  }, [data, search]);

  const removeMut = useMutation({
    mutationFn: (id: number) => api.resources.remove(id),
    onSuccess: () => {
      toast.success("Resource deleted");
      qc.invalidateQueries({ queryKey: ["resources"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell title="Resources" subtitle="Equipment available for reservation">
      <div className="mb-6 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type, asset code..."
            className="pl-9"
          />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Add resource
        </Button>
      </div>

      {(tags ?? []).length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              activeTag === null
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            All
          </button>
          {tags!.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.name)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeTag === tag.name
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card hover:bg-secondary"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border bg-card/60"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="No resources match"
          description="Try a different search or clear filters."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => (
            <div
              key={resource.id}
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-[11px] font-semibold text-success">
                  {resource.quantity} units
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold leading-tight">
                {resource.name}
              </h3>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded bg-secondary px-1.5 py-0.5 font-mono">
                  {resource.assetCode}
                </span>
                <span>·</span>
                <span>{resource.type}</span>
              </div>
              {resource.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex justify-end gap-1.5 border-t border-border pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(resource);
                    setDialogOpen(true);
                  }}
                  className="gap-1.5"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmId(resource.id)}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        tags={tags ?? []}
      />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this resource?"
        description="The resource will be removed permanently."
        onConfirm={() => {
          if (confirmId) removeMut.mutate(confirmId);
          setConfirmId(null);
        }}
      />
    </PageShell>
  );
}

function ResourceDialog({
  open,
  onOpenChange,
  editing,
  tags,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Resource | null;
  tags: Tag[];
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    values: editing
      ? {
          name: editing.name,
          type: editing.type,
          assetCode: editing.assetCode,
          quantity: editing.quantity,
          tagIds: editing.tags?.map((tag) => tag.id) ?? [],
        }
      : { name: "", type: "", assetCode: "", quantity: 1, tagIds: [] },
  });

  const mut = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        type: values.type,
        assetCode: values.assetCode,
        quantity: Number(values.quantity),
        tagIds: values.tagIds,
      };
      return editing ? api.resources.update(editing.id, payload) : api.resources.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Resource updated" : "Resource created");
      qc.invalidateQueries({ queryKey: ["resources"] });
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
            {editing ? "Edit resource" : "New resource"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mut.mutate(values))} className="space-y-4">
          <Field label="Name" error={errors.name?.message}>
            <Input {...register("name", { required: "Required" })} placeholder="Sony A7 III" />
          </Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Type" error={errors.type?.message}>
              <Input {...register("type", { required: "Required" })} placeholder="Camera" />
            </Field>
            <Field label="Asset code" error={errors.assetCode?.message}>
              <Input {...register("assetCode", { required: "Required" })} placeholder="CAM-001" />
            </Field>
            <Field label="Quantity" error={errors.quantity?.message}>
              <Input
                type="number"
                min={1}
                {...register("quantity", {
                  required: "Required",
                  min: { value: 1, message: "Min 1" },
                })}
              />
            </Field>
          </div>
          <Field label="Tags" error={errors.tagIds?.message as string | undefined}>
            <Controller
              control={control}
              name="tagIds"
              rules={{
                validate: (value) => value.length > 0 || "Select at least one tag",
              }}
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {tags.length === 0 && (
                    <span className="text-xs text-muted-foreground">
                      No tags available - create one first.
                    </span>
                  )}
                  {tags.map((tag) => {
                    const active = field.value.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() =>
                          field.onChange(
                            active
                              ? field.value.filter((value) => value !== tag.id)
                              : [...field.value, tag.id],
                          )
                        }
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                          active
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-card hover:bg-secondary"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </Field>
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
