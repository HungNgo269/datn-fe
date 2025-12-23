import { formatDistanceToNow } from "date-fns";

type DateInput = string | number | Date | undefined;

export function safeParseDate(dateInput: DateInput): Date | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    console.error("Invalid date input:", dateInput);
    return null;
  }
  return date;
}
//  (DD/MM/YYYY)
export function formatDate(dateInput: DateInput): string {
  console.log("dateinput", dateInput);
  const date = safeParseDate(dateInput);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
//  (DD/MM/YYYY, HH:MM AM/PM)
export function formatDateTime(dateInput: DateInput): string {
  const date = safeParseDate(dateInput);
  if (!date) return "";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

//(DD/MM/YYYY, HH:MM AM/PM UTC) for notification
export function formatDateTimeUTC(dateInput: DateInput): string {
  const date = safeParseDate(dateInput);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
export function formatRelativeTime(dateInput: DateInput): string {
  const date = safeParseDate(dateInput);

  if (!date) {
    console.error("Invalid date:", dateInput);
    return "";
  }
  return formatDistanceToNow(date, {
    addSuffix: true,
  });
}
