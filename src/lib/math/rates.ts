/**
 * Arredonda um valor monetário para 2 casas decimais evitando erros clássicos de ponto flutuante.
 */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Converte uma taxa de juros efetiva anual (%) em taxa decimal mensal equivalente.
 */
export function annualToMonthlyRate(annualRatePercent: number): number {
  if (annualRatePercent <= 0) {
    return 0;
  }
  return Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1;
}

/**
 * Calcula a prestação fixa pelo Sistema Francês de Amortização (Tabela Price).
 */
export function calculatePriceInstallment(
  balance: number,
  monthlyRate: number,
  remainingMonths: number,
): number {
  if (remainingMonths <= 0 || balance <= 0) {
    return 0;
  }
  if (monthlyRate === 0) {
    return roundCurrency(balance / remainingMonths);
  }
  const factor = Math.pow(1 + monthlyRate, remainingMonths);
  return roundCurrency(balance * ((monthlyRate * factor) / (factor - 1)));
}
