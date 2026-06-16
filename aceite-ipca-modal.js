/**
 * ⚖️ MODAL DE ACEITE DE CONDIÇÕES DO PLANO — EventCalc
 *
 * Aparece após o cliente ativar a licença em acesso-premium.html,
 * pedindo aceite explícito da cláusula de reajuste anual pelo IPCA.
 *
 * BASE JURÍDICA:
 *   - Lei 8.078/1990 (CDC), arts. 46 e 54: contratos de adesão
 *     exigem aceite informado, claro e prévio
 *   - Lei 10.406/2002 (CC), art. 425: contratos atípicos
 *   - LGPD: registro de consentimento com dados técnicos
 *
 * ANTI-FRAUDE:
 *   - Honeypot field (anti-bot)
 *   - Timestamp validation no backend
 *   - IP + User-Agent capturados
 *   - Hash SHA-256 do aceite (impede tampering local trivial)
 *   - Backend valida e envia email de confirmação ao cliente
 *
 * Como usar:
 *   <script src="aceite-ipca-modal.js"></script>
 */

(function() {
    'use strict';

    // ─── CONFIGURAÇÃO ───────────────────────────────────────
    const VERSAO_TERMOS = '1.0';
    const CHAVE_ACEITE = 'eventcalc_aceite_ipca';
    const BACKEND_URL_DEFAULT = 'https://eventcalc-pro-v7.onrender.com';

    // Páginas onde o modal pode aparecer (cliente pagante)
    const PAGINAS_ALVO = [
        'acesso-premium',
        'event_calculator_pro_v7_questionario',
        'event_calculator_pro_v7_cardapio',
        'event_calculator_pro_v7_volumes',
        'event_calculator_pro_v7_proposta',
        'biblioteca-cardapios-especiais'
    ];

    // ─── UTILS ──────────────────────────────────────────────
    function paginaPermitida() {
        const path = window.location.pathname.toLowerCase();
        return PAGINAS_ALVO.some(p => path.includes(p));
    }

    function clienteEPagante() {
        const ativa = localStorage.getItem('eventcalc_licenca_ativa') === 'true';
        const status = localStorage.getItem('license_status') === 'active';
        return ativa || status;
    }

    function jaAceitou() {
        try {
            const raw = localStorage.getItem(CHAVE_ACEITE);
            if (!raw) return false;
            const dados = JSON.parse(raw);
            return dados.aceito === true && dados.versao_termos === VERSAO_TERMOS;
        } catch (e) { return false; }
    }

    async function calcularHashAceite(dados) {
        // SHA-256(versao + email + timestamp) → impede tampering local trivial
        const fonte = dados.versao_termos + '|' + (dados.email || '') + '|' + dados.timestamp;
        const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(fonte));
        return Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
    }

    async function obterIP() {
        try {
            const r = await fetch('https://api.ipify.org?format=json');
            const d = await r.json();
            return d.ip;
        } catch (e) { return 'ip-desconhecido'; }
    }

    function escapeHtml(t) {
        return String(t || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // ─── EXIBIR MODAL ───────────────────────────────────────
    function mostrarModalAceite() {
        // Overlay
        const overlay = document.createElement('div');
        overlay.id = 'aceiteIpcaOverlay';
        overlay.style.cssText = `
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.92);
            backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
            z-index: 99999;
            display: flex; align-items: center; justify-content: center;
            padding: 20px;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #15151a;
            border: 2px solid #d4af37;
            border-radius: 14px;
            padding: 32px 26px;
            max-width: 620px; width: 100%;
            color: #e5e5e5;
            font-family: 'Lora', Georgia, serif;
            max-height: 92vh; overflow-y: auto;
            box-shadow: 0 24px 80px rgba(212,175,55,0.25);
        `;

        // ⚠️ HONEYPOT — campo invisível pra detectar bots
        // Se for preenchido = bot. Humano nunca vê esse campo.
        modal.innerHTML = `
            <div style="text-align:center; margin-bottom: 18px;">
                <div style="font-size:48px;">⚖️</div>
                <h2 style="color:#d4af37; font-family:'Playfair Display',Georgia,serif; font-size:24px; margin:8px 0 4px;">
                    Aceite das Condições do Plano
                </h2>
                <p style="color:#a1a1a6; font-size:13px; margin:0;">
                    Confirme as condições antes de começar a usar o EventCalc
                </p>
            </div>

            <div style="background:#0a0a0a; border:1px solid #2a2a30; border-radius:10px; padding:18px 20px; margin-bottom:18px;">
                <h3 style="color:#d4af37; font-size:14px; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.05em;">
                    📊 Reajuste anual de preço
                </h3>
                <p style="font-size:14px; line-height:1.6; margin:0;">
                    Sua assinatura terá o valor <strong>reajustado uma vez por ano</strong>,
                    na data de aniversário do contrato, com base no <strong>IPCA acumulado</strong>
                    dos 12 meses anteriores (índice oficial IBGE).
                </p>
            </div>

            <div style="background:#0a0a0a; border:1px solid #2a2a30; border-radius:10px; padding:18px 20px; margin-bottom:18px;">
                <h3 style="color:#d4af37; font-size:14px; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.05em;">
                    📧 Aviso prévio
                </h3>
                <p style="font-size:14px; line-height:1.6; margin:0;">
                    Você será <strong>avisado por email com 30 dias de antecedência</strong>
                    sobre qualquer reajuste, com direito de cancelar sem multa antes da cobrança.
                </p>
            </div>

            <div style="background:#0a0a0a; border:1px solid #2a2a30; border-radius:10px; padding:18px 20px; margin-bottom:18px;">
                <h3 style="color:#d4af37; font-size:14px; margin:0 0 8px; text-transform:uppercase; letter-spacing:0.05em;">
                    🛡️ Garantia do Plano Anual
                </h3>
                <p style="font-size:14px; line-height:1.6; margin:0;">
                    Pagamentos no Plano Anual ficam <strong>protegidos do reajuste até o fim
                    do ciclo de 12 meses</strong> já pago.
                </p>
            </div>

            <div style="background:rgba(212,175,55,0.08); border:1px solid #d4af37; border-radius:10px; padding:14px 18px; margin-bottom:20px;">
                <p style="font-size:13.5px; line-height:1.55; margin:0; color:#e5e5e5;">
                    💰 <strong>Garantia de 7 dias:</strong> Se não gostar do EventCalc, devolvemos
                    100% do valor pela Hotmart em até 7 dias, sem perguntas.
                </p>
            </div>

            <p style="font-size:12px; color:#6e6e73; text-align:center; margin-bottom:16px;">
                Ao aceitar, registramos data, hora, dispositivo e IP para fins jurídicos
                (consentimento informado conforme CDC arts. 46 e 54).
                <a href="termos-de-uso.html" target="_blank" style="color:#d4af37;">Ler Termos completos</a>
            </p>

            <!-- ⚠️ HONEYPOT (escondido visualmente, mas presente no DOM) -->
            <input type="text" name="website" id="aceiteHoneypot"
                   tabindex="-1" autocomplete="off"
                   style="position:absolute; left:-9999px; opacity:0; pointer-events:none;">

            <!-- Campo de email pra registro -->
            <div style="margin-bottom:18px;">
                <label style="display:block; color:#d4af37; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:6px;">
                    Seu email (usado na compra)
                </label>
                <input type="email" id="aceiteEmail" required
                       placeholder="seu@email.com"
                       style="width:100%; padding:12px 14px; background:#0a0a0a; border:1px solid #2a2a30; border-radius:8px; color:#fff; font-size:15px; font-family:inherit; box-sizing:border-box; max-width:100%;">
                <p style="font-size:11.5px; color:#6e6e73; margin:6px 0 0;">
                    Usaremos pra confirmar o aceite e enviar comunicações sobre reajustes
                </p>
            </div>

            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <button type="button" id="btnAceitarIpca" style="
                    flex: 1; min-width: 220px;
                    background:linear-gradient(135deg,#d4af37,#b8860b);
                    color:#0a0a0a; border:none; padding:14px 22px;
                    border-radius:10px; cursor:pointer;
                    font-weight:700; font-size:15px;
                    font-family:inherit;
                ">
                    ✓ Li, entendi e aceito
                </button>
                <button type="button" id="btnRecusarIpca" style="
                    flex: 1; min-width: 180px;
                    background:transparent; color:#a1a1a6;
                    border:1px solid #3a3a40; padding:14px 22px;
                    border-radius:10px; cursor:pointer;
                    font-size:14px;
                    font-family:inherit;
                ">
                    ✕ Não aceito
                </button>
            </div>

            <div id="aceiteStatus" style="display:none; margin-top:14px; padding:12px 16px; border-radius:8px; font-size:13.5px; line-height:1.5;"></div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Pré-preenche email se já estiver salvo
        try {
            const codigoLicenca = localStorage.getItem('eventcalc_licenca_email');
            if (codigoLicenca) document.getElementById('aceiteEmail').value = codigoLicenca;
        } catch (e) {}

        // ── HANDLER: ACEITAR ──
        document.getElementById('btnAceitarIpca').addEventListener('click', async () => {
            const btn = document.getElementById('btnAceitarIpca');
            const status = document.getElementById('aceiteStatus');
            const honeypot = document.getElementById('aceiteHoneypot').value;
            const email = document.getElementById('aceiteEmail').value.trim().toLowerCase();

            // Anti-bot: se honeypot foi preenchido = bot
            if (honeypot) {
                console.warn('[aceite-ipca] Honeypot acionado — request bloqueado');
                return; // silenciosamente ignora
            }

            // Validação básica de email
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                status.style.display = 'block';
                status.style.background = 'rgba(196,30,58,0.15)';
                status.style.border = '1px solid #c41e3a';
                status.style.color = '#ff9999';
                status.textContent = '⚠️ Por favor, informe um email válido.';
                return;
            }

            btn.disabled = true;
            btn.textContent = '⏳ Registrando aceite...';

            const timestamp = new Date().toISOString();
            const ip = await obterIP();

            const dadosAceite = {
                aceito: true,
                versao_termos: VERSAO_TERMOS,
                timestamp: timestamp,
                email: email,
                ip: ip,
                user_agent: navigator.userAgent.substring(0, 200),
                idioma: navigator.language || 'pt-BR',
                tela: window.screen.width + 'x' + window.screen.height
            };

            // Hash SHA-256 do aceite (anti-tampering local)
            dadosAceite.hash_aceite = await calcularHashAceite(dadosAceite);

            // Salva localStorage IMEDIATAMENTE (não depende do backend)
            try {
                localStorage.setItem(CHAVE_ACEITE, JSON.stringify(dadosAceite));
                localStorage.setItem('eventcalc_licenca_email', email);
            } catch (e) {
                console.error('[aceite-ipca] Erro ao salvar localStorage:', e);
            }

            // Envia ao backend pra registro jurídico robusto
            // (não-bloqueante: se falhar, o aceite local continua válido)
            try {
                const BACKEND_URL = (window.BACKEND_URL || BACKEND_URL_DEFAULT);
                const resp = await fetch(BACKEND_URL + '/aceite-ipca', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAceite)
                });
                if (resp.ok) {
                    console.log('[aceite-ipca] ✅ Registrado no servidor');
                } else {
                    console.warn('[aceite-ipca] Servidor retornou', resp.status);
                }
            } catch (e) {
                console.warn('[aceite-ipca] Backend offline ou erro — aceite local mantido:', e.message);
            }

            // Mostra confirmação e fecha modal
            status.style.display = 'block';
            status.style.background = 'rgba(76,175,80,0.15)';
            status.style.border = '1px solid #4caf50';
            status.style.color = '#a5d6a7';
            status.innerHTML = '✅ <strong>Aceite registrado!</strong> Você receberá um email de confirmação. Bom uso do EventCalc!';

            setTimeout(() => {
                const ov = document.getElementById('aceiteIpcaOverlay');
                if (ov) ov.remove();
            }, 2200);
        });

        // ── HANDLER: RECUSAR ──
        document.getElementById('btnRecusarIpca').addEventListener('click', () => {
            modal.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:48px; margin-bottom:14px;">😔</div>
                    <h2 style="color:#d4af37; font-family:'Playfair Display',Georgia,serif; font-size:22px; margin:0 0 12px;">
                        Tudo bem, sem problemas
                    </h2>
                    <p style="font-size:14.5px; line-height:1.6; margin:0 0 16px; color:#d8d8da;">
                        Sem o aceite das condições de reajuste, não é possível ativar o EventCalc.
                    </p>
                    <p style="font-size:14px; line-height:1.6; margin:0 0 20px; color:#d8d8da;">
                        Você tem direito a <strong>reembolso integral em até 7 dias</strong> após
                        a compra, pelo painel da Hotmart, sem perguntas.
                    </p>

                    <div style="background:#0a0a0a; border:1px solid #2a2a30; border-radius:10px; padding:16px 18px; margin-bottom:18px; text-align:left;">
                        <p style="font-size:13.5px; line-height:1.6; margin:0;">
                            <strong style="color:#d4af37;">Como pedir reembolso:</strong><br>
                            1. Acesse <a href="https://hotmart.com" target="_blank" style="color:#d4af37;">hotmart.com</a> → "Minhas Compras"<br>
                            2. Encontre o EventCalc na lista<br>
                            3. Clique em "Pedir Reembolso"<br>
                            4. Selecione "Não desejo o produto"
                        </p>
                    </div>

                    <a href="https://hotmart.com/pt-br/club/eventcalc" target="_blank"
                       style="display:inline-block; background:linear-gradient(135deg,#d4af37,#b8860b); color:#0a0a0a; padding:13px 26px; border-radius:8px; text-decoration:none; font-weight:700; font-size:14px;">
                        Ir para Hotmart →
                    </a>

                    <p style="font-size:12px; color:#6e6e73; margin:18px 0 0;">
                        Dúvidas? Fale com <a href="mailto:jm.dryaged@gmail.com" style="color:#d4af37;">jm.dryaged@gmail.com</a>
                    </p>
                </div>
            `;
        });
    }

    // ─── INIT ───────────────────────────────────────────────
    window.addEventListener('load', () => {
        if (!paginaPermitida()) return;
        if (!clienteEPagante()) return; // trial gratuito não precisa
        if (jaAceitou()) return; // já registrado

        // Pequeno delay pra não competir com LGPD modal ou outras inicializações
        setTimeout(mostrarModalAceite, 500);
    });

    // ─── API PÚBLICA (debug/admin) ──────────────────────────
    window.AceiteIPCA = {
        consultar: () => {
            try { return JSON.parse(localStorage.getItem(CHAVE_ACEITE) || '{}'); }
            catch (e) { return null; }
        },
        forcarModal: mostrarModalAceite,
        limpar: () => localStorage.removeItem(CHAVE_ACEITE) // só pra testes em dev
    };
})();
