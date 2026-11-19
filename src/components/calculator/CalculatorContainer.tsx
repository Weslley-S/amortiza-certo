import { useEffect, useState } from 'preact/hooks';
import { runFullComparison } from '@/lib/math/simulator';
import type { SimulationInput } from '@/lib/math/types';
import {
  buildSimulationShareUrl,
  DEFAULT_SIMULATION_INPUT,
  parseSimulationFromUrl,
} from '@/lib/utils/urlParams';
import AmortizationChart from './AmortizationChart';
import EvolutionTable from './EvolutionTable';
import InputForm from './InputForm';
import ResultsSummary from './ResultsSummary';

interface CalculatorContainerProps {
  initialPreset?: Partial<SimulationInput>;
  highlightFgts?: boolean;
}

export default function CalculatorContainer({
  initialPreset,
  highlightFgts = false,
}: CalculatorContainerProps) {
  const [input, setInput] = useState<SimulationInput>(() => ({
    ...DEFAULT_SIMULATION_INPUT,
    ...initialPreset,
  }));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search) {
      setInput(parseSimulationFromUrl(window.location.search, initialPreset));
    }
  }, [initialPreset]);

  const comparison = runFullComparison(input);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    const shareUrl = buildSimulationShareUrl(window.location.href, input);

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.history.replaceState(null, '', shareUrl);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div class="space-y-6">
      <InputForm
        input={input}
        onChange={setInput}
        highlightFgts={highlightFgts}
      />

      <div class="flex flex-wrap items-center justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={handleCopyLink}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
        >
          {copied ? 'Link copiado!' : 'Copiar Link desta Simulação'}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Imprimir / Salvar PDF
        </button>
      </div>

      <ResultsSummary result={comparison} />

      <AmortizationChart
        baseline={comparison.baseline}
        withExtras={comparison.withExtras}
      />

      <EvolutionTable
        schedule={comparison.withExtras.schedule}
        baselineSchedule={comparison.baseline.schedule}
      />
    </div>
  );
}
