# Planejamento Ágil de Implementação: Calculadora de Amortização (JAMstack + SSG + SEO + AdSense)

> **Documento de Especificação Técnica e Backlog Ágil para Execução por Agentes de IA**  
> **Documento Base:** [guia_de_planejamento_micro_web_app_para_renda_extra_com_an_ncios.md](file:///c:/Users/Weslley/Documents/Projetos/Renda%20extra/guia_de_planejamento_micro_web_app_para_renda_extra_com_an_ncios.md)  
> **Arquitetura:** Astro (SSG `output: 'static'`) + Preact Islands + Tailwind CSS + TypeScript Estrito + Vitest  
> **Hospedagem Alvo:** Cloudflare Pages (Custo R$ 0,00/mês, liberado para AdSense comercial)

---

## 0. Diretrizes Anti-Alucinação e Guardrails Globais (LEITURA OBRIGATÓRIA PARA A IA EXECUTORA)

Para evitar erros de implementação, incompatibilidades de pacotes ou alucinações, o modelo de IA responsável pela codificação **DEVE** seguir estritamente estas regras em todas as tarefas:

1. **Proibição de SSR ou Backend:** O projeto é **100% estático (SSG)** com processamento **100% Client-Side**. Nunca adicione adaptadores SSR (`@astrojs/node`, `@astrojs/vercel`, `@astrojs/cloudflare` em modo SSR) e nunca crie endpoints de servidor que dependam de runtime Node em produção. No `astro.config.mjs`, mantenha `output: 'static'`.
2. **Restrição Estrita de Dependências:**
   * **Permitidos:** `astro`, `@astrojs/tailwind`, `@astrojs/preact`, `@astrojs/sitemap`, `preact`, `tailwindcss`, `@tailwindcss/typography`, `typescript`, `vitest`.
   * **Proibidos:** Não instale bibliotecas pesadas de gráficos (`chart.js`, `recharts`, `apexcharts`), bibliotecas de UI (`mui`, `antd`, `bootstrap`), manipuladores de datas (`moment`, `date-fns`) ou bibliotecas de estado externas (`redux`, `zustand`). O gráfico será construído em **SVG nativo responsivo** em um componente Preact de ~80 linhas (zero dependências externas, carregamento instantâneo).
3. **Padrão de Nomenclatura e Caminhos:** Crie exatamente os arquivos nos caminhos especificados em cada Tarefa. Não altere nomes de propriedades das interfaces definidas em `src/lib/math/types.ts`.
4. **Regras de Matemática Financeira e Ponto Flutuante:**
   * Durante o loop de cálculo das parcelas, mantenha precisão de ponto flutuante padrão (`number` IEEE 754), arredondando os valores monetários de cada linha com `roundCurrency(val)` apenas ao registrar a parcela e atualizar o saldo devedor.
   * Na última parcela do financiamento (ou quando a amortização atingir o saldo devedor), ajuste a amortização para ser exatamente igual ao `saldoDevedor` residual, evitando saldo negativo ou resíduos de centavos (`R$ 0,01`).
5. **Prevenção Absoluta de CLS (Cumulative Layout Shift):**
   * Nenhum espaço de anúncio pode colapsar quando vazio. Todo componente de anúncio deve possuir classes `min-h-[...]` explícitas no HTML estático.
   * Use exclusivamente fontes nativas do sistema operacional (`font-sans` padrão do Tailwind) sem importar arquivos de fonte externos do Google Fonts.
6. **Regra de Validação Contínua:** Nenhuma tarefa ou história é considerada concluída (`Done`) sem que os comandos de verificação (`npm run test` e `npm run build`) retornem código de saída `0` (zero erros).
7. **Regra Obrigatória de Marcação de Checkboxes (`[x]`):** Sempre que qualquer elemento da implementação for concluído e verificado, a IA executora **DEVE** atualizar imediatamente este arquivo (`planejamento_calculadora_amortizacao_seo.md`), marcando com `[x]` os checkboxes correspondentes:
   * **Sub-itens, arquivos, funções e cenários de teste** implementados;
   * **Tarefas** completas;
   * **Critérios de Aceite** validados;
   * **Histórias de Usuário** completas (quando todas as suas tarefas e critérios estiverem `[x]`);
   * **Sprints** completas (quando todas as histórias e o entregável da sprint estiverem `[x]`).

---

## 1. Visão Geral da Estrutura de Diretórios Final

O projeto implementado seguirá exatamente esta árvore de arquivos:

```text
calculadora-amortizacao/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── ads.txt
├── src/
│   ├── components/
│   │   ├── ads/
│   │   │   └── AdSlot.astro
│   │   ├── calculator/
│   │   │   ├── CalculatorContainer.tsx
│   │   │   ├── InputForm.tsx
│   │   │   ├── ResultsSummary.tsx
│   │   │   ├── AmortizationChart.tsx
│   │   │   └── EvolutionTable.tsx
│   │   ├── common/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── FaqAccordion.astro
│   │   │   └── CookieConsent.astro
│   │   └── seo/
│   │       ├── SeoMeta.astro
│   │       └── JsonLdSchema.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   │   ├── math/
│   │   │   ├── types.ts
│   │   │   ├── rates.ts
│   │   │   ├── sac.ts
│   │   │   ├── price.ts
│   │   │   ├── simulator.ts
│   │   │   └── __tests__/
│   │   │       └── simulator.test.ts
│   │   └── utils/
│   │       ├── formatters.ts
│   │       └── urlParams.ts
│   └── pages/
│       ├── index.astro
│       ├── tabela-sac-vs-price.astro
│       ├── amortizar-prazo-ou-parcela.astro
│       ├── amortizar-com-fgts.astro
│       ├── sobre.astro
│       ├── contato.astro
│       ├── termos-de-uso.astro
│       └── politica-de-privacidade.astro
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 2. Painel Geral de Progresso (Sprints, Histórias, Tarefas e Testes)

- [x] **SPRINT 1: Fundação, Scaffolding SSG e Infraestrutura de SEO Base**
  - [x] História 1.1: Setup do Projeto Astro SSG, Tailwind CSS, Preact e Vitest
    - [x] Tarefa 1.1.1: Criar `package.json`, `tsconfig.json`, `astro.config.mjs`, `tailwind.config.mjs` e `vitest.config.ts`
    - [x] Tarefa 1.1.2: Criar arquivos públicos obrigatórios (`public/robots.txt`, `public/ads.txt`, `public/favicon.svg`)
    - [x] Critério de Aceite da História 1.1 (`npm install` sem erros)
  - [x] História 1.2: Componentes de SEO Técnico (`SeoMeta.astro` e `JsonLdSchema.astro`)
    - [x] Tarefa 1.2.1: Implementar `src/components/seo/SeoMeta.astro`
    - [x] Tarefa 1.2.2: Implementar `src/components/seo/JsonLdSchema.astro`
    - [x] Critério de Aceite da História 1.2
  - [x] História 1.3: Layout Base, Navegação e Slots de Anúncios Anti-CLS
    - [x] Tarefa 1.3.1: Implementar `src/components/ads/AdSlot.astro`
    - [x] Tarefa 1.3.2: Implementar `src/components/common/Header.astro` e `src/components/common/Footer.astro`
    - [x] Tarefa 1.3.3: Implementar `src/layouts/BaseLayout.astro`
    - [x] Critério de Aceite da Sprint 1 (`npm run build` gerando `dist/index.html` e `dist/sitemap-index.xml`)
- [x] **SPRINT 2: Motor Matemático Financeiro 100% Client-Side (Core Engine & TDD)**
  - [x] História 2.1: Contratos TypeScript, Conversão de Taxas e Utilitários de Formatação
    - [x] Tarefa 2.1.1: Criar `src/lib/math/types.ts` (Contrato Imutável)
    - [x] Tarefa 2.1.2: Criar `src/lib/math/rates.ts`
    - [x] Tarefa 2.1.3: Criar `src/lib/utils/formatters.ts`
  - [x] História 2.2: Algoritmos de Simulação SAC, Price e Amortizações Extraordinárias
    - [x] Tarefa 2.2.1: Implementar `src/lib/math/sac.ts`, `src/lib/math/price.ts` e `simulateSchedule`
    - [x] Tarefa 2.2.2: Implementar função fachada `runFullComparison` em `src/lib/math/simulator.ts`
    - [x] Tarefa 2.2.3: Criar Suíte de Testes Unitários em `src/lib/math/__tests__/simulator.test.ts` (5 cenários de teste)
    - [x] Critério de Aceite da Sprint 2 (`npm run test` passando 100% nos 5 cenários)
- [x] **SPRINT 3: Interface Interativa (Preact Islands) e Compartilhamento por URL**
  - [x] História 3.1: Serialização e Hidratação de Estado via Query Params (`urlParams.ts`)
    - [x] Tarefa 3.1.1: Implementar `src/lib/utils/urlParams.ts`
  - [x] História 3.2: Formulário Interativo, Cards de Resumo, Gráfico SVG e Tabela Paginada
    - [x] Tarefa 3.2.1: Implementar `src/components/calculator/InputForm.tsx`
    - [x] Tarefa 3.2.2: Implementar `src/components/calculator/ResultsSummary.tsx`
    - [x] Tarefa 3.2.3: Implementar `src/components/calculator/AmortizationChart.tsx`
    - [x] Tarefa 3.2.4: Implementar `src/components/calculator/EvolutionTable.tsx`
    - [x] Tarefa 3.2.5: Implementar `src/components/calculator/CalculatorContainer.tsx`
    - [x] Critério de Aceite da Sprint 3 (`npm run build` compilando ilhas Preact sem erros)
- [x] **SPRINT 4: Páginas Temáticas de Cauda Longa (Estratégia "Tool + Guide" e FAQ Schema)**
  - [x] História 4.1: Componente de FAQ Estático e Conteúdo SEO das 4 Rotas de Ferramenta
    - [x] Tarefa 4.1.1: Implementar `src/components/common/FaqAccordion.astro`
    - [x] Tarefa 4.1.2: Implementar Rota Principal `src/pages/index.astro`
    - [x] Tarefa 4.1.3: Implementar Rota `src/pages/tabela-sac-vs-price.astro`
    - [x] Tarefa 4.1.4: Implementar Rota `src/pages/amortizar-prazo-ou-parcela.astro`
    - [x] Tarefa 4.1.5: Implementar Rota `src/pages/amortizar-com-fgts.astro`
    - [x] Critério de Aceite da Sprint 4 (4 rotas geradas com conteúdos exclusivos e Schema JSON-LD)
- [x] **SPRINT 5: Compliance Google AdSense, LGPD, Páginas Institucionais e Auditoria Final**
  - [x] História 5.1: Páginas Institucionais, Jurídicas e Consentimento LGPD
    - [x] Tarefa 5.1.1: Implementar `src/pages/politica-de-privacidade.astro`
    - [x] Tarefa 5.1.2: Implementar `src/pages/termos-de-uso.astro`, `src/pages/sobre.astro` e `src/pages/contato.astro`
    - [x] Tarefa 5.1.3: Implementar `src/components/common/CookieConsent.astro` e incluí-lo no `BaseLayout.astro`
  - [x] História 5.2: Validação Final de Build, Testes e Checklist de Deploy no Cloudflare Pages
    - [x] Tarefa 5.2.1: Executar Bateria de Verificação Automatizada (`npm run test` + `npm run build` + verificação de artefatos em `dist/`)

---

## 3. Backlog Ágil Detalhado (Sprints, Histórias, Tarefas e Testes)

---

### - [x] SPRINT 1: Fundação, Scaffolding SSG e Infraestrutura de SEO Base

* **Objetivo da Sprint:** Inicializar o projeto Astro estático com TypeScript, Preact, Tailwind CSS e Vitest, entregando o layout base responsivo, os componentes de metadados SEO/Schema.org e os slots de anúncio anti-CLS.
* **Entregável Testável ao Final da Sprint:** Aplicação compilando em HTML estático (`dist/`), renderizando uma página inicial esqueleto com nota 100 de Performance e SEO técnico no Lighthouse, contendo `robots.txt`, `ads.txt`, `sitemap-index.xml`, Header, Footer e AdSlots sem Layout Shift.

---

#### - [x] História 1.1: Setup do Projeto Astro SSG, Tailwind CSS, Preact e Vitest
> **Como** desenvolvedor, **quero** configurar o projeto base com Astro em modo SSG, Preact, Tailwind e Vitest **para** ter um ambiente de build determinístico e testável.

##### - [x] Tarefa 1.1.1: Criar `package.json`, `tsconfig.json`, `astro.config.mjs`, `tailwind.config.mjs` e `vitest.config.ts`
* **Ação:** Criar os arquivos de configuração na raiz do projeto.
* **Itens de Implementação da Tarefa 1.1.1:**
  - [x] Criar `package.json` na raiz do projeto:
    ```json
    {
      "name": "calculadora-amortizacao",
      "type": "module",
      "version": "1.0.0",
      "scripts": {
        "dev": "astro dev",
        "build": "astro build",
        "preview": "astro preview",
        "test": "vitest run",
        "test:watch": "vitest"
      },
      "dependencies": {
        "@astrojs/preact": "^3.5.0",
        "@astrojs/sitemap": "^3.2.0",
        "@astrojs/tailwind": "^5.1.0",
        "astro": "^4.16.0",
        "preact": "^10.24.0",
        "tailwindcss": "^3.4.14"
      },
      "devDependencies": {
        "@tailwindcss/typography": "^0.5.15",
        "typescript": "^5.6.3",
        "vitest": "^2.1.4"
      }
    }
    ```
  - [x] Criar `astro.config.mjs` na raiz do projeto:
    ```javascript
    import { defineConfig } from 'astro/config';
    import preact from '@astrojs/preact';
    import tailwind from '@astrojs/tailwind';
    import sitemap from '@astrojs/sitemap';

    export default defineConfig({
      site: 'https://calculadoraamortizacao.com.br',
      output: 'static',
      compressHTML: true,
      integrations: [
        preact(),
        tailwind(),
        sitemap(),
      ],
    });
    ```
  - [x] Criar `tailwind.config.mjs` na raiz do projeto:
    ```javascript
    import typography from '@tailwindcss/typography';

    /** @type {import('tailwindcss').Config} */
    export default {
      content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      theme: {
        extend: {
          fontFamily: {
            sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          },
        },
      },
      plugins: [typography],
    };
    ```
  - [x] Criar `tsconfig.json` na raiz do projeto:
    ```json
    {
      "extends": "astro/tsconfigs/strict",
      "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "preact",
        "baseUrl": ".",
        "paths": {
          "@/*": ["src/*"]
        }
      }
    }
    ```
  - [x] Criar `vitest.config.ts` na raiz do projeto:
    ```typescript
    import { defineConfig } from 'vitest/config';

    export default defineConfig({
      test: {
        include: ['src/**/*.test.ts'],
        environment: 'node',
      },
    });
    ```

##### - [x] Tarefa 1.1.2: Criar arquivos públicos obrigatórios (`public/robots.txt`, `public/ads.txt`, `public/favicon.svg`)
* **Itens de Implementação da Tarefa 1.1.2:**
  - [x] Criar `public/robots.txt`:
    ```txt
    User-agent: *
    Allow: /

    User-agent: Mediapartners-Google
    Allow: /

    Sitemap: https://calculadoraamortizacao.com.br/sitemap-index.xml
    ```
  - [x] Criar `public/ads.txt`:
    ```txt
    google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0
    ```
  - [x] Criar `public/favicon.svg`: Ícone SVG simples (32x32) representando um gráfico financeiro verde (`#059669`).

* - [x] **Critério de Aceite da História 1.1:** Rodar `npm install` sem erros.

---

#### - [x] História 1.2: Componentes de SEO Técnico (`SeoMeta.astro` e `JsonLdSchema.astro`)
> **Como** mecanismo de busca (Googlebot), **quero** ler metatags canônicas, OpenGraph e dados estruturados JSON-LD válidos no `<head>` **para** indexar a ferramenta com rich snippets.

##### - [x] Tarefa 1.2.1: Implementar `src/components/seo/SeoMeta.astro`
* **Propriedades (Props Interface):**
  * `title: string` (obrigatório)
  * `description: string` (obrigatório)
  * `canonicalPath: string` (ex: `'/'` ou `'/tabela-sac-vs-price'`)
  * `ogType?: 'website' | 'article'` (default `'website'`)
* **Itens de Implementação da Tarefa 1.2.1:**
  - [x] Construir a URL canônica absoluta combinando `Astro.site` com `canonicalPath`.
  - [x] Renderizar `<title>{title}</title>`, `<meta name="description" content={description} />`, `<link rel="canonical" href={canonicalUrl} />`, `<meta name="robots" content="index, follow" />`.
  - [x] Renderizar tags OpenGraph (`og:title`, `og:description`, `og:url`, `og:type`, `og:locale="pt_BR"`, `og:site_name="Calculadora de Amortização"`) e Twitter Card (`twitter:card="summary_large_image"`).

##### - [x] Tarefa 1.2.2: Implementar `src/components/seo/JsonLdSchema.astro`
* **Propriedades (Props Interface):**
  ```typescript
  export interface FaqItem {
    question: string;
    answer: string;
  }
  interface Props {
    appName: string;
    appDescription: string;
    canonicalUrl: string;
    faqs?: FaqItem[];
  }
  ```
* **Itens de Implementação da Tarefa 1.2.2:**
  - [x] Renderizar tag `<script type="application/ld+json" set:html={JSON.stringify(webAppSchema)} />` do tipo `WebApplication` com `applicationCategory: "FinanceApplication"`, `operatingSystem: "All"`, `offers: { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }`.
  - [x] Quando `faqs` for fornecido e tiver itens (`faqs.length > 0`), renderizar segunda tag `<script type="application/ld+json">` do tipo `FAQPage` mapeando cada item em `Question` e `acceptedAnswer`.

* - [x] **Critério de Aceite da História 1.2:** Ambos os componentes não possuem dependências client-side e geram HTML/JSON puro na compilação.

---

#### - [x] História 1.3: Layout Base, Navegação e Slots de Anúncios Anti-CLS
> **Como** usuário e anunciante, **quero** uma estrutura de página rápida com espaços de anúncios pré-alocados **para** navegar sem que o layout pule (CLS = 0).

##### - [x] Tarefa 1.3.1: Implementar `src/components/ads/AdSlot.astro`
* **Propriedades (Props Interface):**
  * `slotId: string`
  * `format: 'horizontal' | 'rectangle' | 'in-article'`
  * `label?: string` (default `'Publicidade'`)
* **Itens de Implementação da Tarefa 1.3.1 (Mapeamento de Classes Anti-CLS Obrigatório):**
  - [x] Quando `format === 'horizontal'`: aplicar `min-h-[100px] sm:min-h-[90px] w-full max-w-[728px]`
  - [x] Quando `format === 'rectangle'`: aplicar `min-h-[250px] w-full max-w-[336px]`
  - [x] Quando `format === 'in-article'`: aplicar `min-h-[250px] w-full max-w-[728px]`
  - [x] Renderizar `<aside aria-label="Publicidade" class="my-6 flex flex-col items-center justify-center print:hidden">` contendo o rótulo discreto `"Publicidade"` (`text-[11px] uppercase tracking-wider text-slate-400 mb-1`) e a `div` com `data-ad-slot={slotId}` e as classes de altura mínima fixa, borda tracejada sutil `border border-dashed border-slate-200 bg-slate-50/60 rounded-lg flex items-center justify-center text-xs text-slate-400`.

##### - [x] Tarefa 1.3.2: Implementar `src/components/common/Header.astro` e `src/components/common/Footer.astro`
* **Itens de Implementação da Tarefa 1.3.2:**
  - [x] Criar `src/components/common/Header.astro`: Cabeçalho semântico `<header>` oculto na impressão (`print:hidden`) com links diretos para as 4 páginas de ferramentas:
    1. `Calculadora Geral` (`/`)
    2. `SAC vs. Price` (`/tabela-sac-vs-price`)
    3. `Prazo ou Parcela?` (`/amortizar-prazo-ou-parcela`)
    4. `Amortizar com FGTS` (`/amortizar-com-fgts`)
  - [x] Criar `src/components/common/Footer.astro`: Rodapé semântico `<footer>` com duas colunas de links ("Simuladores" e "Institucional e Legal": `/sobre`, `/contato`, `/termos-de-uso`, `/politica-de-privacidade`) e nota de isenção de responsabilidade explícita: *"As simulações deste site têm caráter meramente informativo e educacional, não substituindo o cálculo oficial da sua instituição financeira."*

##### - [x] Tarefa 1.3.3: Implementar `src/layouts/BaseLayout.astro`
* **Propriedades:** Recebe `title`, `description`, `canonicalPath`, `faqs`.
* **Itens de Implementação da Tarefa 1.3.3:**
  - [x] Configurar `<html lang="pt-BR" class="scroll-smooth">` e `<head>` com `<meta charset="UTF-8" />`, `<meta name="viewport" content="width=device-width, initial-scale=1.0" />`, `<SeoMeta />` e `<JsonLdSchema />`.
  - [x] Configurar `<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">` incluindo `<Header />`, `<AdSlot slotId="top-leaderboard" format="horizontal" />`, `<main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6"><slot /></main>` e `<Footer />`.

* - [x] **Critério de Aceite da Sprint 1:** Criar um `src/pages/index.astro` inicial utilizando `BaseLayout`, executar `npm run build` e verificar se `dist/index.html` e `dist/sitemap-index.xml` são gerados sem erros.

---

### - [x] SPRINT 2: Motor Matemático Financeiro 100% Client-Side (Core Engine & TDD)

* **Objetivo da Sprint:** Implementar toda a inteligência matemática de financiamento imobiliário (SAC, Price, amortização extra mensal e única/FGTS, redução de prazo vs. redução de parcela) com cobertura de testes unitários no Vitest.
* **Entregável Testável ao Final da Sprint:** Suíte de testes unitários (`npm run test`) passando 100% nos cenários de financiamento e amortização extraordinária.

---

#### - [x] História 2.1: Contratos TypeScript, Conversão de Taxas e Utilitários de Formatação
> **Como** motor de cálculo, **quero** contratos de dados estritos e funções de arredondamento determinísticas **para** evitar erros de ponto flutuante ou discrepâncias de tipos entre componentes.

##### - [x] Tarefa 2.1.1: Criar `src/lib/math/types.ts` (Contrato Imutável)
* **Itens de Implementação da Tarefa 2.1.1:**
  - [x] Criar `src/lib/math/types.ts` com o conteúdo exato:
    ```typescript
    export type AmortizationSystem = 'SAC' | 'PRICE';
    export type ExtraReductionStrategy = 'TERM' | 'INSTALLMENT'; // TERM = Reduzir Prazo, INSTALLMENT = Reduzir Parcela

    export interface SimulationInput {
      loanAmount: number;                // Valor financiado / Saldo devedor (R$) - ex: 300000
      annualInterestRate: number;        // Taxa de juros efetiva anual (%) - ex: 9.5
      totalMonths: number;               // Prazo total em meses - ex: 360
      system: AmortizationSystem;        // 'SAC' | 'PRICE'
      monthlyExtraPayment: number;       // Aporte extra recorrente mensal (R$) - ex: 500
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
    ```

##### - [x] Tarefa 2.1.2: Criar `src/lib/math/rates.ts`
* **Itens de Implementação da Tarefa 2.1.2:**
  - [x] Implementar `roundCurrency(value: number): number`:
    * `return Math.round((value + Number.EPSILON) * 100) / 100;`
  - [x] Implementar `annualToMonthlyRate(annualRatePercent: number): number`:
    * Se `annualRatePercent <= 0`, retorna `0`.
    * Fórmula: `Math.pow(1 + annualRatePercent / 100, 1 / 12) - 1`.
  - [x] Implementar `calculatePriceInstallment(balance: number, monthlyRate: number, remainingMonths: number): number`:
    * Se `remainingMonths <= 0` ou `balance <= 0`, retorna `0`.
    * Se `monthlyRate === 0`, retorna `roundCurrency(balance / remainingMonths)`.
    * Fórmula Price: `const factor = Math.pow(1 + monthlyRate, remainingMonths); return roundCurrency(balance * ((monthlyRate * factor) / (factor - 1)));`

##### - [x] Tarefa 2.1.3: Criar `src/lib/utils/formatters.ts`
* **Itens de Implementação da Tarefa 2.1.3:**
  - [x] Implementar `formatBRL(value: number): string`: Usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)`.
  - [x] Implementar `formatPercent(value: number): string`: Formata com 2 casas decimais e sufixo `%`.
  - [x] Implementar `formatMonthsToYearsAndMonths(months: number): string`: Exemplo: `360` -> `"30 anos (360 meses)"`, `42` -> `"3 anos e 6 meses (42 meses)"`, `8` -> `"8 meses"`.

---

#### - [x] História 2.2: Algoritmos de Simulação SAC, Price e Amortizações Extraordinárias
> **Como** usuário simulando meu financiamento, **quero** calcular com exatidão cada parcela mensal considerando aportes extras no prazo ou na parcela **para** saber exatamente quanto economizarei em juros e tempo.

##### - [x] Tarefa 2.2.1: Implementar `src/lib/math/sac.ts` e `src/lib/math/price.ts` (ou unificado modularmente em `src/lib/math/simulator.ts`)
* **Itens de Implementação da Tarefa 2.2.1 (`simulateSchedule(input: SimulationInput, applyExtras: boolean): SimulationSummary`):**
  - [x] Inicializar `balance = roundCurrency(input.loanAmount)`, `remainingMonths = input.totalMonths`, `monthlyRate = annualToMonthlyRate(input.annualInterestRate)`, `month = 1`.
  - [x] Configurar amortização inicial para `SAC` (`currentSacAmortization = roundCurrency(balance / remainingMonths)`) e prestação inicial para `PRICE` (`currentPriceInstallment = calculatePriceInstallment(balance, monthlyRate, remainingMonths)`).
  - [x] Implementar loop `while (balance > 0.009 && month <= input.totalMonths)` calculando juros, amortização regular e prestação base com ajuste de centavos na última parcela.
  - [x] Aplicar cálculo de aportes extras (`monthlyExtraPayment`, `lumpSumPayment` no `lumpSumMonth` e `recurringFgtsAmount` a cada 24 meses) limitado ao saldo devedor atual.
  - [x] Implementar recálculo pós-aporte para estratégia `'INSTALLMENT'` (reduz parcela mantendo prazo) e `'TERM'` (mantém parcela/amortização reduzindo prazo).
  - [x] Consolidar somatórios (`totalPaid`, `totalInterest`, `totalExtraPaid`, `actualMonths`, `monthsSaved`) e retornar `SimulationSummary`.

##### - [x] Tarefa 2.2.2: Implementar função fachada `runFullComparison(input: SimulationInput): ComparisonResult` em `src/lib/math/simulator.ts`
* **Itens de Implementação da Tarefa 2.2.2:**
  - [x] Executar `baseline = simulateSchedule(input, false)`.
  - [x] Executar `withExtras = simulateSchedule(input, true)`.
  - [x] Executar `alternateSystemBaseline = simulateSchedule({ ...input, system: input.system === 'SAC' ? 'PRICE' : 'SAC' }, false)`.
  - [x] Calcular `interestSaved` e `monthsSaved` e retornar `ComparisonResult`.

##### - [x] Tarefa 2.2.3: Criar Suíte de Testes Unitários em `src/lib/math/__tests__/simulator.test.ts`
* **Cenários de Teste Obrigatórios (Marcar cada teste após passar no Vitest):**
  - [x] **Teste 1 (SAC Base):** R$ 300.000, 360 meses, 9.5% a.a., sem extras -> Verificar se `actualMonths === 360`, se a amortização mensal constante é `R$ 833,33`, se o saldo final na parcela 360 é `R$ 0,00` e se a 1ª parcela é maior que a última.
  - [x] **Teste 2 (Price Base):** R$ 300.000, 360 meses, 9.5% a.a., sem extras -> Verificar se `actualMonths === 360`, se as prestações base são constantes, se o saldo final zera e se `price.totalInterest > sac.totalInterest`.
  - [x] **Teste 3 (Amortização Extra no Prazo - `TERM`):** R$ 300.000, 360 meses, 9.5% a.a., SAC, aporte mensal extra de R$ 1.000 -> Verificar se `withExtras.actualMonths < 180` e `interestSaved > 100000`.
  - [x] **Teste 4 (Amortização Extra na Parcela `INSTALLMENT` vs Prazo `TERM`):** Com os mesmos aportes extras, verificar se a estratégia `TERM` economiza mais juros que a estratégia `INSTALLMENT` (`resTerm.interestSaved > resInstallment.interestSaved`).
  - [x] **Teste 5 (Aporte Único FGTS maior que o saldo devedor):** Verificar que o saldo nunca fica negativo (`remainingBalance === 0`) e o financiamento encerra imediatamente no mês do aporte.

* - [x] **Critério de Aceite da Sprint 2:** Executar `npm run test` e obter 100% de aprovação em todos os 5 testes.

---

### - [x] SPRINT 3: Interface Interativa (Preact Islands) e Compartilhamento por URL

* **Objetivo da Sprint:** Construir a ilha interativa da calculadora em Preact (`client:load`), permitindo simulação instantânea em tempo real, gráfico SVG leve comparativo, tabela de evolução paginada e compartilhamento de link parametrizado.
* **Entregável Testável ao Final da Sprint:** Calculadora funcional na página inicial atualizando cards, gráfico e tabela em tempo real ao alterar qualquer campo, além de ler e gravar parâmetros na URL.

---

#### - [x] História 3.1: Serialização e Hidratação de Estado via Query Params (`urlParams.ts`)
> **Como** usuário, **quero** copiar um link com os dados exatos da minha simulação **para** enviar no WhatsApp ou salvar nos favoritos.

##### - [x] Tarefa 3.1.1: Implementar `src/lib/utils/urlParams.ts`
* **Itens de Implementação da Tarefa 3.1.1:**
  - [x] Definir `DEFAULT_SIMULATION_INPUT: SimulationInput` (`loanAmount: 300000`, `annualInterestRate: 9.5`, `totalMonths: 360`, `system: 'SAC'`, `monthlyExtraPayment: 500`, `lumpSumPayment: 0`, `lumpSumMonth: 12`, `recurringFgtsAmount: 0`, `reductionStrategy: 'TERM'`).
  - [x] Implementar `parseSimulationFromUrl(searchString: string, fallbackPreset?: Partial<SimulationInput>): SimulationInput` lendo chaves curtas (`v`, `t`, `m`, `s`, `em`, `lu`, `lm`, `fg`, `st`) com limites de segurança (clamping).
  - [x] Implementar `buildSimulationShareUrl(baseUrl: string, input: SimulationInput): string`.

---

#### - [x] História 3.2: Formulário Interativo, Cards de Resumo, Gráfico SVG e Tabela Paginada
> **Como** usuário, **quero** preencher os dados do financiamento e visualizar imediatamente o impacto em cards de destaque, gráfico comparativo e tabela mensal **para** tomar minha decisão financeira.

##### - [x] Tarefa 3.2.1: Implementar `src/components/calculator/InputForm.tsx`
* **Itens de Implementação da Tarefa 3.2.1:**
  - [x] Campo **Saldo Devedor / Valor Financiado (R$)** com botões rápidos de atalho (`R$ 200 mil`, `R$ 350 mil`, `R$ 500 mil`).
  - [x] Campo **Taxa de Juros Anual (% a.a.)** (`step="0.05"`).
  - [x] Campo **Prazo Restante (Meses)** (`min="1" max="420"`) exibindo o equivalente em anos.
  - [x] Seletor **Sistema de Amortização** (`Tabela SAC` vs `Tabela Price`).
  - [x] Seção **"Simular Amortizações Extras"**: seletor de estratégia (`Reduzir Prazo` vs `Reduzir Valor da Parcela`), `Aporte Extra Mensal Fixo (R$)`, `Aporte Único / FGTS Pontual (R$)` + `No Mês nº`, e `Usar FGTS a cada 2 anos (R$)`.

##### - [x] Tarefa 3.2.2: Implementar `src/components/calculator/ResultsSummary.tsx`
* **Itens de Implementação da Tarefa 3.2.2:**
  - [x] Renderizar os 4 Cards principais (Economia Total de Juros, Tempo Economizado, Total de Juros Pagos, Custo Efetivo Total Pago).
  - [x] Renderizar barra comparativa rápida SAC vs. Price usando `result.alternateSystemBaseline`.

##### - [x] Tarefa 3.2.3: Implementar `src/components/calculator/AmortizationChart.tsx` (Gráfico SVG Puro Zero-Dependência)
* **Itens de Implementação da Tarefa 3.2.3:**
  - [x] Renderizar `<svg viewBox="0 0 700 280" class="w-full h-auto overflow-visible" role="img" aria-label="Gráfico de evolução do saldo devedor">` com linhas de grade horizontais (0% a 100%).
  - [x] Desenhar curva cinza tracejada para `baseline` e curva verde sólida com área preenchida para `withExtras`, além de legenda clara.

##### - [x] Tarefa 3.2.4: Implementar `src/components/calculator/EvolutionTable.tsx`
* **Itens de Implementação da Tarefa 3.2.4:**
  - [x] Renderizar tabela com colunas `Mês`, `Prestação Base`, `Juros`, `Amortização Regular`, `Aporte Extra`, `Total Pago no Mês`, `Saldo Devedor`.
  - [x] Implementar paginação (`24` meses por página + opção `Ver Tudo`) e destaque verde suave nas linhas onde `extraAmortization > 0`.

##### - [x] Tarefa 3.2.5: Implementar `src/components/calculator/CalculatorContainer.tsx`
* **Itens de Implementação da Tarefa 3.2.5:**
  - [x] Gerenciar estado inicial com `DEFAULT_SIMULATION_INPUT` + `initialPreset` e hidratação via `parseSimulationFromUrl` no `useEffect`.
  - [x] Implementar botões **"Copiar Link desta Simulação"** (com feedback visual) e **"Imprimir / Salvar PDF"** (`window.print()`).
  - [x] Integrar `<InputForm />`, `<ResultsSummary />`, `<AmortizationChart />` e `<EvolutionTable />`.

* - [x] **Critério de Aceite da Sprint 3:** `npm run build` compila a ilha Preact sem erros de TypeScript e o bundle JS do cliente fica abaixo de `25 KB` gzipado.

---

### - [x] SPRINT 4: Páginas Temáticas de Cauda Longa (Estratégia "Tool + Guide" e FAQ Schema)

* **Objetivo da Sprint:** Construir as 4 páginas de destino (Landing Pages de SEO) combinando a calculadora pré-configurada no topo (*Above the Fold*) com guias técnicos densos, fórmulas explicadas, tabelas comparativas e FAQs estruturados logo abaixo (*Below the Fold*).
* **Entregável Testável ao Final da Sprint:** As 4 rotas principais (`/`, `/tabela-sac-vs-price`, `/amortizar-prazo-ou-parcela`, `/amortizar-com-fgts`) geradas estaticamente com conteúdo exclusivo de mais de 1.000 palavras e Schema JSON-LD válido em cada uma.

---

#### - [x] História 4.1: Componente de FAQ Estático e Conteúdo SEO das 4 Rotas de Ferramenta
> **Como** usuário vindo do Google, **quero** encontrar a calculadora já ajustada para minha dúvida específica e ler uma explicação confiável logo abaixo **para** entender a matemática por trás do resultado.

##### - [x] Tarefa 4.1.1: Implementar `src/components/common/FaqAccordion.astro`
* **Itens de Implementação da Tarefa 4.1.1:**
  - [x] Criar acordeão HTML nativo com `<details>` e `<summary>` sem JavaScript adicional.

##### - [x] Tarefa 4.1.2: Implementar Rota Principal `src/pages/index.astro`
* **Itens de Implementação da Tarefa 4.1.2:**
  - [x] Configurar SEO (`title`, `description`, `canonicalPath: '/'`).
  - [x] Incluir `<CalculatorContainer client:load />` e `<AdSlot slotId="mid-content-home" format="in-article" />`.
  - [x] Redigir guia completo em `<article>` (funcionamento da amortização, exemplo numérico prático, fórmulas SAC e Price, links internos).
  - [x] Incluir `<FaqAccordion items={homeFaqs} />` com mínimo de 6 perguntas integradas ao JSON-LD.

##### - [x] Tarefa 4.1.3: Implementar Rota `src/pages/tabela-sac-vs-price.astro`
* **Itens de Implementação da Tarefa 4.1.3:**
  - [x] Configurar SEO (`canonicalPath: '/tabela-sac-vs-price'`) e preset comparativo (`loanAmount: 350000`, `annualInterestRate: 9.8`, `totalMonths: 360`, `monthlyExtraPayment: 0`).
  - [x] Redigir artigo exclusivo com tabela HTML comparativa (SAC vs Price) e 5 FAQs específicos integrados ao JSON-LD.

##### - [x] Tarefa 4.1.4: Implementar Rota `src/pages/amortizar-prazo-ou-parcela.astro`
* **Itens de Implementação da Tarefa 4.1.4:**
  - [x] Configurar SEO (`canonicalPath: '/amortizar-prazo-ou-parcela'`) e preset (`loanAmount: 300000`, `annualInterestRate: 9.5`, `totalMonths: 360`, `monthlyExtraPayment: 800`, `reductionStrategy: 'TERM'`).
  - [x] Redigir artigo exclusivo sobre redução de prazo vs. parcela, estratégia híbrida (bola de neve) e 5 FAQs específicos integrados ao JSON-LD.

##### - [x] Tarefa 4.1.5: Implementar Rota `src/pages/amortizar-com-fgts.astro`
* **Itens de Implementação da Tarefa 4.1.5:**
  - [x] Configurar SEO (`canonicalPath: '/amortizar-com-fgts'`) e preset FGTS (`loanAmount: 280000`, `annualInterestRate: 9.0`, `lumpSumPayment: 25000`, `recurringFgtsAmount: 12000`, `highlightFgts: true`).
  - [x] Redigir artigo exclusivo com regras de uso do FGTS a cada 2 anos, passo a passo no banco e 5 FAQs específicos integrados ao JSON-LD.

* - [x] **Critério de Aceite da Sprint 4:** As 4 páginas compilam sem erros, possuem links cruzados entre si e cada uma gera metadados e Schema `FAQPage` próprios.

---

### - [x] SPRINT 5: Compliance Google AdSense, LGPD, Páginas Institucionais e Auditoria Final

* **Objetivo da Sprint:** Criar todas as páginas jurídicas e institucionais exigidas pelo Google AdSense, adicionar o aviso de consentimento de cookies compatível com a LGPD (sem provocar CLS) e realizar a validação final de produção.
* **Entregável Testável ao Final da Sprint:** Site 100% pronto para deploy no Cloudflare Pages e submissão imediata ao Google Search Console e Google AdSense.

---

#### - [x] História 5.1: Páginas Institucionais, Jurídicas e Consentimento LGPD
> **Como** revisor do Google AdSense, **quero** verificar páginas reais de Política de Privacidade (com menção a cookies DART/AdSense e LGPD), Termos de Uso, Sobre e Contato **para** aprovar a monetização do domínio.

##### - [x] Tarefa 5.1.1: Implementar `src/pages/politica-de-privacidade.astro`
* **Itens de Implementação da Tarefa 5.1.1:**
  - [x] Explicar processamento 100% client-side sem coleta de dados financeiros em servidor.
  - [x] Incluir cláusula de cookies de publicidade do Google AdSense com link para `https://adssettings.google.com`.
  - [x] Incluir seção de direitos do titular conforme a LGPD (Lei nº 13.709/2018).

##### - [x] Tarefa 5.1.2: Implementar `src/pages/termos-de-uso.astro`, `src/pages/sobre.astro` e `src/pages/contato.astro`
* **Itens de Implementação da Tarefa 5.1.2:**
  - [x] Criar `src/pages/termos-de-uso.astro` (caráter educativo, isenção sobre seguros MIP/DFI, taxas e TR/IPCA).
  - [x] Criar `src/pages/sobre.astro` (metodologia matemática oficial e objetivo do projeto).
  - [x] Criar `src/pages/contato.astro` (canal de contato institucional).

##### - [x] Tarefa 5.1.3: Implementar `src/components/common/CookieConsent.astro` e incluí-lo no `BaseLayout.astro`
* **Itens de Implementação da Tarefa 5.1.3:**
  - [x] Criar banner com posicionamento `fixed bottom-4 left-4 right-4 z-50` (CLS = 0) controlado por `localStorage.getItem('cookie_consent_accepted')`.
  - [x] Integrar `<CookieConsent />` no `src/layouts/BaseLayout.astro`.

---

#### - [x] História 5.2: Validação Final de Build, Testes e Checklist de Deploy no Cloudflare Pages
> **Como** engenheiro responsável pelo lançamento, **quero** validar todos os artefatos gerados em `dist/` **para** garantir que não existam links quebrados, erros de tipagem ou falhas de SEO.

##### - [x] Tarefa 5.2.1: Executar Bateria de Verificação Automatizada
* **Checklist Obrigatório de Testes e Artefatos:**
  - [x] `npm run test` executado com 100% dos testes unitários aprovados.
  - [x] `npm run build` executado com código de saída `0` (sem erros de compilação ou tipagem).
  - [x] Verificar geração de `dist/index.html`.
  - [x] Verificar geração de `dist/tabela-sac-vs-price/index.html`.
  - [x] Verificar geração de `dist/amortizar-prazo-ou-parcela/index.html`.
  - [x] Verificar geração de `dist/amortizar-com-fgts/index.html`.
  - [x] Verificar geração de `dist/politica-de-privacidade/index.html`.
  - [x] Verificar geração de `dist/termos-de-uso/index.html`.
  - [x] Verificar geração de `dist/sobre/index.html`.
  - [x] Verificar geração de `dist/contato/index.html`.
  - [x] Verificar geração de `dist/sitemap-index.xml` e `dist/sitemap-0.xml`.
  - [x] Verificar geração de `dist/robots.txt` e `dist/ads.txt`.

---

## 4. Guia de Deploy no Cloudflare Pages (Pós-Implementação)

- [ ] 1. Subir o repositório para o GitHub.
- [ ] 2. No painel do **Cloudflare Pages**, clicar em **Create a project > Connect to Git**.
- [ ] 3. Selecionar o repositório e configurar:
  * **Framework preset:** `Astro`
  * **Build command:** `npm run build`
  * **Build output directory:** `dist`
  * **Node.js version (Environment variable):** `NODE_VERSION = 20`
- [ ] 4. Vincular o domínio `.com.br` adquirido no Registro.br apontando os nameservers para a Cloudflare.
- [ ] 5. Substituir `https://calculadoraamortizacao.com.br` em `astro.config.mjs` e `public/robots.txt` pelo domínio definitivo registrado e atualizar o `pub-0000000000000000` em `public/ads.txt` com o ID de editor do Google AdSense.
