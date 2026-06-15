import type { MouseEventHandler } from "react";

import { cn } from "@/lib/utils";

import { Button } from "./Button";
import { Heading } from "./Typography";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
};

export function Logo({ className, size = "md", onClick }: LogoProps) {
  return (
    <Button
      href="/"
      variant="link"
      size="link"
      className={cn(sizeClasses[size], className)}
      aria-label="New Flower Tattoo — home"
      onClick={onClick}
    >
      <Heading size={size}>New Flower</Heading>
    </Button>
  );
}
