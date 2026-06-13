// ── ENVIAR EMAIL COM PDF ANEXADO ──
// Função serverless para enviar email ao novo lead com Tutorial PDF

const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
    // Apenas POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        const { nome, email, whatsapp, pdfBase64 } = JSON.parse(event.body);

        // Validações
        if (!nome || !email || !whatsapp) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Dados incompletos' })
            };
        }

        // Inicializar SendGrid (usar variável de ambiente)
        const apiKey = process.env.SENDGRID_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ SENDGRID_API_KEY não configurada - email não será enviado');
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Lead recebido (sem email)' })
            };
        }

        sgMail.setApiKey(apiKey);

        // Preparar attachments (PDF)
        const attachments = [];
        if (pdfBase64) {
            attachments.push({
                content: pdfBase64.split(',')[1] || pdfBase64, // Remove "data:application/pdf;base64," se existir
                filename: 'EventCalc-Tutorial-Gratuito.pdf',
                type: 'application/pdf',
                disposition: 'attachment'
            });
        }

        // Email para o ADMINISTRADOR (Juliomar)
        const emailAdmin = await sgMail.send({
            to: process.env.ADMIN_EMAIL || 'jm.dryaged@gmail.com',
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@eventcalcpro.com',
            subject: `🎯 Novo Lead Solicitando Tutorial - ${nome}`,
            html: `
                <div style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #d4af37;">🔥 Novo Lead Solicitando Tutorial!</h2>

                    <div style="background: #242424; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d4af37;">
                        <p><strong>Nome:</strong> ${nome}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>WhatsApp:</strong> ${whatsapp}</p>
                        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                    </div>

                    <p style="font-size: 0.95rem; color: #d4af37;">
                        <strong>⭐ Este lead recebeu o Tutorial PDF por email. Ele está interessado em conhecer EventCalc!</strong>
                    </p>

                    <p>
                        <a href="https://wa.me/${whatsapp.replace(/\D/g, '')}" style="background: #25d366; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-right: 10px; margin-top: 10px;">📱 Responder no WhatsApp</a>
                        <a href="https://creative-licorice-04e925.netlify.app/admin-leads.html" style="background: #d4af37; color: #0a0a0a; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 10px;">📊 Ver no Painel</a>
                    </p>

                    <p style="color: #999; font-size: 0.9rem; margin-top: 20px;">
                        EventCalc | Sistema Profissional de Orçamento
                    </p>
                </div>
            `
        });

        // Email para o LEAD (com PDF anexado)
        const emailLead = await sgMail.send({
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@eventcalcpro.com',
            subject: '📚 Seu Tutorial EventCalc Gratuito!',
            html: `
                <div style="font-family: Arial, sans-serif; background: #0a0a0a; color: #fff; padding: 20px; border-radius: 8px;">
                    <h2 style="color: #d4af37;">Oi ${nome.split(' ')[0]}! 🎉</h2>

                    <p>Obrigado por se interessar no <strong>EventCalc</strong>!</p>

                    <p style="font-size: 1.05rem; color: #d4af37;"><strong>📚 Seu Tutorial PDF está anexado neste email!</strong></p>

                    <div style="background: #242424; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d4af37;">
                        <h3 style="color: #d4af37;">✅ O que você vai aprender:</h3>
                        <ul style="color: #ccc;">
                            <li>Como usar cada tela da calculadora</li>
                            <li>Quanto você pode economizar em TEMPO (até 2 horas por orçamento!)</li>
                            <li>Como AUMENTAR seu lucro automaticamente</li>
                            <li>Exemplo prático de ROI e ganhos reais</li>
                            <li>Dicas de ouro para profissionais</li>
                            <li>FAQ com respostas para suas dúvidas</li>
                        </ul>
                    </div>

                    <p><strong style="color: #d4af37;">⏭️ Próximo Passo:</strong></p>
                    <p>Leia o tutorial e veja como EventCalc pode revolucionar seu negócio! Após ler, você pode entrar em contato para uma proposta personalizada.</p>

                    <p style="margin-top: 30px;">
                        <a href="https://wa.me/5547996681010" style="background: #25d366; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold;">Chamar no WhatsApp</a>
                    </p>

                    <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; margin: 30px 0;">
                        <p style="color: #999; font-size: 0.9rem; margin: 0;">
                            <strong>Juliomar Meskiu</strong><br>
                            Médico Veterinário • Mestre Churrasqueiro<br>
                            EventCalc<br>
                            Itapema, SC
                        </p>
                    </div>

                    <p style="color: #666; font-size: 0.85rem; margin-top: 20px; text-align: center;">
                        Se tiver dúvidas, responda este email ou entre em contato pelo WhatsApp<br>
                        <a href="https://wa.me/5547996681010" style="color: #25d366; text-decoration: none;">+55 47 99668-1010</a>
                    </p>
                </div>
            `,
            attachments: attachments
        });

        console.log('✅ Emails enviados com sucesso (com PDF)');

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'Lead processado e emails enviados com PDF anexado'
            })
        };

    } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
