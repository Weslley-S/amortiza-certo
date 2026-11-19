export type AmortizationSystem = 'SAC' | 'PRICE';
export type ExtraReductionStrategy = 'TERM' | 'INSTALLMENT'; // TERM = Reduzir Prazo, INSTALLMENT = Reduzir Parcela

export interface SimulationInput {
  loanAmount: number;                // Valor financiado / Saldo devedor (R$) - ex: 300000
  annualInterestRate: number;        // Taxa de juros efetiva anual (%) - ex: 9.5
  totalMonths: number;               // Prazo total em meses - ex: 360
  system: AmortizationSystem;        // 'SAC' | 'PRICE'
  monthlyExtraPayment: number;       // Aporte extra recorrente (R$) - ex: 500
  extraPaymentIntervalMonths: number; // Periodicidade em meses do aporte recorrente (1 = mensal, 6 = semestral)
  lumpSumPayment: number;            // Aporte único / FGTS (R$) - ex: 30000
  lumpSumMonth: number;              // Mês em que ocorre o aporte único (1 a totalMonths) - ex: 12
  recurringFgtsAmount: number;       // Valor do FGTS usado a cada 24 meses (R$) - ex: 0
  reductionStrategy: ExtraReductionStrategy; // 'TERM' | 'INSTALLMENT'
}

export interface InstallmentRow {
  month: number;                     // Número da parcela (1..N)
  baseInstallment: number;           // Prestação obrigatória do mês (Amortização + Juros)
  interest: number;                  // Juros pagos no mês
  scheduledAmortization: number;     // Amortização regular da parcela
  extraAmortization: number;         // Amortização extraordinária aplicada no mês (mensal + único + FGTS)
  totalPaidInMonth: number;          // Total desembolsado no mês (baseInstallment + extraAmortization)
  remainingBalance: number;          // Saldo devedor final após todos os abates do mês
}

export interface SimulationSummary {
  system: AmortizationSystem;
  originalMonths: number;
  actualMonths: number;              // Quantidade real de meses até quitar
  monthsSaved: number;               // originalMonths - actualMonths
  totalPaid: number;                 // Soma de tudo pago
  totalInterest: number;             // Soma de todos os juros pagos
  totalExtraPaid: number;            // Soma de todas as amortizações extras
  firstInstallment: number;          // Valor da 1ª prestação base
  lastInstallment: number;           // Valor da última prestação base
  schedule: InstallmentRow[];        // Tabela mês a mês completa
}

export interface ComparisonResult {
  input: SimulationInput;
  baseline: SimulationSummary;       // Simulação original SEM aportes extras
  withExtras: SimulationSummary;     // Simulação COM os aportes extras configurados
  alternateSystemBaseline: SimulationSummary; // Se input for SAC, traz PRICE (e vice-versa) para comparação
  interestSaved: number;             // baseline.totalInterest - withExtras.totalInterest
  monthsSaved: number;               // baseline.actualMonths - withExtras.actualMonths
}
