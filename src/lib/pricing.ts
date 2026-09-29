import { differenceInDays, isWeekend, isWithinInterval, parseISO, differenceInCalendarDays } from 'date-fns';
import type { PricingRule } from '@/types';

export function calculatePricing(
  basePrice: number,
  checkIn: string,
  checkOut: string,
  rules: PricingRule[],
  promoDiscount?: { type: 'percentage' | 'fixed'; value: number }
) {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  const nights = differenceInDays(end, start);
  if (nights <= 0) return { nights: 0, nightly: [], subtotal: 0, fees: 0, taxes: 0, discount: 0, total: 0 };

  const nightly: { date: Date; price: number; label: string }[] = [];
  const today = new Date();

  for (let i = 0; i < nights; i++) {
    const date = new Date(start);
    date.setDate(date.getDate() + i);
    let price = basePrice;
    let label = 'Base rate';

    const seasonalRule = rules.find(
      (r) =>
        r.rule_type === 'seasonal' &&
        r.start_date &&
        r.end_date &&
        isWithinInterval(date, { start: parseISO(r.start_date), end: parseISO(r.end_date) })
    );
    if (seasonalRule) {
      price = basePrice * (1 + seasonalRule.value / 100);
      label = 'Seasonal rate';
    }

    const weekendRule = rules.find((r) => r.rule_type === 'weekend_surcharge');
    if (weekendRule && isWeekend(date)) {
      price = price * (1 + weekendRule.value / 100);
      label = label === 'Base rate' ? 'Weekend rate' : `${label} + weekend`;
    }

    nightly.push({ date, price: Math.round(price * 100) / 100, label });
  }

  let subtotal = nightly.reduce((sum, n) => sum + n.price, 0);

  let discount = 0;
  const longStayRule = rules
    .filter((r) => r.rule_type === 'long_stay_discount' && r.min_nights && nights >= r.min_nights)
    .sort((a, b) => (b.min_nights ?? 0) - (a.min_nights ?? 0))[0];
  if (longStayRule) {
    discount += subtotal * (longStayRule.value / 100);
  }

  const lastMinuteRule = rules.find((r) => r.rule_type === 'last_minute_discount');
  if (lastMinuteRule && differenceInCalendarDays(start, today) <= 3) {
    discount += subtotal * (lastMinuteRule.value / 100);
  }

  if (promoDiscount) {
    if (promoDiscount.type === 'percentage') {
      discount += (subtotal - discount) * (promoDiscount.value / 100);
    } else {
      discount += promoDiscount.value;
    }
  }

  discount = Math.round(discount * 100) / 100;
  const fees = Math.round(subtotal * 0.12 * 100) / 100;
  const taxable = subtotal - discount + fees;
  const taxes = Math.round(taxable * 0.08 * 100) / 100;
  const total = Math.round((subtotal - discount + fees + taxes) * 100) / 100;

  return { nights, nightly, subtotal: Math.round(subtotal * 100) / 100, fees, taxes, discount, total };
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
