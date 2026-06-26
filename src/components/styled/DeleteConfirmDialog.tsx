"use client";

import { useState } from "react";

import { Loader2, Trash2 } from "lucide-react";

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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  const actionButtons = (
    <>
      <Button
        variant="outline"
        onClick={onCancel}
        disabled={deleting}
        className="w-full sm:w-auto"
      >
        {cancelLabel ?? "Cancel"}
      </Button>
      <Button
        variant="destructive"
        onClick={handleConfirm}
        disabled={deleting}
        className="w-full sm:w-auto"
      >
        {deleting ? (
          <>
            <Loader2 className="animate-spin" />
            {confirmLoadingLabel}
          </>
        ) : (
          <>
            <Trash2 />
            {confirmLabel}
          </>
        )}
      </Button>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle asChild>
              <Heading serif={false} className="text-red-600">
                {title}
              </Heading>
            </DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>{actionButtons}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle asChild>
            <Heading serif={false} className="text-red-600">
              {title}
            </Heading>
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>{actionButtons}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
