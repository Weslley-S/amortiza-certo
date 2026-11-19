import { describe, expect, it } from 'vitest';
import { runFullComparison, simulateSchedule } from '../simulator';
import type { SimulationInput } from '../types';

const baseInput: SimulationInput = {
  loanAmount: 300000,
  annualInterestRate: 9.5,
  totalMonths: 360,
  system: 'SAC',
  monthlyExtraPayment: 0,
  extraPaymentIntervalMonths: 1,
  lumpSumPayment: 0,
  lumpSumMonth: 12,
  recurringFgtsAmount: 0,
  reductionStrategy: 'TERM',
};

describe('Motor Financeiro de Amortização (SAC e Price)', () => {
  it('Teste 1 (SAC Base): R$ 300.000 em 360 meses a 9.5% a.a. sem extras', () => {
    const summary = simulateSchedule(baseInput, false);

    expect(summary.actualMonths).toBe(360);
    expect(summary.monthsSaved).toBe(0);
    expect(summary.schedule[0].scheduledAmortization).toBe(833.33);
    expect(summary.schedule[179].scheduledAmortization).toBe(833.33);
    expect(summary.schedule[359].remainingBalance).toBe(0);
    expect(summary.firstInstallment).toBeGreaterThan(summary.lastInstallment);
  });

  it('Teste 2 (Price Base): R$ 300.000 em 360 meses a 9.5% a.a. sem extras', () => {
    const sacSummary = simulateSchedule(baseInput, false);
    const priceSummary = simulateSchedule({ ...baseInput, system: 'PRICE' }, false);

    expect(priceSummary.actualMonths).toBe(360);
    expect(priceSummary.schedule[0].baseInstallment).toBe(
      priceSummary.schedule[100].baseInstallment,
    );
    expect(priceSummary.schedule[359].remainingBalance).toBe(0);
    expect(priceSummary.totalInterest).toBeGreaterThan(sacSummary.totalInterest);
  });

  it('Teste 3 (Amortização Extra no Prazo - TERM): aporte mensal de R$ 1.000 no SAC', () => {
    const result = runFullComparison({
      ...baseInput,
      monthlyExtraPayment: 1000,
      reductionStrategy: 'TERM',
    });

    expect(result.withExtras.actualMonths).toBeLessThan(180);
    expect(result.interestSaved).toBeGreaterThan(100000);
    expect(result.monthsSaved).toBe(360 - result.withExtras.actualMonths);
    expect(result.withExtras.schedule[result.withExtras.actualMonths - 1].remainingBalance).toBe(0);
  });

  it('Teste 4 (Amortização Extra na Parcela INSTALLMENT vs Prazo TERM): TERM economiza mais juros', () => {
    const resTerm = runFullComparison({
      ...baseInput,
      monthlyExtraPayment: 800,
      reductionStrategy: 'TERM',
    });

    const resInstallment = runFullComparison({
      ...baseInput,
      monthlyExtraPayment: 800,
      reductionStrategy: 'INSTALLMENT',
    });

    expect(resTerm.interestSaved).toBeGreaterThan(resInstallment.interestSaved);
    expect(resInstallment.withExtras.actualMonths).toBeGreaterThan(
      resTerm.withExtras.actualMonths,
    );
    expect(resInstallment.withExtras.lastInstallment).toBeLessThan(
      resInstallment.baseline.lastInstallment,
    );

    const lumpSumInstallment = runFullComparison({
      ...baseInput,
      lumpSumPayment: 50000,
      lumpSumMonth: 12,
      reductionStrategy: 'INSTALLMENT',
    });
    expect(lumpSumInstallment.withExtras.actualMonths).toBe(360);
  });

  it('Teste 5 (Aporte Único FGTS maior que o saldo devedor): zera saldo e encerra no mês do aporte', () => {
    const result = runFullComparison({
      ...baseInput,
      lumpSumPayment: 500000,
      lumpSumMonth: 12,
      reductionStrategy: 'TERM',
    });

    expect(result.withExtras.actualMonths).toBe(12);
    const lastRow = result.withExtras.schedule[result.withExtras.schedule.length - 1];
    expect(lastRow.month).toBe(12);
    expect(lastRow.remainingBalance).toBe(0);
    expect(result.withExtras.schedule.every((row) => row.remainingBalance >= 0)).toBe(true);
  });

  it('Teste 6 (Aporte Extra Periódico a cada 6 meses): aplica somente nos meses múltiplos do intervalo', () => {
    const result = runFullComparison({
      ...baseInput,
      monthlyExtraPayment: 6000,
      extraPaymentIntervalMonths: 6,
      reductionStrategy: 'TERM',
    });

    expect(result.withExtras.schedule[0].extraAmortization).toBe(0);
    expect(result.withExtras.schedule[4].extraAmortization).toBe(0);
    expect(result.withExtras.schedule[5].extraAmortization).toBe(6000);
    expect(result.withExtras.schedule[11].extraAmortization).toBe(6000);
    expect(result.withExtras.actualMonths).toBeLessThan(200);
    expect(result.interestSaved).toBeGreaterThan(100000);
  });
});
