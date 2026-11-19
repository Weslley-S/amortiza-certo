import {
  annualToMonthlyRate,
  calculatePriceInstallment,
  roundCurrency,
} from './rates';
import type {
  ComparisonResult,
  InstallmentRow,
  SimulationInput,
  SimulationSummary,
} from './types';

/**
 * Simula o cronograma mensal completo de amortização (SAC ou Price),
 * aplicando opcionalmente aportes extras mensais, pontuais e FGTS bienal.
 */
export function simulateSchedule(
  input: SimulationInput,
  applyExtras: boolean,
): SimulationSummary {
  const originalMonths = Math.max(0, Math.round(input.totalMonths));
  let balance = roundCurrency(Math.max(0, input.loanAmount));

  if (balance <= 0 || originalMonths <= 0) {
    return {
      system: input.system,
      originalMonths,
      actualMonths: 0,
      monthsSaved: originalMonths,
      totalPaid: 0,
      totalInterest: 0,
      totalExtraPaid: 0,
      firstInstallment: 0,
      lastInstallment: 0,
      schedule: [],
    };
  }

  let remainingMonths = originalMonths;
  const monthlyRate = annualToMonthlyRate(input.annualInterestRate);
  const extraInterval = Math.max(1, Math.round(input.extraPaymentIntervalMonths || 1));
  let month = 1;

  let currentSacAmortization = roundCurrency(balance / remainingMonths);
  let currentPriceInstallment = calculatePriceInstallment(
    balance,
    monthlyRate,
    remainingMonths,
  );

  const schedule: InstallmentRow[] = [];
  let totalPaid = 0;
  let totalInterest = 0;
  let totalExtraPaid = 0;

  while (balance > 0.009 && month <= originalMonths) {
    const interest = roundCurrency(balance * monthlyRate);
    let scheduledAmortization: number;
    let baseInstallment: number;

    if (input.system === 'SAC') {
      const isLastExpected = remainingMonths === 1;
      scheduledAmortization =
        isLastExpected || currentSacAmortization >= balance
          ? balance
          : currentSacAmortization;
      baseInstallment = roundCurrency(scheduledAmortization + interest);
    } else {
      baseInstallment = currentPriceInstallment;
      scheduledAmortization = roundCurrency(Math.max(0, baseInstallment - interest));

      if (scheduledAmortization >= balance || remainingMonths === 1) {
        scheduledAmortization = balance;
        baseInstallment = roundCurrency(scheduledAmortization + interest);
      }
    }

    balance = roundCurrency(Math.max(0, balance - scheduledAmortization));

    let extraAmortization = 0;
    if (applyExtras && balance > 0) {
      let rawExtra = 0;
      if (input.monthlyExtraPayment > 0 && month % extraInterval === 0) {
        rawExtra += input.monthlyExtraPayment;
      }
      if (input.lumpSumPayment > 0 && month === input.lumpSumMonth) {
        rawExtra += input.lumpSumPayment;
      }
      if (input.recurringFgtsAmount > 0 && month % 24 === 0) {
        rawExtra += input.recurringFgtsAmount;
      }

      if (rawExtra > 0) {
        extraAmortization = roundCurrency(Math.min(balance, rawExtra));
        balance = roundCurrency(Math.max(0, balance - extraAmortization));
      }
    }

    remainingMonths = Math.max(0, remainingMonths - 1);

    if (extraAmortization > 0 && balance > 0 && input.reductionStrategy === 'INSTALLMENT') {
      const targetMonths = Math.max(1, remainingMonths);
      if (input.system === 'SAC') {
        currentSacAmortization = roundCurrency(balance / targetMonths);
      } else {
        currentPriceInstallment = calculatePriceInstallment(
          balance,
          monthlyRate,
          targetMonths,
        );
      }
    }

    const totalPaidInMonth = roundCurrency(baseInstallment + extraAmortization);
    totalPaid = roundCurrency(totalPaid + totalPaidInMonth);
    totalInterest = roundCurrency(totalInterest + interest);
    totalExtraPaid = roundCurrency(totalExtraPaid + extraAmortization);

    schedule.push({
      month,
      baseInstallment,
      interest,
      scheduledAmortization,
      extraAmortization,
      totalPaidInMonth,
      remainingBalance: balance,
    });

    month++;
  }

  const actualMonths = schedule.length;

  return {
    system: input.system,
    originalMonths,
    actualMonths,
    monthsSaved: Math.max(0, originalMonths - actualMonths),
    totalPaid,
    totalInterest,
    totalExtraPaid,
    firstInstallment: schedule[0]?.baseInstallment ?? 0,
    lastInstallment: schedule[actualMonths - 1]?.baseInstallment ?? 0,
    schedule,
  };
}

/**
 * Executa a comparação completa entre o cenário original (sem aportes extras),
 * o cenário com os aportes configurados e o sistema alternativo (SAC vs. PRICE).
 */
export function runFullComparison(input: SimulationInput): ComparisonResult {
  const baseline = simulateSchedule(input, false);
  const withExtras = simulateSchedule(input, true);
  const alternateSystemBaseline = simulateSchedule(
    {
      ...input,
      system: input.system === 'SAC' ? 'PRICE' : 'SAC',
    },
    false,
  );

  const interestSaved = Math.max(
    0,
    roundCurrency(baseline.totalInterest - withExtras.totalInterest),
  );
  const monthsSaved = Math.max(0, baseline.actualMonths - withExtras.actualMonths);

  return {
    input,
    baseline,
    withExtras,
    alternateSystemBaseline,
    interestSaved,
    monthsSaved,
  };
}
