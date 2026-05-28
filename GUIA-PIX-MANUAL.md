# 💰 Guia do Sistema PIX Manual - EventCalc Pro v7

## ⚡ Fluxo Rápido (3 passos)

### 1️⃣ Cliente acessa: `http://localhost:3000/acesso-premium.html`
- Preenche: Nome, Email e Qual Plano
- Vê a chave PIX e o valor
- Clica "Solicitar Código"
- Recebe ID único (ex: #1716533456789)

### 2️⃣ Você acessa: `http://localhost:3000/gerenciador-codigos-pix.html`
- Vê a solicitação do cliente **em tempo real**
- Clica "Gerar" na linha dele
- Preenche o número sequencial (001, 002, etc)
- Clica "✨ Gerar Código"
- Clica "📋 Copiar Código"

### 3️⃣ Envia para cliente
- Copia o código gerado (ex: `EVENTCALC-MENSAL-2025-001`)
- Envia por WhatsApp ou Email
- Cliente ativa em `acesso-premium.html` no campo "Já pagou? Ative seu acesso"
- ✅ Cliente tem acesso completo!

---

## 📊 O que foi implementado

### Em `acesso-premium.html` (página de preços)
```
Cliente vê:
├─ 4 Planos (Semanal/Mensal/Trimestral/Vitalício)
├─ Campo "Já pagou? Ative seu código" (já existia)
└─ NOVO: Formulário PIX com:
   ├─ Campos: Nome, Email, Plano
   ├─ Chave PIX: 03362258905
   ├─ Valor automático baseado no plano
   └─ Salva solicitação no localStorage
```

### Em `gerenciador-codigos-pix.html` (só você acessa)
```
Você vê:
├─ Solicitações Pendentes
│  └─ Cliente, Plano, Valor, Data
│  └─ Botão "Gerar" (cria código)
│  └─ Botão "Remover" (se errou)
│
├─ Gerador de Código
│  ├─ ID Solicitação (auto-preenchido)
│  ├─ Tipo de Plano
│  ├─ Número sequencial (001, 002...)
│  └─ Botão "Gerar Código"
│
└─ Histórico
   └─ Todos os códigos gerados
   └─ Qual solicitação cada código é
   └─ Status (Disponível/Usado)
```

---

## 🔐 Dados armazenados (localStorage)

### `eventcalc_solicitacoes_pix`
```json
[
  {
    "id": 1716533456789,
    "nome": "João da Silva",
    "email": "joao@email.com",
    "plano": "mensal",
    "valor": 24.90,
    "data": "25/05/2026 14:30",
    "status": "pendente",
    "codigo": null
  }
]
```

### `eventcalc_codigos_gerados`
```json
[
  {
    "codigo": "EVENTCALC-MENSAL-2025-001",
    "tipo": "mensal",
    "dataCriacao": "25/05/2026 14:35",
    "idSolicitacao": "1716533456789",
    "usado": false
  }
]
```

---

## ⚙️ Processos

### Como um código é criado?
1. Você vai para `gerenciador-codigos-pix.html`
2. Vê as solicitações na tabela
3. Clica "Gerar" na linha do cliente
4. Sistema auto-preenche o ID
5. Você preenche: Tipo + Número sequencial
6. Clica "✨ Gerar Código"
7. Código é criado no padrão: `EVENTCALC-[TIPO]-[DATA]-[NUMERO]`

### O número sequencial
- Cada dia reseta, ou mantém numeração contínua
- Exemplos:
  - `EVENTCALC-MENSAL-2025-001` (primeiro do dia)
  - `EVENTCALC-MENSAL-2025-002` (segundo do dia)
  - etc.

### Validação de código
- Cliente ativa em `acesso-premium.html`
- Sistema verifica se está em `CODIGOS_VALIDOS`
- Se válido → Ativa licença no localStorage
- Se inválido → Mostra erro

---

## 📝 Próximos Passos (Fase 2)

### Quando aumentar o volume:
1. **Integração com gateway** (Mercado Pago, Stripe, etc)
   - Pagamento automático
   - Código gerado na hora
   
2. **Sistema de assinatura recorrente**
   - Renovação automática mensal
   - Cancelamento facilitado

3. **Email automático**
   - Enviar código por email após pagamento
   - Lembretes de renovação

---

## 🚀 Para começar

### Teste Local:
```
1. Abra: localhost:3000/acesso-premium.html
2. Preencha formulário PIX
3. Abra: localhost:3000/gerenciador-codigos-pix.html (nova aba)
4. Veja a solicitação aparecer em tempo real
5. Gere o código
6. Copie e envie para cliente
7. Cliente ativa em acesso-premium.html
```

### Verificar localStorage:
- F12 → Application → LocalStorage
- Ver `eventcalc_solicitacoes_pix`
- Ver `eventcalc_codigos_gerados`

---

## 💡 Dicas

1. **ID único automático**: Cada solicitação tem ID único (timestamp)
2. **Recarregamento automático**: Gerenciador recarrega a cada 10s
3. **Copiar com 1 clique**: Botão copia automaticamente para clipboard
4. **Histórico completo**: Todos os códigos ficam salvos
5. **Sem limite**: Você pode gerar quantos códigos quiser

---

## ❓ Dúvidas

- **Cliente não recebe código?** Você precisa gerar manualmente e enviar por email/WhatsApp
- **Código expirou?** Sistema valida duração conforme o tipo (7/30/90/infinito dias)
- **Quer mudar valores?** Edite `PRECOS_PLANOS` em acesso-premium.html

---

**Sucesso nas vendas! 🎉**
