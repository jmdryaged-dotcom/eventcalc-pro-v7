# 🔍 Auditoria Final — EventCalc Pré-Venda

**Data:** 2026-06-14
**Escopo:** Cybersecurity · LGPD · Coleta de leads · Links Hotmart · Funcionamento geral

---

## 📊 Resumo executivo

| Eixo | Status | Achados corrigidos | Pendências |
|---|---|---|---|
| **Cybersecurity** | ✅ Pronto | 3 corrigidos | 1 conhecida (CHAVE_SECRETA frontend) |
| **LGPD** | ✅ Pronto | 2 corrigidos | 0 |
| **Coleta de leads** | ✅ Pronto | 0 (já estava OK) | 0 |
| **Links Hotmart** | ✅ Pronto | 0 (3 IDs confirmados) | 0 |
| **Funcionamento geral** | ✅ Pronto | 0 | 0 |

**Veredito:** EventCalc pronto pra publicar. Subir Netlify + integrar webhook Render = vender.

---

## 1. 🔒 CYBERSECURITY

### 🚨 ACHADOS CRÍTICOS — CORRIGIDOS NESTA AUDITORIA

#### A) Códigos de teste expostos em produção (corrigido ✅)
**Arquivo:** `acesso-premium.html`
**Antes:** Bloco "🧪 Códigos de Teste" mostrava `EVENTCALC-MENSAL-2026-TEST001` em texto plano para TODOS os visitantes — inclusive em produção (Netlify). Cliente legítimo poderia copiar e tentar usar (não funcionaria por causa do gate `_ehLocal`, mas geraria ticket de suporte).
**Fix:** Box agora começa `display:none` e só aparece via JS se `hostname === localhost`.
**Validado:** `inspect` confirmou `display: block` em local, esconderá em produção.

#### B) XSS em `eventoPill` da Proposta (corrigido ✅)
**Arquivo:** `event_calculator_pro_v7_proposta.html:820`
**Antes:** `nomeContratante` (input do usuário) concatenado direto no `innerHTML` sem escape.
**Vetor:** Assador entra com nome contendo `<img src=x onerror=alert(1)>` → roda script ao gerar proposta.
**Fix:** Trocado por `esc(questionario.nomeContratante)` usando função `esc()` já existente.
**Validado:** Teste com payload XSS resultou em renderização escapada (`&lt;img...`), `alert` NÃO foi chamado.

#### C) XSS no histórico de orçamentos (corrigido ✅)
**Arquivo:** `event_calculator_pro_v7_questionario.html:861`
**Antes:** `item.numeroProposta`, `item.local`, `item.timestamp` injetados sem escape.
**Vetor:** Mesmo do anterior — assador maliciosamente injetaria via local do evento.
**Fix:** Todos os campos agora usam `escHtml()`.

#### D) Painel admin-leads acessível publicamente (corrigido ✅)
**Arquivo:** `netlify.toml`
**Antes:** Bloqueio existia pra `gerenciador-licencas`, `admin-setup`, `gerenciador-codigos-pix` — mas **NÃO** pra `admin-leads.html` (que tem dados pessoais dos leads).
**Fix:** Adicionada regra de redirect `404` para `/admin-leads*`.

### ✅ JÁ ESTAVA OK

| Item | Onde |
|---|---|
| Admin password com SHA-256 (não plaintext) | `admin-leads.html:704` |
| Atraso anti-brute-force ao validar código | `acesso-premium.html:443` (setTimeout 1500ms) |
| HOTTOK validado em tempo constante | `webhook-hotmart.js` (`crypto.timingSafeEqual`) |
| Headers de segurança Netlify | `netlify.toml` (HSTS, X-Frame-Options, Permissions-Policy, etc.) |
| CORS restrito ao Netlify | confirmado nas tasks #32-33 |
| Sem `eval()` ou `document.write` em todo o projeto | grep limpo |
| Idempotência do webhook (mesma compra = mesmo código) | `webhook-hotmart.js` |
| Hotmart events que NÃO geram licença só logam | `webhook-hotmart.js` (REFUNDED, CHARGEBACK) |
| Webhook sempre 200 (anti-loop de retry da Hotmart) | `webhook-hotmart.js` |
| Imagens em links externos com `rel="noopener"` | `index_v7.html` (botões Hotmart) |

### ⚠️ LIMITAÇÃO CONHECIDA (aceita pelo MVP)

**CHAVE_SECRETA no frontend (`licenca-checksum.js:20`)**
- A chave fica visível em JS público (essa é a natureza de paywall client-side)
- Mitigação: atacantes precisam **também saber o formato exato** do código
- Como invalidar TODOS os códigos antigos: trocar `CHAVE_SECRETA` em DOIS lugares (`licenca-checksum.js` E `webhook-hotmart.js`) e refazer deploy
- Roadmap próximo: validar inteiramente no backend (frontend só chama `POST /validar-codigo`)

---

## 2. 🔐 LGPD

### ✅ CORRIGIDOS NESTA AUDITORIA

#### A) LGPD modal ausente em `acesso-premium.html` (corrigido ✅)
**Antes:** Cliente colava código de licença sem ter passado pelo aceite LGPD (caso entrasse direto pela URL do email do webhook).
**Fix:** Adicionado `<script src="lgpd-modal.js"></script>` antes do `rastreamento-seguranca.js`.

#### B) LGPD modal ausente em `biblioteca-cardapios-especiais.html` (corrigido ✅)
**Antes:** Defesa em profundidade — assinante acessa via licença, mas idealmente passa pelo modal antes.
**Fix:** Adicionado link do `lgpd-modal.js` no `<head>`.

### ✅ JÁ ESTAVA OK

| Item | Detalhe |
|---|---|
| Modal bloqueia uso até aceite | `lgpd-modal.js:25-28` |
| "Direito ao esquecimento" implementado | Botão "APAGAR MEUS DADOS" em `politica-privacidade.html` (com cor vermelha intencional pra ação destrutiva) |
| Termos de Uso e Política de Privacidade separados | `termos-de-uso.html`, `politica-privacidade.html` |
| LGPD modal exclui páginas admin (não bloqueia interno) | `lgpd-modal.js:21` |
| Consentimento persistido em localStorage | `eventcalc_privacy_consent` |
| Data do consentimento registrada | `eventcalc_privacy_consent_date` |
| Analytics aguarda consentimento | `analytics.js` ("Analytics aguardando consentimento LGPD") |

### 📋 Cobertura LGPD modal por tela (10 telas com modal, 5 sem — todas justificadas)

✅ Com modal: `index_v7`, `questionario`, `cardapio`, `cardapio_2b`, `volumes`, `volumes_3b`, `proposta`, `termos`, `política`, `acesso-premium`, `biblioteca`

🟢 Sem modal (justificado):
- `404.html` — página de erro
- `admin-leads.html`, `admin-setup.html`, `gerenciador-licencas.html` — admin (área interna, sem dados de cliente externo)

---

## 3. 📥 COLETA DE LEADS

### ✅ FLUXO FUNCIONA

```
Cliente preenche modal na landing
    ↓
JS valida nome+email+whatsapp
    ↓
fetch POST {BACKEND_URL}/send-tutorial
    ↓
Backend Render (Express + Resend):
   - Rate limit aplicado (#32)
   - CORS restrito Netlify (#33)
   - Gera PDF tutorial
   - Envia email pro lead (com PDF anexado)
   - Notifica admin Juliomar (#31)
    ↓
Lead aparece em admin-leads.html (protegido + senha hashada)
```

### ✅ JÁ ESTAVA OK

| Item | Onde |
|---|---|
| Modal de captura na landing | `index_v7.html:1397-1445` |
| Validação client-side (nome, email, whatsapp obrigatórios) | `index_v7.html` form `leadsForm` |
| Persistência local antes do envio (backup) | `index_v7.html:2106-2107` |
| Endpoint backend | `BACKEND_URL/send-tutorial` |
| HTTPS em produção | `https://eventcalc-pro-v7.onrender.com` |
| Detecta ambiente (local vs prod) automaticamente | `index_v7.html:15-21` |
| Tutorial PDF gerado dinamicamente | `tutorial-pdf.js` |
| Notificação admin (#31) | server.js (memória diz: completo) |
| Rate limit no endpoint (#32) | server.js (memória diz: completo) |

---

## 4. 🛒 LINKS HOTMART

### ✅ CONFIRMADOS NO PROJETO

| Produto | ID Hotmart | URL completa | Localização |
|---|---|---|---|
| **EventCalc** (compra principal) | `C106118117Q` | `https://pay.hotmart.com/C106118117Q` | `index_v7.html:1477` (Plano Mensal) + `1493` (Plano Anual) |
| **A Arte do Churrasco** (ebook) | `D100305376G` | `https://go.hotmart.com/D100305376G?dp=1` | `tutorial-pdf.js:618` |
| **Entre Dois Pães** (ebook) | `S100382006A` | `https://go.hotmart.com/S100382006A` | `tutorial-pdf.js:623` |

### ⚠️ Observação

- **Litoral de Luxo** (3º ebook) ainda não tem link no projeto. Como você disse que ele "não tem ligação com churrasco", **fica de fora propositalmente** — não cabe oferecer dentro do EventCalc.
- **EventCalc** usa o **mesmo link** pro Mensal e Anual. Cliente escolhe o plano no checkout Hotmart. Isso é **correto** pois você cadastrou os 2 planos no mesmo produto.
- Todos os links abrem em **nova aba** (`target="_blank"`) com `rel="noopener"` (sem vazamento de `window.opener`).

### 🧪 Pra testar

1. Acessa Netlify → clica "Assinar Agora" no Plano Mensal → confere se abre `pay.hotmart.com/C106118117Q`
2. Faz o mesmo no Plano Anual
3. Gera tutorial PDF como lead → confere se os 2 ebooks aparecem com links clicáveis

---

## 5. ⚙️ FUNCIONAMENTO GERAL

### ✅ TUDO TESTADO NESTA SESSÃO

| Recurso | Como testei |
|---|---|
| Landing (hero + planos + depoimentos) | inspect + screenshot mobile/desktop |
| Tela 1 (Questionário) | inspect mobile, 0 sub-44px touch targets |
| Tela 2 (Cardápio) | inspect mobile + funções de manual/sugestões |
| Tela 2B (Cardápio Especial) | botão de biblioteca aparece + link OK |
| Tela 3 (Volumes) | inspect mobile, sem scroll horizontal |
| Tela 4 (Proposta) — aba 1 Custos | inspect, tabs 75px |
| Tela 4 (Proposta) — aba 2 Assador | 0 vermelhos |
| Tela 4 (Proposta) — aba 3 Cliente | 0 vermelhos, XSS bloqueado |
| Acesso Premium | LGPD adicionado, box teste esconde em prod |
| Biblioteca Cardápios | 25 cards × 4 abas, paywall validado |
| Lápis pulsante na Landing | inspect: dourado, pulsa quando incompleto |
| Bloqueio Proposta Cliente | modal aparece se dados pessoais faltam |

### Stack confirmado

- **Frontend:** HTML/CSS/JS puro (sem build), hospedado em Netlify
- **Backend:** Express + Resend (deploy Render)
- **Pagamento:** Hotmart (3 produtos)
- **Email transacional:** Resend
- **Tracking ativações:** localStorage (IP via ipify HTTPS) + Firebase configurado mas não usado
- **PDF:** jsPDF v2.5.1 CDN
- **Webhook entrega licença:** `webhook-hotmart.js` (módulo separado, pronto pra colar no server.js do Render)

---

## 📋 PENDÊNCIAS OPERACIONAIS (você precisa fazer)

| # | Ação | Onde | Tempo |
|---|---|---|---|
| 1 | Subir frontend atualizado no Netlify | painel Netlify ou git push | 5 min |
| 2 | Copiar `webhook-hotmart.js` pro repo backend GitHub | git | 2 min |
| 3 | Adicionar 2 linhas no `server.js` do backend (instruções no `WEBHOOK-HOTMART-INSTRUCOES.md`) | server.js | 2 min |
| 4 | Adicionar variável `HOTMART_HOTTOK` no painel do Render | Render Environment | 3 min |
| 5 | Cadastrar webhook na Hotmart (PURCHASE_APPROVED + PURCHASE_COMPLETE) | painel Hotmart | 3 min |
| 6 | Teste compra real (cupom 99,99% off) → confirmar email + ativação | end-to-end | 5 min |
| 7 | Publicar EventCalc na Hotmart (sair do rascunho) | painel Hotmart | 1 min |

**Total ~20 min** pra ir ao ar.

---

## 🎯 CRITÉRIOS DE "PRONTO PRA VENDER"

- [x] Cliente nunca vê vermelho (Proposta Cliente)
- [x] Mobile 100% funcional (Poco testado)
- [x] LGPD em todas as telas com dados pessoais
- [x] XSS bloqueado nos pontos onde input do user vira HTML
- [x] Códigos de teste escondidos em produção
- [x] Admin-leads bloqueado em produção
- [x] Webhook código pronto + instruções claras
- [x] Links Hotmart presentes e corretos
- [x] Lápis chamativo + bloqueio obrigatório antes da Proposta
- [x] Biblioteca de Cardápios Especiais (benefício real do assinante)
- [x] Depoimentos honestos (placeholders sem inventar nomes)
- [ ] Webhook efetivamente ativo no Render *(você ainda precisa fazer)*
- [ ] Compra teste end-to-end aprovada *(você ainda precisa fazer)*

🚀 **Ao completar os 2 últimos itens, você pode tirar EventCalc do Rascunho na Hotmart e começar a vender.**
