import type { SimulationSummary } from '@/lib/math/types';

interface AmortizationChartProps {
  baseline: SimulationSummary;
  withExtras: SimulationSummary;
}

function formatCompactBRL(value: number): string {
  if (value >= 1_000_000) {
    return `R$ ${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (value >= 1_000) {
    return `R$ ${Math.round(value / 1_000)}k`;
  }
  return `R$ ${Math.round(value)}`;
}

export default function AmortizationChart({
  baseline,
  withExtras,
}: AmortizationChartProps) {
  const firstRow = baseline.schedule[0];
  const initialBalance = firstRow
    ? firstRow.remainingBalance +
      firstRow.scheduledAmortization +
      firstRow.extraAmortization
    : 0;

  if (initialBalance <= 0 || baseline.schedule.length === 0) {
    return null;
  }

  const width = 700;
  const height = 280;
  const padLeft = 68;
  const padRight = 20;
  const padTop = 16;
  const padBottom = 32;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const maxMonths = Math.max(1, baseline.actualMonths, withExtras.actualMonths);

  const toX = (month: number) =>
    padLeft + (month / maxMonths) * plotWidth;
  const toY = (balance: number) =>
    padTop + (1 - Math.min(1, Math.max(0, balance / initialBalance))) * plotHeight;

  const buildPolylinePoints = (summary: SimulationSummary): string => {
    const pts: string[] = [`${toX(0).toFixed(1)},${toY(initialBalance).toFixed(1)}`];
    for (const row of summary.schedule) {
      pts.push(`${toX(row.month).toFixed(1)},${toY(row.remainingBalance).toFixed(1)}`);
    }
    return pts.join(' ');
  };

  const baselinePoints = buildPolylinePoints(baseline);
  const extrasPoints = buildPolylinePoints(withExtras);

  const lastExtraMonth =
    withExtras.schedule[withExtras.schedule.length - 1]?.month ?? 0;
  const extrasAreaPoints = `${toX(0).toFixed(1)},${toY(0).toFixed(1)} ${extrasPoints} ${toX(lastExtraMonth).toFixed(1)},${toY(0).toFixed(1)}`;

  const gridLevels = [1, 0.75, 0.5, 0.25, 0];
  const midMonth = Math.round(maxMonths / 2);

  return (
    <section
      aria-label="Gráfico de evolução do saldo devedor"
      class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm"
    >
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 class="text-base font-bold text-slate-900">
            Evolução do Saldo Devedor
          </h3>
          <p class="text-xs text-slate-500">
            Comparação entre o prazo original e o cenário com amortizações extras.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block w-5 border-t-2 border-dashed border-slate-400"
              aria-hidden="true"
            />
            <span>Sem aportes ({baseline.actualMonths} meses)</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block w-5 border-t-2 border-emerald-600"
              aria-hidden="true"
            />
            <span>Com aportes ({withExtras.actualMonths} meses)</span>
          </div>
        </div>
      </div>

      <svg
        viewBox="0 0 700 280"
        class="w-full h-auto overflow-visible"
        role="img"
        aria-label="Gráfico de evolução do saldo devedor"
      >
        {/* Linhas de grade horizontais (0% a 100%) */}
        {gridLevels.map((level) => {
          const y = toY(initialBalance * level);
          return (
            <g key={level}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#e2e8f0"
                stroke-width="1"
              />
              <text
                x={padLeft - 8}
                y={y + 4}
                text-anchor="end"
                fill="#64748b"
                font-size="11"
              >
                {formatCompactBRL(initialBalance * level)}
              </text>
            </g>
          );
        })}

        {/* Rótulos do eixo X (Meses) */}
        <text
          x={toX(0)}
          y={height - 8}
          text-anchor="start"
          fill="#64748b"
          font-size="11"
        >
          Mês 0
        </text>
        {maxMonths > 2 && (
          <text
            x={toX(midMonth)}
            y={height - 8}
            text-anchor="middle"
            fill="#64748b"
            font-size="11"
          >
            Mês {midMonth}
          </text>
        )}
        <text
          x={toX(maxMonths)}
          y={height - 8}
          text-anchor="end"
          fill="#64748b"
          font-size="11"
        >
          Mês {maxMonths}
        </text>

        {/* Área preenchida do cenário com aportes extras */}
        <polygon points={extrasAreaPoints} fill="rgba(16, 185, 129, 0.12)" />

        {/* Curva cinza tracejada: cenário sem aportes */}
        <polyline
          fill="none"
          stroke="#94a3b8"
          stroke-width="2.2"
          stroke-dasharray="6 4"
          points={baselinePoints}
        />

        {/* Curva verde sólida: cenário com aportes */}
        <polyline
          fill="none"
          stroke="#059669"
          stroke-width="2.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          points={extrasPoints}
        />
      </svg>
    </section>
  );
}
