const DEFAULT_LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  th: "th-TH",
};

const BUDDHIST_CALENDAR_SUFFIX = "u-ca-buddhist";

function resolveBaseLocale(locale: string) {
  return DEFAULT_LOCALE_MAP[locale] ?? locale;
}

function resolveDisplayLocale(locale: string) {
  if (locale === "th") {
    return `${resolveBaseLocale(locale)}-${BUDDHIST_CALENDAR_SUFFIX}`;
  }
  return resolveBaseLocale(locale);
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}

export function formatDateLocalized(
  value: Date | string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(resolveDisplayLocale(locale), options).format(
    date,
  );
}

export function formatDateTime(value: Date | string, locale: string) {
  return formatDateLocalized(value, locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatDate(value: Date | string, locale: string) {
  return formatDateLocalized(value, locale, {
    dateStyle: "medium",
  });
}

export function createDateLabelFormatter(
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
) {
  const formatter = new Intl.DateTimeFormat(
    resolveDisplayLocale(locale),
    options,
  );
  return (date: Date) => formatter.format(date);
}
