# EventCalc Pro v7

EventCalc — Orçamentos de Churrasco em Minutos. Calculadora web profissional para pitmasters/churrasqueiros/empresas de eventos. Projeto profissional do Juliomar (Vet/Pitmaster, Itapema/SC).

## Stack
- HTML5 + CSS3 + Vanilla JS (sem framework, sem build)
- `localStorage` para persistir estado entre telas
- jsPDF v2.5.1 (CDN cdnjs) para geração de PDFs
- Fontes: Playfair Display (headings) + Lora (body)

## Paleta
- BG escuro: `#0a0a0a`
- Card escuro: `#242424`
- Dourado: `#d4af37`
- Vermelho: `#c41e3a`
- Vermelho escuro: `#8b1428`

## Fluxo de telas
`ABRA_AQUI_v7.html` → `index_v7.html` (landing) → questionário (T1) → cardápio (T2) → volumes (T3) → proposta (T5, 3 abas: Custos / Relatório Assador / Proposta Cliente).
Tela 4 (Consumo) ainda não existe — opcional.

## Arquivos
- `ABRA_AQUI_v7.html` — redirect
- `index_v7.html` — landing
- `event_calculator_pro_v7_questionario.html` — T1
- `event_calculator_pro_v7_cardapio.html` — T2
- `event_calculator_pro_v7_volumes.html` — T3
- `event_calculator_pro_v7_proposta.html` — T5

## Chaves localStorage
- `eventocalcData` → `{ questionario: { local, data, horario, duracao, refeicao, adultos, criancas, equipamentos, tipoCardapio, cortes, veganos, vegetarianos, volumes } }`
- `eventocalc_cardapio` → `{ aperitivo, proteina, carboidrato, salada, sobremesa }` (arrays)
- `eventocalc_volumes` → `[{ nome, kg, preco, perda }, ...]`

## Defaults de gramagem (g/pessoa)
| Refeição | Aperitivo | Proteína | Carbo | Salada | Sobremesa |
|----------|-----------|----------|-------|--------|-----------|
| café     | 100       | 150      | 200   | 0      | 50        |
| almoço   | 120       | 450      | 200   | 100    | 100       |
| lanche   | 200       | 300      | 0     | 0      | 50        |
| jantar   | 150       | 500      | 200   | 150    | 100       |

## Regras de UI/UX
- **Tela 5, abas 2 (Relatório Assador) e 3 (Proposta Cliente): NUNCA usar texto vermelho.** Para destaques, usar dourado `#d4af37`. Vermelho é permitido só na aba 1 (Custos) para alertas/negativos.
- Antes de editar, **ler o HTML real** — o que está no código pode divergir de specs antigos.
- Idioma: pt-BR.

## Comunicação
- pt-BR, tom calmo, explicar o "porquê" antes do "como".
