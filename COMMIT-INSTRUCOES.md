# 📦 Como subir as mudanças desta sessão

**Importante:** temos DOIS repositórios diferentes:

1. **Repo do frontend** (Netlify) — onde você está agora. Site que o cliente vê.
2. **Repo do backend** (Render) — outro projeto, separado. Servidor que envia emails e processa webhook Hotmart.

Por isso vamos fazer DOIS commits diferentes, em pastas diferentes.

---

## 🟦 PARTE 1 — Commit no FRONTEND (Netlify)

Esse é o repo que você está aqui (`EventCalc Pro v7/files`).

### Passo 1.1 — Abre o PowerShell na pasta certa

1. Aperta **Windows + R**
2. Digita `powershell` e Enter
3. Cola este comando e Enter:

```powershell
cd "C:\Users\jamju\OneDrive\Desktop\Claude code\EventCalc Pro v7\files"
```

### Passo 1.2 — Confere o que mudou (opcional, só pra você ver)

Cola e Enter:

```powershell
git status
```

Você vai ver uma lista de arquivos modificados e novos. Não precisa entender cada um — eu já organizei.

### Passo 1.3 — Adiciona TODOS os arquivos do frontend (menos os do backend)

Cola e Enter (são 3 linhas, cola tudo junto):

```powershell
git add 404.html CLAUDE.md acesso-premium.html api/send-email.js `
        event_calculator_pro_v7_cardapio.html event_calculator_pro_v7_cardapio_2b.html `
        event_calculator_pro_v7_proposta.html event_calculator_pro_v7_questionario.html `
        event_calculator_pro_v7_volumes.html event_calculator_pro_v7_volumes_3b.html `
        index_v7.html netlify.toml politica-privacidade.html termos-de-uso.html `
        biblioteca-cardapios-especiais.html mobile-fixes.css `
        AUDITORIA-FINAL-2026-06-14.md PATROCINADORES.md
```

### Passo 1.4 — Cria o commit com mensagem clara

Cola e Enter (é UM comando só, mesmo com várias linhas):

```powershell
git commit -m "feat: EventCalc 2.0 — biblioteca, mobile-first, segurança, depoimentos

- Nome novo em 10 arquivos: 'Orcamentos de Churrasco em Minutos'
- Biblioteca de Cardapios Especiais (restrita a assinantes, 4 perfis x 25 itens)
- Depoimentos placeholders honestos na landing
- Lapis pulsante + bloqueio obrigatorio antes da Proposta Cliente
- Mobile-first: novo mobile-fixes.css linkado em 12 telas
- Auditoria Dark Premium: zero vermelho na area do cliente
- Security: XSS fixes na Proposta e Questionario, codigos de teste escondidos em prod
- LGPD: modal adicionado em acesso-premium e biblioteca
- Netlify: bloqueio do admin-leads em producao"
```

### Passo 1.5 — Envia pra origem (faz o Netlify atualizar)

Cola e Enter:

```powershell
git push origin main
```

✅ **Pronto!** O Netlify vai detectar e fazer deploy automático em ~2 minutos. Você pode acompanhar em `app.netlify.com`.

---

## 🟧 PARTE 2 — Webhook no BACKEND (Render)

Os arquivos do webhook (`webhook-hotmart.js`, `webhook-hotmart.test.js`, `WEBHOOK-HOTMART-INSTRUCOES.md`) **NÃO** devem ficar no frontend — eles são código de servidor.

### Passo 2.1 — Copia os 3 arquivos pro repo do backend

Você tem o repo backend em algum lugar do seu PC? Aquele que faz deploy no Render?

➡️ **Me responde aqui na conversa:** "o backend fica em `C:\caminho\...`" pra eu te dar comandos pra copiar.

Enquanto isso, os arquivos estão prontos em:
```
C:\Users\jamju\OneDrive\Desktop\Claude code\EventCalc Pro v7\files\webhook-hotmart.js
C:\Users\jamju\OneDrive\Desktop\Claude code\EventCalc Pro v7\files\webhook-hotmart.test.js
C:\Users\jamju\OneDrive\Desktop\Claude code\EventCalc Pro v7\files\WEBHOOK-HOTMART-INSTRUCOES.md
```

### Passo 2.2 — Quando tiver o backend localizado:

Eu te dou comandos pra:
1. Copiar os 3 arquivos
2. Editar 2 linhas no `server.js`
3. Commit + push
4. Adicionar `HOTMART_HOTTOK` no painel Render

---

## 🚨 Se algo der errado

| Erro | O que fazer |
|---|---|
| `fatal: not a git repository` | Você está na pasta errada. Volta no Passo 1.1 |
| `Permission denied (publickey)` | Tem que configurar SSH ou usar HTTPS. Me chama. |
| `Updates were rejected` (push) | Alguém atualizou main antes. Roda `git pull origin main --rebase` e tenta o push de novo. |
| Netlify deploy falhou | Vai em `app.netlify.com` → seu site → Deploys → último deploy → vê o log. Cola aqui o erro. |
| Algo na tela do site quebrou em produção | Me chama com screenshot. Posso reverter com 1 comando. |

---

## ⏭️ Depois desses dois commits

Faltam só estes 3 passos operacionais (5 min cada):

1. **Painel Render** → adicionar variável `HOTMART_HOTTOK`
2. **Painel Hotmart** → cadastrar URL do webhook
3. **Teste com compra real** (cupom 99,99% off)

Quando chegar nessa fase, **me avisa que eu te guio passo-a-passo**.
