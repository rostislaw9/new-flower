"use client";

import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/styled/Accordion";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqSection {
  id: string;
  title: string;
  questions: FaqItem[];
}

export function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  const [openId, setOpenId] = useState<string>("");

  return (
    <div className="flex flex-col gap-16">
      {sections.map((section) => (
        <div key={section.id} className="flex flex-col gap-6">
          <Eyebrow>{section.title}</Eyebrow>
          <Accordion
            type="single"
            collapsible
            value={openId}
            onValueChange={(val) => setOpenId(val || "")}
          >
            {section.questions.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger>
                  <Heading as="h3" size="sm" className="text-left">
                    {item.question}
                  </Heading>
                </AccordionTrigger>
                <AccordionContent>
                  <Text muted>{item.answer}</Text>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
