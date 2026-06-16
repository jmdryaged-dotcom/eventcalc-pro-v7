const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const { jsPDF } = require('jspdf');
const { gerarTutorialPDF } = require('./tutorial-pdf');
const webhookHotmart = require('./webhook-hotmart');
const aceiteIpca = require('./aceite-ipca-endpoint');
require('dotenv').config();

// ════════════════════════════════════════════
// SUPABASE — persistir leads
// ════════════════════════════════════════════
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

async function salvarLeadNoSupabase(dados) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.warn('[leads] Supabase não configurado — lead NÃO persistido');
        return false;
    }
    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                nome: (dados.nome || '').substring(0, 200),
                email: (dados.email || '').substring(0, 200),
                whatsapp: (dados.whatsapp || '').substring(0, 30),
                ip: dados.ip || null,
                user_agent: (dados.user_agent || '').substring(0, 500),
                origem: 'tutorial'
            })
        });
        if (resp.ok) {
            console.log('[leads] ✅ Lead salvo no Supabase');
            return true;
        }
        const err = await resp.text();
        console.error('[leads] Supabase erro:', resp.status, err);
        return false;
    } catch (e) {
        console.error('[leads] Supabase falha:', e.message);
        return false;
    }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: [
        'https://eventcalc-pro-v7.pages.dev',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
    ]
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// ════════════════════════════════════════════
// CONFIGURAR RESEND (substituiu Gmail SMTP)
// Render Free bloqueia portas SMTP, então usamos
// Resend que envia emails via HTTPS API
// ════════════════════════════════════════════

const resend = new Resend(process.env.RESEND_API_KEY);

// Email remetente
// IMPORTANTE: Por enquanto usar onboarding@resend.dev (padrão do Resend para testes)
// Quando tiver domínio próprio verificado, mudar para: noreply@seudominio.com
const FROM_EMAIL = process.env.FROM_EMAIL || 'EventCalc Pro <onboarding@resend.dev>';

// Email do ADMIN que recebe notificação de cada lead capturado
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jm.dryaged@gmail.com';

// ════════════════════════════════════════════
// FUNÇÃO: Notificar admin sobre novo lead
// (rodada em paralelo, não bloqueia resposta ao cliente)
// ════════════════════════════════════════════
async function notificarAdminNovoLead(nome, email, whatsapp) {
    try {
        const dataAgora = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        const whatsappLink = whatsapp ? whatsapp.replace(/\D/g, '') : '';

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: ADMIN_EMAIL,
            subject: `🎯 NOVO LEAD: ${nome}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a1a; color: #d0d0d0;">
                    <div style="background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%); padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                        <h1 style="margin: 0; color: #0a0a0a; font-size: 1.6rem;">🎯 NOVO LEAD CAPTURADO</h1>
                        <p style="margin: 5px 0 0 0; color: #0a0a0a;">EventCalc - Orçamentos de Churrasco em Minutos</p>
                    </div>

                    <div style="background: #2a2a2a; padding: 25px; border-radius: 0 0 8px 8px; border: 1px solid #d4af37;">
                        <h2 style="color: #d4af37; margin-top: 0;">Dados do Interessado</h2>

                        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #444; color: #d4af37; font-weight: bold; width: 30%;">Nome:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #444; color: #fff;">${nome}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #444; color: #d4af37; font-weight: bold;">Email:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #444; color: #fff;">
                                    <a href="mailto:${email}" style="color: #d4af37;">${email}</a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #444; color: #d4af37; font-weight: bold;">WhatsApp:</td>
                                <td style="padding: 10px; border-bottom: 1px solid #444; color: #fff;">${whatsapp || '(não informado)'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; color: #d4af37; font-weight: bold;">Capturado em:</td>
                                <td style="padding: 10px; color: #fff;">${dataAgora}</td>
                            </tr>
                        </table>

                        <div style="margin-top: 25px; padding: 15px; background: rgba(212, 175, 55, 0.1); border-left: 4px solid #d4af37; border-radius: 4px;">
                            <p style="margin: 0; color: #d0d0d0; font-size: 0.95rem;">
                                <strong style="color: #d4af37;">✅ Tutorial PDF enviado automaticamente</strong> para o email do lead.
                            </p>
                        </div>

                        ${whatsappLink ? `
                            <div style="text-align: center; margin: 25px 0 10px 0;">
                                <a href="https://wa.me/${whatsappLink}?text=Olá%20${encodeURIComponent(nome.split(' ')[0])}!%20Vi%20que%20você%20se%20interessou%20pelo%20EventCalc."
                                   style="display: inline-block; padding: 12px 28px; background: #25d366; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                    💬 Chamar no WhatsApp agora
                                </a>
                            </div>
                        ` : ''}

                        <p style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #444; color: #909090; font-size: 0.85rem; text-align: center;">
                            💡 <strong>Dica:</strong> Responder em até 5 minutos aumenta a conversão em 9x.
                        </p>
                    </div>

                    <p style="text-align: center; margin-top: 20px; color: #707070; font-size: 0.8rem;">
                        EventCalc © 2026 — Sistema de Captura de Leads
                    </p>
                </div>
            `,
            // ReplyTo para você responder direto ao cliente
            reply_to: email
        });

        if (error) {
            console.error('⚠️ Falha ao notificar admin (lead salvo, mas você não recebeu email):', error);
            return false;
        }

        console.log(`📩 Notificação enviada ao admin (${ADMIN_EMAIL}). ID: ${data.id}`);
        return true;

    } catch (err) {
        // Erro aqui NÃO deve quebrar o envio do tutorial pro cliente
        console.error('⚠️ Erro ao notificar admin:', err.message);
        return false;
    }
}

// ════════════════════════════════════════════
// ENDPOINT: Enviar Tutorial por Email
// ════════════════════════════════════════════

app.post('/send-tutorial', async (req, res) => {
    try {
        const { nome, email, whatsapp } = req.body;

        // Validar dados
        if (!nome || !email) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Dados incompletos. Faltam: nome ou email.'
            });
        }

        // Validação simples de email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValido) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Email inválido.'
            });
        }

        console.log(`📧 Enviando tutorial para: ${email} (${nome})`);

        // ── GERAR PDF NO SERVIDOR ──
        const pdfBuffer = gerarTutorialPDF();
        console.log(`📄 PDF gerado com sucesso (${pdfBuffer.length} bytes)`);

        // ── ENVIAR EMAIL VIA RESEND ──
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: '📚 Tutorial EventCalc - Como Usar',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">Olá ${nome}! 👋</h2>
                    <p>Obrigado por se interessar no <strong>EventCalc</strong>!</p>
                    <p>Em anexo você encontra:</p>
                    <ul>
                        <li>✅ Guia completo de como usar</li>
                        <li>✅ Passo a passo das telas</li>
                        <li>✅ Dicas profissionais</li>
                        <li>✅ Exemplo de proposta</li>
                    </ul>
                    <p style="margin-top: 30px;"><em>Qualquer dúvida, estou à disposição!</em></p>
                    <p style="margin-top: 20px;">Abraço,<br><strong>Equipe EventCalc</strong></p>
                </div>
            `,
            attachments: [
                {
                    filename: 'Tutorial_EventCalc.pdf',
                    content: pdfBuffer.toString('base64')
                }
            ]
        });

        if (error) {
            console.error('❌ Erro do Resend:', error);
            return res.status(500).json({
                sucesso: false,
                mensagem: `❌ Erro ao enviar email: ${error.message || error.name}`,
                detalhes: error
            });
        }

        console.log(`✅ Email enviado com sucesso ao cliente! ID: ${data.id}`);

        // ── PERSISTIR LEAD NO SUPABASE + NOTIFICAR ADMIN (em paralelo) ──
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
        const clientUa = req.headers['user-agent'] || '';

        salvarLeadNoSupabase({ nome, email, whatsapp, ip: clientIp, user_agent: clientUa }).catch(err => {
            console.error('⚠️ Falha silenciosa ao salvar lead:', err.message);
        });

        notificarAdminNovoLead(nome, email, whatsapp).catch(err => {
            console.error('⚠️ Falha silenciosa ao notificar admin:', err.message);
        });

        // Resposta sucesso (já vai antes da notificação ao admin terminar)
        res.json({
            sucesso: true,
            mensagem: `✅ Tutorial enviado para ${email}! Confira sua caixa de entrada (e a pasta de spam).`,
            messageId: data.id
        });

    } catch (erro) {
        console.error('❌ Erro ao enviar email:', erro);

        res.status(500).json({
            sucesso: false,
            mensagem: `❌ Erro ao enviar: ${erro.message}`,
            detalhes: erro.message
        });
    }
});

// ════════════════════════════════════════════
// ⭐ NOVO ENDPOINT: Webhook Hotmart
// Recebe notificação de compra e gera código de licença
// ════════════════════════════════════════════

app.post('/webhook/hotmart', webhookHotmart.makeHandler({ resend }));

app.post('/aceite-ipca',
    aceiteIpca.rateLimiter,
    aceiteIpca.makeHandler({ resend })
);

// ════════════════════════════════════════════
// ENDPOINT: Health Check
// ════════════════════════════════════════════

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        servidor: 'EventCalc Backend',
        emailProvider: 'Resend',
        resendConfigured: !!process.env.RESEND_API_KEY,
        hotmartWebhookConfigured: !!process.env.HOTMART_HOTTOK,
        adminEmail: ADMIN_EMAIL.replace(/(.{2}).+(@.+)/, '$1***$2') // mascarado nos logs
    });
});

// ════════════════════════════════════════════
// INICIAR SERVIDOR
// ════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   EventCalc - Backend Server           ║
║   Rodando em http://localhost:${PORT}    ║
╚════════════════════════════════════════╝
    `);
    console.log(`✅ Servidor iniciado`);
    console.log(`✅ Resend configurado: ${process.env.RESEND_API_KEY ? 'SIM' : '❌ FALTANDO RESEND_API_KEY'}`);
    console.log(`✅ Hotmart Webhook: ${process.env.HOTMART_HOTTOK ? 'SIM' : '⚠️ FALTANDO HOTMART_HOTTOK'}`);
    console.log(`📧 Endpoint: POST /send-tutorial`);
    console.log(`🔔 Endpoint: POST /webhook/hotmart`);
    console.log(`📩 Admin notificado em: ${ADMIN_EMAIL}`);
});

// ════════════════════════════════════════════
// TRATAMENTO DE ERROS
// ════════════════════════════════════════════

process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
});
