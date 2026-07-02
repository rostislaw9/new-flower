import type { ComponentProps } from "react";

import Link from "next/link";

import { type VariantProps, cva } from "class-variance-authority";

import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const customButtonVariants = cva(["tracking-wider", "uppercase", "shadow-sm"], {
  variants: {
    variant: {
      default:
        "bg-primary text-primary-foreground hover:bg-primary/90 border border-primary",
      accent:
        "bg-transparent text-accent border border-accent hover:bg-accent hover:text-secondary",
      destructive:
        "bg-transparent text-red-600 hover:bg-red-600 hover:text-secondary border border-border",
      outline:
        "bg-transparent text-foreground hover:bg-secondary border border-border hover:border-foreground/30",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost:
        "bg-transparent text-foreground hover:bg-secondary border border-transparent",
      link: "bg-transparent text-primary hover:bg-transparent hover:opacity-70 p-0",
    },
    size: {
      sm: "h-8 px-4 text-xs",
      md: "h-10 px-6 text-sm",
      lg: "h-12 px-8 text-md",
      xl: "h-14 px-10 text-xl",
      icon: "h-10 w-10",
      "icon-borderless": "h-10 w-10 border border-transparent",
      link: "p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

type ButtonProps = Omit<
  ComponentProps<typeof ShadcnButton>,
  "variant" | "size"
> &
  VariantProps<typeof customButtonVariants> & {
    href?: string;
    target?: string;
  };

export function Button({
  variant,
  size,
  className,
  href,
  target,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(customButtonVariants({ variant, size }), className);

  if (href) {
    return (
      <ShadcnButton asChild className={classes} {...props}>
        <Link href={href} target={target}>
          {children}
        </Link>
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton className={classes} {...props}>
      {children}
    </ShadcnButton>
  );
}
