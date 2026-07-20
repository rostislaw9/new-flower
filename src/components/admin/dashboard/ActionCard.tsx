"use client";

import { useRouter } from "next/navigation";
import { useTopLoader } from "nextjs-toploader";

import {
  BookImage,
  BookText,
  Calendar,
  Images,
  MessageCircleQuestionMark,
  Sparkles,
} from "lucide-react";

import { Heading, Text } from "@/components/styled/Typography";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONS = {
  calendar: Calendar,
  images: Images,
  star: Sparkles,
  user: BookImage,
  faq: MessageCircleQuestionMark,
  about: BookText,
} as const;

type IconKey = keyof typeof ICONS;

interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: IconKey;
  className?: string;
}

export function ActionCard({
  title,
  description,
  href,
  icon,
  className,
}: ActionCardProps) {
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
        "group col-span-2 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-md transition-colors hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={24}
          className="text-muted-foreground transition-colors group-hover:text-accent"
        />
        <Heading
          serif={false}
          size="md"
          className="transition-colors group-hover:text-accent"
        >
          {title}
        </Heading>
      </div>
      <Text size="sm" muted>
        {description}
      </Text>
    </Card>
  );
}
