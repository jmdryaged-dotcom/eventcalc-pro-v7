/**
 * 📊 GOOGLE ANALYTICS 4 - EventCalc
 *
 * COMO CONFIGURAR:
 * 1. Acesse: https://analytics.google.com
 * 2. Crie uma conta (use jm.dryaged@gmail.com)
 * 3. Crie uma propriedade "EventCalc"
 * 4. Selecione "Web" como plataforma
 * 5. URL: https://eventcalc-pro-v7.pages.dev
 * 6. Copie o "Measurement ID" (formato: G-XXXXXXXXXX)
 * 7. Substitua G-XXXXXXXXXX abaixo pelo seu ID
 * 8. Faça upload da pasta files no Cloudflare Pages (via git push)
 *
 * QUE EVENTOS SÃO MEDIDOS:
 * - Page view automático (toda visita)
 * - lead_capturado: quando alguém envia o form
 * - lead_erro: quando dá erro no envio
 * - licenca_ativada: quando alguém ativa código premium
 * - cta_click: cliques em CTAs importantes (ex: "Receber Tutorial")
 */

(function() {
    'use strict';

    // Measurement ID do GA4 — Club Carnivorista / EventCalc
    const GA_MEASUREMENT_ID = 'G-SSC5V8L9XV';

    // Verificação: não carregar se não foi configurado
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') {
        console.warn('📊 Google Analytics não configurado. Edite analytics.js com seu Measurement ID.');
        // Cria stubs para que window.eventoGA não quebre o código que chama
        window.eventoGA = function() { /* noop */ };
        return;
    }

    // Respeitar LGPD: só carregar se consentimento foi dado
    if (localStorage.getItem('eventcalc_privacy_consent') !== 'true') {
        console.log('📊 Analytics aguardando consentimento LGPD.');
        // Cria stubs temporários
        window.eventoGA = function() { /* aguardando consent */ };

        // Quando o usuário aceitar, recarregar a página para ativar analytics
        // (o script será carregado da próxima vez)
        return;
    }

    // ─── Carregar script do GA4 ───
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        anonymize_ip: true,             // LGPD: IP anonimizado
        cookie_flags: 'SameSite=Strict;Secure',
        send_page_view: true
    });

    // ─── Helper global para disparar eventos custom ───
    // Uso: window.eventoGA('lead_capturado', { metodo: 'form_landing' })
    window.eventoGA = function(nome, params) {
        try {
            if (typeof gtag === 'function') {
                gtag('event', nome, params || {});
                console.log('📊 GA event:', nome, params);
            }
        } catch(e) {
            console.warn('Erro ao disparar evento GA:', e);
        }
    };

    console.log('📊 Google Analytics ativo:', GA_MEASUREMENT_ID);
})();
