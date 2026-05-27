const express = require('express');
const { Resend } = require('resend');
const cors = require('cors');
const { jsPDF } = require('jspdf');
const { gerarTutorialPDF } = require('./tutorial-pdf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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

        console.log(`📧 Enviando tutorial para: ${email} (${nome})`);

        // ── GERAR PDF NO SERVIDOR ──
        const pdfBuffer = gerarTutorialPDF();
        console.log(`📄 PDF gerado com sucesso (${pdfBuffer.length} bytes)`);

        // ── ENVIAR EMAIL VIA RESEND ──
        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to: email,
            subject: '📚 Tutorial EventCalc Pro v7 - Como Usar',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #d4af37;">Olá ${nome}! 👋</h2>
                    <p>Obrigado por se interessar no <strong>EventCalc Pro v7</strong>!</p>
                    <p>Em anexo você encontra:</p>
                    <ul>
                        <li>✅ Guia completo de como usar</li>
                        <li>✅ Passo a passo das telas</li>
                        <li>✅ Dicas profissionais</li>
                        <li>✅ Exemplo de proposta</li>
                    </ul>
                    <p style="margin-top: 30px;"><em>Qualquer dúvida, estou à disposição!</em></p>
                    <p style="margin-top: 20px;">Abraço,<br><strong>Equipe EventCalc Pro v7</strong></p>
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

        console.log(`✅ Email enviado com sucesso! ID: ${data.id}`);

        // Resposta sucesso
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
        servidor: 'EventCalc Pro v7 Backend',
        emailProvider: 'Resend',
        resendConfigured: !!process.env.RESEND_API_KEY
    });
});

// ════════════════════════════════════════════
// INICIAR SERVIDOR
// ════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   EventCalc Pro v7 - Backend Server    ║
║   Rodando em http://localhost:${PORT}    ║
╚════════════════════════════════════════╝
    `);
    console.log(`✅ Servidor iniciado`);
    console.log(`✅ Resend configurado: ${process.env.RESEND_API_KEY ? 'SIM' : '❌ FALTANDO RESEND_API_KEY'}`);
    console.log(`📧 Endpoint: POST /send-tutorial`);
});

// ════════════════════════════════════════════
// TRATAMENTO DE ERROS
// ════════════════════════════════════════════

process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
});
