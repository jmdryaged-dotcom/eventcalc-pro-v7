# 💰 Plano de Monetização via Patrocinadores — EventCalc

**Status:** 📦 Planejamento (não implementar visualmente até atingir métricas de tráfego)
**Última atualização:** 2026-06-13
**Decisão estratégica:** começamos a abordar patrocinadores após 3 meses de operação com tráfego comprovado. Antes disso, banner vazio = falta de credibilidade.

---

## 🎯 Por que esperar 3 meses

Patrocinador não compra "esperança" — compra **alcance comprovado**. Sem dados de Analytics (GA4 já instalado) mostrando:

- Sessões/mês mínimas: **3.000+**
- Profissionais ativos (assinantes): **50+**
- Tempo médio na página: **2 min+**
- Origem geográfica: relevante pro patrocinador (ex: SC pra patrocinador local)

…qualquer proposta comercial será fraca. **Antes desse marco, manter foco em vender o EventCalc.**

---

## 🎁 Modelos de patrocínio propostos

### Modelo A — **Banner "Apoiadores Oficiais"** (footer da landing)

Grid de 3-6 logos pequenos no rodapé da landing.

- **Formato:** "Apoiado por: [Logo Açougue X] [Logo Carvoaria Y] [Logo Distribuidora Z]"
- **Pricing sugerido:** R$ 200-500/mês por logo (12 meses = R$ 2.400-6.000/ano por patrocinador)
- **Capacidade:** 6 slots × R$ 350 médio = **R$ 2.100/mês de receita passiva**
- **Pros:** baixo atrito visual, fácil de vender, presença discreta
- **Contras:** menor exposição individual = menor valor percebido

### Modelo B — **Banner Premium Rotativo (topo)**

1 banner grande no topo da landing, rotativo entre 2-3 patrocinadores.

- **Formato:** Hero secundário acima do fold ou abaixo do hero principal
- **Pricing sugerido:** R$ 1.000-3.000/mês por patrocinador
- **Capacidade:** 3 slots × R$ 1.500 médio = **R$ 4.500/mês**
- **Pros:** alta exposição, atrai marcas grandes
- **Contras:** pode competir com CTA principal de venda do EventCalc; precisa rotacionar

### Modelo C — **Fornecedores Recomendados** (página dedicada)

Lista curada de açougues/carvoarias/distribuidoras por região.

- **Formato:** página interna "/fornecedores-recomendados" com cards por estado
- **Pricing sugerido:** R$ 150/mês fixo + R$ 5 por click (afiliados estilo CPC)
- **Capacidade:** 30+ fornecedores × R$ 200 médio = **R$ 6.000/mês**
- **Pros:** valor real pro usuário (lista útil), escala bem por região, baixa fricção visual
- **Contras:** precisa gerenciar lista, garantir qualidade

### Modelo D (futuro, requer escala) — **Pacote anual com clusters de marcas**

Vender pacote anual integrado: logo no footer + um banner rotativo + 1 menção em email mensal + post nas redes sociais.

- **Pricing sugerido:** R$ 8.000-15.000/ano por marca
- **Pros:** ticket alto, relacionamento longo
- **Contras:** só funciona com 5.000+ leads/mês

---

## 🎯 Segmentos-alvo de patrocinadores

### Prioritários (alta sinergia com pitmaster)

1. **Açougues premium / boutiques de carne**
   - Casa de carnes regionais (SC, RS, PR primeiro)
   - Dry-aged especialistas
   - Marketplaces de carne (Carnes Online, Wessel, etc.)

2. **Carvoarias / lenha**
   - Carvão de baixa umidade
   - Lenha de eucalipto premium
   - Briquete de coco / produtos especiais

3. **Distribuidoras de bebida**
   - Cervejarias artesanais regionais
   - Importadoras de vinho
   - Distribuidoras de destilados

4. **Equipamentos de churrasco**
   - Fabricantes de churrasqueiras (Weber, Brastemp, regionais)
   - Facas profissionais
   - Termômetros e gadgets

### Secundários (sinergia média)

5. **Buffets / serviços de catering**
6. **Embalagens descartáveis premium**
7. **Eventos e festivais gastronômicos**
8. **Cursos online de gastronomia**

### Evitar

- Marcas conflitantes com ebooks do Juliomar (cursos concorrentes)
- Produtos de baixa qualidade que afetam reputação
- Empresas com problemas regulatórios (Procon, etc.)

---

## 📋 Template de proposta comercial

```
Olá [NOME DA EMPRESA],

Sou Juliomar Meskiu, criador do EventCalc — a calculadora profissional para
pitmasters, churrasqueiros e empresas de eventos que faturou [VALOR] em
[PERÍODO] desde o lançamento.

Acreditamos que o público do EventCalc — profissionais que compram carnes,
carvão e bebidas semanalmente para eventos — tem alta sinergia com a [MARCA].

Atualmente entregamos:
- [X.XXX] sessões/mês na landing
- [Y] profissionais ativos como assinantes
- [Z%] dos usuários em [REGIÃO ALVO DA MARCA]

Nossos modelos de parceria começam em R$ [VALOR]/mês e incluem:
- Logo permanente no rodapé da landing
- Menção em [N] emails mensais aos assinantes
- [OUTROS BENEFÍCIOS]

Posso enviar um deck completo com métricas e formatos disponíveis?

Abraço,
Juliomar Meskiu
+55 47 99668-1010
jm.dryaged@gmail.com
```

---

## 🛠️ Reservas técnicas no código (a fazer SÓ quando ativar)

Quando for ativar o Modelo A (footer), bastará:

1. **CSS:** já temos `.footer-apoiadores` reservado (não precisa criar — adicionamos no momento)
2. **HTML:** inserir bloco antes do `<footer>` da landing, com `style="display:none"` inicial e ativar via flag
3. **localStorage flag (opcional):** `eventcalc_patrocinadores_ativos = 'true'` pra controlar exibição sem rebuild

Não vou reservar espaço no HTML agora — sem patrocinador, fica "buraco" visual.

---

## 📊 Marcos para reavaliar este documento

- **+90 dias após lançamento:** rever métricas de Analytics e decidir se entra fase de prospecção
- **+180 dias:** se atingir 3.000 sessões/mês, começar a abordar 5 patrocinadores-piloto
- **+12 meses:** reavaliar pricing com base na concorrência (sites comparáveis)

---

## 🚫 Princípios não-negociáveis

1. **Patrocínio não pode interferir no produto principal.** EventCalc continua sendo a calculadora — patrocinadores são suporte financeiro, não eixo do negócio.
2. **Sem patrocínio que conflite com a credibilidade do Juliomar (Pitmaster).** Marcas amadoras ou de baixa qualidade comprometem a reputação.
3. **Sempre destacar:** "Apoiadores oficiais" ou "Parceiros recomendados" — nunca disfarçar de conteúdo editorial.
4. **Contratos sempre por escrito.** Mesmo em testes, formalizar para evitar problemas.
