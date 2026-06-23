"use client";

import { useEffect, useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import type { AppointmentStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateBookingStatusAction } from "@/lib/actions/update-booking-status";

interface StatusOption {
  value: AppointmentStatus;
  label: string;
}

interface BookingStatusControlProps {
  bookingId: string;
  currentStatus: AppointmentStatus;
  statusOptions: StatusOption[];
  labels: {
    currentStatus: string;
    button: string;
  };
  messages: {
    success: string;
    error: string;
  };
}

export function BookingStatusControl({
  bookingId,
  currentStatus,
  statusOptions,
  labels,
  messages,
}: BookingStatusControlProps) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedStatus === currentStatus) {
      return;
    }

    startTransition(async () => {
      const result = await updateBookingStatusAction({
        bookingId,
        status: selectedStatus,
      });

      if (!result.success) {
        console.error(
          "[BookingStatusControl] Status update failed",
          result.message,
        );
        toast.error(result.message || messages.error);
        return;
      }

      toast.success(messages.success);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Badge className="w-fit" variant={currentStatus}>
          {labels.currentStatus}
        </Badge>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(value as AppointmentStatus)
            }
            disabled={isPending}
          >
            <SelectTrigger className="h-9 w-full min-w-0 sm:w-52 lg:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="submit"
            size="sm"
            className="w-full sm:w-auto sm:min-w-32"
            disabled={isPending || selectedStatus === currentStatus}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              labels.button
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
