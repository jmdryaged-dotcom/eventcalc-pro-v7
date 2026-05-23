// ── ENVIAR WHATSAPP COM TWILIO ──
// Função serverless para enviar mensagem no WhatsApp

const twilio = require('twilio');

exports.handler = async (event) => {
    // Apenas POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Método não permitido' };
    }

    try {
        const { nome, whatsapp, tipo = 'welcome' } = JSON.parse(event.body);

        // Validações
        if (!nome || !whatsapp) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Dados incompletos' })
            };
        }

        // Verificar credenciais Twilio
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;

        if (!accountSid || !authToken) {
            console.warn('⚠️ Credenciais Twilio não configuradas - WhatsApp não será enviado');
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: 'Lead recebido (sem WhatsApp)' })
            };
        }

        const client = twilio(accountSid, authToken);
        const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'; // Sandbox
        const toNumber = `whatsapp:+${whatsapp.replace(/\D/g, '')}`;

        // Mensagens diferentes por tipo
        let mensagem = '';
        switch(tipo) {
            case 'welcome':
                mensagem = `Oi ${nome.split(' ')[0]}! 🎉\n\n📚 *Tutorial PDF enviado para seu email!*\n\nVocê solicitou nosso tutorial gratuito do EventCalc Pro v7. Já enviei um PDF completo com:\n✅ Como usar a calculadora\n✅ Quanto você economiza em TEMPO\n✅ Como AUMENTAR seu lucro\n✅ Exemplos práticos e dicas\n\n💡 *Próximo passo:*\nLeia o tutorial e entre em contato para uma proposta personalizada!\n\n📞 Dúvidas? Estou aqui!\n\nJuliomar 🏆\nMestre Churrasqueiro • EventCalc Pro v7`;
                break;
            case 'followup':
                mensagem = `Oi ${nome.split(' ')[0]}!\n\nSó passando para confirmar se ainda tem interesse no EventCalc Pro v7.\n\nTemos uma proposta especial esperando por você! 🎯\n\nPosso enviar detalhes?\n\nJuliomar 🏆`;
                break;
            default:
                mensagem = `Oi ${nome}! 👋\n\nMuito obrigado pelo seu interesse no EventCalc Pro v7!\n\nJuliomar`;
        }

        // Enviar via Twilio
        const message = await client.messages.create({
            body: mensagem,
            from: fromNumber,
            to: toNumber
        });

        console.log(`✅ WhatsApp enviado para ${whatsapp}. SID: ${message.sid}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: 'WhatsApp enviado com sucesso',
                sid: message.sid
            })
        };

    } catch (error) {
        console.error('❌ Erro ao enviar WhatsApp:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
