/**
 * 🔐 SISTEMA AUTOMÁTICO DE EXPIRAÇÃO - EventCalc Pro v7
 *
 * Este script automaticamente:
 * 1. Verifica se a versão de teste expirou
 * 2. Mostra aviso visual se está perto de expirar
 * 3. Bloqueia acesso e redireciona para pagamento se expirou
 *
 * CONFIGURAÇÃO: Altere apenas a data em DATA_EXPIRACAO (linha 15)
 */

(function() {
    // ═══════════════════════════════════════════════════════════════════
    // ⚙️ CONFIGURAÇÃO - ALTERE APENAS AQUI
    // ═══════════════════════════════════════════════════════════════════

    // Data de expiração da versão de teste (YYYY-MM-DD)
    const DATA_EXPIRACAO = '2026-06-01';

    // URL para redirecionamento após expiração
    const URL_PAGAMENTO = 'https://seu-dominio.com/planos';

    // Número de dias antes de expiração para mostrar aviso
    const DIAS_AVISO = 7;

    // ═══════════════════════════════════════════════════════════════════
    // 🔧 LÓGICA (Não altere daqui para baixo)
    // ═══════════════════════════════════════════════════════════════════

    function verificarExpiracao() {
        const hoje = new Date();
        const expiracao = new Date(DATA_EXPIRACAO);

        // Se hoje > data de expiração: BLOQUEADO
        if (hoje > expiracao) {
            mostrarTelaExpirada();
            return false;
        }

        // Se faltam poucos dias: MOSTRAR AVISO
        const diasRestantes = Math.ceil((expiracao - hoje) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= DIAS_AVISO) {
            mostrarAvisoExpiracao(diasRestantes);
        }

        return true;
    }

    function mostrarTelaExpirada() {
        // Bloqueia a página inteira
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: white;
                font-family: 'Playfair Display', serif;
                padding: 20px;
                text-align: center;
            ">
                <div style="max-width: 600px;">
                    <h1 style="
                        font-size: 3rem;
                        color: #c41e3a;
                        margin: 0 0 20px 0;
                        text-shadow: 0 2px 10px rgba(196,30,58,0.3);
                    ">⏰ Período de Teste Expirado</h1>

                    <p style="
                        font-size: 1.3rem;
                        color: #d4af37;
                        margin: 20px 0;
                        font-family: 'Lora', serif;
                    ">
                        A versão de teste da EventCalc Pro v7 expirou em ${DATA_EXPIRACAO}.
                    </p>

                    <p style="
                        font-size: 1.1rem;
                        color: #d0d0d0;
                        margin: 30px 0;
                        font-family: 'Lora', serif;
                        line-height: 1.6;
                    ">
                        Para continuar usando a calculadora de orçamento,
                        <strong style="color: #d4af37;">contratar um plano</strong>.
                    </p>

                    <button onclick="window.location.href='${URL_PAGAMENTO}'" style="
                        padding: 15px 40px;
                        font-size: 1.1rem;
                        background: linear-gradient(135deg, #c41e3a, #8b1428);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: bold;
                        letter-spacing: 1px;
                        transition: transform 0.3s;
                        margin: 20px 0;
                    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                        VER PLANOS DE PREÇO
                    </button>

                    <p style="
                        font-size: 0.9rem;
                        color: #909090;
                        margin-top: 30px;
                    ">
                        Dúvidas? Entre em contato conosco.
                    </p>
                </div>
            </div>
        `;

        // Bloqueia cliques e navegação
        document.addEventListener('click', (e) => e.preventDefault(), true);
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    function mostrarAvisoExpiracao(diasRestantes) {
        // Cria banner no topo da página
        const banner = document.createElement('div');
        banner.id = 'aviso-expiracao';
        banner.innerHTML = `
            <div style="
                background: linear-gradient(90deg, #c41e3a 0%, #8b1428 100%);
                color: white;
                padding: 15px 20px;
                text-align: center;
                font-family: 'Lora', serif;
                font-size: 1.1rem;
                border-bottom: 3px solid #d4af37;
                box-shadow: 0 4px 12px rgba(196,30,58,0.3);
                position: sticky;
                top: 0;
                z-index: 9999;
            ">
                <strong>⚠️ VERSÃO DE TESTE</strong> -
                Expira em <strong>${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}</strong>
                (${DATA_EXPIRACAO}).
                <a href="${URL_PAGAMENTO}" style="
                    color: #d4af37;
                    text-decoration: underline;
                    font-weight: bold;
                    margin-left: 10px;
                    cursor: pointer;
                ">Contratar plano</a>
            </div>
        `;

        // Insere no topo do body
        document.body.insertBefore(banner, document.body.firstChild);

        // Log para debug
        console.log(`📅 EventCalc Pro v7 expira em: ${DATA_EXPIRACAO} (${diasRestantes} dias)`);
    }

    // Executar verificação quando página carrega
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', verificarExpiracao);
    } else {
        verificarExpiracao();
    }

    // Também verifica a cada 5 minutos (em caso de teste longo)
    setInterval(verificarExpiracao, 5 * 60 * 1000);
})();
