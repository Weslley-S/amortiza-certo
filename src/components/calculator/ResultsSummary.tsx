import type { ComparisonResult } from '@/lib/math/types';
import {
  formatBRL,
  formatMonthsToYearsAndMonths,
} from '@/lib/utils/formatters';

interface ResultsSummaryProps {
  result: ComparisonResult;
}

export default function ResultsSummary({ result }: ResultsSummaryProps) {
  const {
    baseline,
    withExtras,
    alternateSystemBaseline,
    interestSaved,
    monthsSaved,
  } = result;

  const hasExtras = withExtras.totalExtraPaid > 0;
  const altSystemName =
    alternateSystemBaseline.system === 'SAC' ? 'Tabela SAC' : 'Tabela Price';
  const currentSystemName =
    baseline.system === 'SAC' ? 'Tabela SAC' : 'Tabela Price';

  return (
    <section aria-label="Resumo dos resultados" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Economia Total de Juros */}
        <div class="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Economia Total de Juros
          </p>
          <p class="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {formatBRL(interestSaved)}
          </p>
          <p class="mt-1.5 text-xs text-emerald-900/80">
            {hasExtras
              ? `Com ${formatBRL(withExtras.totalExtraPaid)} em aportes extras.`
              : 'Informe um aporte extra acima para calcular sua economia.'}
          </p>
        </div>

        {/* Card 2: Tempo Economizado */}
        <div class="rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wider text-sky-800">
            Tempo Economizado
          </p>
          <p class="mt-2 text-xl sm:text-2xl font-extrabold text-sky-700 tracking-tight">
            {monthsSaved > 0
              ? formatMonthsToYearsAndMonths(monthsSaved)
              : '0 meses'}
          </p>
          <p class="mt-1.5 text-xs text-sky-900/80">
            De {baseline.actualMonths} para {withExtras.actualMonths} parcelas
          </p>
        </div>

        {/* Card 3: Total de Juros Pagos */}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total de Juros Pagos
          </p>
          <p class="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatBRL(withExtras.totalInterest)}
          </p>
          <p class="mt-1.5 text-xs text-slate-500">
            {interestSaved > 0 ? (
              <>
                Sem aportes:{' '}
                <span class="line-through text-slate-400">
                  {formatBRL(baseline.totalInterest)}
                </span>
              </>
            ) : (
              'Juros totais do financiamento'
            )}
          </p>
        </div>

        {/* Card 4: Custo Efetivo Total Pago */}
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Pago no Contrato
          </p>
          <p class="mt-2 text-2xl font-extrabold text-slate-900 tracking-tight">
            {formatBRL(withExtras.totalPaid)}
          </p>
          <p class="mt-1.5 text-xs text-slate-500">
            Parcela base: {formatBRL(withExtras.firstInstallment)} →{' '}
            {formatBRL(withExtras.lastInstallment)}
          </p>
        </div>
      </div>

      {/* Barra Comparativa Rápida SAC vs. Price */}
      <div class="rounded-xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
        <div class="text-slate-700">
          <span class="font-semibold text-slate-900">
            Comparativo {currentSystemName} vs. {altSystemName}:
          </span>{' '}
          No sistema alternativo ({altSystemName}, sem aportes extras), a 1ª parcela
          seria de{' '}
          <strong class="text-slate-900">
            {formatBRL(alternateSystemBaseline.firstInstallment)}
          </strong>{' '}
          com juros totais de{' '}
          <strong class="text-slate-900">
            {formatBRL(alternateSystemBaseline.totalInterest)}
          </strong>
          .
        </div>
        <a
          href="/tabela-sac-vs-price"
          class="text-xs font-semibold text-emerald-700 hover:text-emerald-800 whitespace-nowrap underline underline-offset-2 print:hidden"
        >
          Ver comparativo completo →
        </a>
      </div>
    </section>
  );
}
