import { Eyebrow, Heading, Text } from "@/components/styled/Typography";

interface PageHeadingProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function PageHeading({ eyebrow, title, subtitle }: PageHeadingProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading as="h1" size="headline">
        {title}
      </Heading>
      <Text size="lg" muted>
        {subtitle}
      </Text>
    </div>
  );
}
