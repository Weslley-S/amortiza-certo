import { useEffect, useState } from 'preact/hooks';
import type { SimulationInput } from '@/lib/math/types';
import { formatMonthsToYearsAndMonths } from '@/lib/utils/formatters';

interface InputFormProps {
  input: SimulationInput;
  onChange: (updated: SimulationInput) => void;
  highlightFgts?: boolean;
}

interface NumericInputProps {
  id: string;
  value: number;
  min: number;
  max: number;
  integerOnly?: boolean;
  className: string;
  onValueChange: (val: number) => void;
}

function formatNumberForInput(val: number): string {
  return String(val).replace('.', ',');
}

function NumericInput({
  id,
  value,
  min,
  max,
  integerOnly = false,
  className,
  onValueChange,
}: NumericInputProps) {
  const [text, setText] = useState<string>(() => formatNumberForInput(value));
  const [isFocused, setIsFocused] = useState(false);

  // Sincroniza apenas quando o valor muda externamente (ex.: presets ou URL)
  useEffect(() => {
    if (!isFocused) {
      setText(formatNumberForInput(value));
    }
  }, [value, isFocused]);

  const handleInput = (raw: string) => {
    // Permite apenas dígitos e (se decimal) um único separador ',' ou '.'
    const pattern = integerOnly ? /[^\d]/g : /[^\d.,]/g;
    let sanitized = raw.replace(pattern, '');

    if (!integerOnly) {
      const firstSepIndex = sanitized.search(/[.,]/);
      if (firstSepIndex !== -1) {
        const head = sanitized.slice(0, firstSepIndex + 1);
        const tail = sanitized.slice(firstSepIndex + 1).replace(/[.,]/g, '');
        sanitized = head + tail;
      }
    }

    setText(sanitized);

    if (sanitized === '' || sanitized === ',' || sanitized === '.') {
      return;
    }

    const normalized = sanitized.replace(',', '.');
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) {
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    onValueChange(integerOnly ? Math.round(clamped) : clamped);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const normalized = text.replace(',', '.');
    const parsed = Number(normalized);

    if (text.trim() === '' || !Number.isFinite(parsed)) {
      setText(formatNumberForInput(value));
      return;
    }

    const clamped = Math.min(max, Math.max(min, parsed));
    const finalVal = integerOnly ? Math.round(clamped) : clamped;
    onValueChange(finalVal);
    setText(formatNumberForInput(finalVal));
  };

  return (
    <input
      id={id}
      type="text"
      inputMode={integerOnly ? 'numeric' : 'decimal'}
      value={text}
      onFocus={() => setIsFocused(true)}
      onInput={(e) => handleInput(e.currentTarget.value)}
      onBlur={handleBlur}
      class={className}
    />
  );
}

const LOAN_PRESETS = [
  { label: 'R$ 200 mil', value: 200000 },
  { label: 'R$ 350 mil', value: 350000 },
  { label: 'R$ 500 mil', value: 500000 },
];

export default function InputForm({
  input,
  onChange,
  highlightFgts = false,
}: InputFormProps) {
  const updateField = <K extends keyof SimulationInput>(
    key: K,
    value: SimulationInput[K],
  ) => {
    onChange({ ...input, [key]: value });
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      class="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6"
      aria-label="Parâmetros do financiamento"
    >
      <div>
        <h2 class="text-lg font-bold text-slate-900">Dados do Financiamento</h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Ajuste os valores abaixo para simular em tempo real no seu navegador.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Saldo Devedor / Valor Financiado */}
        <div>
          <label
            htmlFor="loan-amount"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Saldo Devedor / Valor Financiado (R$)
          </label>
          <NumericInput
            id="loan-amount"
            min={1000}
            max={50000000}
            value={input.loanAmount}
            onValueChange={(val) => updateField('loanAmount', val)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
          />
          <div class="mt-2 flex flex-wrap gap-1.5">
            {LOAN_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => updateField('loanAmount', preset.value)}
                class={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                  input.loanAmount === preset.value
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Taxa de Juros Anual */}
        <div>
          <label
            htmlFor="annual-interest-rate"
            class="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Taxa de Juros Anual (% a.a.)
          </label>
          <NumericInput
            id="annual-interest-rate"
            min={0.1}
            max={35}
            value={input.annualInterestRate}
            onValueChange={(val) => updateField('annualInterestRate', val)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
          />
          <p class="mt-1.5 text-xs text-slate-500">
            Informe a taxa efetiva anual do contrato (ex.: 9,50% a.a.).
          </p>
        </div>

        {/* Prazo Restante */}
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label
              htmlFor="total-months"
              class="block text-sm font-semibold text-slate-700"
            >
              Prazo Restante (Meses)
            </label>
            <span class="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {formatMonthsToYearsAndMonths(input.totalMonths)}
            </span>
          </div>
          <NumericInput
            id="total-months"
            min={1}
            max={420}
            integerOnly={true}
            value={input.totalMonths}
            onValueChange={(months) =>
              onChange({
                ...input,
                totalMonths: months,
                lumpSumMonth: Math.min(input.lumpSumMonth, months),
              })
            }
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
          />
        </div>

        {/* Sistema de Amortização */}
        <div>
          <span class="block text-sm font-semibold text-slate-700 mb-1.5">
            Sistema de Amortização
          </span>
          <div
            role="group"
            aria-label="Sistema de amortização"
            class="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200"
          >
            <button
              type="button"
              onClick={() => updateField('system', 'SAC')}
              aria-pressed={input.system === 'SAC'}
              class={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                input.system === 'SAC'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabela SAC
            </button>
            <button
              type="button"
              onClick={() => updateField('system', 'PRICE')}
              aria-pressed={input.system === 'PRICE'}
              class={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                input.system === 'PRICE'
                  ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabela Price
            </button>
          </div>
          <p class="mt-1.5 text-xs text-slate-500">
            SAC tem parcelas decrescentes; Price tem parcelas fixas.
          </p>
        </div>
      </div>

      {/* Seção Destacada: Simular Amortizações Extras */}
      <div class="pt-5 border-t border-slate-200 space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 class="text-base font-bold text-slate-900">
              Simular Amortizações Extras (Opcional)
            </h3>
            <p class="text-xs text-slate-500">
              Veja o impacto de aportes mensais, pontuais ou uso do FGTS.
            </p>
          </div>
        </div>

        {/* Estratégia do Aporte Extra */}
        <div>
          <span class="block text-sm font-semibold text-slate-700 mb-1.5">
            Estratégia do Aporte Extra
          </span>
          <div
            role="group"
            aria-label="Estratégia de redução"
            class="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200"
          >
            <button
              type="button"
              onClick={() => updateField('reductionStrategy', 'TERM')}
              aria-pressed={input.reductionStrategy === 'TERM'}
              class={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                input.reductionStrategy === 'TERM'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reduzir Prazo (Recomendado)
            </button>
            <button
              type="button"
              onClick={() => updateField('reductionStrategy', 'INSTALLMENT')}
              aria-pressed={input.reductionStrategy === 'INSTALLMENT'}
              class={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                input.reductionStrategy === 'INSTALLMENT'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reduzir Valor da Parcela
            </button>
          </div>
        </div>

        {/* Linha 1: Aporte Extra Recorrente + Periodicidade */}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div>
            <label
              htmlFor="monthly-extra"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Aporte Extra Recorrente (R$)
            </label>
            <NumericInput
              id="monthly-extra"
              min={0}
              max={50000000}
              value={input.monthlyExtraPayment}
              onValueChange={(val) => updateField('monthlyExtraPayment', val)}
              className="w-full h-[42px] rounded-lg border border-slate-300 px-3.5 py-2 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="extra-interval"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Periodicidade
            </label>
            <select
              id="extra-interval"
              value={
                [1, 2, 3, 6, 12].includes(input.extraPaymentIntervalMonths)
                  ? String(input.extraPaymentIntervalMonths)
                  : 'custom'
              }
              onChange={(e) => {
                const val = e.currentTarget.value;
                if (val === 'custom') {
                  updateField('extraPaymentIntervalMonths', 4);
                } else {
                  updateField('extraPaymentIntervalMonths', Number(val));
                }
              }}
              class="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
            >
              <option value="1">Todo mês (Mensal)</option>
              <option value="2">A cada 2 meses</option>
              <option value="3">A cada 3 meses</option>
              <option value="6">A cada 6 meses</option>
              <option value="12">A cada 12 meses</option>
              <option value="custom">Outro intervalo...</option>
            </select>

            {![1, 2, 3, 6, 12].includes(input.extraPaymentIntervalMonths) && (
              <div class="mt-2 flex items-center gap-2">
                <label
                  htmlFor="extra-interval-custom"
                  class="text-xs text-slate-600 whitespace-nowrap"
                >
                  A cada
                </label>
                <NumericInput
                  id="extra-interval-custom"
                  min={1}
                  max={480}
                  integerOnly={true}
                  value={input.extraPaymentIntervalMonths}
                  onValueChange={(val) =>
                    updateField('extraPaymentIntervalMonths', val)
                  }
                  className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-900 font-medium focus:border-emerald-600 outline-none"
                />
                <span class="text-xs text-slate-600">meses</span>
              </div>
            )}
          </div>
        </div>

        {/* Linha 2: Aporte Único / FGTS Pontual + No Mês + FGTS Bienal */}
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
          <div>
            <label
              htmlFor="lump-sum-payment"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Aporte Único / FGTS Pontual (R$)
            </label>
            <NumericInput
              id="lump-sum-payment"
              min={0}
              max={50000000}
              value={input.lumpSumPayment}
              onValueChange={(val) => updateField('lumpSumPayment', val)}
              className={`w-full h-[42px] rounded-lg border px-3.5 py-2 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition ${
                highlightFgts
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-300 bg-white'
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="lump-sum-month"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              No Mês nº
            </label>
            <NumericInput
              id="lump-sum-month"
              min={1}
              max={input.totalMonths}
              integerOnly={true}
              value={input.lumpSumMonth}
              onValueChange={(val) => updateField('lumpSumMonth', val)}
              className="w-full h-[42px] rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition"
            />
          </div>

          <div>
            <label
              htmlFor="recurring-fgts"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              FGTS a cada 2 anos (R$)
            </label>
            <NumericInput
              id="recurring-fgts"
              min={0}
              max={50000000}
              value={input.recurringFgtsAmount}
              onValueChange={(val) => updateField('recurringFgtsAmount', val)}
              className={`w-full h-[42px] rounded-lg border px-3.5 py-2 text-slate-900 font-medium focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 outline-none transition ${
                highlightFgts
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-300 bg-white'
              }`}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
