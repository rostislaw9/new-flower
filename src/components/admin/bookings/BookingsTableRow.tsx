"use client";

import * as React from "react";

import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import type { AppointmentStatus } from "@prisma/client";
import { Loader2, Trash2 } from "lucide-react";

import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import { DeleteConfirmDialog } from "@/components/styled/DeleteConfirmDialog";
import { TableCell, TableRow } from "@/components/ui/table";
import { deleteBookingAction } from "@/lib/actions/delete-booking";
import { toast } from "sonner";

interface BookingsTableRowProps {
  bookingId: string;
  detailHref: string;
  clientName: string;
  clientEmail: string;
  status: AppointmentStatus;
  statusLabel: string;
  preferredDates: string[];
  noDatesLabel: string;
  remainingPreferredDates: number;
  moreDatesLabel?: string;
  submittedLabel: string;
  updatedLabel: string;
  viewLabel: string;
  deleteLabels: {
    title: string;
    description: string;
    confirm: string;
    confirming: string;
    cancel: string;
  };
  messages: {
    deleteSuccess: string;
    deleteError: string;
  };
}

export function BookingsTableRow({
  bookingId,
  detailHref,
  clientName,
  clientEmail,
  status,
  statusLabel,
  preferredDates,
  noDatesLabel,
  remainingPreferredDates,
  moreDatesLabel,
  submittedLabel,
  updatedLabel,
  viewLabel,
  deleteLabels,
  messages,
}: BookingsTableRowProps) {
  const router = useRouter();
  const { start } = useTopLoader();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deletePending, setDeletePending] = React.useState(false);

  const handleNavigate = () => {
    start();
    void router.push(detailHref);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  const handleDelete = async () => {
    setDeletePending(true);
    try {
      const result = await deleteBookingAction(bookingId);
      if (!result.success) {
        toast.error(result.message ?? messages.deleteError);
        return;
      }
      toast.success(messages.deleteSuccess);
      setConfirmOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[BookingsTableRow] delete", error);
      toast.error(messages.deleteError);
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <>
      <TableRow
        role="link"
        tabIndex={0}
        aria-label={viewLabel}
        onClick={handleNavigate}
        onKeyDown={handleKeyDown}
        className="cursor-pointer"
      >
        <TableCell>
          <div className="space-y-1">
            <div className="font-medium">{clientName}</div>
            <div className="text-sm text-muted-foreground">{clientEmail}</div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={status}>{statusLabel}</Badge>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            {preferredDates.length > 0 ? (
              preferredDates.map((date, index) => (
                <div key={`${detailHref}-preferred-${index}`}>{date}</div>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">
                {noDatesLabel}
              </span>
            )}
            {remainingPreferredDates > 0 && moreDatesLabel ? (
              <div className="text-sm text-muted-foreground">
                {moreDatesLabel}
              </div>
            ) : null}
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {submittedLabel}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {updatedLabel}
        </TableCell>
        <TableCell className="text-right">
          <Button
            type="button"
            variant="destructive"
            size="icon-borderless"
            aria-label={deleteLabels.title}
            disabled={deletePending}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              setConfirmOpen(true);
            }}
            onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) =>
              event.stopPropagation()
            }
          >
            {deletePending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Trash2 />
            )}
          </Button>
        </TableCell>
      </TableRow>

      <DeleteConfirmDialog
        open={confirmOpen}
        title={deleteLabels.title}
        description={deleteLabels.description}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        confirmLabel={deleteLabels.confirm}
        confirmLoadingLabel={deleteLabels.confirming}
        cancelLabel={deleteLabels.cancel}
      />
    </>
  );
}
