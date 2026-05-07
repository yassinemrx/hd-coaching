import { format, getISOWeek, getISOWeekYear } from "date-fns";

export function currentWeekLabel(date = new Date()) {
  const week = getISOWeek(date);
  const year = getISOWeekYear(date);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "MMM d, yyyy");
}

export function formatShortDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return format(date, "MMM d");
}
