"use client";

import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/styled/Button";
import { Heading } from "@/components/styled/Typography";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel,
  confirmLoadingLabel,
  cancelLabel,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <Heading className="text-red-600">{title}</Heading>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={deleting}>
            {cancelLabel ?? "Cancel"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {confirmLoadingLabel ?? "Deleting..."}
              </>
            ) : (
              (confirmLabel ?? "Delete")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
