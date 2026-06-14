# 🔔 Webhook Hotmart — Como Integrar

Este documento mostra **exatamente** como colocar o webhook no ar.
Tempo estimado: **20-30 minutos** (a maior parte é configurar variáveis).

---

## 1. Adicionar 1 variável de ambiente no Render

1. Acessa o **dashboard do Render** (https://dashboard.render.com)
2. Abre o serviço **eventcalc-pro-v7**
3. Menu lateral → **Environment**
4. Clica **Add Environment Variable**:
   - **Key:** `HOTMART_HOTTOK`
   - **Value:** *(o token que você ainda NÃO clicou em "Mostrar" — vai precisar agora)*
5. **Save changes** → Render faz redeploy automático (~2 min)

### Como pegar o HOTTOK na Hotmart

1. Abre a Hotmart → **Ferramentas → Webhook → aba Autenticação**
2. Clica **Mostrar hottok**
3. Copia (não compartilha em chat/screenshot)
4. Cola no campo do Render
5. Fecha a aba — não precisa ver de novo

---

## 2. Adicionar 2 linhas no seu `server.js` do Render

No seu repo do GitHub do backend (`eventcalc-pro-v7`), edita o `server.js`:

### a) No topo, junto com os outros `require`:

```js
const webhookHotmart = require('./webhook-hotmart');
```

### b) Onde estão suas rotas (depois do `app.use(express.json())`):

```js
app.post(
    '/webhook/hotmart',
    express.json(),
    webhookHotmart.makeHandler({ resend })
);
```

> ⚠️ Importante: `resend` é o **client já inicializado** do seu server.js (algo como `const resend = new Resend(process.env.RESEND_API_KEY)`).
> O webhook recebe ele por injeção pra evitar duplicar configuração.

### c) Copia `webhook-hotmart.js` pra raiz do repo backend e faz commit.

---

## 3. Cadastrar o webhook na Hotmart

1. Hotmart → **Ferramentas → Webhook → aba Minhas configurações**
2. **+ Cadastrar Webhook**
3. Preenche:
   - **Nome:** `EventCalc - Produção`
   - **URL:** `https://eventcalc-pro-v7.onrender.com/webhook/hotmart`
   - **Versão da API:** `2.0.0`
   - **Produto:** EventCalc — Orçamentos de Churrasco em Minutos
   - **Eventos:** marca **PURCHASE_APPROVED** e **PURCHASE_COMPLETE** (mínimo)
4. **Salvar**

---

## 4. Testar com a compra de 99,99% que você já fez

Você ainda tem o cupom de teste? Se sim:

1. Faz uma compra teste (R$ 0,01)
2. Acompanha os logs do Render:
   - `[hotmart-webhook] Evento recebido: PURCHASE_APPROVED | comprador: ...`
   - `[hotmart-webhook] ✅ Código gerado e enviado | ... | mensal | EVENTCALC-MENSAL-***`
3. Verifica seu email → deve chegar o "Bem-vindo + código"
4. Acessa `acesso-premium.html`, cola o código → deve ativar

Se der erro, os logs do Render mostram exatamente onde.

---

## 5. O que NÃO precisa fazer

- ❌ **Não precisa Firebase** — caminho C, sem banco de dados
- ❌ **Não precisa SendGrid** — usa o Resend que já está no Render
- ❌ **Não precisa mudar `licenca-checksum.js`** — backend e frontend usam o **mesmo algoritmo SHA-256 com a mesma chave**, então código gerado no backend valida no frontend automaticamente

---

## 🔒 Sobre segurança

- **HOTTOK** validado em **tempo constante** (`crypto.timingSafeEqual`) → imune a timing attack
- **Erros sempre retornam 200** pra Hotmart não reenviar em loop → bugs nossos não viram dor de cabeça operacional
- **Idempotente:** mesma compra (mesmo `transaction`) → mesmo código. Se Hotmart reenviar webhook por algum motivo, cliente recebe o mesmo código (não duplica)
- **CHAVE_SECRETA** vive no código (não em env) porque ela tem que existir em DOIS lugares (backend + frontend `licenca-checksum.js`). Se vazasse, o invasor precisaria também saber o formato exato — risco médio. Para fortalecer no futuro: mover validação inteiramente pro backend (frontend só chama uma API `/validar-codigo`).

---

## 🆘 Se algo der errado

1. **Email não chega:** confere logs Render. Se aparecer `RESEND_API_KEY ausente`, é problema do env var (não do webhook).
2. **Hotmart retorna erro 401:** HOTTOK no Render diferente do da Hotmart. Confere os 2.
3. **Hotmart retorna timeout:** seu server.js Free do Render pode estar "dormindo". O webhook leva ~10s pra acordar. A Hotmart tenta de novo automaticamente em alguns minutos.
4. **Código não ativa no `acesso-premium.html`:** abre o console do navegador (F12). Vai aparecer `❌ Checksum inválido` se a `CHAVE_SECRETA` divergir entre backend e frontend.

---

## 📊 Arquivos envolvidos

| Arquivo | Onde mora | Função |
|---|---|---|
| `webhook-hotmart.js` | Backend Render | Handler do webhook (criado por mim) |
| `server.js` | Backend Render | Você adiciona 2 linhas (montagem da rota) |
| `licenca-checksum.js` | Frontend Netlify | Já existe, valida o código no navegador |
| `acesso-premium.html` | Frontend Netlify | Tela onde cliente cola o código |
| Var `HOTMART_HOTTOK` | Render env | Token de validação |
| Var `RESEND_API_KEY` | Render env | Já existe, não mexer |
