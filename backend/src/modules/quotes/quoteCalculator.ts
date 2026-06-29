import type { QuoteCurrency } from './types.js';

export type CalculateQuoteTotalsInput = {
  materialsSubtotal: number;
  hardwareSubtotal: number;
  servicesSubtotal: number;
  laborSubtotal: number;
  wastePercentage: number;
  marginPercentage: number;
  discount: number;
  depositPercentage: number;
  currency: QuoteCurrency;
  exchangeRateSell: number | null;
};

export type QuoteTotals = {
  subtotalBeforeWaste: number;
  wasteAmount: number;
  subtotalWithWaste: number;
  marginAmount: number;
  totalArs: number;
  totalUsd: number | null;
  depositArs: number;
  depositUsd: number | null;
};

export function calculateQuoteTotals(input: CalculateQuoteTotalsInput): QuoteTotals {
  assertNonNegative(input.materialsSubtotal, 'materialsSubtotal');
  assertNonNegative(input.hardwareSubtotal, 'hardwareSubtotal');
  assertNonNegative(input.servicesSubtotal, 'servicesSubtotal');
  assertNonNegative(input.laborSubtotal, 'laborSubtotal');
  assertNonNegative(input.wastePercentage, 'wastePercentage');
  assertNonNegative(input.marginPercentage, 'marginPercentage');
  assertNonNegative(input.discount, 'discount');
  assertPercentage(input.depositPercentage, 'depositPercentage');

  if (input.currency === 'USD') {
    assertPositive(input.exchangeRateSell, 'exchangeRateSell');
  }

  const subtotalBeforeWaste = roundCurrency(
    input.materialsSubtotal + input.hardwareSubtotal + input.servicesSubtotal + input.laborSubtotal,
  );
  const wasteAmount = roundCurrency(subtotalBeforeWaste * (input.wastePercentage / 100));
  const subtotalWithWaste = roundCurrency(subtotalBeforeWaste + wasteAmount);
  const marginAmount = roundCurrency(subtotalWithWaste * (input.marginPercentage / 100));
  const totalArs = roundCurrency(Math.max(0, subtotalWithWaste + marginAmount - input.discount));
  const totalUsd =
    input.currency === 'USD' && input.exchangeRateSell !== null
      ? roundCurrency(totalArs / input.exchangeRateSell)
      : null;
  const depositArs = roundCurrency(totalArs * (input.depositPercentage / 100));
  const depositUsd =
    totalUsd === null ? null : roundCurrency(totalUsd * (input.depositPercentage / 100));

  return {
    subtotalBeforeWaste,
    wasteAmount,
    subtotalWithWaste,
    marginAmount,
    totalArs,
    totalUsd,
    depositArs,
    depositUsd,
  };
}

function assertNonNegative(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than or equal to 0.`);
  }
}

function assertPositive(value: number | null, fieldName: string): void {
  if (value === null || !Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${fieldName} must be a finite number greater than 0.`);
  }
}

function assertPercentage(value: number, fieldName: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new RangeError(`${fieldName} must be a finite percentage between 0 and 100.`);
  }
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
