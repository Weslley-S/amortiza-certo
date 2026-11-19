import type {
  AmortizationSystem,
  ExtraReductionStrategy,
  SimulationInput,
} from '@/lib/math/types';

export const DEFAULT_SIMULATION_INPUT: SimulationInput = {
  loanAmount: 300000,
  annualInterestRate: 9.5,
  totalMonths: 360,
  system: 'SAC',
  monthlyExtraPayment: 500,
  extraPaymentIntervalMonths: 1,
  lumpSumPayment: 0,
  lumpSumMonth: 12,
  recurringFgtsAmount: 0,
  reductionStrategy: 'TERM',
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function parseClampedNumber(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
  roundInt = false,
): number {
  if (raw === null || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  const clamped = clamp(parsed, min, max);
  return roundInt ? Math.round(clamped) : clamped;
}

/**
 * Lê os parâmetros curtos da query string e aplica limites de segurança (clamping).
 */
export function parseSimulationFromUrl(
  searchString: string,
  fallbackPreset?: Partial<SimulationInput>,
): SimulationInput {
  const base: SimulationInput = {
    ...DEFAULT_SIMULATION_INPUT,
    ...fallbackPreset,
  };

  const params = new URLSearchParams(searchString);

  const totalMonths = parseClampedNumber(
    params.get('m'),
    base.totalMonths,
    1,
    480,
    true,
  );

  const rawSystem = params.get('s')?.toUpperCase();
  const system: AmortizationSystem =
    rawSystem === 'SAC' || rawSystem === 'PRICE' ? rawSystem : base.system;

  const rawStrategy = params.get('st')?.toUpperCase();
  const reductionStrategy: ExtraReductionStrategy =
    rawStrategy === 'TERM' || rawStrategy === 'INSTALLMENT'
      ? rawStrategy
      : base.reductionStrategy;

  return {
    loanAmount: parseClampedNumber(
      params.get('v'),
      base.loanAmount,
      1000,
      50000000,
    ),
    annualInterestRate: parseClampedNumber(
      params.get('t'),
      base.annualInterestRate,
      0.1,
      35,
    ),
    totalMonths,
    system,
    monthlyExtraPayment: parseClampedNumber(
      params.get('em'),
      base.monthlyExtraPayment,
      0,
      50000000,
    ),
    extraPaymentIntervalMonths: parseClampedNumber(
      params.get('ei'),
      base.extraPaymentIntervalMonths,
      1,
      480,
      true,
    ),
    lumpSumPayment: parseClampedNumber(
      params.get('lu'),
      base.lumpSumPayment,
      0,
      50000000,
    ),
    lumpSumMonth: parseClampedNumber(
      params.get('lm'),
      clamp(base.lumpSumMonth, 1, totalMonths),
      1,
      totalMonths,
      true,
    ),
    recurringFgtsAmount: parseClampedNumber(
      params.get('fg'),
      base.recurringFgtsAmount,
      0,
      50000000,
    ),
    reductionStrategy,
  };
}

/**
 * Serializa os parâmetros da simulação em uma URL compartilhável.
 */
export function buildSimulationShareUrl(
  baseUrl: string,
  input: SimulationInput,
): string {
  const url = new URL(baseUrl);
  const params = new URLSearchParams();

  params.set('v', String(input.loanAmount));
  params.set('t', String(input.annualInterestRate));
  params.set('m', String(input.totalMonths));
  params.set('s', input.system);
  params.set('em', String(input.monthlyExtraPayment));
  params.set('ei', String(input.extraPaymentIntervalMonths));
  params.set('lu', String(input.lumpSumPayment));
  params.set('lm', String(input.lumpSumMonth));
  params.set('fg', String(input.recurringFgtsAmount));
  params.set('st', input.reductionStrategy);

  url.search = params.toString();
  return url.toString();
}
