"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";

import { useLocale, useTranslations } from "next-intl";

import {
  Check,
  Copy,
  Link as LinkIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { ImageUploader } from "@/components/common/ImageUploader";
import { Button } from "@/components/styled/Button";
import { DatePicker } from "@/components/styled/DatePicker";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { type Locale, defaultLocale } from "@/i18n/config";
import type { ActionResult } from "@/lib/actions/create-appointment";
import { createAppointment } from "@/lib/actions/create-appointment";
import {
  clearFormState,
  loadFormState,
  saveFormState,
} from "@/lib/form-storage";
import { isSupportedLocale } from "@/lib/locale-utils";
import type {
  BodyPlacement,
  BudgetRange,
  ContactMethod,
} from "@/lib/schemas/appointment";
import {
  BODY_PLACEMENTS,
  BUDGET_RANGES,
  CONTACT_METHODS,
} from "@/lib/schemas/appointment";

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const INITIAL_STATE: ActionResult | null = null;

type ContactMethodOptionKey = "email" | "instagram" | "facebook" | "whatsapp";
const contactMethodTranslationKeys: Record<
  ContactMethod,
  ContactMethodOptionKey
> = {
  Email: "email",
  Instagram: "instagram",
  Facebook: "facebook",
  WhatsApp: "whatsapp",
};

type BodyPlacementOptionKey =
  | "arm"
  | "forearm"
  | "upperArm"
  | "shoulder"
  | "back"
  | "chest"
  | "rib"
  | "leg"
  | "thigh"
  | "calf"
  | "ankle"
  | "foot"
  | "neck"
  | "hand"
  | "wrist"
  | "other";
const bodyPlacementTranslationKeys: Record<
  BodyPlacement,
  BodyPlacementOptionKey
> = {
  Arm: "arm",
  Forearm: "forearm",
  "Upper arm": "upperArm",
  Shoulder: "shoulder",
  Back: "back",
  Chest: "chest",
  Rib: "rib",
  Leg: "leg",
  Thigh: "thigh",
  Calf: "calf",
  Ankle: "ankle",
  Foot: "foot",
  Neck: "neck",
  Hand: "hand",
  Wrist: "wrist",
  Other: "other",
};

type BudgetOptionKey =
  | "under10000"
  | "10000to20000"
  | "20000to40000"
  | "40000to80000"
  | "over80000"
  | "toDiscuss";

const budgetTranslationKeys: Record<BudgetRange, BudgetOptionKey> = {
  "Under ฿10,000": "under10000",
  "฿10,000 – ฿20,000": "10000to20000",
  "฿20,000 – ฿40,000": "20000to40000",
  "฿40,000 – ฿80,000": "40000to80000",
  "฿80,000+": "over80000",
  "To discuss": "toDiscuss",
};

const MAX_REFERENCE_IMAGES = 5;

type UploadedImageMeta = {
  url: string;
  name?: string | undefined;
  meta?: string | undefined;
};

type StoredBookingFormState = Partial<BookingFormValues> & {
  uploadedImagesMeta?: UploadedImageMeta[];
  imageInputMode?: "url" | "upload";
};

const BOOKING_FORM_STORAGE_KEY = "booking-form-values";

const bookingFieldNames = [
  "fullName",
  "email",
  "contactMethod",
  "phone",
  "tattooDescription",
  "bodyPlacement",
  "tattooSize",
  "preferredDates",
  "budgetRange",
  "referenceImageUrls",
] as const;

type BookingFieldName = (typeof bookingFieldNames)[number];

function isBookingFieldName(value: string): value is BookingFieldName {
  return (bookingFieldNames as readonly string[]).includes(value);
}

interface BookingFormValues {
  fullName: string;
  email: string;
  contactMethod: ContactMethod | "";
  phone: string;
  tattooDescription: string;
  bodyPlacement: BodyPlacement | "";
  tattooSize: string;
  preferredDates: string[];
  budgetRange: BudgetRange | "";
  referenceImageUrls: string[];
}

const BOOKING_FORM_DEFAULTS: BookingFormValues = {
  fullName: "",
  email: "",
  contactMethod: "",
  phone: "",
  tattooDescription: "",
  bodyPlacement: "",
  tattooSize: "",
  preferredDates: [],
  budgetRange: "",
  referenceImageUrls: [""],
};

export function BookingForm() {
  const rawLocale = useLocale();
  const locale: Locale = isSupportedLocale(rawLocale)
    ? rawLocale
    : defaultLocale;

  const formT = useTranslations("booking.form");
  const successT = useTranslations("booking.success");

  const [state, formAction, isPending] = useActionState(
    createAppointment,
    INITIAL_STATE,
  );

  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");
  const [copied, setCopied] = useState(false);
  const [manualUrls, setManualUrls] = useState<string[]>([""]);
  const [uploadedImagesMeta, setUploadedImagesMeta] = useState<
    UploadedImageMeta[]
  >([]);

  const successRef = useRef<HTMLDivElement>(null);
  const uploadedImagesMetaRef = useRef(uploadedImagesMeta);
  uploadedImagesMetaRef.current = uploadedImagesMeta;
  const imageInputModeRef = useRef(imageInputMode);
  imageInputModeRef.current = imageInputMode;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<BookingFormValues>({
    defaultValues: BOOKING_FORM_DEFAULTS,
  });

  useEffect(() => {
    const saved = loadFormState<StoredBookingFormState>(
      BOOKING_FORM_STORAGE_KEY,
      locale,
    );
    if (saved) {
      const restored = { ...BOOKING_FORM_DEFAULTS, ...saved };
      reset(restored);
      if (saved.uploadedImagesMeta?.length) {
        setUploadedImagesMeta(saved.uploadedImagesMeta);
      }
      if (saved.imageInputMode) {
        setImageInputMode(saved.imageInputMode);
      }
      const uploadedUrls = new Set(
        saved.uploadedImagesMeta?.map((m) => m.url) ?? [],
      );
      const manualOnly = (saved.referenceImageUrls ?? []).filter(
        (url) => url && !uploadedUrls.has(url),
      );
      setManualUrls(manualOnly.length > 0 ? manualOnly : [""]);
      saveFormState(BOOKING_FORM_STORAGE_KEY, restored, locale);
    } else {
      saveFormState(
        BOOKING_FORM_STORAGE_KEY,
        {
          ...getValues(),
          uploadedImagesMeta: uploadedImagesMetaRef.current,
          imageInputMode: imageInputModeRef.current,
        },
        locale,
      );
    }
  }, [reset, getValues, locale]);

  useEffect(() => {
    const subscription = watch((values) => {
      saveFormState(
        BOOKING_FORM_STORAGE_KEY,
        {
          ...values,
          uploadedImagesMeta: uploadedImagesMetaRef.current,
          imageInputMode: imageInputModeRef.current,
        },
        locale,
      );
    });
    return () => subscription.unsubscribe();
  }, [watch, locale]);

  const contactMethodValue = watch("contactMethod");

  const filledManualUrlsCount = manualUrls.filter(Boolean).length;
  const uploadedCount = uploadedImagesMeta.length;
  const totalReferenceCount = filledManualUrlsCount + uploadedCount;

  useEffect(() => {
    setValue(
      "referenceImageUrls",
      [
        ...manualUrls.filter(Boolean),
        ...uploadedImagesMeta.map((img) => img.url),
      ],
      { shouldValidate: false },
    );
  }, [manualUrls, uploadedImagesMeta, setValue]);

  const fullNameRegistration = register("fullName", {
    required: formT("fullName.errors.required"),
    minLength: { value: 2, message: formT("fullName.errors.min") },
  });

  const emailRegistration = register("email", {
    required: formT("email.errors.required"),
    pattern: { value: EMAIL_REGEX, message: formT("email.errors.invalid") },
  });

  const phoneRegistration = register("phone", {
    validate: (value) => {
      if (
        contactMethodValue &&
        contactMethodValue !== "Email" &&
        !value.trim()
      ) {
        return formT("phone.errors.required");
      }
      return true;
    },
  });

  const tattooDescriptionRegistration = register("tattooDescription", {
    required: formT("description.errors.required"),
    minLength: { value: 20, message: formT("description.errors.min") },
  });

  const scrollToField = (field: BookingFieldName) => {
    const target = document.getElementById(field);
    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.focus({ preventScroll: true });
      });
    }
  };

  useEffect(() => {
    void trigger("phone");
  }, [contactMethodValue, trigger]);

  useEffect(() => {
    if (state?.success) {
      reset(BOOKING_FORM_DEFAULTS);
      setValue("referenceImageUrls", BOOKING_FORM_DEFAULTS.referenceImageUrls);
      setImageInputMode("url");
      setCopied(false);
      setManualUrls([""]);
      setUploadedImagesMeta([]);
      try {
        clearFormState(BOOKING_FORM_STORAGE_KEY);
      } catch {
        // ignore
      }

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
  }, [reset, setValue, state]);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  useEffect(() => {
    if (state && !state.success && state.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, messages]) => {
        if (!messages || messages.length === 0) return;
        if (isBookingFieldName(key)) {
          const message = messages[0];
          if (message) {
            setError(key as keyof BookingFormValues, {
              type: "server",
              message,
            });
          }
        }
      });

      const firstField = bookingFieldNames.find(
        (name) => state.fieldErrors?.[name]?.length,
      );
      if (firstField) {
        scrollToField(firstField);
      }
    }
  }, [setError, state]);

  const addReferenceUrl = () => {
    if (totalReferenceCount >= MAX_REFERENCE_IMAGES) return;
    setManualUrls((prev) => [...prev, ""]);
  };

  const onSubmit = handleSubmit((values) => {
    const filteredPreferredDates = values.preferredDates.filter((date) => date);
    if (filteredPreferredDates.length === 0) {
      setError("preferredDates", {
        type: "manual",
        message: formT("preferredDates.errors.required"),
      });
      scrollToField("preferredDates");
      return;
    }

    const filteredReferenceUrls = values.referenceImageUrls
      .map((url) => url.trim())
      .filter((url) => url.length > 0)
      .slice(0, MAX_REFERENCE_IMAGES);

    const formData = new FormData();
    formData.set("fullName", values.fullName.trim());
    formData.set("email", values.email.trim());
    formData.set("contactMethod", values.contactMethod);
    formData.set("phone", values.phone.trim());
    formData.set("tattooDescription", values.tattooDescription.trim());
    formData.set("bodyPlacement", values.bodyPlacement);
    formData.set("tattooSize", values.tattooSize.trim());
    formData.set("budgetRange", values.budgetRange);
    filteredPreferredDates.forEach((date) => {
      formData.append("preferredDates", date);
    });
    filteredReferenceUrls.forEach((url) => {
      formData.append("referenceImageUrls", url);
    });

    startTransition(() => {
      formAction(formData);
    });
  });
  const preferredDatePlaceholder = formT(
    "preferredDates.datePicker.placeholder",
  );
  const preferredDateClearLabel = formT("preferredDates.datePicker.clearLabel");
  const minPreferredDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }, []);

  if (state?.success) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="flex flex-col gap-6 outline-none"
        aria-live="polite"
      >
        <div className="border border-border bg-secondary p-8">
          <div className="flex flex-col gap-4">
            <Eyebrow>{successT("eyebrow")}</Eyebrow>
            <Heading as="h2" size="title">
              {successT("title")}
            </Heading>
            <Text muted>{successT("message")}</Text>
            <div className="flex items-center gap-3">
              <Text size="sm" muted>
                {successT("bookingIdLabel")}:{" "}
                <span className="font-mono text-foreground">{state.id}</span>
              </Text>
              <Button
                variant="ghost"
                size="link"
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(state.id ?? "");
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
                aria-label={successT("copyAria")}
              >
                {copied ? (
                  <>
                    <Check />
                    <span>{successT("copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy />
                    <span>{successT("copyAction")}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
        <Button href="/" variant="outline" size="md">
          {successT("returnHome")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      {/* Section: Contact */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.contact")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.contact")}</Eyebrow>
          <Separator />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field>
            <FieldContent>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="fullName">
                  {formT("fullName.label")}
                </FieldLabel>
                {errors.fullName ? (
                  <span role="alert" className="text-xs text-destructive">
                    {errors.fullName.message}
                  </span>
                ) : null}
              </div>
              <Input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder={formT("fullName.placeholder")}
                aria-invalid={!!errors.fullName || undefined}
                className={
                  errors.fullName ? "border-destructive/60" : undefined
                }
                {...fullNameRegistration}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldContent>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="email">{formT("email.label")}</FieldLabel>
                {errors.email ? (
                  <span role="alert" className="text-xs text-destructive">
                    {errors.email.message}
                  </span>
                ) : null}
              </div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={formT("email.placeholder")}
                aria-invalid={!!errors.email || undefined}
                className={errors.email ? "border-destructive/60" : undefined}
                {...emailRegistration}
              />
            </FieldContent>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            control={control}
            name="contactMethod"
            rules={{ required: formT("contactMethod.errors.required") }}
            render={({ field, fieldState }) => (
              <Field>
                <FieldContent>
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="contactMethod">
                      {formT("contactMethod.label")}
                    </FieldLabel>
                    {fieldState.error ? (
                      <span role="alert" className="text-xs text-destructive">
                        {fieldState.error.message}
                      </span>
                    ) : null}
                  </div>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="contactMethod"
                      aria-invalid={fieldState.invalid || undefined}
                      className={
                        fieldState.invalid ? "border-destructive/60" : undefined
                      }
                    >
                      <SelectValue
                        placeholder={formT("contactMethod.placeholder")}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {CONTACT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {formT(
                              `contactMethod.options.${contactMethodTranslationKeys[method]}`,
                            )}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          />

          <Field>
            <FieldContent>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="phone">{formT("phone.label")}</FieldLabel>
                {errors.phone ? (
                  <span role="alert" className="text-xs text-destructive">
                    {errors.phone.message}
                  </span>
                ) : (
                  <FieldDescription>{formT("phone.hint")}</FieldDescription>
                )}
              </div>
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder={formT("phone.placeholder")}
                aria-invalid={!!errors.phone || undefined}
                className={errors.phone ? "border-destructive/60" : undefined}
                {...phoneRegistration}
              />
            </FieldContent>
          </Field>
        </div>
      </fieldset>

      {/* Section: Tattoo */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.tattoo")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.tattoo")}</Eyebrow>
          <Separator />
        </div>

        <Field>
          <FieldContent>
            <div className="flex items-baseline justify-between gap-2">
              <FieldLabel htmlFor="tattooDescription">
                {formT("description.label")}
              </FieldLabel>
              {errors.tattooDescription ? (
                <span role="alert" className="text-xs text-destructive">
                  {errors.tattooDescription.message}
                </span>
              ) : formT("description.hint") ? (
                <FieldDescription>{formT("description.hint")}</FieldDescription>
              ) : null}
            </div>
            <Textarea
              id="tattooDescription"
              rows={6}
              placeholder={formT("description.placeholder")}
              aria-invalid={!!errors.tattooDescription || undefined}
              className={
                errors.tattooDescription ? "border-destructive/60" : undefined
              }
              {...tattooDescriptionRegistration}
            />
          </FieldContent>
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            control={control}
            name="bodyPlacement"
            render={({ field, fieldState }) => (
              <Field>
                <FieldContent>
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="bodyPlacement">
                      {formT("bodyPlacement.label")}
                    </FieldLabel>
                    <FieldDescription>
                      {formT("bodyPlacement.hint")}
                    </FieldDescription>
                  </div>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="bodyPlacement"
                      className={
                        fieldState.invalid ? "border-destructive/60" : undefined
                      }
                    >
                      <SelectValue
                        placeholder={formT("bodyPlacement.placeholder")}
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {BODY_PLACEMENTS.map((placement) => (
                          <SelectItem key={placement} value={placement}>
                            {formT(
                              `bodyPlacement.options.${bodyPlacementTranslationKeys[placement]}`,
                            )}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          />

          <Controller
            control={control}
            name="tattooSize"
            render={({ field, fieldState }) => (
              <Field>
                <FieldContent>
                  <div className="flex items-baseline justify-between gap-2">
                    <FieldLabel htmlFor="tattooSize">
                      {formT("size.label")}
                    </FieldLabel>
                    <FieldDescription>{formT("size.hint")}</FieldDescription>
                  </div>
                  <Input
                    id="tattooSize"
                    type="text"
                    placeholder={formT("size.placeholder")}
                    className={
                      fieldState.invalid ? "border-destructive/60" : undefined
                    }
                    {...field}
                  />
                </FieldContent>
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="budgetRange"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className="flex items-baseline justify-between gap-2">
                  <FieldLabel htmlFor="budgetRange">
                    {formT("budget.label")}
                  </FieldLabel>
                  <FieldDescription>{formT("budget.hint")}</FieldDescription>
                </div>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="budgetRange"
                    className={
                      fieldState.invalid ? "border-destructive/60" : undefined
                    }
                  >
                    <SelectValue placeholder={formT("budget.placeholder")} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      {BUDGET_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {formT(
                            `budget.options.${budgetTranslationKeys[range]}`,
                          )}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          )}
        />
      </fieldset>

      {/* Section: Availability */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.availability")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.availability")}</Eyebrow>
          <Separator />
        </div>

        <Controller
          control={control}
          name="preferredDates"
          rules={{ required: formT("preferredDates.errors.required") }}
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent>
                <div className="flex items-baseline justify-between gap-2">
                  <FieldLabel htmlFor="preferredDates">
                    {formT("preferredDates.label")}
                  </FieldLabel>
                  {fieldState.error ? (
                    <span role="alert" className="text-xs text-destructive">
                      {fieldState.error.message}
                    </span>
                  ) : formT("preferredDates.hint") ? (
                    <FieldDescription>
                      {formT("preferredDates.hint")}
                    </FieldDescription>
                  ) : null}
                </div>
                <DatePicker
                  id="preferredDates"
                  mode="multiple"
                  value={field.value}
                  onChange={(dates) => {
                    if (dates.length <= MAX_REFERENCE_IMAGES) {
                      field.onChange(dates);
                    }
                  }}
                  placeholder={preferredDatePlaceholder}
                  clearLabel={preferredDateClearLabel}
                  ariaLabel={formT("preferredDates.label")}
                  hasError={fieldState.invalid}
                  minDate={minPreferredDate}
                  locale={locale}
                  formatDateLabel={(dates) =>
                    formT("preferredDates.datePicker.selectedCount", {
                      count: dates.length,
                    })
                  }
                />
              </FieldContent>
            </Field>
          )}
        />
      </fieldset>

      {/* Section: Reference Images */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.references")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.references")}</Eyebrow>
          <Separator />
        </div>

        {/* Toggle between URL and Upload */}
        <div className="flex gap-2">
          <Button
            variant={imageInputMode === "url" ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setImageInputMode("url")}
            disabled={uploadedCount >= MAX_REFERENCE_IMAGES}
          >
            <LinkIcon className="h-4 w-4" />
            {formT("reference.toggle.urls")}
          </Button>
          <Button
            variant={imageInputMode === "upload" ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setImageInputMode("upload")}
            disabled={filledManualUrlsCount >= MAX_REFERENCE_IMAGES}
          >
            <Upload className="h-4 w-4" />
            {formT("reference.toggle.upload")}
          </Button>
        </div>

        {imageInputMode === "url" ? (
          <Field>
            <FieldContent>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="referenceImageUrls-0">
                  {formT("reference.urls.label")}
                </FieldLabel>
                {errors.referenceImageUrls ? (
                  <span role="alert" className="text-xs text-destructive">
                    {errors.referenceImageUrls.message}
                  </span>
                ) : (
                  <FieldDescription>
                    {formT("reference.urls.hint", {
                      max: MAX_REFERENCE_IMAGES,
                      count: totalReferenceCount,
                    })}
                  </FieldDescription>
                )}
              </div>
              <div className="flex flex-col gap-3">
                {manualUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      id={index === 0 ? "referenceImageUrls-0" : undefined}
                      type="url"
                      placeholder={formT("reference.urls.placeholder")}
                      value={url}
                      onChange={(e) =>
                        setManualUrls((prev) =>
                          prev.map((u, i) =>
                            i === index ? e.target.value : u,
                          ),
                        )
                      }
                      aria-label={formT("reference.urls.aria", {
                        number: index + 1,
                      })}
                      className="flex-1"
                    />
                    {manualUrls.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          setManualUrls((prev) =>
                            prev.length > 1
                              ? prev.filter((_, i) => i !== index)
                              : prev,
                          )
                        }
                        aria-label={formT("reference.urls.removeAria", {
                          number: index + 1,
                        })}
                        className="hover:border-destructive/40 hover:text-destructive"
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                ))}
                {manualUrls.length < MAX_REFERENCE_IMAGES - uploadedCount && (
                  <Button
                    type="button"
                    variant="link"
                    size="link"
                    onClick={addReferenceUrl}
                    className="self-start"
                  >
                    {formT("reference.urls.addAnother")}
                  </Button>
                )}
              </div>
            </FieldContent>
          </Field>
        ) : (
          <Field>
            <FieldContent>
              <div className="flex items-baseline justify-between gap-2">
                <FieldLabel htmlFor="referenceImages">
                  {formT("reference.upload.label")}
                </FieldLabel>
                {errors.referenceImageUrls ? (
                  <span role="alert" className="text-xs text-destructive">
                    {errors.referenceImageUrls.message}
                  </span>
                ) : (
                  <FieldDescription>
                    {formT("reference.upload.hint", {
                      max: MAX_REFERENCE_IMAGES,
                      count: totalReferenceCount,
                    })}
                  </FieldDescription>
                )}
              </div>
              <ImageUploader
                folder="bookings"
                maxFiles={MAX_REFERENCE_IMAGES - filledManualUrlsCount}
                keepUploadedImages={true}
                initialImages={uploadedImagesMeta}
                onUploadComplete={(data) => {
                  setUploadedImagesMeta((prev) => {
                    const next = [...prev];
                    data.forEach((item) => {
                      const existingIndex = next.findIndex(
                        (i) => i.url === item.url,
                      );
                      const entry: UploadedImageMeta = {
                        url: item.url,
                        name: item.name,
                        meta: item.meta,
                      };
                      if (existingIndex >= 0) {
                        next[existingIndex] = entry;
                      } else {
                        next.push(entry);
                      }
                    });
                    return next;
                  });
                }}
              />
            </FieldContent>
          </Field>
        )}
      </fieldset>

      {/* Submit */}
      <div className="flex flex-col gap-4 pt-2">
        <Text size="sm" muted>
          {formT("disclaimer.line1")}
          <br />
          {formT("disclaimer.line2")}
        </Text>
        <div className="flex items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            aria-disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                {formT("actions.saving")}
              </>
            ) : (
              formT("actions.submit")
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
