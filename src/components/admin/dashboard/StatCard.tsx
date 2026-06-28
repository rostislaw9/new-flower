"use client";

import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import { Calendar, CheckCircle, Clock, Images } from "lucide-react";

import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS = {
  calendar: Calendar,
  checkCircle: CheckCircle,
  clock: Clock,
  images: Images,
} as const;

type IconKey = keyof typeof ICONS;

interface StatCardProps {
  title: string;
  value: number;
  icon: IconKey;
  description: string;
  href: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon,
  description,
  href,
  className,
}: StatCardProps) {
  const router = useRouter();
  const { start } = useTopLoader();
  const Icon = ICONS[icon];

  const navigate = () => {
    start();
    router.push(href);
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate();
        }
      }}
      className={cn(
        "group rounded-2xl border border-border/60 bg-card/60 shadow-lg transition-colors hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>
          <Eyebrow size="xs">{title}</Eyebrow>
        </CardTitle>
        <Icon
          size={16}
          className="text-muted-foreground transition-colors group-hover:text-accent"
        />
      </CardHeader>
      <CardContent>
        <Heading
          serif={false}
          size="lg"
          className="transition-colors group-hover:text-accent"
        >
          {value}
        </Heading>
        <Text muted size="xs">
          {description}
        </Text>
      </CardContent>
    </Card>
  );
}
