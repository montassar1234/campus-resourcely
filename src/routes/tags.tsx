import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Tag as TagIcon, Hash } from "lucide-react";
import { api } from "@/lib/api";
import type { Tag } from "@/lib/types";
import { PageShell } from "@/components/PageShell";
import { EmptyState } from "@/components/EmptyState";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/tags")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/tags" });
  },
  component: () => null,
});

export function TagsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Tag | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["tags", search],
    queryFn: () => (search ? api.tags.search(search) : api.tags.list()),
  });

  const removeMut = useMutation({
    mutationFn: (id: number) => api.tags.remove(id),
    onSuccess: () => {
      toast.success("Tag deleted");
      qc.invalidateQueries({ queryKey: ["tags"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageShell title="Tags" subtitle="Group resources by category">
      <div className="mb-6 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tags..." className="pl-9" />
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> New tag
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-border bg-card/60" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState icon={TagIcon} title="No tags yet" description="Create your first tag to categorize resources." />
      ) : (
        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
          {data!.map((tag) => (
            <div
              key={tag.id}
              className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-elevated"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                  <TagIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-medium">{tag.name}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Hash className="h-3 w-3" />
                    {tag.resourceCount ?? 0} resources
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(tag); setDialogOpen(true); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setConfirmId(tag.id)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TagDialog open={dialogOpen} onOpenChange={setDialogOpen} editing={editing} />
      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete this tag?"
        description="Resources tagged with this will lose the association."
        onConfirm={() => {
          if (confirmId) removeMut.mutate(confirmId);
          setConfirmId(null);
        }}
      />
    </PageShell>
  );
}

function TagDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: Tag | null;
}) {
  const qc = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ name: string }>({
    values: { name: editing?.name ?? "" },
  });
  const mut = useMutation({
    mutationFn: (values: { name: string }) => (editing ? api.tags.update(editing.id, values) : api.tags.create(values)),
    onSuccess: () => {
      toast.success(editing ? "Tag updated" : "Tag created");
      qc.invalidateQueries({ queryKey: ["tags"] });
      onOpenChange(false);
      reset();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">{editing ? "Edit tag" : "New tag"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mut.mutate(values))} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Name</Label>
            <Input
              {...register("name", { required: "Required", maxLength: { value: 50, message: "Max 50 chars" } })}
              placeholder="e.g. Camera, Electronics"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
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
