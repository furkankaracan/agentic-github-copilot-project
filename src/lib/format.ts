const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

const preciseCurrencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export function formatMoney(amount: number, precise = false): string {
  return (precise ? preciseCurrencyFormatter : currencyFormatter).format(amount);
}

export function formatDate(iso: string): string {
  const time = Date.parse(iso);
  return Number.isNaN(time) ? '—' : dateFormatter.format(time);
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
