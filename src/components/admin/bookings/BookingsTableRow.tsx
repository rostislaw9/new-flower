"use client";

import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import type { AppointmentStatus } from "@prisma/client";

import { Badge } from "@/components/styled/Badge";
import { TableCell, TableRow } from "@/components/ui/table";

interface BookingsTableRowProps {
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
}

export function BookingsTableRow({
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
}: BookingsTableRowProps) {
  const router = useRouter();
  const { start } = useTopLoader();

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

  return (
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
    </TableRow>
  );
}
