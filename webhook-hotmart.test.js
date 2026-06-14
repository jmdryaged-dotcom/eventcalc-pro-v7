/**
 * 🧪 TESTE LOCAL DO WEBHOOK HOTMART
 *
 * Simula um POST que a Hotmart enviaria após uma compra aprovada
 * e verifica se o webhook-hotmart.js:
 *   1. Valida o HOTTOK corretamente (rejeita errado, aceita certo)
 *   2. Gera código de licença no formato esperado
 *   3. Tenta enviar email (mockamos o cliente Resend para não enviar de verdade)
 *   4. É idempotente (mesma compra = mesmo código)
 *   5. Lida com eventos de reembolso sem gerar código
 *
 * COMO RODAR:
 *   cd "EventCalc Pro v7/files"
 *   node webhook-hotmart.test.js
 *
 * Resultado esperado: 7 OKs em verde. Se aparecer FAIL, algo precisa ser corrigido
 * ANTES de fazer deploy no Render.
 */

'use strict';

process.env.HOTMART_HOTTOK = 'TESTE_HOTTOK_FAKE_NAO_USAR_EM_PRODUCAO';

const webhook = require('./webhook-hotmart');

// ─── MOCK DO RESEND ────────────────────────────────────────────
// Captura as chamadas a resend.emails.send() sem realmente enviar.
const emailsCapturados = [];
const fakeResend = {
    emails: {
        send: async function(payload) {
            emailsCapturados.push(payload);
            return { id: 'fake-email-id-' + Date.now() };
        }
    }
};

// ─── MOCK DE req/res EXPRESS ───────────────────────────────────
function criarReq(opts) {
    return {
        headers: opts.headers || {},
        body: opts.body || {}
    };
}

function criarRes() {
    const r = {
        statusCode: null,
        jsonPayload: null,
        status: function(code) { this.statusCode = code; return this; },
        json: function(p) { this.jsonPayload = p; return this; }
    };
    return r;
}

// ─── PAYLOADS DE EXEMPLO HOTMART ───────────────────────────────
function payloadCompra(plano, opts) {
    opts = opts || {};
    return {
        event: opts.event || 'PURCHASE_APPROVED',
        data: {
            buyer: {
                name: opts.nome || 'João Silva Teste',
                email: opts.email || 'joao@teste.com'
            },
            purchase: {
                transaction: opts.transaction || 'HP1234567890',
                price: { value: 19.90 }
            },
            subscription: {
                plan: { name: plano === 'anual' ? 'Plano Anual' : 'Plano Mensal' }
            }
        }
    };
}

// ─── HELPERS DE LOG ────────────────────────────────────────────
let passou = 0, falhou = 0;
function ok(nome, detalhe) {
    console.log(`  \x1b[32m✓\x1b[0m ${nome}${detalhe ? ' — ' + detalhe : ''}`);
    passou++;
}
function fail(nome, esperado, recebido) {
    console.log(`  \x1b[31m✗ FAIL\x1b[0m ${nome}`);
    console.log(`     esperado: ${esperado}`);
    console.log(`     recebido: ${recebido}`);
    falhou++;
}

// ─── TESTES ───────────────────────────────────────────────────
async function rodarTestes() {
    console.log('\n🧪 Testando webhook-hotmart.js\n');

    const handler = webhook.makeHandler({ resend: fakeResend });

    // 1) HOTTOK ausente → rejeita
    {
        emailsCapturados.length = 0;
        const req = criarReq({ body: payloadCompra('mensal') });
        const res = criarRes();
        await handler(req, res);
        if (res.statusCode === 401) ok('Rejeita request sem HOTTOK');
        else fail('Sem HOTTOK', 401, res.statusCode);
    }

    // 2) HOTTOK errado → rejeita
    {
        emailsCapturados.length = 0;
        const req = criarReq({
            headers: { 'x-hotmart-hottok': 'TOKEN_ERRADO_AAAAAAAAAAAAAAAAAAAAA' },
            body: payloadCompra('mensal')
        });
        const res = criarRes();
        await handler(req, res);
        if (res.statusCode === 401) ok('Rejeita HOTTOK errado');
        else fail('HOTTOK errado', 401, res.statusCode);
    }

    // 3) PURCHASE_APPROVED válido → 200 + email enviado + código no formato certo
    {
        emailsCapturados.length = 0;
        const req = criarReq({
            headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK },
            body: payloadCompra('mensal', { email: 'cliente1@teste.com', transaction: 'TX-001' })
        });
        const res = criarRes();
        await handler(req, res);

        const status200 = res.statusCode === 200;
        const enviou2Emails = emailsCapturados.length === 2; // 1 cliente + 1 admin
        const emailCliente = emailsCapturados.find(e => e.to === 'cliente1@teste.com');
        const temCodigo = emailCliente && /EVENTCALC-MENSAL-\d{8}-[0-9A-F]{6}-[0-9A-F]{4}/.test(emailCliente.html);

        if (status200 && enviou2Emails && temCodigo) {
            const codigo = emailCliente.html.match(/EVENTCALC-MENSAL-\d{8}-[0-9A-F]{6}-[0-9A-F]{4}/)[0];
            ok('PURCHASE_APPROVED gera código + 2 emails', `código: ${codigo}`);
        } else {
            fail('PURCHASE_APPROVED', '200 + 2 emails + código formatado',
                `status=${res.statusCode}, emails=${emailsCapturados.length}, temCodigo=${temCodigo}`);
        }
    }

    // 4) Idempotência: mesma compra → mesmo código
    {
        emailsCapturados.length = 0;
        const req1 = criarReq({
            headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK },
            body: payloadCompra('anual', { email: 'idem@teste.com', transaction: 'TX-IDEM' })
        });
        await handler(req1, criarRes());

        const req2 = criarReq({
            headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK },
            body: payloadCompra('anual', { email: 'idem@teste.com', transaction: 'TX-IDEM' })
        });
        await handler(req2, criarRes());

        const emails1 = emailsCapturados.filter((_, i) => i < 2);
        const emails2 = emailsCapturados.filter((_, i) => i >= 2);

        const cod1 = (emails1.find(e => e.to === 'idem@teste.com').html.match(/EVENTCALC-ANUAL-[^"<\s]+/) || [])[0];
        const cod2 = (emails2.find(e => e.to === 'idem@teste.com').html.match(/EVENTCALC-ANUAL-[^"<\s]+/) || [])[0];

        if (cod1 && cod2 && cod1 === cod2) ok('Idempotência (mesma compra = mesmo código)');
        else fail('Idempotência', `${cod1} === ${cod1}`, `${cod1} !== ${cod2}`);
    }

    // 5) PURCHASE_REFUNDED → não gera código, retorna 200 logado
    {
        emailsCapturados.length = 0;
        const req = criarReq({
            headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK },
            body: payloadCompra('mensal', { event: 'PURCHASE_REFUNDED' })
        });
        const res = criarRes();
        await handler(req, res);

        if (res.statusCode === 200 && emailsCapturados.length === 0 && res.jsonPayload?.acao === 'logado') {
            ok('PURCHASE_REFUNDED é só logado (não gera código)');
        } else {
            fail('REFUNDED', '200 sem email, acao=logado',
                `status=${res.statusCode}, emails=${emailsCapturados.length}, acao=${res.jsonPayload?.acao}`);
        }
    }

    // 6) Evento desconhecido → 200 ignorado
    {
        emailsCapturados.length = 0;
        const req = criarReq({
            headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK },
            body: { event: 'EVENTO_QUE_NAO_EXISTE', data: { buyer: { email: 'x@x.com' } } }
        });
        const res = criarRes();
        await handler(req, res);

        if (res.statusCode === 200 && res.jsonPayload?.acao === 'ignorado') ok('Evento desconhecido → ignorado');
        else fail('Evento desconhecido', 'acao=ignorado', `acao=${res.jsonPayload?.acao}`);
    }

    // 7) Email do cliente contém link de ativação correto
    {
        emailsCapturados.length = 0;
        const req = criarReq({
            headers: { 'x-hotmart-hottok': process.env.HOTMART_HOTTOK },
            body: payloadCompra('mensal', { email: 'link@teste.com', transaction: 'TX-LINK' })
        });
        await handler(req, criarRes());

        const emailCliente = emailsCapturados.find(e => e.to === 'link@teste.com');
        const temLink = emailCliente && emailCliente.html.includes('acesso-premium.html');

        if (temLink) ok('Email do cliente tem link para acesso-premium.html');
        else fail('Link de ativação', 'link contendo acesso-premium.html', 'não encontrado no HTML');
    }

    // ─── RESUMO ─────────────────────────────────────────────────
    console.log(`\n📊 Resultado: \x1b[32m${passou} OK\x1b[0m, \x1b[${falhou ? '31' : '32'}m${falhou} FAIL\x1b[0m\n`);

    if (falhou === 0) {
        console.log('\x1b[32m✅ Tudo passou — webhook está pronto pra subir no Render!\x1b[0m\n');
        process.exit(0);
    } else {
        console.log('\x1b[31m❌ Algo falhou — NÃO suba pra produção sem corrigir.\x1b[0m\n');
        process.exit(1);
    }
}

rodarTestes().catch(err => {
    console.error('💥 Erro inesperado no teste:', err);
    process.exit(2);
});
