/**
 * 🔔 WEBHOOK HOTMART — EventCalc
 * ─────────────────────────────────────────────────────────────
 * Recebe notificações da Hotmart, gera código de licença com
 * checksum SHA-256 (compatível com licenca-checksum.js do front)
 * e envia email transacional via Resend ao comprador.
 *
 * SEM PERSISTÊNCIA: o próprio código carrega a validade —
 * frontend valida via SHA-256 (CHAVE_SECRETA + base). Trocar
 * CHAVE_SECRETA invalida TODOS os códigos antigos de uma vez.
 *
 * COMO INTEGRAR NO server.js (Express):
 *   const { resend } = require('./resend-client'); // seu client existente
 *   const webhook = require('./webhook-hotmart');
 *   app.post('/webhook/hotmart', express.json(), webhook.makeHandler({ resend }));
 *
 * VARIÁVEIS DE AMBIENTE NECESSÁRIAS (no Render):
 *   - HOTMART_HOTTOK  → token obtido em "Ferramentas → Webhook → Autenticação"
 *   - RESEND_API_KEY  → já existe no Render (não mexer)
 *   - FROM_EMAIL      → opcional, default "noreply@eventcalcpro.com"
 *   - ADMIN_EMAIL     → opcional, default "jm.dryaged@gmail.com"
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

const crypto = require('crypto');

/* ============================================================
   1) CONFIGURAÇÃO
   ============================================================ */

// ⚠️ MESMA chave do frontend (licenca-checksum.js linha 20)
// Trocar aqui E lá invalida TODOS os códigos antigos.
const CHAVE_SECRETA = 'CLUB-CARNIVORISTA-2026-EVENTCALC-V7-PIX-MAY';

// Duração de cada plano em dias (alinhado com PRECOS_PLANOS do acesso-premium.html)
const DIAS_POR_PLANO = {
    mensal: 30,
    trimestral: 90,
    anual: 365,
    vitalicio: 36500,
    cortesia: 30
};

// Mapa Hotmart "plan name" → tipo interno
// Ajustar conforme nomes EXATOS dos planos cadastrados no Hotmart
const MAPA_PLANO_HOTMART = {
    'Plano Mensal': 'mensal',
    'Plano Anual': 'anual',
    'Mensal': 'mensal',
    'Anual': 'anual'
};

// Eventos da Hotmart que geram código de licença
const EVENTOS_QUE_GERAM_LICENCA = new Set([
    'PURCHASE_APPROVED',     // pagamento aprovado (cartão/PIX)
    'PURCHASE_COMPLETE'      // entrega liberada
]);

// Eventos que apenas logamos (sem ação automática)
const EVENTOS_INFORMATIVOS = new Set([
    'PURCHASE_REFUNDED',
    'PURCHASE_CHARGEBACK',
    'SUBSCRIPTION_CANCELLATION',
    'SWITCH_PLAN'
]);

/* ============================================================
   2) GERAÇÃO DE CÓDIGO (compatível com frontend)
   ============================================================ */

/**
 * Checksum SHA-256 idêntico ao licenca-checksum.js do frontend.
 * Pega os 4 primeiros caracteres hex em maiúsculas.
 */
function calcularChecksum(codigoBase) {
    const hash = crypto.createHash('sha256')
        .update(CHAVE_SECRETA + ':' + codigoBase)
        .digest('hex');
    return hash.substring(0, 4).toUpperCase();
}

/**
 * Gera hash determinístico de 6 chars a partir do email + transaction id.
 * Mesma compra = mesmo código (idempotência).
 */
function gerarHashCompra(email, transacao) {
    const fonte = (email || '').toLowerCase() + '|' + (transacao || '');
    const hash = crypto.createHash('sha256').update(fonte + CHAVE_SECRETA).digest('hex');
    return hash.substring(0, 6).toUpperCase();
}

/**
 * Monta o código final no formato esperado pelo frontend:
 *   EVENTCALC-{PLANO}-{YYYYMMDD}-{HASH6}-{CHECKSUM4}
 *
 * Ex: EVENTCALC-MENSAL-20260613-A7K3P9-B2C8
 */
function gerarCodigoLicenca(plano, email, transacao) {
    const data = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const hash = gerarHashCompra(email, transacao);
    const base = `EVENTCALC-${plano.toUpperCase()}-${data}-${hash}`;
    const checksum = calcularChecksum(base);
    return base + '-' + checksum;
}

/* ============================================================
   3) VALIDAÇÃO HOTTOK
   ============================================================ */

/**
 * Validação em tempo constante para evitar timing attacks.
 * Hotmart envia o token em:
 *   - header "x-hotmart-hottok"
 *   - OU header "X-HOTMART-HOTTOK"
 *   - OU campo "hottok" no body (formato legado)
 */
function validarHottok(req) {
    const hottokEsperado = process.env.HOTMART_HOTTOK;
    if (!hottokEsperado) {
        console.error('[hotmart-webhook] HOTMART_HOTTOK ausente no ambiente — rejeitando');
        return false;
    }

    const recebido =
        req.headers['x-hotmart-hottok'] ||
        req.headers['X-HOTMART-HOTTOK'] ||
        (req.body && req.body.hottok) ||
        '';

    if (!recebido || recebido.length !== hottokEsperado.length) return false;

    return crypto.timingSafeEqual(
        Buffer.from(String(recebido)),
        Buffer.from(hottokEsperado)
    );
}

/* ============================================================
   4) EMAIL — Dark Premium (usa Resend client injetado)
   ============================================================ */

function montarEmailHTML({ nome, codigo, plano, validade }) {
    const primeiroNome = (nome || 'Pitmaster').split(/\s+/)[0];
    const planoLabel = plano === 'anual' ? 'Anual (365 dias)' : 'Mensal (30 dias)';

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0; background:#0a0a0a; font-family:'Inter',Arial,sans-serif; color:#f5f5f7;">
    <div style="max-width:560px; margin:0 auto; padding:32px 20px;">
        <div style="text-align:center; margin-bottom:24px;">
            <h1 style="font-family:Georgia,serif; color:#d4af37; font-size:30px; margin:0 0 6px;">EventCalc</h1>
            <p style="color:#a1a1a6; font-size:13px; margin:0; letter-spacing:0.05em; text-transform:uppercase;">Orçamentos de Churrasco em Minutos</p>
        </div>

        <div style="background:#15151a; border:1px solid #d4af37; border-radius:12px; padding:32px 26px; margin-bottom:20px;">
            <h2 style="color:#d4af37; font-family:Georgia,serif; font-size:22px; margin:0 0 12px;">Bem-vindo, ${primeiroNome}! 🔥</h2>
            <p style="color:#e5e5e5; font-size:15px; line-height:1.65; margin:0 0 22px;">
                Seu acesso ao EventCalc <strong style="color:#d4af37;">${planoLabel}</strong> está liberado. Abaixo está seu código de ativação.
            </p>

            <div style="background:#0a0a0a; border:1px dashed #d4af37; border-radius:10px; padding:20px 16px; text-align:center; margin-bottom:22px;">
                <p style="color:#a1a1a6; font-size:11px; margin:0 0 8px; letter-spacing:0.1em; text-transform:uppercase;">Seu código</p>
                <p style="color:#d4af37; font-family:'Courier New',monospace; font-size:18px; font-weight:700; margin:0; letter-spacing:0.05em; word-break:break-all;">${codigo}</p>
                <p style="color:#6e6e73; font-size:12px; margin:10px 0 0;">Válido até <strong>${validade}</strong></p>
            </div>

            <a href="https://eventcalc-pro-v7.pages.dev/acesso-premium.html"
               style="display:block; background:linear-gradient(135deg,#d4af37,#b8860b); color:#0a0a0a; padding:16px; border-radius:10px; text-align:center; text-decoration:none; font-weight:700; font-size:15px;">
                Ativar minha licença agora →
            </a>
        </div>

        <div style="background:#15151a; border:1px solid #2a2a30; border-radius:10px; padding:20px 22px; margin-bottom:20px;">
            <h3 style="color:#d4af37; font-size:14px; margin:0 0 10px; text-transform:uppercase; letter-spacing:0.05em;">Como ativar</h3>
            <ol style="color:#e5e5e5; font-size:14px; line-height:1.7; margin:0; padding-left:20px;">
                <li>Acesse <a href="https://eventcalc-pro-v7.pages.dev/acesso-premium.html" style="color:#d4af37;">a página de ativação</a></li>
                <li>Cole o código acima no campo</li>
                <li>Comece a fazer orçamentos profissionais imediatamente</li>
            </ol>
        </div>

        <div style="text-align:center; padding:14px 20px 0;">
            <p style="color:#a1a1a6; font-size:13px; margin:0 0 6px;">Dúvidas? Fale comigo no WhatsApp:</p>
            <a href="https://wa.me/5547996681010" style="color:#d4af37; font-weight:700; font-size:15px; text-decoration:none;">+55 47 99668-1010</a>
        </div>

        <div style="text-align:center; margin-top:30px; padding-top:20px; border-top:1px solid #2a2a30;">
            <p style="color:#6e6e73; font-size:12px; margin:0 0 4px;"><strong>Juliomar Meskiu</strong></p>
            <p style="color:#6e6e73; font-size:11px; margin:0;">Pitmaster · Club Carnivorista · Itapema, SC</p>
        </div>
    </div>
</body>
</html>`;
}

function montarNotificacaoAdminHTML({ nome, email, plano, codigo, transacao, valor, validade, emailEnviado }) {
    const primeiroNome = (nome || 'Cliente').split(/\s+/)[0];
    const whatsappNum = '';
    const msgWhatsApp = encodeURIComponent(
        `Olá ${primeiroNome}! 🔥\n\n` +
        `Sua compra do EventCalc foi confirmada!\n\n` +
        `Seu código de ativação:\n*${codigo}*\n\n` +
        `Válido até: ${validade}\n\n` +
        `Para ativar, acesse:\nhttps://eventcalc-pro-v7.pages.dev/acesso-premium.html\n\n` +
        `Cole o código no campo e pronto! Qualquer dúvida, me chama aqui. 💪`
    );
    const statusEmail = emailEnviado
        ? '<span style="color:#34c759;">✅ Email enviado ao cliente</span>'
        : '<span style="color:#ff9500;">⚠️ Email NÃO enviado (sem domínio verificado) — envie via WhatsApp abaixo</span>';

    return `
<div style="font-family:Arial,sans-serif; background:#0a0a0a; color:#f5f5f7; padding:24px; border-radius:8px; max-width:560px;">
    <h2 style="color:#d4af37; margin:0 0 14px;">💰 Nova venda EventCalc!</h2>

    <div style="background:#1a1a1a; border:2px dashed #d4af37; border-radius:10px; padding:16px; text-align:center; margin-bottom:16px;">
        <p style="color:#a1a1a6; font-size:11px; margin:0 0 6px; text-transform:uppercase; letter-spacing:0.1em;">Código do cliente</p>
        <p style="color:#d4af37; font-family:'Courier New',monospace; font-size:20px; font-weight:700; margin:0; word-break:break-all;">${codigo}</p>
        <p style="color:#6e6e73; font-size:12px; margin:8px 0 0;">Válido até ${validade}</p>
    </div>

    <div style="margin-bottom:16px;">${statusEmail}</div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
        <tr><td style="padding:8px 0; color:#a1a1a6;">Comprador</td><td style="padding:8px 0;"><strong>${nome}</strong></td></tr>
        <tr><td style="padding:8px 0; color:#a1a1a6;">Email</td><td style="padding:8px 0;">${email}</td></tr>
        <tr><td style="padding:8px 0; color:#a1a1a6;">Plano</td><td style="padding:8px 0;"><strong>${plano}</strong></td></tr>
        <tr><td style="padding:8px 0; color:#a1a1a6;">Valor</td><td style="padding:8px 0;"><strong>R$ ${valor}</strong></td></tr>
        <tr><td style="padding:8px 0; color:#a1a1a6;">Transação</td><td style="padding:8px 0; font-family:monospace; font-size:12px;">${transacao}</td></tr>
    </table>

    <div style="text-align:center;">
        <a href="https://wa.me/?text=${msgWhatsApp}"
           style="display:inline-block; padding:14px 28px; background:#25d366; color:white; text-decoration:none; border-radius:8px; font-weight:bold; font-size:15px;">
            💬 Enviar código via WhatsApp
        </a>
        <p style="color:#6e6e73; font-size:11px; margin:8px 0 0;">Clique e escolha o contato do cliente</p>
    </div>
</div>`;
}

/* ============================================================
   5) HANDLER PRINCIPAL (factory pattern p/ injeção de deps)
   ============================================================ */

/**
 * @param {Object} deps
 * @param {Object} deps.resend  - cliente Resend já inicializado no server.js
 * @returns {Function} express handler
 */
function makeHandler({ resend }) {
    if (!resend || typeof resend.emails?.send !== 'function') {
        throw new Error('webhook-hotmart: parâmetro "resend" inválido. Passe o client Resend inicializado.');
    }

    return async function handler(req, res) {
        try {
            // 1. Validar HOTTOK
            if (!validarHottok(req)) {
                console.warn('[hotmart-webhook] HOTTOK inválido — request rejeitada');
                return res.status(401).json({ erro: 'Token inválido' });
            }

            const body = req.body || {};
            const event = body.event || body.data?.event;
            const data = body.data || {};
            const buyer = data.buyer || {};
            const purchase = data.purchase || {};
            const subscription = data.subscription || {};

            console.log(`[hotmart-webhook] Evento recebido: ${event} | comprador: ${buyer.email}`);

            // 2. Eventos informativos só logam
            if (EVENTOS_INFORMATIVOS.has(event)) {
                console.log(`[hotmart-webhook] Evento informativo (${event}) — sem ação automática`);
                return res.status(200).json({ ok: true, acao: 'logado' });
            }

            // 3. Só geramos licença em PURCHASE_APPROVED ou PURCHASE_COMPLETE
            if (!EVENTOS_QUE_GERAM_LICENCA.has(event)) {
                console.log(`[hotmart-webhook] Evento ignorado: ${event}`);
                return res.status(200).json({ ok: true, acao: 'ignorado' });
            }

            // 4. Identificar plano
            const planoNome = subscription.plan?.name || purchase.offer?.code || 'mensal';
            const plano = MAPA_PLANO_HOTMART[planoNome] || (planoNome.toLowerCase().includes('anual') ? 'anual' : 'mensal');

            // 5. Gerar código com checksum (idempotente: mesma compra → mesmo código)
            const codigo = gerarCodigoLicenca(plano, buyer.email, purchase.transaction);
            const dias = DIAS_POR_PLANO[plano] || 30;
            const validade = new Date(Date.now() + dias * 86400000).toLocaleDateString('pt-BR');

            const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
            const adminEmail = process.env.ADMIN_EMAIL || 'jm.dryaged@gmail.com';

            // 6. PRIORIDADE: Notificar admin com código + botão WhatsApp
            let emailEnviado = false;
            await resend.emails.send({
                from: `EventCalc <${fromEmail}>`,
                to: adminEmail,
                subject: `💰 Nova venda: ${buyer.name} — ${plano}`,
                html: montarNotificacaoAdminHTML({
                    nome: buyer.name,
                    email: buyer.email,
                    plano: plano,
                    codigo: codigo,
                    transacao: purchase.transaction || 'n/d',
                    valor: purchase.price?.value || 'n/d',
                    validade: validade,
                    emailEnviado: false
                })
            });
            console.log(`[hotmart-webhook] 📩 Admin notificado com código`);

            // 7. Tentar enviar email ao comprador (falha silenciosa sem domínio verificado)
            try {
                await resend.emails.send({
                    from: `EventCalc <${fromEmail}>`,
                    to: buyer.email,
                    subject: 'Seu código EventCalc está pronto!',
                    html: montarEmailHTML({
                        nome: buyer.name,
                        codigo: codigo,
                        plano: plano,
                        validade: validade
                    })
                });
                emailEnviado = true;
                console.log(`[hotmart-webhook] ✅ Email enviado ao comprador: ${buyer.email}`);
            } catch (errBuyer) {
                console.warn(`[hotmart-webhook] ⚠️ Email ao comprador falhou (sem domínio verificado): ${errBuyer.message}`);
                console.warn('[hotmart-webhook] → Admin já foi notificado. Enviar código via WhatsApp.');
            }

            console.log(`[hotmart-webhook] ✅ Código gerado | ${buyer.email} | ${plano} | ${codigo.slice(0, -5)}-***`);
            return res.status(200).json({ ok: true, acao: 'codigo_gerado', emailEnviado });

        } catch (err) {
            console.error('[hotmart-webhook] ❌ Erro:', err);
            // Sempre 200 pra Hotmart não reenviar em loop em caso de bug nosso
            return res.status(200).json({ ok: false, erro: err.message });
        }
    };
}

/* ============================================================
   6) EXPORTS (testáveis individualmente)
   ============================================================ */

module.exports = {
    makeHandler,
    // Exportados para testes/inspeção:
    _internals: {
        calcularChecksum,
        gerarHashCompra,
        gerarCodigoLicenca,
        validarHottok,
        montarEmailHTML,
        DIAS_POR_PLANO,
        MAPA_PLANO_HOTMART
    }
};
