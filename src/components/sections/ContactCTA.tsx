import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/styled/Button";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import { Separator } from "@/components/ui/separator";

interface ContactCTAProps {
  eyebrow: string;
  heading: string;
  body: string;
  bookButton: string;
  contactButton: string;
}

export function ContactCTA({
  eyebrow,
  heading,
  body,
  bookButton,
  contactButton,
}: ContactCTAProps) {
  return (
    <>
      <Separator />
      <Section size="lg">
        <Container>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
            <Eyebrow>{eyebrow}</Eyebrow>
            <Heading as="h2" size="headline">
              {heading}
            </Heading>
            <Text size="lg" muted className="max-w-lg">
              {body}
            </Text>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/booking" size="lg">
                {bookButton}
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                {contactButton}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
