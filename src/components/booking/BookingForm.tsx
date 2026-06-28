"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useLocale, useTranslations } from "next-intl";

import {
  Check,
  Copy,
  Link as LinkIcon,
  Loader2,
  Upload,
  X,
} from "lucide-react";

import { ImageUploader } from "@/components/admin/ImageUploader";
import { Button } from "@/components/styled/Button";
import { DatePicker } from "@/components/styled/DatePicker";
import { FormField } from "@/components/styled/FormField";
import { Eyebrow, Heading, Text } from "@/components/styled/Typography";
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

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    instagram: "",
    placement: "",
    sizeApprox: "",
    tattooDescription: "",
    referenceLinks: "",
    budget: "",
    contactMethod: "",
  });
  const [preferredDates, setPreferredDates] = useState<string[]>([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [imageInputMode, setImageInputMode] = useState<"url" | "upload">("url");
  const [copied, setCopied] = useState(false);

  const fullNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const contactMethodRef = useRef<HTMLButtonElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const tattooDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const preferredDatesRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear client error for this field when user types
    if (clientErrors[field]) {
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  useEffect(() => {
    if (state?.success) {
      successRef.current?.focus();
      // Reset form data on success
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        instagram: "",
        placement: "",
        sizeApprox: "",
        tattooDescription: "",
        referenceLinks: "",
        budget: "",
        contactMethod: "",
      });
      setPreferredDates([]);
      setReferenceImageUrls([""]);
    }
  }, [state]);

  const addReferenceUrl = () => {
    if (referenceImageUrls.length < 5) {
      setReferenceImageUrls((prev) => [...prev, ""]);
    }
  };

  const removeReferenceUrl = (index: number) => {
    setReferenceImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const [clientErrors, setClientErrors] = useState<Record<string, string[]>>(
    {},
  );

  const fieldRefs = {
    fullName: fullNameRef,
    email: emailRef,
    contactMethod: contactMethodRef,
    phone: phoneRef,
    tattooDescription: tattooDescriptionRef,
    preferredDates: preferredDatesRef,
  } as const;

  const scrollToFirstError = (errors: Record<string, string[]>) => {
    const fieldOrder: (keyof typeof fieldRefs)[] = [
      "fullName",
      "email",
      "contactMethod",
      "phone",
      "tattooDescription",
      "preferredDates",
    ];

    const firstErrorField = fieldOrder.find(
      (field) => (errors[field]?.length ?? 0) > 0,
    );

    if (!firstErrorField) return;

    const target = fieldRefs[firstErrorField].current;

    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus({ preventScroll: true });
    });
  };

  // Email regex matching Zod's email validation
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    // Full name validation (matches server: min 2 chars)
    if (!formData.fullName.trim()) {
      errors.fullName = [formT("fullName.errors.required")];
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = [formT("fullName.errors.min")];
    }

    // Email validation (matches server: required, valid format)
    if (!formData.email.trim()) {
      errors.email = [formT("email.errors.required")];
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = [formT("email.errors.invalid")];
    }

    // Contact method validation (matches server: required enum)
    if (!formData.contactMethod) {
      errors.contactMethod = [formT("contactMethod.errors.required")];
    }

    // Phone/Handle validation (matches server: optional but required by us)
    if (
      !formData.phone.trim() &&
      formData.contactMethod &&
      formData.contactMethod !== "Email"
    ) {
      errors.phone = [formT("phone.errors.required")];
    }

    // Description validation (matches server: min 20 chars)
    if (!formData.tattooDescription.trim()) {
      errors.tattooDescription = [formT("description.errors.required")];
    } else if (formData.tattooDescription.trim().length < 20) {
      errors.tattooDescription = [formT("description.errors.min")];
    }

    // Preferred dates validation (matches server: min 1 date required)
    const validDates = preferredDates.filter((d) => d.trim() !== "");
    if (validDates.length === 0) {
      errors.preferredDates = [formT("preferredDates.errors.required")];
    }

    setClientErrors(errors);
    const isValid = Object.keys(errors).length === 0;

    if (!isValid) {
      scrollToFirstError(errors);
    }

    return isValid;
  };

  const handleSubmit = (formData: FormData) => {
    if (!validateForm()) {
      // Prevent submission if validation fails
      return;
    }
    startTransition(() => {
      formAction(formData);
    });
  };

  const fieldErrors =
    state !== null && !state.success && state.fieldErrors !== undefined
      ? state.fieldErrors
      : clientErrors;

  const preferredDatesError = Boolean(fieldErrors["preferredDates"]?.length);
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
                    <Check className="h-3.5 w-3.5" />
                    <span>{successT("copied")}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(new FormData(e.currentTarget));
      }}
      noValidate
      className="flex flex-col gap-10"
    >
      {/* Server error */}
      {state !== null && !state.success && state.message !== undefined && (
        <div
          role="alert"
          className="border border-destructive/40 bg-destructive/10 px-4 py-3"
        >
          <Text size="sm" className="text-destructive">
            {state.message}
          </Text>
        </div>
      )}

      {/* Section: Contact */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.contact")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.contact")}</Eyebrow>
          <Separator />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label={formT("fullName.label")}
            htmlFor="fullName"
            required
            error={fieldErrors["fullName"]}
          >
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder={formT("fullName.placeholder")}
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              ref={fullNameRef}
              aria-describedby={
                (fieldErrors["fullName"]?.length ?? 0) > 0
                  ? "fullName-error"
                  : undefined
              }
              required
            />
          </FormField>

          <FormField
            label={formT("email.label")}
            htmlFor="email"
            required
            error={fieldErrors["email"]}
          >
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={formT("email.placeholder")}
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              ref={emailRef}
              aria-describedby={
                (fieldErrors["email"]?.length ?? 0) > 0
                  ? "email-error"
                  : undefined
              }
              required
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label={formT("contactMethod.label")}
            htmlFor="contactMethod"
            required
            error={fieldErrors["contactMethod"]}
          >
            <input
              type="hidden"
              name="contactMethod"
              value={formData.contactMethod}
            />

            <Select
              value={formData.contactMethod}
              onValueChange={(value) =>
                handleInputChange("contactMethod", value)
              }
            >
              <SelectTrigger
                ref={contactMethodRef}
                className={
                  (fieldErrors["contactMethod"]?.length ?? 0) > 0
                    ? "border-destructive/60"
                    : undefined
                }
              >
                <SelectValue placeholder={formT("contactMethod.placeholder")} />
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
          </FormField>

          <FormField
            label={formT("phone.label")}
            htmlFor="phone"
            error={fieldErrors["phone"]}
            hint={formT("phone.hint")}
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={formT("phone.placeholder")}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              ref={phoneRef}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Section: Tattoo */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.tattoo")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.tattoo")}</Eyebrow>
          <Separator />
        </div>

        <FormField
          label={formT("description.label")}
          htmlFor="tattooDescription"
          required
          error={fieldErrors["tattooDescription"]}
          hint={formT("description.hint")}
        >
          <Textarea
            id="tattooDescription"
            name="tattooDescription"
            rows={6}
            placeholder={formT("description.placeholder")}
            value={formData.tattooDescription}
            onChange={(e) =>
              handleInputChange("tattooDescription", e.target.value)
            }
            ref={tattooDescriptionRef}
            aria-describedby={
              (fieldErrors["tattooDescription"]?.length ?? 0) > 0
                ? "tattooDescription-error"
                : undefined
            }
            required
          />
        </FormField>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormField
            label={formT("bodyPlacement.label")}
            htmlFor="bodyPlacement"
            error={fieldErrors["bodyPlacement"]}
            hint={formT("bodyPlacement.hint")}
          >
            <input
              type="hidden"
              name="bodyPlacement"
              value={formData.placement}
            />

            <Select
              value={formData.placement}
              onValueChange={(value) => handleInputChange("placement", value)}
            >
              <SelectTrigger
                className={
                  (fieldErrors["bodyPlacement"]?.length ?? 0) > 0
                    ? "border-destructive/60"
                    : undefined
                }
              >
                <SelectValue placeholder={formT("bodyPlacement.placeholder")} />
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
          </FormField>

          <FormField
            label={formT("size.label")}
            htmlFor="tattooSize"
            error={fieldErrors["tattooSize"]}
            hint={formT("size.hint")}
          >
            <Input
              id="tattooSize"
              name="tattooSize"
              type="text"
              placeholder={formT("size.placeholder")}
              value={formData.sizeApprox}
              onChange={(e) => handleInputChange("sizeApprox", e.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label={formT("budget.label")}
          htmlFor="budgetRange"
          error={fieldErrors["budgetRange"]}
          hint={formT("budget.hint")}
        >
          <input type="hidden" name="budgetRange" value={formData.budget} />

          <Select
            value={formData.budget}
            onValueChange={(value) => handleInputChange("budget", value)}
          >
            <SelectTrigger
              className={
                (fieldErrors["budgetRange"]?.length ?? 0) > 0
                  ? "border-destructive/60"
                  : undefined
              }
            >
              <SelectValue placeholder={formT("budget.placeholder")} />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                {BUDGET_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {formT(`budget.options.${budgetTranslationKeys[range]}`)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
      </fieldset>

      {/* Section: Availability */}
      <fieldset className="flex flex-col gap-6">
        <legend className="sr-only">{formT("sections.availability")}</legend>
        <div className="flex flex-col gap-2">
          <Eyebrow>{formT("sections.availability")}</Eyebrow>
          <Separator />
        </div>

        <FormField
          label={formT("preferredDates.label")}
          htmlFor="preferredDates"
          required
          error={fieldErrors["preferredDates"]}
          hint={formT("preferredDates.hint")}
        >
          <div className="flex flex-col gap-3">
            {preferredDates.map((date) => (
              <input
                key={date}
                type="hidden"
                name="preferredDates"
                value={date}
              />
            ))}
            <DatePicker
              ref={preferredDatesRef}
              mode="multiple"
              value={preferredDates}
              onChange={(dates) => {
                if (dates.length <= 5) {
                  setPreferredDates(dates);
                  if (clientErrors.preferredDates) {
                    setClientErrors((prev) => {
                      const next = { ...prev };
                      delete next.preferredDates;
                      return next;
                    });
                  }
                }
              }}
              placeholder={preferredDatePlaceholder}
              clearLabel={preferredDateClearLabel}
              ariaLabel={formT("preferredDates.label")}
              hasError={preferredDatesError}
              minDate={minPreferredDate}
              locale={locale}
              formatDateLabel={(dates) =>
                formT("preferredDates.datePicker.selectedCount", {
                  count: dates.length,
                })
              }
            />
          </div>
        </FormField>
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
          >
            <LinkIcon className="h-4 w-4" />
            {formT("reference.toggle.urls")}
          </Button>
          <Button
            variant={imageInputMode === "upload" ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setImageInputMode("upload")}
          >
            <Upload className="h-4 w-4" />
            {formT("reference.toggle.upload")}
          </Button>
        </div>

        {imageInputMode === "url" ? (
          <FormField
            label={formT("reference.urls.label")}
            htmlFor="referenceImageUrls-0"
            error={fieldErrors["referenceImageUrls"]}
            hint={formT("reference.urls.hint")}
          >
            <div className="flex flex-col gap-3">
              {referenceImageUrls.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    id={index === 0 ? "referenceImageUrls-0" : undefined}
                    name="referenceImageUrls"
                    type="url"
                    placeholder={formT("reference.urls.placeholder")}
                    value={url}
                    onChange={(e) => {
                      setReferenceImageUrls((prev) =>
                        prev.map((u, i) => (i === index ? e.target.value : u)),
                      );
                    }}
                    aria-label={formT("reference.urls.aria", {
                      number: index + 1,
                    })}
                    className="flex-1"
                  />
                  {referenceImageUrls.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => removeReferenceUrl(index)}
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
              {referenceImageUrls.length < 5 && (
                <Button
                  type="button"
                  variant="link"
                  size="link"
                  onClick={addReferenceUrl}
                  className="self-start"
                >
                  {referenceImageUrls.length === 0
                    ? formT("reference.urls.add")
                    : formT("reference.urls.addAnother")}
                </Button>
              )}
            </div>
          </FormField>
        ) : (
          <FormField
            label={formT("reference.upload.label")}
            htmlFor="referenceImages"
            error={fieldErrors["referenceImageUrls"]}
            hint={formT("reference.upload.hint")}
          >
            <ImageUploader
              folder="bookings"
              maxFiles={5 - referenceImageUrls.filter(Boolean).length}
              onUploadComplete={(data) => {
                data.forEach((item) => {
                  setReferenceImageUrls((prev) => {
                    const emptyIndex = prev.findIndex((u) => !u);
                    if (emptyIndex >= 0) {
                      return prev.map((u, i) =>
                        i === emptyIndex ? item.url : u,
                      );
                    }
                    return [...prev, item.url];
                  });
                });
              }}
            />
            {referenceImageUrls
              .filter((url) => url.trim() !== "")
              .map((url, index) => (
                <input
                  key={`reference-upload-${index}`}
                  type="hidden"
                  name="referenceImageUrls"
                  value={url}
                />
              ))}
          </FormField>
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
