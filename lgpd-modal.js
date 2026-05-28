/**
 * 🔒 MODAL DE CONSENTIMENTO LGPD - EventCalc
 *
 * Aparece automaticamente em qualquer página que inclua este script,
 * caso o usuário ainda não tenha aceitado.
 *
 * Bloqueia o uso do site até o aceite.
 * Inclui botão de "deletar meus dados" (direito ao esquecimento).
 *
 * Como usar:
 *   <script src="lgpd-modal.js"></script>
 */

(function() {
    'use strict';

    const CHAVE_CONSENTIMENTO = 'eventcalc_privacy_consent';
    const CHAVE_DATA = 'eventcalc_privacy_consent_date';

    // Páginas onde NÃO mostramos o modal (mas a função deletar dados precisa estar disponível)
    const paginasExcluidas = ['politica-privacidade', '404', 'admin-leads', 'admin-setup', 'gerenciador-'];
    const urlAtual = window.location.pathname.toLowerCase();
    const estaExcluida = paginasExcluidas.some(p => urlAtual.includes(p));

    window.addEventListener('load', () => {
        // Não exibir modal em páginas excluídas (mas a função deletarMeusDados continua disponível)
        if (estaExcluida) return;
        if (localStorage.getItem(CHAVE_CONSENTIMENTO) === 'true') return;

        // ── OVERLAY ──
        const overlay = document.createElement('div');
        overlay.id = 'lgpdOverlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(4px);
            z-index: 99998;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;

        // ── MODAL ──
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #1a1a1a;
            border: 2px solid #d4af37;
            border-radius: 12px;
            padding: 35px 28px;
            max-width: 560px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 60px rgba(212, 175, 55, 0.3);
            color: #d0d0d0;
            font-family: 'Lora', serif, sans-serif;
            max-height: 90vh;
            overflow-y: auto;
        `;

        modal.innerHTML = `
            <div style="font-size: 2.8rem; margin-bottom: 12px;">🔒</div>
            <h2 style="color: #d4af37; margin-bottom: 18px; font-size: 1.5rem; font-family: 'Playfair Display', serif, sans-serif;">
                Aviso de Privacidade (LGPD)
            </h2>
            <p style="margin-bottom: 14px; line-height: 1.6; font-size: 0.95rem;">
                Para usar o <strong style="color: #d4af37;">EventCalc</strong>,
                você precisa ler e aceitar nossa Política de Privacidade.
            </p>
            <p style="margin-bottom: 14px; line-height: 1.6; font-size: 0.9rem; text-align: left;">
                <strong style="color: #d4af37;">O que coletamos:</strong><br>
                • Dados do evento (local, data, número de pessoas) — armazenados no SEU navegador<br>
                • Email/WhatsApp (apenas se você preencher o formulário de tutorial)<br>
                • IP do dispositivo (se você ativar uma licença — para detectar compartilhamento)
            </p>
            <p style="margin-bottom: 14px; line-height: 1.6; font-size: 0.9rem; text-align: left;">
                <strong style="color: #d4af37;">Onde ficam:</strong><br>
                • Localmente no seu navegador (localStorage)<br>
                • Email transacional via Resend (apenas para enviar o tutorial)
            </p>
            <p style="margin-bottom: 20px; line-height: 1.8;">
                <a href="politica-privacidade.html" target="_blank"
                   style="color: #d4af37; text-decoration: underline; font-weight: bold; font-size: 0.95rem;">
                    📄 Política de Privacidade
                </a>
                <span style="color: #555; margin: 0 10px;">|</span>
                <a href="termos-de-uso.html" target="_blank"
                   style="color: #d4af37; text-decoration: underline; font-weight: bold; font-size: 0.95rem;">
                    📜 Termos de Uso
                </a>
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 14px;">
                <button id="btnAceitarLGPD" style="
                    background: linear-gradient(135deg, #d4af37 0%, #b8860b 100%);
                    color: #0a0a0a;
                    border: none;
                    padding: 13px 28px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 0.95rem;
                    transition: 0.3s;
                ">
                    ✓ Aceito e Quero Continuar
                </button>
                <button id="btnRecusarLGPD" style="
                    background: transparent;
                    color: #909090;
                    border: 1px solid #444;
                    padding: 13px 28px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 0.95rem;
                    transition: 0.3s;
                ">
                    ✕ Não Aceito
                </button>
            </div>
            <p style="font-size: 0.78rem; color: #707070; margin-bottom: 10px;">
                Ao clicar em "Aceito", você concorda com nossa Política de Privacidade.
            </p>
            <p style="font-size: 0.78rem; color: #707070;">
                💡 Você pode revogar o consentimento e deletar seus dados a qualquer momento
                no <a href="politica-privacidade.html" style="color: #d4af37;">link da política</a>.
            </p>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        const scrollOriginal = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        // Aceitar
        document.getElementById('btnAceitarLGPD').addEventListener('click', () => {
            localStorage.setItem(CHAVE_CONSENTIMENTO, 'true');
            localStorage.setItem(CHAVE_DATA, new Date().toISOString());
            overlay.remove();
            document.body.style.overflow = scrollOriginal;
        });

        // Recusar — redireciona para fora do site
        document.getElementById('btnRecusarLGPD').addEventListener('click', () => {
            if (confirm('Sem aceitar a Política de Privacidade, você não poderá usar o EventCalc. Deseja sair do site?')) {
                window.location.href = 'https://www.google.com';
            }
        });

        // Hover effect
        document.getElementById('btnAceitarLGPD').addEventListener('mouseover', e => e.target.style.transform = 'translateY(-2px)');
        document.getElementById('btnAceitarLGPD').addEventListener('mouseout', e => e.target.style.transform = 'none');
        document.getElementById('btnRecusarLGPD').addEventListener('mouseover', e => e.target.style.background = '#2a2a2a');
        document.getElementById('btnRecusarLGPD').addEventListener('mouseout', e => e.target.style.background = 'transparent');
    });

    // ═════════════════════════════════════════════════════════════
    // 🗑️ FUNÇÃO GLOBAL: Direito ao Esquecimento (LGPD)
    // Pode ser chamada de qualquer página: window.deletarMeusDados()
    // ═════════════════════════════════════════════════════════════
    window.deletarMeusDados = function() {
        const confirma = confirm(
            '⚠️ ATENÇÃO: Esta ação vai APAGAR todos os seus dados deste navegador:\n\n' +
            '• Orçamentos salvos\n' +
            '• Cardápios customizados\n' +
            '• Dados profissionais (nome, contatos, fotos)\n' +
            '• Consentimento LGPD\n' +
            '• Licenças ativas\n\n' +
            'Não há volta. Deseja continuar?'
        );
        if (!confirma) return false;

        // Lista de TODAS as chaves do EventCalc para apagar
        const chavesParaApagar = [];
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave && (chave.startsWith('eventcalc') || chave.startsWith('eventocalc'))) {
                chavesParaApagar.push(chave);
            }
        }
        chavesParaApagar.forEach(c => localStorage.removeItem(c));

        alert('✅ Todos os seus dados foram apagados.\n\n' + chavesParaApagar.length + ' itens removidos.\n\nA página será recarregada agora.');
        window.location.reload();
        return true;
    };
})();
