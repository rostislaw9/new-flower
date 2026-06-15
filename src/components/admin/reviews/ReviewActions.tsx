"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Flag, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { deleteReview, setReviewFeatured } from "@/lib/actions/reviews";

interface ReviewActionsProps {
  id: string;
  featured: boolean;
  labels: {
    deleteTitle: string;
    deleteDescription: string;
  };
  dialogLabels: {
    cancel: string;
    confirm: string;
    confirming: string;
  };
}

export function ReviewActions({
  id,
  featured,
  labels,
  dialogLabels,
}: ReviewActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [togglePending, startToggleTransition] = useTransition();
  const [deletePending, setDeletePending] = useState(false);

  function handleToggleFeatured() {
    startToggleTransition(() => {
      void setReviewFeatured(id, !featured)
        .catch((error) => {
          console.error("[ReviewActions] Toggle failed", error);
        })
        .finally(() => {
          router.refresh();
        });
    });
  }

  async function handleDelete() {
    setDeletePending(true);
    try {
      const result = await deleteReview(id);
      if (!result.success) {
        console.error("[ReviewActions] Delete failed", result.message);
        return;
      }
      setConfirmOpen(false);
    } catch (error) {
      console.error("[ReviewActions] Delete error", error);
    } finally {
      setDeletePending(false);
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="accent"
          size="icon-borderless"
          onClick={handleToggleFeatured}
          disabled={togglePending || deletePending}
        >
          {togglePending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Flag />
          )}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-borderless"
          onClick={() => setConfirmOpen(true)}
          disabled={deletePending}
        >
          <Trash2 />
        </Button>
      </div>

      <DeleteConfirmDialog
        open={confirmOpen}
        title={labels.deleteTitle}
        description={labels.deleteDescription}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel={dialogLabels.confirm}
        confirmLoadingLabel={dialogLabels.confirming}
        cancelLabel={dialogLabels.cancel}
      />
    </>
  );
}
