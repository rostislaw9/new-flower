"use client";

import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { useRouter } from "next/navigation";

import type { AppointmentStatus } from "@prisma/client";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/styled/Badge";
import { Button } from "@/components/styled/Button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
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
  const [isPending, startTransition] = useTransition();
  const form = useForm<{ status: AppointmentStatus }>({
    defaultValues: { status: currentStatus },
  });

  useEffect(() => {
    form.reset({ status: currentStatus });
  }, [currentStatus, form]);

  const handleSubmit = form.handleSubmit(({ status }) => {
    if (status === currentStatus) {
      return;
    }

    startTransition(async () => {
      const result = await updateBookingStatusAction({
        bookingId,
        status,
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
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Badge className="w-fit" variant={currentStatus}>
          {labels.currentStatus}
        </Badge>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
                className="w-full sm:w-auto"
              >
                <FieldContent className="w-full">
                  <FieldLabel className="sr-only">
                    {labels.currentStatus}
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      className="h-9 w-full sm:w-auto"
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldContent>
              </Field>
            )}
          />

          <Button
            type="submit"
            size="sm"
            className="w-full sm:w-auto sm:min-w-32"
            disabled={isPending || form.watch("status") === currentStatus}
          >
            {isPending ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              labels.button
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
