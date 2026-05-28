const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { jsPDF } = require('jspdf');
const { gerarTutorialPDF } = require('./tutorial-pdf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ════════════════════════════════════════════
// CORS — apenas origens permitidas
// (Adicionar mais domínios se for vender com domínio próprio depois)
// ════════════════════════════════════════════
const ORIGENS_PERMITIDAS = [
    'https://cute-parfait-948162.netlify.app',
    'http://localhost:3000',  // desenvolvimento local
    'http://localhost:8000',  // desenvolvimento local alternativo
    'http://127.0.0.1:5500'   // VS Code Live Server
];

app.use(cors({
    origin: function(origin, callback) {
        // Permite requisições sem origin (Postman, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (ORIGENS_PERMITIDAS.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`⚠️ CORS bloqueado para origem: ${origin}`);
            callback(new Error('Origem não permitida'));
        }
    },
    methods: ['GET', 'POST'],
    credentials: false
}));

// Trust proxy do Render (necessário para rate-limit pegar IP real)
app.set('trust proxy', 1);

app.use(express.json({ limit: '5mb' })); // reduzido de 50mb (era exagero)
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// ════════════════════════════════════════════
// RATE LIMITING — protege contra spam/bots
// ════════════════════════════════════════════
// Limita a 5 requests por IP a cada 15 min no endpoint de email
const limitadorEnvioEmail = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 envios por IP por janela
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        sucesso: false,
        mensagem: '⚠️ Muitas tentativas. Aguarde 15 minutos para tentar novamente.'
    },
    handler: (req, res, next, options) => {
        console.warn(`🚫 Rate-limit atingido para IP: ${req.ip}`);
        res.status(options.statusCode).json(options.message);
    }
});

// Limite geral (mais permissivo, para todos os endpoints)
const limitadorGeral = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 requests por minuto
    standardHeaders: true,
    legacyHeaders: false,
    message: { sucesso: false, mensagem: 'Muitas requisições. Aguarde um momento.' }
});

app.use(limitadorGeral);

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
            subject: `Novo lead: ${nome}`,
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #0a0a0b; color: #f5f5f7;">

                    <div style="text-align: center; margin-bottom: 24px;">
                        <p style="color: #c9a14b; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; margin: 0;">Novo lead capturado</p>
                        <p style="color: #f5f5f7; font-size: 26px; font-weight: 700; letter-spacing: -0.025em; margin: 8px 0 0 0;">EventCalc</p>
                    </div>

                    <div style="background: #131316; border: 1px solid #232328; border-radius: 16px; padding: 28px;">
                        <p style="color: #6e6e73; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 12px 0;">Dados do interessado</p>

                        <h2 style="color: #f5f5f7; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 24px 0;">${nome}</h2>

                        <div style="padding: 14px 0; border-bottom: 1px solid #232328;">
                            <p style="color: #6e6e73; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px 0;">Email</p>
                            <a href="mailto:${email}" style="color: #c9a14b; font-size: 15px; text-decoration: none; font-weight: 500;">${email}</a>
                        </div>

                        <div style="padding: 14px 0; border-bottom: 1px solid #232328;">
                            <p style="color: #6e6e73; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px 0;">WhatsApp</p>
                            <p style="color: #f5f5f7; font-size: 15px; margin: 0; font-weight: 500;">${whatsapp || '—'}</p>
                        </div>

                        <div style="padding: 14px 0 18px;">
                            <p style="color: #6e6e73; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px 0;">Capturado em</p>
                            <p style="color: #a1a1a6; font-size: 14px; margin: 0;">${dataAgora}</p>
                        </div>

                        <div style="background: rgba(201, 161, 75, 0.06); border: 1px solid rgba(201, 161, 75, 0.2); border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
                            <p style="color: #c9a14b; font-size: 13px; margin: 0; font-weight: 500;">✓ Tutorial em PDF enviado automaticamente</p>
                        </div>

                        ${whatsappLink ? `
                            <a href="https://wa.me/${whatsappLink}?text=${encodeURIComponent('Olá ' + nome.split(' ')[0] + '! Vi que você baixou o tutorial do EventCalc. Posso te ajudar com alguma dúvida?')}"
                               style="display: block; padding: 14px; background: #c9a14b; color: #0a0a0b; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; text-align: center; letter-spacing: -0.01em;">
                                Chamar no WhatsApp →
                            </a>
                        ` : ''}

                        <p style="color: #6e6e73; font-size: 12px; margin: 20px 0 0 0; text-align: center;">
                            Responder em até 5 minutos aumenta a conversão em 9×.
                        </p>
                    </div>

                    <p style="text-align: center; color: #48484c; font-size: 11px; margin: 20px 0 0 0;">
                        EventCalc · Sistema de captura de leads
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

app.post('/send-tutorial', limitadorEnvioEmail, async (req, res) => {
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
            subject: 'Seu tutorial do EventCalc chegou',
            html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #0a0a0b; color: #f5f5f7; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 32px;">
                        <p style="font-size: 24px; font-weight: 700; letter-spacing: -0.025em; color: #f5f5f7; margin: 0 0 8px 0;">EventCalc</p>
                        <p style="font-size: 13px; color: #6e6e73; margin: 0; letter-spacing: 0.05em; text-transform: uppercase;">Tutorial Gratuito</p>
                    </div>

                    <h2 style="color: #f5f5f7; font-size: 22px; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 16px;">Olá, ${nome}.</h2>

                    <p style="color: #a1a1a6; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                        Obrigado por baixar o tutorial. Em anexo você encontra um PDF completo com:
                    </p>

                    <div style="background: #131316; border: 1px solid #232328; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                        <p style="color: #f5f5f7; font-size: 14px; line-height: 2; margin: 0;">
                            • Guia completo de como usar o EventCalc<br>
                            • Passo a passo das 5 telas<br>
                            • Dicas profissionais de orçamento<br>
                            • Exemplo de proposta pronta para o cliente
                        </p>
                    </div>

                    <p style="color: #a1a1a6; font-size: 14px; line-height: 1.6; margin-bottom: 32px;">
                        Qualquer dúvida, é só responder este email — estou à disposição.
                    </p>

                    <div style="padding-top: 24px; border-top: 1px solid #232328;">
                        <p style="color: #6e6e73; font-size: 13px; margin: 0;">Equipe EventCalc</p>
                        <p style="color: #6e6e73; font-size: 12px; margin: 4px 0 0 0;">Club Carnivorista • Itapema, SC</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'Tutorial_EventCalc_Pro_v7.pdf',
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

        // ── NOTIFICAR ADMIN (em paralelo, sem bloquear resposta) ──
        // Roda assíncrono. Se falhar, não impacta o cliente.
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
// ENDPOINT: Health Check
// ════════════════════════════════════════════

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        servidor: 'EventCalc Backend',
        emailProvider: 'Resend',
        resendConfigured: !!process.env.RESEND_API_KEY,
        adminEmail: ADMIN_EMAIL.replace(/(.{2}).+(@.+)/, '$1***$2') // mascarado nos logs
    });
});

// ════════════════════════════════════════════
// INICIAR SERVIDOR
// ════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   EventCalc - Backend Server    ║
║   Rodando em http://localhost:${PORT}    ║
╚════════════════════════════════════════╝
    `);
    console.log(`✅ Servidor iniciado`);
    console.log(`✅ Resend configurado: ${process.env.RESEND_API_KEY ? 'SIM' : '❌ FALTANDO RESEND_API_KEY'}`);
    console.log(`📧 Endpoint: POST /send-tutorial`);
    console.log(`📩 Admin notificado em: ${ADMIN_EMAIL}`);
});

// ════════════════════════════════════════════
// TRATAMENTO DE ERROS
// ════════════════════════════════════════════

process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
});
