/**
 * ⚖️ ENDPOINT BACKEND — Aceite de Cláusula IPCA
 *
 * Recebe POST /aceite-ipca do frontend (aceite-ipca-modal.js)
 * com dados do aceite jurídico do cliente, valida, registra
 * e envia email de confirmação.
 *
 * USO NO server.js:
 *   const aceiteIpca = require('./aceite-ipca-endpoint');
 *   app.post('/aceite-ipca',
 *       aceiteIpca.rateLimiter,
 *       express.json(),
 *       aceiteIpca.makeHandler({ resend })
 *   );
 *
 * SEGURANÇA APLICADA:
 *   - Rate limit: 5 requests por IP em 1 hora (anti-flood)
 *   - Validação server-side de todos os campos
 *   - Sanitização contra XSS (escapeHtml)
 *   - Validação de timestamp (±5 min do server)
 *   - Captura de IP real (Express req.ip)
 *   - Log estruturado pra auditoria forense
 *   - Email automático: cliente + admin
 *   - Sempre retorna 200 pra não vazar info de falha
 */

'use strict';

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

/* ============================================================
   1) RATE LIMITER (anti-flood / brute-force)
   ============================================================ */
const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,  // 1 hora
    max: 5,                     // máx 5 requests por IP nessa janela
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, erro: 'rate_limit_excedido' },
    skip: (req) => {
        // IP local em desenvolvimento não conta
        const ip = req.ip || '';
        return ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.');
    }
});

/* ============================================================
   2) UTILS
   ============================================================ */
function escapeHtml(t) {
    return String(t || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function validarEmail(email) {
    if (!email || typeof email !== 'string') return false;
    if (email.length > 200) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarTimestamp(tsStr) {
    if (!tsStr || typeof tsStr !== 'string') return false;
    const ts = Date.parse(tsStr);
    if (isNaN(ts)) return false;
    const agora = Date.now();
    const diff = Math.abs(agora - ts);
    return diff <= 5 * 60 * 1000;  // ±5 min do server
}

function mascararIP(ip) {
    if (!ip) return 'desconhecido';
    if (ip.includes(':')) {  // IPv6
        return ip.split(':').slice(0, 4).join(':') + ':****';
    }
    const partes = ip.split('.');
    if (partes.length === 4) return partes.slice(0, 3).join('.') + '.***';
    return 'desconhecido';
}

/* ============================================================
   3) EMAIL TEMPLATES
   ============================================================ */
function emailClienteHTML({ email, timestamp, versao_termos, hash_aceite }) {
    const dataBR = new Date(timestamp).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo'
    });

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0; background:#0a0a0a; font-family:'Inter',Arial,sans-serif; color:#f5f5f7;">
    <div style="max-width:560px; margin:0 auto; padding:32px 20px;">
        <div style="text-align:center; margin-bottom:24px;">
            <h1 style="font-family:Georgia,serif; color:#d4af37; font-size:28px; margin:0 0 6px;">EventCalc</h1>
            <p style="color:#a1a1a6; font-size:13px; margin:0; letter-spacing:0.05em; text-transform:uppercase;">Comprovante de Aceite</p>
        </div>

        <div style="background:#15151a; border:1px solid #d4af37; border-radius:12px; padding:28px 24px; margin-bottom:18px;">
            <h2 style="color:#d4af37; font-family:Georgia,serif; font-size:20px; margin:0 0 14px;">✓ Aceite registrado com sucesso</h2>
            <p style="color:#e5e5e5; font-size:14.5px; line-height:1.65; margin:0 0 14px;">
                Confirmamos o registro do seu aceite das condições do plano EventCalc, conforme manifestação eletrônica feita por você.
            </p>

            <table style="width:100%; border-collapse:collapse; margin-top:18px;">
                <tr>
                    <td style="padding:8px 0; color:#a1a1a6; font-size:13px; width:38%;">Email</td>
                    <td style="padding:8px 0; color:#e5e5e5; font-size:13px;"><strong>${escapeHtml(email)}</strong></td>
                </tr>
                <tr>
                    <td style="padding:8px 0; color:#a1a1a6; font-size:13px;">Data e hora</td>
                    <td style="padding:8px 0; color:#e5e5e5; font-size:13px;"><strong>${escapeHtml(dataBR)}</strong> (BRT)</td>
                </tr>
                <tr>
                    <td style="padding:8px 0; color:#a1a1a6; font-size:13px;">Versão dos Termos</td>
                    <td style="padding:8px 0; color:#e5e5e5; font-size:13px;"><strong>${escapeHtml(versao_termos)}</strong></td>
                </tr>
                <tr>
                    <td style="padding:8px 0; color:#a1a1a6; font-size:13px;">ID do aceite</td>
                    <td style="padding:8px 0; color:#e5e5e5; font-size:12px; font-family:monospace;">${escapeHtml(hash_aceite)}</td>
                </tr>
            </table>
        </div>

        <div style="background:#15151a; border:1px solid #2a2a30; border-radius:10px; padding:20px 22px; margin-bottom:18px;">
            <h3 style="color:#d4af37; font-size:13px; margin:0 0 12px; text-transform:uppercase; letter-spacing:0.05em;">O que você aceitou</h3>
            <ul style="color:#d8d8da; font-size:13.5px; line-height:1.7; margin:0; padding-left:18px;">
                <li><strong>Reajuste anual</strong> pelo IPCA acumulado nos 12 meses anteriores</li>
                <li><strong>Aviso prévio</strong> de 30 dias antes de qualquer reajuste</li>
                <li>Direito de <strong>cancelar sem multa</strong> antes do novo valor entrar em vigor</li>
                <li>Plano Anual: <strong>preço protegido até o fim do ciclo de 12 meses</strong> pago</li>
            </ul>
        </div>

        <div style="background:rgba(212,175,55,0.08); border-left:4px solid #d4af37; padding:14px 18px; margin-bottom:18px;">
            <p style="color:#e5e5e5; font-size:13px; line-height:1.6; margin:0;">
                💰 <strong>Garantia de 7 dias:</strong> Se mudar de ideia, devolvemos 100% do valor pago via Hotmart em até 7 dias, sem perguntas.
            </p>
        </div>

        <div style="text-align:center; padding-top:14px;">
            <p style="color:#a1a1a6; font-size:13px; margin:0 0 6px;">Guarde este email como comprovante.</p>
            <p style="color:#6e6e73; font-size:12px; margin:0;">Dúvidas? <a href="mailto:jm.dryaged@gmail.com" style="color:#d4af37;">jm.dryaged@gmail.com</a></p>
        </div>

        <div style="text-align:center; margin-top:28px; padding-top:18px; border-top:1px solid #2a2a30;">
            <p style="color:#6e6e73; font-size:11.5px; margin:0;">
                EventCalc &middot; Club Carnivorista &middot; Itapema, SC<br>
                Documento gerado eletronicamente conforme CDC arts. 46 e 54
            </p>
        </div>
    </div>
</body>
</html>`;
}

function emailAdminHTML({ email, timestamp, ip, user_agent, idioma, tela, hash_aceite }) {
    const dataBR = new Date(timestamp).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    return `
<div style="font-family:Arial,sans-serif; max-width:600px; background:#0a0a0a; color:#f5f5f7; padding:24px; border-radius:8px;">
    <h2 style="color:#d4af37; margin:0 0 16px;">⚖️ Novo aceite IPCA registrado</h2>
    <table style="width:100%; border-collapse:collapse; font-size:13px;">
        <tr><td style="padding:6px 0; color:#a1a1a6;">Email</td><td style="padding:6px 0;"><strong>${escapeHtml(email)}</strong></td></tr>
        <tr><td style="padding:6px 0; color:#a1a1a6;">Quando</td><td style="padding:6px 0;">${escapeHtml(dataBR)}</td></tr>
        <tr><td style="padding:6px 0; color:#a1a1a6;">IP (parcial)</td><td style="padding:6px 0; font-family:monospace; font-size:12px;">${escapeHtml(mascararIP(ip))}</td></tr>
        <tr><td style="padding:6px 0; color:#a1a1a6;">Idioma</td><td style="padding:6px 0;">${escapeHtml(idioma)}</td></tr>
        <tr><td style="padding:6px 0; color:#a1a1a6;">Resolução</td><td style="padding:6px 0;">${escapeHtml(tela)}</td></tr>
        <tr><td style="padding:6px 0; color:#a1a1a6;">User-Agent</td><td style="padding:6px 0; font-size:11px; word-break:break-all;">${escapeHtml(user_agent)}</td></tr>
        <tr><td style="padding:6px 0; color:#a1a1a6;">Hash</td><td style="padding:6px 0; font-family:monospace; font-size:12px; color:#d4af37;">${escapeHtml(hash_aceite)}</td></tr>
    </table>
    <p style="color:#6e6e73; font-size:11px; margin-top:18px;">
        Auditoria forense: guarde este registro por no mínimo 5 anos conforme exigência fiscal.
    </p>
</div>`;
}

/* ============================================================
   4) HANDLER (factory pattern p/ injeção de deps)
   ============================================================ */
function makeHandler({ resend }) {
    if (!resend || typeof resend.emails?.send !== 'function') {
        throw new Error('aceite-ipca: parâmetro "resend" inválido. Passe o client Resend inicializado.');
    }

    return async function handler(req, res) {
        try {
            const body = req.body || {};
            const {
                email, timestamp, versao_termos, hash_aceite,
                user_agent, idioma, tela
            } = body;

            // ── VALIDAÇÕES SERVER-SIDE ──
            if (!validarEmail(email)) {
                console.warn('[aceite-ipca] Email inválido:', email);
                return res.status(200).json({ ok: false, erro: 'email_invalido' });
            }
            if (!validarTimestamp(timestamp)) {
                console.warn('[aceite-ipca] Timestamp inválido ou fora da janela:', timestamp);
                return res.status(200).json({ ok: false, erro: 'timestamp_invalido' });
            }
            if (!versao_termos || typeof versao_termos !== 'string' || versao_termos.length > 20) {
                return res.status(200).json({ ok: false, erro: 'versao_invalida' });
            }
            if (!hash_aceite || typeof hash_aceite !== 'string' || hash_aceite.length > 64) {
                return res.status(200).json({ ok: false, erro: 'hash_invalido' });
            }

            const ipReal = req.ip || req.headers['x-forwarded-for'] || 'desconhecido';
            const fromEmail = process.env.FROM_EMAIL || 'noreply@eventcalcpro.com';
            const adminEmail = process.env.ADMIN_EMAIL || 'jm.dryaged@gmail.com';

            // ── LOG ESTRUTURADO (auditoria) ──
            console.log(JSON.stringify({
                evt: 'aceite_ipca',
                email,
                ts: timestamp,
                ip_mascarado: mascararIP(ipReal),
                versao: versao_termos,
                hash: hash_aceite,
                ua: (user_agent || '').substring(0, 100)
            }));

            // ── EMAIL CLIENTE (comprovante) ──
            try {
                await resend.emails.send({
                    from: `EventCalc <${fromEmail}>`,
                    to: email,
                    subject: '✓ Comprovante de aceite — EventCalc',
                    html: emailClienteHTML({ email, timestamp, versao_termos, hash_aceite })
                });
            } catch (e) {
                console.error('[aceite-ipca] Falha ao enviar email cliente:', e.message);
            }

            // ── EMAIL ADMIN (registro auditoria) ──
            try {
                await resend.emails.send({
                    from: `EventCalc <${fromEmail}>`,
                    to: adminEmail,
                    subject: `⚖️ Novo aceite IPCA: ${email}`,
                    html: emailAdminHTML({
                        email, timestamp, ip: ipReal,
                        user_agent: user_agent || 'n/d',
                        idioma: idioma || 'n/d',
                        tela: tela || 'n/d',
                        hash_aceite
                    })
                });
            } catch (e) {
                console.error('[aceite-ipca] Falha ao enviar email admin:', e.message);
            }

            return res.status(200).json({ ok: true, hash: hash_aceite });

        } catch (err) {
            console.error('[aceite-ipca] Erro inesperado:', err);
            // Sempre 200 pra não vazar info de erro
            return res.status(200).json({ ok: false, erro: 'erro_interno' });
        }
    };
}

/* ============================================================
   5) EXPORTS
   ============================================================ */
module.exports = {
    rateLimiter,
    makeHandler,
    _internals: {
        validarEmail,
        validarTimestamp,
        mascararIP,
        escapeHtml
    }
};
