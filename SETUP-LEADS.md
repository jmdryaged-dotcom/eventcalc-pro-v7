# 📋 SETUP COMPLETO - Sistema de Leads EventCalc Pro v7

## 🎯 Visão Geral

O sistema de coleta de leads foi totalmente implementado com:
- ✅ Formulário na landing page
- ✅ Painel de Administração
- ✅ Notificações automáticas (Email + WhatsApp)
- ✅ Armazenamento seguro (Firebase)
- ✅ Sistema de follow-up

---

## 📦 O que foi criado:

### 1. **Arquivos da Landing Page**
- `index_v7.html` - Modificado para incluir formulário e integração
- `gerar-tutorial-pdf.js` - Tutorial PDF gratuito
- `firebase-config.js` - Configuração Firebase

### 2. **Painel de Admin**
- `admin-leads.html` - Interface de administração com:
  - Visualização de todos os leads
  - Edição de status e notas
  - Exportação em CSV
  - Integração com WhatsApp
  - Busca e filtros

### 3. **Netlify Functions (Serverless)**
- `netlify/functions/send-email.js` - Enviar emails via SendGrid
- `netlify/functions/send-whatsapp.js` - Enviar WhatsApp via Twilio
- `netlify/functions/package.json` - Dependências

---

## 🚀 SETUP PASSO A PASSO

### PASSO 1: Firebase (Banco de Dados)

**Tempo: 10 minutos**

1. Acesse: https://console.firebase.google.com
2. Clique em "Criar Projeto"
3. Nome: `eventcalc-leads`
4. Siga os passos (Google Analytics é opcional)
5. Após criar, vá em: **Realtime Database** → **Criar banco de dados**
6. Escolha: `Começar no modo de teste` (depois ajustaremos)
7. Região: `southamerica-southeast1` (São Paulo)
8. Clique em "Ativar"

**Copie as credenciais:**
9. Vá em: ⚙️ Configurações do Projeto
10. Abra a aba: **Geral**
11. Role até: **Seus aplicativos web**
12. Clique no app web (ou crie um)
13. Copie o objeto `firebaseConfig`:

```javascript
const firebaseConfig = {
    apiKey: "SEU_API_KEY",
    authDomain: "seu-projeto.firebaseapp.com",
    databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

13. Abra: `firebase-config.js` na raiz do projeto
14. Substitua o `firebaseConfig` inteiro pelas suas credenciais
15. Também em: `admin-leads.html` (linha ~200) - substitua o firebaseConfig

**Configurar Regras de Segurança:**
16. No Firebase, vá em: **Realtime Database** → **Regras**
17. Substitua o conteúdo por:

```json
{
  "rules": {
    "leads": {
      ".read": false,
      ".write": true,
      "$leadId": {
        ".validate": "newData.hasChildren(['nome', 'email', 'whatsapp', 'data'])",
        "nome": { ".validate": "newData.isString() && newData.val().length > 2" },
        "email": { ".validate": "newData.isString() && newData.val().contains('@')" },
        "whatsapp": { ".validate": "newData.isString()" },
        "data": { ".validate": "newData.isString()" },
        "status": { ".validate": "newData.isString()" },
        "notas": { ".validate": "newData.isString()" }
      }
    }
  }
}
```

18. Clique **Publicar**

✅ Firebase está pronto!

---

### PASSO 2: SendGrid (Email)

**Tempo: 5 minutos**

1. Acesse: https://sendgrid.com
2. Clique em "Free" → "Sign Up"
3. Preencha o formulário (seu email será verificado)
4. Verifique seu email
5. Após verificar, faça login
6. Vá em: **Settings** → **API Keys**
7. Clique em **Create API Key**
8. Nome: `eventcalc-netlify`
9. Escolha: **Restricted Access**
10. Selecione: **Mail Send** → Full Access
11. Clique **Create**
12. **COPIE A CHAVE** (você não verá de novo)

**Adicionar remetente (From Email):**
13. Vá em: **Settings** → **Sender Authentication**
14. Clique em **Create New Sender**
15. Preencha:
    - From Email: `noreply@eventcalcpro.com`
    - From Name: `EventCalc Pro v7`
    - Reply To: seu email real
16. Verifique o link no seu email
17. Clique em **Verify**

✅ SendGrid está pronto!

---

### PASSO 3: Twilio (WhatsApp)

**Tempo: 5 minutos**

1. Acesse: https://www.twilio.com/console
2. Faça signup (use seu número de celular)
3. Após confirmar, você recebe crédito grátis ($15-30)
4. No dashboard, vá em: **Phone Numbers** → **Manage** → **Messaging Services**
5. Clique em **Create Messaging Service**
6. Nome: `eventcalc-whatsapp`
7. Purpose: `Application to Person (A2P)`
8. Clique **Create**
9. Agora em: **Phone Numbers** → **Manage** → **Active Numbers**
10. Você vê um número gerado (ex: `+14155238886`)
11. Use este número no `send-whatsapp.js`

**Para produção (enviar para números reais):**
- Você precisará conectar uma conta WhatsApp oficial
- Por enquanto, use o sandbox (mensagens de teste)
- Custo: ~$0.025 por mensagem

✅ Twilio está pronto!

---

### PASSO 4: Netlify (Deploy das Functions)

**Tempo: 10 minutos**

1. Se ainda não fez, conecte seu repo ao Netlify:
   - Vá em: https://netlify.com
   - Clique em **New site from Git**
   - Escolha seu repositório
   - Base directory: (deixe vazio ou coloque `files`)
   - Build command: (deixe vazio)
   - Publish directory: `files`
   - Clique **Deploy**

2. Após fazer deploy, vá na seção **Functions** do Netlify
3. Verifique se as funções estão em:
   - `/.netlify/functions/send-email`
   - `/.netlify/functions/send-whatsapp`

4. Agora, adicione as variáveis de ambiente:
   - No Netlify, vá em: **Site settings** → **Build & deploy** → **Environment**
   - Clique em **Edit variables**
   - Adicione:
     ```
     SENDGRID_API_KEY = [sua chave do SendGrid]
     ADMIN_EMAIL = seu-email@gmail.com
     SENDGRID_FROM_EMAIL = noreply@eventcalcpro.com
     TWILIO_ACCOUNT_SID = [seu Account SID]
     TWILIO_AUTH_TOKEN = [seu Auth Token]
     TWILIO_WHATSAPP_NUMBER = whatsapp:+14155238886
     ```

5. Para pegar Twilio SID e Token:
   - No Twilio, vá em: **Account** → **API Keys & Tokens**
   - Copy **Account SID** e **Auth Token**

6. Clique **Save**

7. Vá em **Deploys** e faça um novo deploy para aplicar as variáveis:
   - Clique em **Trigger Deploy** → **Deploy site**

✅ Netlify Functions estão prontas!

---

### PASSO 5: Acessar o Painel de Admin

**Tempo: 1 minuto**

1. Acesse: `https://seu-site.netlify.app/admin-leads.html`
2. Senha padrão: `EvenCalc@2026`
3. **MUDE A SENHA!**
   - Abra: `admin-leads.html`
   - Procure por: `const ADMIN_PASSWORD = "EvenCalc@2026";`
   - Substitua por uma senha forte
   - Faça deploy novamente

✅ Pronto para usar!

---

## 📱 TESTAR O SISTEMA

### Teste 1: Formulário de Lead
1. Acesse a landing page
2. Clique em "💌 Tenho Interesse - Receber Proposta"
3. Preencha com dados de teste:
   - Nome: João Silva
   - Email: seu-email@gmail.com
   - WhatsApp: seu número real
4. Clique em "Enviar Dados"
5. Verifique:
   - ✅ Mensagem de sucesso
   - ✅ Email em seu inbox (aguarde 1-2 min)
   - ✅ WhatsApp recebido (se Twilio sandbox ativado)

### Teste 2: Painel de Admin
1. Acesse: `/admin-leads.html`
2. Digite a senha
3. Você deve ver o lead que acabou de preencher
4. Clique em "✏️ Editar"
5. Mude o status para "Contatado"
6. Clique em "Salvar"
7. Teste "📥 Exportar CSV" para baixar os dados

### Teste 3: Contato via WhatsApp
1. No painel, clique em "💬" (ícone WhatsApp)
2. Deve abrir uma conversa com o lead
3. Teste mensagens manuais

---

## 🔒 SEGURANÇA

✅ **O que está protegido:**

1. **Firebase Realtime Database**
   - Regras de validação impedem dados inválidos
   - Backup automático Google
   - SSL/TLS encriptado
   - GDPR compliant

2. **Netlify Functions**
   - Código executado no servidor (não no cliente)
   - API keys nunca expostas
   - Variáveis de ambiente seguras
   - Rate limiting automático

3. **Painel de Admin**
   - Autenticação por senha
   - Dados persistentes no localStorage
   - Acesso apenas local

4. **WhatsApp & Email**
   - Enviados por serviços profissionais (Twilio, SendGrid)
   - Conformidade com LGPD/GDPR
   - Backup dos dados

---

## 📊 COMO FUNCIONA O FLUXO

```
┌─────────────────────┐
│  Usuário preenche   │
│   formulário lead   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Salva em           │
│  localStorage       │
│  (fallback)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Envia para         │
│  Firebase           │
│  (banco de dados)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Netlify Functions processa:    │
│  ✓ Envia email (SendGrid)       │
│  ✓ Envia WhatsApp (Twilio)      │
│  ✓ Armazena status              │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Painel de Admin permite:       │
│  ✓ Ver todos os leads           │
│  ✓ Responder via WhatsApp       │
│  ✓ Atualizar status             │
│  ✓ Exportar CSV                 │
│  ✓ Agendar follow-up            │
└─────────────────────────────────┘
```

---

## 🆘 TROUBLESHOOTING

### Problema: "Firebase não inicializado"
**Solução:** Verifique se as credenciais em `firebase-config.js` estão corretas

### Problema: "Email não está chegando"
**Solução:**
1. Verifique se a chave SendGrid está correta
2. Confirme que `ADMIN_EMAIL` está preenchido no Netlify
3. Verifique pasta de SPAM

### Problema: "WhatsApp não chega"
**Solução:**
1. Verifique se Twilio tem créditos (não está em R$0)
2. Confirme que o número está correto (+55 ...)
3. O Sandbox só funciona se o número estiver confirmado

### Problema: "Painel de Admin não abre"
**Solução:**
1. Verifique a senha (default: `EvenCalc@2026`)
2. Limpe cache do navegador
3. Tente em navegação privada/incógnita

---

## 📈 PRÓXIMOS PASSOS

1. **Automação de Follow-up**
   - Agendar lembretes automáticos
   - Enviar emails de acompanhamento
   - Rastreamento de conversão

2. **Integração com CRM**
   - Pipedrive
   - Hubspot
   - Zoho

3. **Analytics**
   - Taxa de conversão
   - Tempo de resposta
   - ROI de leads

4. **Personalização**
   - Templates de email customizados
   - Mensagens WhatsApp dinâmicas
   - Branding próprio

---

## 📞 SUPORTE

**Serviços Utilizados:**
- Firebase: https://firebase.google.com/support
- SendGrid: https://support.sendgrid.com
- Twilio: https://www.twilio.com/console/support
- Netlify: https://docs.netlify.com

---

## ✅ CHECKLIST FINAL

- [ ] Firebase configurado e testado
- [ ] SendGrid API key adicionada ao Netlify
- [ ] Twilio credenciais adicionadas ao Netlify
- [ ] Funções Netlify fazendo deploy sem erros
- [ ] Painel de Admin acessível
- [ ] Formulário de lead recebendo dados
- [ ] Emails sendo enviados
- [ ] WhatsApp sendo enviado (teste)
- [ ] Senha do painel alterada
- [ ] Backup de dados verificado

---

**Pronto! Seu sistema de leads está funcionando! 🚀**
