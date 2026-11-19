const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const percentFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata um valor numérico como moeda brasileira (BRL).
 */
export function formatBRL(value: number): string {
  return brlFormatter.format(value);
}

/**
 * Formata uma taxa percentual com 2 casas decimais e sufixo %.
 */
export function formatPercent(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

/**
 * Converte um total de meses em texto legível com anos e meses.
 * Exemplos:
 * - 360 -> "30 anos (360 meses)"
 * - 42  -> "3 anos e 6 meses (42 meses)"
 * - 8   -> "8 meses"
 */
export function formatMonthsToYearsAndMonths(months: number): string {
  const total = Math.max(0, Math.round(months));
  if (total === 0) {
    return '0 meses';
  }

  const years = Math.floor(total / 12);
  const remainingMonths = total % 12;

  if (years === 0) {
    return `${total} ${total === 1 ? 'mês' : 'meses'}`;
  }

  const yearsLabel = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  const monthsTotalLabel = `${total} ${total === 1 ? 'mês' : 'meses'}`;

  if (remainingMonths === 0) {
    return `${yearsLabel} (${monthsTotalLabel})`;
  }

  const remLabel = `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  return `${yearsLabel} e ${remLabel} (${monthsTotalLabel})`;
}
