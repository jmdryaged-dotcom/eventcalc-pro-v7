// ── GERADOR DO TUTORIAL PDF v2 ──
// Cores otimizadas: Preto, Dourado, Branco, Vermelho
// Conteúdo com VALUE PROPOSITION e ROI
// Inclui: Horas Excedentes, economia de tempo, exemplos práticos

function gerarTutorialPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // ── CORES ──
    const corOuro = [212, 175, 55];      // #d4af37 - Dourado
    const corVermelho = [196, 30, 58];   // #c41e3a - Vermelho
    const corPreto = [26, 26, 26];       // #1a1a1a - Preto
    const corBranco = [255, 255, 255];   // #ffffff - Branco
    const corCinza = [180, 180, 180];    // #b4b4b4 - Cinza claro

    let posY = 15;
    const margemEsq = 15;
    const margemDir = 15;
    const larguraTexto = 210 - margemEsq - margemDir;
    const linhaAltura = 5;

    // ── FUNÇÃO: Adicionar Página com Fundo ──
    function novaPagemComFundo() {
        doc.setFillColor(...corPreto);
        doc.rect(0, 0, 210, 297, 'F');
        posY = 15;
    }

    // ── FUNÇÃO: Título Principal ──
    function adicionarTitulo(texto) {
        doc.setFont('times', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...corOuro);
        doc.text(texto, margemEsq, posY);
        posY += 12;
    }

    // ── FUNÇÃO: Subtítulo ──
    function adicionarSubtitulo(texto) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...corOuro);
        doc.text(texto, margemEsq, posY);
        posY += 7;
    }

    // ── FUNÇÃO: Texto Normal ──
    function adicionarTexto(texto, tamanho = 10, cor = corCinza) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(tamanho);
        doc.setTextColor(...cor);

        const linhas = doc.splitTextToSize(texto, larguraTexto);
        doc.text(linhas, margemEsq, posY);
        posY += linhas.length * linhaAltura + 2;
    }

    // ── FUNÇÃO: Caixa Destacada ──
    function adicionarCaixa(titulo, conteudo, tipoCor = 'ouro') {
        const cor = tipoCor === 'vermelho' ? corVermelho : corOuro;

        doc.setDrawColor(...cor);
        doc.setLineWidth(1);
        doc.rect(margemEsq, posY - 2, larguraTexto, 22, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...cor);
        doc.text(titulo, margemEsq + 3, posY + 1);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...corBranco);
        const linhas = doc.splitTextToSize(conteudo, larguraTexto - 6);
        doc.text(linhas, margemEsq + 3, posY + 5);

        posY += Math.max(22, linhas.length * 3.5 + 5);
    }

    // ────────────────────────────────────────────
    // PÁGINA 1: CAPA
    // ────────────────────────────────────────────
    novaPagemComFundo();

    posY = 70;
    doc.setFont('times', 'bold');
    doc.setFontSize(36);
    doc.setTextColor(...corOuro);
    doc.text('EventCalc', 105, posY, { align: 'center' });

    posY += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(...corBranco);
    doc.text('Tutorial Completo', 105, posY, { align: 'center' });

    posY += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...corCinza);
    doc.text('Como usar a calculadora de orçamentos', 105, posY, { align: 'center' });
    doc.text('para eventos com máxima eficiência', 105, posY + 5, { align: 'center' });

    posY += 25;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('🚀 Economize HORAS de trabalho', 105, posY, { align: 'center' });
    doc.text('💰 Aumente seu LUCRO automaticamente', 105, posY + 5, { align: 'center' });
    doc.text('📊 Proposta profissional em minutos', 105, posY + 10, { align: 'center' });

    // ────────────────────────────────────────────
    // PÁGINA 2: POR QUE EVENTCALC?
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Por Que Usar EventCalc?');

    adicionarTexto('Você gasta HORAS calculando orçamentos na mão, em planilhas confusas ou em cadernos? Esse tempo pode custar você CLIENTES!', 11, corBranco);

    posY += 5;
    adicionarSubtitulo('O Problema Real:');
    adicionarTexto('⏱️ Calcular manualmente leva 45 minutos por orçamento');
    adicionarTexto('📊 Planilhas confusas com fórmulas que erram');
    adicionarTexto('😟 Dúvidas se o preço está certo ou se vai dar lucro');
    adicionarTexto('📱 Cliente espera dias pela proposta');
    adicionarTexto('🚫 Perder cliente porque a concorrência é mais rápida');

    posY += 5;
    adicionarSubtitulo('A Solução EventCalc:');
    adicionarCaixa('⚡ 5-10 MINUTOS', 'Crie qualquer orçamento em menos de 10 minutos. Sempre!', 'ouro');
    adicionarCaixa('✅ 100% PRECISO', 'Sem erros de contas. Calculadora faz a matemática.', 'ouro');
    adicionarCaixa('💎 PROFISSIONAL', 'Proposta PDF linda para impressionar o cliente.', 'ouro');
    adicionarCaixa('🎯 PREÇO CERTO', 'Sabe exatamente quanto vai ganhar em cada evento.', 'ouro');

    // ────────────────────────────────────────────
    // PÁGINA 3: MATEMÁTICA DO ROI
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Quanto Você Economiza?');

    adicionarTexto('Vamos fazer as contas juntos:', 11, corBranco);

    posY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('Cenário ANTES (sem EventCalc):', margemEsq, posY);
    posY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('• Você recebe um pedido de orçamento', margemEsq + 3, posY);
    doc.text('• Gasta 45 minutos calculando tudo', margemEsq + 3, posY + 4);
    doc.text('• Cliente espera 2-3 dias pela resposta', margemEsq + 3, posY + 8);
    doc.text('• Cliente pede mais 3 variações (3 × 45min = 2h15min)', margemEsq + 3, posY + 12);
    doc.text('• Total perdido: 3 horas de trabalho + cliente desconfiado', margemEsq + 3, posY + 16);
    posY += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('Cenário DEPOIS (com EventCalc):', margemEsq, posY);
    posY += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('• Cliente pede orçamento', margemEsq + 3, posY);
    doc.text('• Você cria em 8 minutos', margemEsq + 3, posY + 4);
    doc.text('• Envia proposta HOJE MESMO', margemEsq + 3, posY + 8);
    doc.text('• Cliente pede 3 variações (3 × 8min = 24min)', margemEsq + 3, posY + 12);
    doc.text('• Total economizado: 2 HORAS + cliente impressionado', margemEsq + 3, posY + 16);
    posY += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corVermelho);
    doc.text('RESULTADO: 2 HORAS GANHAS POR ORÇAMENTO!', margemEsq, posY);

    posY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('Se você faz 4 orçamentos por semana:', margemEsq, posY);
    doc.text('4 × 2 horas = 8 HORAS por semana', margemEsq, posY + 4);
    doc.text('8 × 4 semanas = 32 HORAS por mês!', margemEsq, posY + 8);
    doc.text('Isso é UMA SEMANA INTEIRA ganha por mês! 🚀', margemEsq, posY + 12);

    // ────────────────────────────────────────────
    // PÁGINA 4: AUMENTAR O LUCRO
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Aumente Seu Lucro Automaticamente');

    adicionarTexto('Não é só economia de TEMPO. EventCalc também aumenta o DINHEIRO que você ganha:', 11, corBranco);

    posY += 5;
    adicionarSubtitulo('1. Não Esquecer Custos:');
    adicionarTexto('Quantas vezes você "esqueceu" de cobrar por algo? Taxa de limpeza? Carvão? Com EventCalc, NADA se perde. Tudo é incluído automaticamente.');

    adicionarSubtitulo('2. Precificar Melhor:');
    adicionarTexto('Você vê EXATAMENTE quanto custa cada evento. Sabe se está cobrando pouco ou muito. Pode ajustar para ganhar MAIS sem perder clientes.');

    adicionarSubtitulo('3. Horas Excedentes:');
    adicionarTexto('Se o evento vai além do combinado, a calculadora CALCULA quanto você ganha a mais por hora. Nunca mais vai descontar de suas horas!');

    adicionarSubtitulo('4. Menos Erros = Menos Prejuízos:');
    adicionarTexto('Uma única conta errada em um grande evento pode custar CENTENAS de reais em prejuízo. EventCalc elimina erros de cálculo.');

    posY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...corVermelho);
    doc.text('EXEMPLO REAL:', margemEsq, posY);

    posY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corCinza);
    const exemploTexto = doc.splitTextToSize(
        'Você cobra R$ 150 por pessoa em um evento de 50 pessoas = R$ 7.500. ' +
        'Com EventCalc, você descobre que realmente ganha R$ 2.100 de lucro (não R$ 3.750 que você achava). ' +
        'Com essa informação, você ajusta sua estratégia e passa a ganhar R$ 3.500 por evento! ' +
        'Em 10 eventos/mês = R$ 14.000 a MAIS!',
        larguraTexto
    );
    doc.text(exemploTexto, margemEsq, posY);

    // ────────────────────────────────────────────
    // PÁGINA 5: TELA 1 - QUESTIONÁRIO
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 1: O Questionário Inicial');
    adicionarTexto('Aqui você conta ao sistema tudo sobre o seu evento. É como um "formulário mágico" que aprende sobre seu evento.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('O que você preenche:');
    adicionarCaixa('📍 LOCAL', 'Onde será? Na sua churrasqueira, em um salão, numa chácara?');
    adicionarCaixa('📅 DATA E HORA', 'Dia, hora de início, hora de término, duração');
    adicionarCaixa('🍽️ TIPO DE REFEIÇÃO', 'Café, almoço, lanche ou jantar? Cada um tem gramagens diferentes!');
    adicionarCaixa('👥 QUANTAS PESSOAS', 'Adultos? Crianças? Idosos? Tudo conta na conta!');
    adicionarCaixa('🚫 RESTRIÇÕES', 'Alguém é vegano? Intolerante à lactose? Celíaco? Alérgico?');
    adicionarCaixa('🔥 TIPO DE ASSADOR', 'Grelha, espeto giratório, churrasqueira, forno? Importa!');

    posY += 2;
    adicionarTexto('💡 Dica: Salve seus eventos! A calculadora guarda tudo. Próxima vez, copia!', 10, corOuro);

    // ────────────────────────────────────────────
    // PÁGINA 6: TELA 2 - CARDÁPIO
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 2: Escolhendo o Cardápio');
    adicionarTexto('Aqui você monta o MENU do evento. Tem sugestões prontas OU você cria do zero!', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('As 5 Categorias:');
    adicionarCaixa('🥂 APERITIVOS', 'Tâmaras, queijo, paleta, carne seca, broinha');
    adicionarCaixa('🥩 PROTEÍNAS', 'Picanha, cupim, moqueca, frango, linguiça, costela');
    adicionarCaixa('🍠 CARBOIDRATOS', 'Batata, polenta, broa, farofa, batatinha frita');
    adicionarCaixa('🥗 SALADAS', 'Verde, tomate, aipim, maionese, coleslaw');
    adicionarCaixa('🍰 SOBREMESAS', 'Brigadeiro, pavê, pudim, sorvete, fruta');

    posY += 2;
    adicionarSubtitulo('Modo Manual + Cardápios Especiais:');
    adicionarTexto('Tem VEGANOS? Tem CELÍACOS? A Tela 2B cria cardápios especiais apenas para eles. A calculadora soma com o resto automaticamente!', 10, corBranco);

    posY += 2;
    adicionarTexto('💡 Dica: Salve seus cardápios favoritos. Reutilize em eventos similares!', 10, corOuro);

    // ────────────────────────────────────────────
    // PÁGINA 7: TELA 3 - VOLUMES & HORAS EXCEDENTES
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 3: Volumes e Horas Excedentes');
    adicionarTexto('A mágica acontece aqui! A calculadora sabe QUANTO de cada coisa você precisa.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('Como Calcula os Volumes:');
    adicionarTexto('Cada item tem uma GRAMAGEM padrão por pessoa. Exemplo:', 10, corBranco);
    adicionarTexto('• Picanha: 450g/pessoa → Para 30 pessoas = 13,5 kg', 10, corCinza);
    adicionarTexto('• Batata: 200g/pessoa → Para 30 pessoas = 6 kg', 10, corCinza);
    adicionarTexto('• Salada: 150g/pessoa → Para 30 pessoas = 4,5 kg', 10, corCinza);

    posY += 3;
    adicionarSubtitulo('⏰ HORAS EXCEDENTES (MUITO IMPORTANTE!):');
    adicionarCaixa('ISSO VALE DINHEIRO!',
        'Se o cliente combina 4 horas e acaba durando 5 horas, você precisa calcular quanto ganha a MAIS. EventCalc faz isso automaticamente! Sua taxa/hora × horas extras = DINHEIRO A MAIS!',
        'vermelho'
    );

    adicionarSubtitulo('Perdas (Encolhimento):');
    adicionarTexto('Carnes encolhem quando assam. EventCalc pergunta: qual sua taxa de perda?', 10, corBranco);
    adicionarTexto('Se 10% de perda → ela compra 10% a mais para compensar. NUNCA mais você falta carne!', 10, corBranco);

    // ────────────────────────────────────────────
    // PÁGINA 8: TELA 4 ABA 1 - CUSTOS
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 4, Aba 1: Calcular Custos');
    adicionarTexto('Aqui você VÊ TODO O DINHEIRO: quanto custa, quanto você ganha.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('Todos os Custos Inclusos:');
    adicionarCaixa('🥩 MATÉRIA-PRIMA', 'Carne, temperos, verduras... a calculadora já sabe o preço!');
    adicionarCaixa('⚫ CARVÃO/LENHA', 'Quanto você gasta em combustível');
    adicionarCaixa('🧂 TEMPEROS & ALIMENTOS', 'Sal, alho, óleo, maionese, acém');
    adicionarCaixa('👨‍🍳 MÃO DE OBRA', 'QUANTO VOCÊ QUER GANHAR POR HORA!');
    adicionarCaixa('🏠 ALUGUEL DO LOCAL', 'Se precisar alugar espaço');
    adicionarCaixa('🧹 TAXA LIMPEZA', 'Deixar tudo impecável tem um preço!');
    adicionarCaixa('📊 LUCRO', 'Sua margem de ganho (20%? 30%? 50%?)');

    posY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corVermelho);
    doc.text('👉 RESULTADO FINAL: Apareça em TEMPO REAL!', margemEsq, posY);

    // ────────────────────────────────────────────
    // PÁGINA 9: TELA 4 ABA 2 - RELATÓRIO ASSADOR
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 4, Aba 2: Seu Relatório Privado');
    adicionarTexto('Esse documento é SÓ PARA VOCÊ! Com tudo que você precisa no dia do evento.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('O que tem:');
    adicionarCaixa('📋 DADOS DO EVENTO', 'Data, hora, local, quantas pessoas, tipo de refeição');
    adicionarCaixa('🍽️ CARDÁPIO COMPLETO', 'Tudo o que vai servir (com cardápios especiais se houver)');
    adicionarCaixa('📦 LISTA DE COMPRAS', 'Quanto de CADA COISA você precisa buscar na feira');
    adicionarCaixa('⚖️ MODO DE PREPARO', 'Peso por pessoa, ordem de preparo, dicas');
    adicionarCaixa('💰 RESUMO FINANCEIRO', 'Quanto custou tudo e quanto você vai ganhar');

    posY += 2;
    adicionarTexto('💡 Dica: IMPRIMA ou baixe como PDF. Leve no bolso no dia do evento!', 10, corOuro);
    adicionarTexto('Você marca os itens conforme prepara. Nada é esquecido!', 10, corCinza);

    // ────────────────────────────────────────────
    // PÁGINA 10: TELA 4 ABA 3 - PROPOSTA CLIENTE
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 4, Aba 3: Proposta para Cliente');
    adicionarTexto('Esse é o documento PROFISSIONAL que você envia ao cliente. É BONITO, é COMPLETO, é IRRESISTÍVEL!', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('O que tem:');
    adicionarCaixa('👤 SEUS DADOS', 'Nome, WhatsApp, email, Instagram, foto sua');
    adicionarCaixa('🎉 DADOS DO EVENTO', 'Tudo o que cliente pediu: data, hora, local, pessoas');
    adicionarCaixa('🍽️ CARDÁPIO BONITO', 'Menu apresentado de forma linda e apetitosa');
    adicionarCaixa('✅ O QUE INCLUI', 'Decoração? Bebida? Louça? Fotos? Tudo claro!');
    adicionarCaixa('💰 PREÇO FINAL', 'O valor que ele vai pagar. CLARO e SEM DÚVIDAS');
    adicionarCaixa('💳 COMO PAGAR', 'PIX, transferência, dinheiro. Seus dados de pagamento');

    posY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corOuro);
    doc.text('🎁 ESSA PROPOSTA VENDE SOZINHA!', margemEsq, posY);

    // ────────────────────────────────────────────
    // PÁGINA 11: PASSO A PASSO COMPLETO
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Passo a Passo Completo');
    adicionarTexto('Do pedido do cliente até receber o dinheiro:', 11, corBranco);

    posY += 2;
    let passos = [
        '1️⃣  Cliente pede orçamento',
        '2️⃣  Você clica em "Começar" na landing',
        '3️⃣  Preenche o Questionário (Tela 1)',
        '4️⃣  Escolhe o Cardápio (Tela 2)',
        '5️⃣  Se tiver restrições, cria cardápio especial (Tela 2B)',
        '6️⃣  Calcula os Volumes (Tela 3)',
        '7️⃣  Se tiver restrições, calcula especiais (Tela 3B)',
        '8️⃣  Preenche os Custos e vê o lucro (Tela 4, Aba 1)',
        '9️⃣  Vê seu relatório privado (Tela 4, Aba 2)',
        '🔟 Gera a Proposta bonita (Tela 4, Aba 3)',
        '1️⃣1️⃣ Envia ao cliente por WhatsApp/Email',
        '1️⃣2️⃣ Cliente aprova e paga',
        '1️⃣3️⃣ Você recebe o dinheiro 💰'
    ];

    passos.forEach((passo, idx) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...corOuro);
        doc.text(passo, margemEsq, posY);
        posY += 5;
    });

    // ────────────────────────────────────────────
    // PÁGINA 12: DICAS & FAQ
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Dicas & Perguntas Frequentes');

    adicionarSubtitulo('💡 Dica 1: Teste Tudo');
    adicionarTexto('Antes de mandar a primeira proposta, crie 2-3 orçamentos fictícios. Você aprende como funciona!', 10);

    adicionarSubtitulo('💡 Dica 2: Suas Informações');
    adicionarTexto('Na landing (botão ✏️), adicione seu nome, WhatsApp, email, PIX. Isso aparece em TODA proposta automaticamente!', 10);

    adicionarSubtitulo('💡 Dica 3: Cardápios Salvos');
    adicionarTexto('Guarde seus cardápios! Próximo evento similar, você copia. Economiza 5 minutos!', 10);

    adicionarSubtitulo('❓ Posso mudar depois?');
    adicionarTexto('SIM! Você volta em qualquer tela, muda o que quiser, tudo recalcula automaticamente!', 10, corBranco);

    adicionarSubtitulo('❓ Preciso de internet?');
    adicionarTexto('Para ABRIR sim. Depois, tudo fica guardado no seu navegador. Funciona offline!', 10, corBranco);

    adicionarSubtitulo('❓ Quanto tempo leva?');
    adicionarTexto('Primeira vez: 15-20 minutos aprendendo. Depois: 5-8 minutos por orçamento. Logo você faz em 2-3 minutos!', 10, corBranco);

    // ────────────────────────────────────────────
    // PÁGINA 13: CONCLUSÃO
    // ────────────────────────────────────────────
    doc.addPage();
    novaPagemComFundo();

    posY = 80;
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...corOuro);
    doc.text('Você Está Pronto! 🚀', 105, posY, { align: 'center' });

    posY += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...corBranco);
    doc.text('Você aprendeu TUDO sobre EventCalc.', 105, posY, { align: 'center' });

    posY += 7;
    doc.setFontSize(11);
    doc.setTextColor(...corCinza);
    doc.text('Agora é hora de USAR e começar a economizar', 105, posY, { align: 'center' });
    doc.text('HORAS de trabalho e AUMENTAR seu LUCRO!', 105, posY + 5, { align: 'center' });

    posY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corOuro);
    doc.text('⏱️  Economize 2 HORAS por orçamento', 105, posY, { align: 'center' });
    posY += 6;
    doc.text('💰 Aumente seu LUCRO automaticamente', 105, posY, { align: 'center' });
    posY += 6;
    doc.text('📊 Seja mais profissional que a concorrência', 105, posY, { align: 'center' });

    posY += 20;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...corVermelho);
    doc.text('Próximo passo: Abra EventCalc e crie seu primeiro orçamento!', 105, posY, { align: 'center' });

    // ── DOWNLOAD ──
    doc.save('EventCalc-Tutorial-Gratuito.pdf');
}
