import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/styled/Button";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";

interface NotFoundSectionProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export function NotFoundSection({
  eyebrow,
  title,
  subtitle,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: NotFoundSectionProps) {
  return (
    <Section size="lg" className="flex min-h-[70vh] items-center">
      <Container className="flex flex-col items-center gap-6 text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h1" size="display">
          {title}
        </Heading>
        <Text size="md" muted className="max-w-xs sm:max-w-lg">
          {subtitle}
        </Text>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={primaryHref}>{primaryLabel}</Button>
          <Button href={secondaryHref} variant="outline">
            {secondaryLabel}
          </Button>
        </div>
      </Container>
    </Section>
  );
}
