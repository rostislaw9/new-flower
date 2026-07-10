"use client";

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { Eye, EyeOff, Flag, FlagOff, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import {
  deleteReview,
  setReviewFeatured,
  setReviewVisible,
} from "@/lib/actions/reviews";

interface ReviewActionsProps {
  id: string;
  featured: boolean;
  visible: boolean;
  labels: {
    deleteTitle: string;
    deleteDescription: string;
  };
  dialogLabels: {
    cancel: string;
    confirm: string;
    confirming: string;
  };
  messages: {
    toggleOn: string;
    toggleOff: string;
    toggleError: string;
    deleteSuccess: string;
    deleteError: string;
    visibleOn: string;
    visibleOff: string;
    visibleError: string;
  };
}

export function ReviewActions({
  id,
  featured,
  visible,
  labels,
  dialogLabels,
  messages,
}: ReviewActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [togglePending, startToggleTransition] = useTransition();
  const [visiblePending, startVisibleTransition] = useTransition();
  const [deletePending, setDeletePending] = useState(false);

  function handleToggleFeatured() {
    startToggleTransition(() => {
      void setReviewFeatured(id, !featured)
        .then((result) => {
          if (!result.success) {
            toast.error(result.message || messages.toggleError);
            return;
          }
          toast.success(featured ? messages.toggleOff : messages.toggleOn);
        })
        .catch((error) => {
          console.error("[ReviewActions] Toggle failed", error);
          toast.error(messages.toggleError);
        })
        .finally(() => {
          router.refresh();
        });
    });
  }

  function handleToggleVisible() {
    startVisibleTransition(() => {
      void setReviewVisible(id, !visible)
        .then((result) => {
          if (!result.success) {
            toast.error(result.message || messages.visibleError);
            return;
          }
          toast.success(visible ? messages.visibleOff : messages.visibleOn);
        })
        .catch((error) => {
          console.error("[ReviewActions] Visibility toggle failed", error);
          toast.error(messages.visibleError);
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
        toast.error(result.message || messages.deleteError);
        return;
      }
      setConfirmOpen(false);
      toast.success(messages.deleteSuccess);
    } catch (error) {
      console.error("[ReviewActions] Delete error", error);
      toast.error(messages.deleteError);
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
          variant="ghost"
          size="icon-borderless"
          onClick={handleToggleVisible}
          disabled={visiblePending || deletePending}
          aria-label={visible ? messages.visibleOff : messages.visibleOn}
        >
          {visiblePending ? (
            <Loader2 className="animate-spin" />
          ) : visible ? (
            <EyeOff />
          ) : (
            <Eye />
          )}
        </Button>
        <Button
          type="button"
          variant="accent"
          size="icon-borderless"
          onClick={handleToggleFeatured}
          disabled={togglePending || deletePending}
          aria-label={featured ? messages.toggleOff : messages.toggleOn}
        >
          {togglePending ? (
            <Loader2 className="animate-spin" />
          ) : featured ? (
            <FlagOff />
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
          {deletePending ? <Loader2 className="animate-spin" /> : <Trash2 />}
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
