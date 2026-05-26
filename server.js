const express = require('express');
const nodemailer = require('nodemailer');
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
// CONFIGURAR NODEMAILER COM GMAIL
// ════════════════════════════════════════════

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

// ════════════════════════════════════════════
// FUNÇÃO: Gerar PDF do Tutorial DETALHADO
// (Importada de tutorial-pdf.js)
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

        // Configurar email
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: '📚 Tutorial EventCalc Pro v7 - Como Usar',
            html: `
                <h2>Olá ${nome}! 👋</h2>
                <p>Obrigado por se interessar no <strong>EventCalc Pro v7</strong>!</p>
                <p>Em anexo você encontra:</p>
                <ul>
                    <li>✅ Guia completo de como usar</li>
                    <li>✅ Passo a passo das telas</li>
                    <li>✅ Dicas profissionais</li>
                    <li>✅ Exemplo de proposta</li>
                </ul>
                <p><strong>Contato para dúvidas:</strong></p>
                <ul>
                    <li>📧 Email: jm.dryaged@gmail.com</li>
                    <li>📱 WhatsApp: +55 47 99668-1010</li>
                </ul>
                <p><em>Qualquer dúvida, estou à disposição!</em></p>
                <br>
                <p>Abraço,<br><strong>Club Carnivorista</strong></p>
            `,
            attachments: [
                {
                    filename: 'Tutorial_EventCalc_Pro_v7.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        // Enviar email
        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email enviado com sucesso! ID: ${info.messageId}`);

        // Resposta sucesso
        res.json({
            sucesso: true,
            mensagem: `✅ Tutorial enviado para ${email}! Confira sua caixa de entrada.`,
            messageId: info.messageId
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
    res.json({ status: 'OK', servidor: 'EventCalc Pro v7 Backend' });
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
    console.log(`✅ Email configurado: ${process.env.GMAIL_USER}`);
    console.log(`📧 Endpoint: POST /send-tutorial`);
});

// ════════════════════════════════════════════
// TRATAMENTO DE ERROS
// ════════════════════════════════════════════

process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
});
