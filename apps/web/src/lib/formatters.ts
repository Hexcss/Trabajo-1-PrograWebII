export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return dateFormatter.format(date);
}

export function clampText(value: string, limit: number): string {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}

export function toSentenceCase(value: string): string {
  if (!value) return value;
  return value.slice(0, 1).toUpperCase() + value.slice(1).toLowerCase();
}
