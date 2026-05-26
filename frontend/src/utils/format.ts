export function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function formatDate(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("vi-VN").format(new Date(value));
}
