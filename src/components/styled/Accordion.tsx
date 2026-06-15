"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger as ShadcnAccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export { Accordion, AccordionContent, AccordionItem };

export function AccordionTrigger({
  className,
  ...props
}: React.ComponentProps<typeof ShadcnAccordionTrigger>) {
  return (
    <ShadcnAccordionTrigger
      className={cn(
        ["hover:no-underline", "hover:text-foreground/80"],
        className,
      )}
      {...props}
    />
  );
}
