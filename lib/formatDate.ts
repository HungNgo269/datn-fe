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
export function formatTimeVN(dateInput: DateInput) {
  const date = safeParseDate(dateInput);
  const now = new Date();
  if (!dateInput) return null;
  if (!date) return null;

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  let timeAgo = "";

  const minutes = 60;
  const hours = 60 * minutes;
  const days = 24 * hours;
  const weeks = 7 * days;
  const months = 30 * days;
  const years = 365 * days;

  if (diffInSeconds < minutes) {
    timeAgo = "Vừa xong";
  } else if (diffInSeconds < hours) {
    const mins = Math.floor(diffInSeconds / minutes);
    timeAgo = `${mins} phút trước`;
  } else if (diffInSeconds < days) {
    const hrs = Math.floor(diffInSeconds / hours);
    timeAgo = `${hrs} giờ trước`;
  } else if (diffInSeconds < weeks) {
    const dys = Math.floor(diffInSeconds / days);
    timeAgo = `${dys} ngày trước`;
  } else if (diffInSeconds < months) {
    const wks = Math.floor(diffInSeconds / weeks);
    timeAgo = `${wks} tuần trước`;
  } else if (diffInSeconds < years) {
    const mths = Math.floor(diffInSeconds / months);
    timeAgo = `${mths} tháng trước`;
  } else {
    const yrs = Math.floor(diffInSeconds / years);
    timeAgo = `${yrs} năm trước`;
  }

  const hour = date.getHours().toString().padStart(2, "0");
  const minute = date.getMinutes().toString().padStart(2, "0");

  const formattedTime = `${hour}:${minute}`;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return {
    label: timeAgo,
    fullDateTime: `${formattedTime} - ${day}/${month}/${year}`,
    timeOnly: formattedTime,
  };
}
