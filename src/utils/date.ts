import { format } from 'date-fns';

export function formatDisplayDate(value: string | Date | undefined, pattern = 'yyyy-MM-dd') {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : format(date, pattern);
}
