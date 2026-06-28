"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";

import { Loader2 } from "lucide-react";

import { RatingInput } from "@/components/reviews/RatingInput";
import { Button } from "@/components/styled/Button";
import { Eyebrow, Heading } from "@/components/styled/Typography";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type ReviewFormErrors,
  type ReviewFormState,
  submitReview,
} from "@/lib/actions/reviews";

interface ReviewFormProps {
  labels: {
    nameLabel: string;
    emailLabel: string;
    ratingLabel: string;
    ratingHelp: string;
    reviewLabel: string;
    reviewPlaceholder: string;
    submit: string;
    submitting: string;
    error: string;
    ratingArias: string[];
  };
  success: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
}

const initialState: ReviewFormState = { status: "idle" };

export function ReviewForm({ labels, success }: ReviewFormProps) {
  const [state, formAction] = useActionState(submitReview, initialState);
  const [pending, startTransition] = useTransition();
  const successRef = useRef<HTMLDivElement>(null);

  const isSuccess = state.status === "success";

  useEffect(() => {
    if (isSuccess) {
      // Delay scroll to allow conditional render to complete
      setTimeout(() => {
        const element = successRef.current;
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top,
            behavior: "smooth",
          });
          element.focus();
        }
      }, 0);
    }
  }, [isSuccess]);

  const fieldErrors =
    state.status === "error"
      ? (state.fieldErrors ?? ({} as ReviewFormErrors))
      : {};
  const ratingError = fieldErrors.rating?.[0];

  const hasGlobalError = state.status === "error" && state.message;

  if (isSuccess) {
    return (
      <Card ref={successRef} tabIndex={-1} className="text-center outline-none">
        <CardHeader>
          <CardTitle>
            <Eyebrow>{success.eyebrow}</Eyebrow>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <Heading size="lg">{success.title}</Heading>
          <CardDescription>{success.subtitle}</CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      className="flex flex-col gap-6"
      action={(formData) => {
        startTransition(() => {
          void formAction(formData);
        });
      }}
    >
      {hasGlobalError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message ?? labels.error}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="clientName">{labels.nameLabel}</Label>
          <Input
            id="clientName"
            name="clientName"
            required
            aria-required="true"
          />
          {fieldErrors.clientName ? (
            <p className="text-sm text-destructive">
              {fieldErrors.clientName[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="clientEmail">{labels.emailLabel}</Label>
          <Input id="clientEmail" name="clientEmail" type="email" />
          {fieldErrors.clientEmail ? (
            <p className="text-sm text-destructive">
              {fieldErrors.clientEmail[0]}
            </p>
          ) : null}
        </div>
      </div>

      <RatingInput
        label={labels.ratingLabel}
        helpText={labels.ratingHelp}
        ariaLabels={labels.ratingArias}
        {...(ratingError ? { error: ratingError } : {})}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="text">{labels.reviewLabel}</Label>
        <Textarea
          id="text"
          name="text"
          rows={6}
          placeholder={labels.reviewPlaceholder}
          required
          aria-required="true"
        />
        {fieldErrors.text ? (
          <p className="text-sm text-destructive">{fieldErrors.text[0]}</p>
        ) : null}
      </div>

      <div>
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? (
            <>
              <Loader2 className="animate-spin" />
              {labels.submitting}
            </>
          ) : (
            labels.submit
          )}
        </Button>
      </div>
    </form>
  );
}
