import { useState } from 'preact/hooks';
import type { InstallmentRow } from '@/lib/math/types';
import { formatBRL } from '@/lib/utils/formatters';

interface EvolutionTableProps {
  schedule: InstallmentRow[];
  baselineSchedule?: InstallmentRow[];
}

const PAGE_SIZE = 24;

export default function EvolutionTable({ schedule }: EvolutionTableProps) {
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(false);

  if (schedule.length === 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(schedule.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const visibleRows = showAll
    ? schedule
    : schedule.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <section
      aria-label="Tabela de evolução mensal do financiamento"
      class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 class="text-base font-bold text-slate-900">
            Tabela de Evolução Mês a Mês
          </h3>
          <p class="text-xs text-slate-500">
            Exibindo {visibleRows.length} de {schedule.length} parcelas. Linhas em
            verde indicam meses com amortização extra.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {showAll ? 'Paginar (24 meses)' : 'Ver Tudo'}
          </button>
        </div>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-right">
          <thead class="bg-slate-50 text-slate-600 font-semibold">
            <tr>
              <th scope="col" class="px-3 py-3 text-left">
                Mês
              </th>
              <th scope="col" class="px-3 py-3">
                Prestação Base
              </th>
              <th scope="col" class="px-3 py-3">
                Juros
              </th>
              <th scope="col" class="px-3 py-3">
                Amortização Regular
              </th>
              <th scope="col" class="px-3 py-3">
                Aporte Extra
              </th>
              <th scope="col" class="px-3 py-3">
                Total Pago no Mês
              </th>
              <th scope="col" class="px-3 py-3">
                Saldo Devedor
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-slate-700">
            {visibleRows.map((row) => (
              <tr
                key={row.month}
                class={
                  row.extraAmortization > 0
                    ? 'bg-emerald-50/70 hover:bg-emerald-100/60 transition-colors'
                    : 'bg-white hover:bg-slate-50 transition-colors'
                }
              >
                <td class="px-3 py-2.5 text-left font-semibold text-slate-900">
                  {row.month}
                </td>
                <td class="px-3 py-2.5">{formatBRL(row.baseInstallment)}</td>
                <td class="px-3 py-2.5 text-slate-600">
                  {formatBRL(row.interest)}
                </td>
                <td class="px-3 py-2.5">
                  {formatBRL(row.scheduledAmortization)}
                </td>
                <td
                  class={`px-3 py-2.5 font-medium ${
                    row.extraAmortization > 0
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                  }`}
                >
                  {formatBRL(row.extraAmortization)}
                </td>
                <td class="px-3 py-2.5 font-semibold text-slate-900">
                  {formatBRL(row.totalPaidInMonth)}
                </td>
                <td class="px-3 py-2.5 font-medium text-slate-800">
                  {formatBRL(row.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && totalPages > 1 && (
        <div class="flex items-center justify-between pt-2 print:hidden">
          <span class="text-xs text-slate-500">
            Página {safePage} de {totalPages}
          </span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
