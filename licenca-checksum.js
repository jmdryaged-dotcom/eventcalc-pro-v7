/**
 * 🔐 BIBLIOTECA DE CHECKSUM - EventCalc Pro v7
 *
 * Adiciona uma assinatura matemática (checksum) aos códigos de licença.
 * Sem o checksum correto, o código é rejeitado.
 *
 * Isso NÃO é segurança perfeita (a chave fica no JS público), mas:
 * - Filtra usuários casuais que tentariam forjar códigos
 * - Garante que códigos antigos sem checksum não funcionem
 * - Permite invalidar todos os códigos antigos trocando a chave
 *
 * Para versão final segura, validação migrará para backend (Assador 5 Min).
 */

(function(global) {
    'use strict';

    // ⚠️ CHAVE SECRETA — Trocar quando quiser invalidar TODOS os códigos antigos
    // (clientes legítimos precisarão receber novos códigos)
    const CHAVE_SECRETA = 'CLUB-CARNIVORISTA-2026-EVENTCALC-V7-PIX-MAY';

    /**
     * Calcula checksum de um código (sem o checksum no final).
     * Retorna 4 caracteres hexadecimais maiúsculos.
     *
     * @param {string} codigoBase - O código sem o checksum (ex: "EVENTCALC-MENSAL-20260527-AB12CD")
     * @returns {Promise<string>} - 4 caracteres do checksum (ex: "K7P3")
     */
    async function calcularChecksum(codigoBase) {
        const dados = CHAVE_SECRETA + ':' + codigoBase;
        const buf = await crypto.subtle.digest(
            'SHA-256',
            new TextEncoder().encode(dados)
        );
        const hex = Array.from(new Uint8Array(buf))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        // Pega os 4 primeiros caracteres do hash e converte pra maiúsculo
        return hex.substring(0, 4).toUpperCase();
    }

    /**
     * Gera um código completo com checksum.
     *
     * @param {string} tipo - "MENSAL" ou "TRIMESTRAL" etc.
     * @param {string} data - YYYYMMDD (ex: "20260527")
     * @param {string} hash - 6 caracteres aleatórios (ex: "AB12CD")
     * @returns {Promise<string>} - Código completo (ex: "EVENTCALC-MENSAL-20260527-AB12CD-K7P3")
     */
    async function gerarCodigoComChecksum(tipo, data, hash) {
        const base = `EVENTCALC-${tipo.toUpperCase()}-${data}-${hash.toUpperCase()}`;
        const checksum = await calcularChecksum(base);
        return base + '-' + checksum;
    }

    /**
     * Valida um código verificando se o checksum está correto.
     *
     * @param {string} codigo - Código completo a validar
     * @returns {Promise<boolean>} - true se válido, false caso contrário
     */
    async function validarChecksum(codigo) {
        if (!codigo || typeof codigo !== 'string') return false;

        const partes = codigo.trim().toUpperCase().split('-');
        // Formato esperado: EVENTCALC-TIPO-DATA-HASH-CHECKSUM (5 partes)
        if (partes.length !== 5) return false;
        if (partes[0] !== 'EVENTCALC') return false;

        const checksumInformado = partes[4];
        const base = partes.slice(0, 4).join('-');
        const checksumEsperado = await calcularChecksum(base);

        return checksumInformado === checksumEsperado;
    }

    /**
     * Extrai informações de um código válido.
     *
     * @param {string} codigo - Código completo
     * @returns {Object|null} - {tipo, data, hash, checksum} ou null se inválido
     */
    function extrairInfo(codigo) {
        if (!codigo || typeof codigo !== 'string') return null;
        const partes = codigo.trim().toUpperCase().split('-');
        if (partes.length !== 5 || partes[0] !== 'EVENTCALC') return null;

        return {
            prefixo: partes[0],
            tipo: partes[1].toLowerCase(),
            data: partes[2],
            hash: partes[3],
            checksum: partes[4]
        };
    }

    // Expor API global
    global.LicencaChecksum = {
        calcular: calcularChecksum,
        gerar: gerarCodigoComChecksum,
        validar: validarChecksum,
        extrair: extrairInfo
    };
})(window);
