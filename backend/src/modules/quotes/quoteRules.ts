import type { CutlistItem } from '../cutlists/types.js';
import type { Quote, QuoteStatus } from './types.js';

export type ApplyQuoteValidityRulesInput = {
  status: QuoteStatus;
  validUntil: Date | string | null;
  frozenAt: Date | string | null;
  approvedByDiego: boolean;
  depositPaid?: boolean;
  isFinalQuote?: boolean;
  now?: Date | string;
};

export type QuoteValidityResult = {
  isExpired: boolean;
  canRecalculate: boolean;
  isFrozenByDeposit: boolean;
  requiresDiegoValidation: boolean;
};

const finalQuoteStatuses = new Set<QuoteStatus>([
  'pendiente_validacion_diego',
  'validada',
  'enviada_cliente',
  'señada',
  'convertida_en_proyecto',
]);

export function applyQuoteValidityRules(input: ApplyQuoteValidityRulesInput): QuoteValidityResult {
  const now = toDate(input.now ?? new Date());
  const validUntil = input.validUntil === null ? null : toDate(input.validUntil);
  const isFrozenByDeposit =
    input.depositPaid === true || input.frozenAt !== null || input.status === 'señada';
  const isExpired =
    input.status === 'vencida' ||
    (validUntil !== null && validUntil.getTime() < now.getTime() && !isFrozenByDeposit);
  const isFinalQuote = input.isFinalQuote ?? finalQuoteStatuses.has(input.status);
  const requiresDiegoValidation =
    (isFinalQuote || input.status === 'pendiente_validacion_diego') && !input.approvedByDiego;

  return {
    isExpired,
    canRecalculate: isExpired && !isFrozenByDeposit,
    isFrozenByDeposit,
    requiresDiegoValidation,
  };
}

export function canSendQuoteToClient(quote: Quote): boolean {
  if (quote.validUntil === null) {
    return false;
  }

  const validity = applyQuoteValidityRules({
    status: quote.status,
    validUntil: quote.validUntil,
    frozenAt: quote.frozenAt,
    approvedByDiego: quote.approvedByDiego,
  });

  if (validity.isExpired || validity.requiresDiegoValidation) {
    return false;
  }

  if (!hasQuoteTotal(quote)) {
    return false;
  }

  return true;
}

export function canSendCutlistToSupplier(quote: Quote, cutlist: readonly CutlistItem[]): boolean {
  if (!quote.approvedByDiego || cutlist.length === 0) {
    return false;
  }

  return cutlist.every((item) => {
    return (
      item.approvedForCut &&
      item.materialId !== null &&
      item.quantity > 0 &&
      item.lengthMm > 0 &&
      item.widthMm > 0 &&
      (item.thicknessMm === null || item.thicknessMm > 0)
    );
  });
}

function hasQuoteTotal(quote: Quote): boolean {
  return quote.totalArs > 0 || (quote.totalUsd !== null && quote.totalUsd > 0);
}

function toDate(value: Date | string): Date {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date value.');
  }

  return date;
}
