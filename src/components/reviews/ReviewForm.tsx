"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ReviewFormState, submitReview } from "@/lib/actions/reviews";

interface ReviewFormProps {
  labels: {
    nameLabel: string;
    nameError: string;
    emailLabel: string;
    emailError: string;
    ratingLabel: string;
    ratingHelp: string;
    ratingError: string;
    reviewLabel: string;
    reviewPlaceholder: string;
    reviewError: string;
    submit: string;
    submitting: string;
    optionalTag: string;
    ratingArias: string[];
  };
  success: {
    eyebrow: string;
    title: string;
    subtitle: string;
  };
}

const initialState: ReviewFormState = { status: "idle" };

interface ReviewFormValues {
  clientName: string;
  clientEmail: string;
  rating: number | null;
  text: string;
}

const REVIEW_FORM_STORAGE_KEY = "review-form-values";

const REVIEW_FORM_DEFAULTS: ReviewFormValues = {
  clientName: "",
  clientEmail: "",
  rating: null,
  text: "",
};

const reviewFormFieldNames = [
  "clientName",
  "clientEmail",
  "rating",
  "text",
] as const satisfies Array<keyof ReviewFormValues>;

function isReviewFormField(
  key: string,
): key is (typeof reviewFormFieldNames)[number] {
  return reviewFormFieldNames.includes(
    key as (typeof reviewFormFieldNames)[number],
  );
}

export function ReviewForm({ labels, success }: ReviewFormProps) {
  const [state, formAction] = useActionState(submitReview, initialState);
  const [pending, startTransition] = useTransition();
  const successRef = useRef<HTMLDivElement>(null);

  const form = useForm<ReviewFormValues>({
    defaultValues: REVIEW_FORM_DEFAULTS,
  });
  const { control, handleSubmit, reset, setError, clearErrors, watch } = form;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(REVIEW_FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<ReviewFormValues>;
        reset({ ...REVIEW_FORM_DEFAULTS, ...parsed });
      }
    } catch {
      // ignore parse errors
    }
  }, [reset]);

  useEffect(() => {
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem(REVIEW_FORM_STORAGE_KEY, JSON.stringify(values));
      } catch {
        // ignore storage errors
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const isSuccess = state.status === "success";

  useEffect(() => {
    if (state.status === "error") {
      clearErrors();
      const errors = state.fieldErrors ?? {};
      Object.entries(errors).forEach(([key, messages]) => {
        if (!isReviewFormField(key)) {
          return;
        }
        const message = messages?.[0];
        if (message) {
          setError(key, { type: "server", message });
        }
      });
    } else if (state.status === "success") {
      reset(REVIEW_FORM_DEFAULTS);
      clearErrors();
      try {
        sessionStorage.removeItem(REVIEW_FORM_STORAGE_KEY);
      } catch {
        // ignore
      }
    } else if (state.status === "idle") {
      clearErrors();
    }
  }, [state, clearErrors, reset, setError]);

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
      }, 500);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.append("clientName", values.clientName);
    formData.append("clientEmail", values.clientEmail ?? "");
    formData.append("rating", values.rating ? String(values.rating) : "");
    formData.append("text", values.text);

    startTransition(() => {
      void formAction(formData);
    });
  });

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
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <div className="grid gap-6 md:grid-cols-2">
        <Controller
          control={control}
          name="clientName"
          rules={{
            required: labels.nameError,
            minLength: { value: 2, message: labels.nameError },
          }}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className="flex items-baseline justify-between gap-2">
                  <FieldLabel htmlFor="clientName">
                    {labels.nameLabel}
                  </FieldLabel>
                  {fieldState.error ? (
                    <span role="alert" className="text-xs text-destructive">
                      {fieldState.error.message}
                    </span>
                  ) : null}
                </div>
                <Input
                  id="clientName"
                  aria-invalid={fieldState.invalid || undefined}
                  className={
                    fieldState.invalid ? "border-destructive/60" : undefined
                  }
                  {...field}
                />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="clientEmail"
          rules={{
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: labels.emailError,
            },
          }}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className="flex items-baseline justify-between gap-2">
                  <FieldLabel htmlFor="clientEmail">
                    {labels.emailLabel}
                  </FieldLabel>
                  {fieldState.error ? (
                    <span role="alert" className="text-xs text-destructive">
                      {fieldState.error.message}
                    </span>
                  ) : (
                    <FieldDescription>{labels.optionalTag}</FieldDescription>
                  )}
                </div>
                <Input
                  id="clientEmail"
                  type="email"
                  aria-invalid={fieldState.invalid || undefined}
                  className={
                    fieldState.invalid ? "border-destructive/60" : undefined
                  }
                  {...field}
                />
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="rating"
          rules={{
            required: labels.ratingError,
            min: { value: 1, message: labels.ratingError },
          }}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className="flex items-baseline justify-between gap-2">
                  <FieldLabel>{labels.ratingLabel}</FieldLabel>
                  {fieldState.error ? (
                    <span role="alert" className="text-xs text-destructive">
                      {fieldState.error.message}
                    </span>
                  ) : (
                    <FieldDescription>{labels.ratingHelp}</FieldDescription>
                  )}
                </div>
                <RatingInput
                  ariaLabels={labels.ratingArias}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={pending}
                />
              </FieldContent>
            </Field>
          )}
        />
      </div>

      <Controller
        control={control}
        name="text"
        rules={{
          required: labels.reviewError,
          minLength: { value: 20, message: labels.reviewError },
        }}
        render={({ field, fieldState }) => (
          <Field>
            <FieldContent>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="text">{labels.reviewLabel}</FieldLabel>
                {fieldState.error ? (
                  <span role="alert" className="text-xs text-destructive">
                    {fieldState.error.message}
                  </span>
                ) : null}
              </div>
              <Textarea
                id="text"
                rows={6}
                placeholder={labels.reviewPlaceholder}
                aria-invalid={fieldState.invalid || undefined}
                className={
                  fieldState.invalid ? "border-destructive/60" : undefined
                }
                {...field}
              />
            </FieldContent>
          </Field>
        )}
      />

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
