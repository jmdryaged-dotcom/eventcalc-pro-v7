/**
 * 🔐 SISTEMA AUTOMÁTICO DE EXPIRAÇÃO - EventCalc
 *
 * Este script automaticamente:
 * 1. Verifica se a versão de teste expirou
 * 2. Mostra aviso visual se está perto de expirar
 * 3. Bloqueia acesso e redireciona para pagamento se expirou
 *
 * CONFIGURAÇÃO: Altere apenas a data em DATA_EXPIRACAO (linha 15)
 */

(function() {
    console.log('🚀 SISTEMA-EXPIRACAO.JS CARREGADO');

    // ═══════════════════════════════════════════════════════════════════
    // ⚙️ CONFIGURAÇÃO - ALTERE APENAS AQUI
    // ═══════════════════════════════════════════════════════════════════

    // Quantos dias cada usuário tem de teste, contado a partir da PRIMEIRA
    // entrada no site (não uma data global).
    const DIAS_TESTE = 7;

    // URL para redirecionamento após expiração
    const URL_PAGAMENTO = 'acesso-premium.html';

    // Número de dias antes de expiração para mostrar aviso
    const DIAS_AVISO = 3;

    // Chave do localStorage que guarda a primeira entrada do usuário
    const CHAVE_PRIMEIRA_ENTRADA = 'eventcalc_primeira_entrada';

    // ═══════════════════════════════════════════════════════════════════
    // 🔧 Calcular data de expiração baseada na primeira entrada do usuário
    // ═══════════════════════════════════════════════════════════════════
    function obterDataExpiracaoUsuario() {
        let dataPrimeiraEntrada = localStorage.getItem(CHAVE_PRIMEIRA_ENTRADA);

        if (!dataPrimeiraEntrada) {
            // Primeira visita: registra agora
            dataPrimeiraEntrada = new Date().toISOString();
            localStorage.setItem(CHAVE_PRIMEIRA_ENTRADA, dataPrimeiraEntrada);
            console.log('🆕 Primeira entrada do usuário registrada:', dataPrimeiraEntrada);
        }

        const entrada = new Date(dataPrimeiraEntrada);
        const expiracao = new Date(entrada.getTime() + (DIAS_TESTE * 24 * 60 * 60 * 1000));
        return expiracao;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🔧 LÓGICA (Não altere daqui para baixo)
    // ═══════════════════════════════════════════════════════════════════

    function verificarExpiracao() {
        // 🚫 EXCEÇÕES: Não bloquear em páginas de pagamento/admin
        const href = window.location.href;
        const paginasExcluidas = ['acesso-premium.html', 'gerenciador-codigos-pix.html', 'politica-privacidade.html'];
        const estaEmPaginaExcluida = paginasExcluidas.some(p => href.includes(p));

        console.log(`📄 URL: ${href} | Excluída: ${estaEmPaginaExcluida}`);

        if (estaEmPaginaExcluida) {
            console.log('✅✅✅ Página EXCLUÍDA - SEM NENHUM BLOQUEIO');
            return true;
        }

        // PRIORIDADE 1: Verificar se tem licença ativa
        const temLicenca = localStorage.getItem('eventcalc_licenca_ativa') === 'true';
        if (temLicenca) {
            const dataExpiracaoLicenca = localStorage.getItem('eventcalc_licenca_expiracao');
            if (dataExpiracaoLicenca) {
                const hoje = new Date();
                const expiracao = new Date(dataExpiracaoLicenca);

                // Se licença ainda é válida: ACESSO COMPLETO
                if (hoje <= expiracao) {
                    const tipoLicenca = localStorage.getItem('eventcalc_licenca_tipo') || 'desconhecido';
                    const diasRestantes = Math.ceil((expiracao - hoje) / (1000 * 60 * 60 * 24));

                    // Se falta pouco: mostrar aviso de renovação (APENAS NAS PÁGINAS NÃO EXCLUÍDAS)
                    if (diasRestantes <= 30 && !estaEmPaginaExcluida) {
                        mostrarAvisoRenovacao(diasRestantes, tipoLicenca);
                    }

                    console.log(`✅ EventCalc - Licença ${tipoLicenca} ativa até ${dataExpiracaoLicenca} (Página excluída: ${estaEmPaginaExcluida})`);
                    // ✅ SEMPRE retorna true se licença válida - deixa acessar tudo
                    return true;
                } else {
                    // Licença expirou: limpar e bloquear
                    localStorage.removeItem('eventcalc_licenca_ativa');
                    localStorage.removeItem('eventcalc_licenca_tipo');
                    localStorage.removeItem('eventcalc_licenca_expiracao');
                }
            }
        }

        // PRIORIDADE 2: Verificar trial individual do usuário
        // Cada usuário tem DIAS_TESTE dias contados a partir da primeira entrada
        const hoje = new Date();
        const expiracao = obterDataExpiracaoUsuario();

        // Se trial expirou: BLOQUEADO (mostra tela de pagamento)
        if (hoje > expiracao) {
            mostrarTelaExpirada();
            return false;
        }

        // Se faltam poucos dias: MOSTRAR AVISO
        const diasRestantes = Math.ceil((expiracao - hoje) / (1000 * 60 * 60 * 24));
        if (diasRestantes <= DIAS_AVISO) {
            mostrarAvisoExpiracao(diasRestantes);
        }

        console.log(`✅ EventCalc - Trial ativo. Expira em ${diasRestantes} dia(s).`);
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
                        Seu período de ${DIAS_TESTE} dias de teste gratuito terminou.
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

    function mostrarAvisoRenovacao(diasRestantes, tipoLicenca) {
        // Cria banner no topo da página (licença ativa mas vencendo)
        const banner = document.createElement('div');
        banner.id = 'aviso-renovacao';
        banner.innerHTML = `
            <div style="
                background: linear-gradient(90deg, #d4af37 0%, #b8860b 100%);
                color: #0a0a0a;
                padding: 15px 20px;
                text-align: center;
                font-family: 'Lora', serif;
                font-size: 1.1rem;
                border-bottom: 3px solid #8b1428;
                box-shadow: 0 4px 12px rgba(212,175,55,0.3);
                position: sticky;
                top: 0;
                z-index: 9999;
            ">
                <strong>📅 AVISO DE RENOVAÇÃO</strong> -
                Sua licença (${tipoLicenca}) expira em <strong>${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}</strong>.
                <a href="${URL_PAGAMENTO}" style="
                    color: #8b1428;
                    text-decoration: underline;
                    font-weight: bold;
                    margin-left: 10px;
                    cursor: pointer;
                ">Renovar agora</a>
            </div>
        `;

        // Insere no topo do body
        document.body.insertBefore(banner, document.body.firstChild);
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
                <strong>⚠️ TESTE GRATUITO</strong> -
                Seu teste expira em <strong>${diasRestantes} dia${diasRestantes !== 1 ? 's' : ''}</strong>.
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
        console.log(`📅 EventCalc - Trial individual. Restam ${diasRestantes} dia(s).`);
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
