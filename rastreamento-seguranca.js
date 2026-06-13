/**
 * 🔐 SISTEMA DE RASTREAMENTO DE SEGURANÇA - EventCalc
 *
 * Detecta e avisa sobre compartilhamento de licenças
 * Armazena localmente: IPs, timestamps, emails
 */

const RastreamentoSeguranca = (() => {
    const CHAVE_ATIVACOES = 'eventcalc_ativacoes_log';
    const LIMIAR_ATIVACOES_SUSPEITAS = 3; // Ativar em 3+ IPs diferentes em 24h = suspeito
    const JANELA_TEMPO = 24 * 60 * 60 * 1000; // 24 horas em ms

    /**
     * Registrar ativação de código
     * @param {string} codigo - Código de licença
     * @param {string} email - Email do cliente
     */
    async function registrarAtivacao(codigo, email) {
        try {
            // Obter IP do cliente
            const ip = await obterIP();

            // Obter ativações anteriores
            const ativacoes = JSON.parse(localStorage.getItem(CHAVE_ATIVACOES) || '[]');

            // Registrar esta ativação
            const novaAtivacao = {
                codigo: codigo,
                email: email,
                ip: ip,
                timestamp: new Date().getTime(),
                navegador: detectarNavegador(),
                dispositivo: detectarDispositivo()
            };

            ativacoes.push(novaAtivacao);
            localStorage.setItem(CHAVE_ATIVACOES, JSON.stringify(ativacoes));

            // Verificar se é suspeito
            const alertas = verificarCompartilhamento(codigo, ativacoes);

            if (alertas.length > 0) {
                registrarAlerta(codigo, email, ip, alertas);
            }

            return {
                sucesso: true,
                suspeito: alertas.length > 0,
                alertas: alertas
            };

        } catch (erro) {
            console.error('Erro ao registrar ativação:', erro);
            return { sucesso: false, erro: erro.message };
        }
    }

    /**
     * Obter IP do cliente via API pública
     */
    async function obterIP() {
        try {
            const resposta = await fetch('https://api.ipify.org?format=json');
            const dados = await resposta.json();
            return dados.ip;
        } catch (erro) {
            console.warn('Não conseguiu obter IP:', erro);
            return 'ip-desconhecido';
        }
    }

    /**
     * Detectar tipo de navegador
     */
    function detectarNavegador() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Edg') > -1) return 'Edge';
        if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
        return 'Desconhecido';
    }

    /**
     * Detectar tipo de dispositivo
     */
    function detectarDispositivo() {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return 'Mobile';
        if (/tablet/i.test(ua)) return 'Tablet';
        if (/iPad/i.test(ua)) return 'iPad';
        return 'Desktop';
    }

    /**
     * Verificar se há padrão de compartilhamento
     */
    function verificarCompartilhamento(codigo, todasAsAtivacoes) {
        const alertas = [];
        const agora = new Date().getTime();

        // Filtrar ativações do mesmo código nos últimos 24h
        const ativacoesDoCodigo = todasAsAtivacoes.filter(a =>
            a.codigo === codigo &&
            (agora - a.timestamp) <= JANELA_TEMPO
        );

        // Contar IPs únicos
        const ipsUnicos = new Set(ativacoesDoCodigo.map(a => a.ip));

        // ALERTA 1: Múltiplos IPs em 24h
        if (ipsUnicos.size >= LIMIAR_ATIVACOES_SUSPEITAS) {
            alertas.push({
                tipo: 'MULTIPLOS_IPS',
                severidade: 'alto',
                mensagem: `Licença ativada em ${ipsUnicos.size} IPs diferentes nas últimas 24h`,
                ips: Array.from(ipsUnicos)
            });
        }

        // ALERTA 2: Múltiplos navegadores/dispositivos
        const dispositivos = new Set(ativacoesDoCodigo.map(a => `${a.navegador}/${a.dispositivo}`));
        if (dispositivos.size >= 3) {
            alertas.push({
                tipo: 'MULTIPLOS_DISPOSITIVOS',
                severidade: 'medio',
                mensagem: `Licença usada em ${dispositivos.size} combinações de navegador/dispositivo`,
                dispositivos: Array.from(dispositivos)
            });
        }

        // ALERTA 3: Ativações muito próximas (< 1 minuto)
        if (ativacoesDoCodigo.length >= 2) {
            const ultimaDois = ativacoesDoCodigo.slice(-2);
            const diferenca = ultimaDois[1].timestamp - ultimaDois[0].timestamp;

            if (diferenca < 60 * 1000) { // Menos de 1 minuto
                alertas.push({
                    tipo: 'ATIVACOES_RAPIDAS',
                    severidade: 'medio',
                    mensagem: 'Duas ativações em menos de 1 minuto detectadas'
                });
            }
        }

        return alertas;
    }

    /**
     * Registrar alerta para análise
     */
    function registrarAlerta(codigo, email, ip, alertas) {
        const alertasLog = JSON.parse(localStorage.getItem('eventcalc_alertas_seguranca') || '[]');

        alertasLog.push({
            codigo: codigo,
            email: email,
            ip: ip,
            timestamp: new Date().toISOString(),
            alertas: alertas,
            dataLegivel: new Date().toLocaleString('pt-BR')
        });

        localStorage.setItem('eventcalc_alertas_seguranca', JSON.stringify(alertasLog));

        // Log no console para debug
        console.warn('🚨 ALERTA DE SEGURANÇA:', {
            codigo: codigo,
            email: email,
            alertas: alertas
        });
    }

    /**
     * Obter relatório de ativações (para gerenciador)
     */
    function obterRelatorio() {
        const ativacoes = JSON.parse(localStorage.getItem(CHAVE_ATIVACOES) || '[]');
        const alertas = JSON.parse(localStorage.getItem('eventcalc_alertas_seguranca') || '[]');

        return {
            totalAtivacoes: ativacoes.length,
            codigosUsados: new Set(ativacoes.map(a => a.codigo)).size,
            ativacoes: ativacoes,
            alertas: alertas,
            alertasAtivos: alertas.filter(a => {
                const idade = new Date().getTime() - new Date(a.timestamp).getTime();
                return idade < 7 * 24 * 60 * 60 * 1000; // Últimos 7 dias
            })
        };
    }

    /**
     * Limpar relatório (para testes)
     */
    function limparRelatorio() {
        localStorage.removeItem(CHAVE_ATIVACOES);
        localStorage.removeItem('eventcalc_alertas_seguranca');
        console.log('✅ Relatório de segurança limpo');
    }

    /**
     * API pública
     */
    return {
        registrarAtivacao,
        obterRelatorio,
        limparRelatorio,
        obterIP
    };
})();
