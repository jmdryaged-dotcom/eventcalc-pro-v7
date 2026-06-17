var LOGO_CLUB_BASE64 = null;
(function() {
    try {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxW = 200;
            var scale = maxW / img.width;
            canvas.width = maxW;
            canvas.height = img.height * scale;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            LOGO_CLUB_BASE64 = canvas.toDataURL('image/jpeg', 0.7);
        };
        img.crossOrigin = 'anonymous';
        img.src = 'logo-club.jpeg';
    } catch(e) {}
})();

function gerarTutorialPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });

    const corOuro = [212, 175, 55];
    const corVermelho = [196, 30, 58];
    const corPreto = [26, 26, 26];
    const corBranco = [255, 255, 255];
    const corCinza = [180, 180, 180];

    let posY = 15;
    const margemEsq = 15;
    const larguraTexto = 180;
    const linhaAltura = 5;

    function novaPagemComFundo() {
        doc.setFillColor(...corPreto);
        doc.rect(0, 0, 210, 297, 'F');
        posY = 15;
    }

    function adicionarTitulo(texto) {
        doc.setFont('times', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(...corOuro);
        doc.text(texto, margemEsq, posY);
        posY += 12;
    }

    function adicionarSubtitulo(texto) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(...corOuro);
        doc.text(texto, margemEsq, posY);
        posY += 7;
    }

    function adicionarTexto(texto, tamanho, cor) {
        tamanho = tamanho || 10;
        cor = cor || corCinza;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(tamanho);
        doc.setTextColor(...cor);
        var linhas = doc.splitTextToSize(texto, larguraTexto);
        doc.text(linhas, margemEsq, posY);
        posY += linhas.length * linhaAltura + 2;
    }

    function adicionarCaixa(titulo, conteudo, tipoCor) {
        tipoCor = tipoCor || 'ouro';
        var cor = tipoCor === 'vermelho' ? corVermelho : corOuro;
        var altCaixa = 22;
        var linhas = doc.splitTextToSize(conteudo, larguraTexto - 6);
        var altCalc = linhas.length * 4 + 10;
        if (altCalc > altCaixa) altCaixa = altCalc;

        doc.setDrawColor(...cor);
        doc.setLineWidth(0.8);
        doc.rect(margemEsq, posY - 2, larguraTexto, altCaixa, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...cor);
        doc.text(titulo, margemEsq + 4, posY + 2);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...corBranco);
        doc.text(linhas, margemEsq + 4, posY + 7);

        posY += altCaixa + 3;
    }

    // ── PAGINA 1: CAPA ──
    novaPagemComFundo();

    if (LOGO_CLUB_BASE64) {
        try { doc.addImage(LOGO_CLUB_BASE64, 'JPEG', 77.5, 20, 55, 40); } catch(e) {}
    }

    posY = LOGO_CLUB_BASE64 ? 75 : 70;
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
    doc.setFontSize(11);
    doc.setTextColor(...corCinza);
    doc.text('Como usar a calculadora de orcamentos', 105, posY, { align: 'center' });
    doc.text('para eventos com maxima eficiencia', 105, posY + 5, { align: 'center' });

    posY += 25;
    doc.setFontSize(11);
    doc.setTextColor(...corOuro);
    doc.text('>> Economize HORAS de trabalho', 105, posY, { align: 'center' });
    doc.text('>> Aumente seu LUCRO automaticamente', 105, posY + 6, { align: 'center' });
    doc.text('>> Proposta profissional em minutos', 105, posY + 12, { align: 'center' });

    // ── PAGINA 2: POR QUE EVENTCALC? ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Por Que Usar EventCalc?');
    adicionarTexto('Voce gasta HORAS calculando orcamentos na mao, em planilhas confusas ou em cadernos? Esse tempo pode custar voce CLIENTES!', 11, corBranco);

    posY += 5;
    adicionarSubtitulo('O Problema Real:');
    adicionarTexto('- Calcular manualmente leva 45 minutos por orcamento');
    adicionarTexto('- Planilhas confusas com formulas que erram');
    adicionarTexto('- Duvidas se o preco esta certo ou se vai dar lucro');
    adicionarTexto('- Cliente espera dias pela proposta');
    adicionarTexto('- Perder cliente porque a concorrencia e mais rapida');

    posY += 5;
    adicionarSubtitulo('A Solucao EventCalc:');
    adicionarCaixa('5-10 MINUTOS', 'Crie qualquer orcamento em menos de 10 minutos. Sempre!');
    adicionarCaixa('100% PRECISO', 'Sem erros de contas. Calculadora faz a matematica.');
    adicionarCaixa('PROFISSIONAL', 'Proposta PDF linda para impressionar o cliente.');
    adicionarCaixa('PRECO CERTO', 'Sabe exatamente quanto vai ganhar em cada evento.');

    // ── PAGINA 3: MATEMATICA DO ROI ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Quanto Voce Economiza?');
    adicionarTexto('Vamos fazer as contas juntos:', 11, corBranco);

    posY += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('Cenario ANTES (sem EventCalc):', margemEsq, posY);
    posY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('- Voce recebe um pedido de orcamento', margemEsq + 3, posY);
    doc.text('- Gasta 45 minutos calculando tudo', margemEsq + 3, posY + 4);
    doc.text('- Cliente espera 2-3 dias pela resposta', margemEsq + 3, posY + 8);
    doc.text('- Cliente pede mais 3 variacoes (3 x 45min = 2h15min)', margemEsq + 3, posY + 12);
    doc.text('- Total perdido: 3 horas de trabalho + cliente desconfiado', margemEsq + 3, posY + 16);
    posY += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('Cenario DEPOIS (com EventCalc):', margemEsq, posY);
    posY += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('- Cliente pede orcamento', margemEsq + 3, posY);
    doc.text('- Voce cria em 8 minutos', margemEsq + 3, posY + 4);
    doc.text('- Envia proposta HOJE MESMO', margemEsq + 3, posY + 8);
    doc.text('- Cliente pede 3 variacoes (3 x 8min = 24min)', margemEsq + 3, posY + 12);
    doc.text('- Total economizado: 2 HORAS + cliente impressionado', margemEsq + 3, posY + 16);
    posY += 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corVermelho);
    doc.text('RESULTADO: 2 HORAS GANHAS POR ORCAMENTO!', margemEsq, posY);

    posY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('Se voce faz 4 orcamentos por semana:', margemEsq, posY);
    doc.text('4 x 2 horas = 8 HORAS por semana', margemEsq, posY + 5);
    doc.text('8 x 4 semanas = 32 HORAS por mes!', margemEsq, posY + 10);
    doc.text('Isso e UMA SEMANA INTEIRA ganha por mes!', margemEsq, posY + 15);

    // ── PAGINA 4: AUMENTAR O LUCRO ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Aumente Seu Lucro Automaticamente');
    adicionarTexto('Nao e so economia de TEMPO. EventCalc tambem aumenta o DINHEIRO que voce ganha:', 11, corBranco);

    posY += 5;
    adicionarSubtitulo('1. Nao Esquecer Custos:');
    adicionarTexto('Quantas vezes voce "esqueceu" de cobrar por algo? Taxa de limpeza? Carvao? Com EventCalc, NADA se perde. Tudo e incluido automaticamente.');

    adicionarSubtitulo('2. Precificar Melhor:');
    adicionarTexto('Voce ve EXATAMENTE quanto custa cada evento. Sabe se esta cobrando pouco ou muito. Pode ajustar para ganhar MAIS sem perder clientes.');

    adicionarSubtitulo('3. Horas Excedentes:');
    adicionarTexto('Se o evento vai alem do combinado, a calculadora CALCULA quanto voce ganha a mais por hora. Nunca mais vai descontar de suas horas!');

    adicionarSubtitulo('4. Menos Erros = Menos Prejuizos:');
    adicionarTexto('Uma unica conta errada em um grande evento pode custar CENTENAS de reais em prejuizo. EventCalc elimina erros de calculo.');

    posY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corVermelho);
    doc.text('EXEMPLO REAL:', margemEsq, posY);
    posY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corCinza);
    var exemploTexto = doc.splitTextToSize(
        'Voce cobra R$ 150 por pessoa em um evento de 50 pessoas = R$ 7.500. ' +
        'Com EventCalc, voce descobre que realmente ganha R$ 2.100 de lucro (nao R$ 3.750 que voce achava). ' +
        'Com essa informacao, voce ajusta sua estrategia e passa a ganhar R$ 3.500 por evento! ' +
        'Em 10 eventos/mes = R$ 14.000 a MAIS!',
        larguraTexto
    );
    doc.text(exemploTexto, margemEsq, posY);

    // ── PAGINA 5: TELA 1 - QUESTIONARIO ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 1: O Questionario Inicial');
    adicionarTexto('Aqui voce conta ao sistema tudo sobre o seu evento. E como um "formulario magico" que aprende sobre seu evento.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('O que voce preenche:');
    adicionarCaixa('LOCAL', 'Onde sera? Na sua churrasqueira, em um salao, numa chacara?');
    adicionarCaixa('DATA E HORA', 'Dia, hora de inicio, hora de termino, duracao');
    adicionarCaixa('TIPO DE REFEICAO', 'Cafe, almoco, lanche ou jantar? Cada um tem gramagens diferentes!');
    adicionarCaixa('QUANTAS PESSOAS', 'Adultos? Criancas? Idosos? Tudo conta na conta!');
    adicionarCaixa('RESTRICOES', 'Alguem e vegano? Intolerante a lactose? Celiaco? Alergico?');
    adicionarCaixa('TIPO DE ASSADOR', 'Grelha, espeto giratorio, churrasqueira, forno? Importa!');

    posY += 2;
    adicionarTexto('DICA: Salve seus eventos! A calculadora guarda tudo. Proxima vez, copia!', 10, corOuro);

    // ── PAGINA 6: TELA 2 - CARDAPIO ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 2: Escolhendo o Cardapio');
    adicionarTexto('Aqui voce monta o MENU do evento. Tem sugestoes prontas OU voce cria do zero!', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('As 5 Categorias:');
    adicionarCaixa('APERITIVOS', 'Tamaras, queijo, paleta, carne seca, broinha');
    adicionarCaixa('PROTEINAS', 'Picanha, cupim, moqueca, frango, linguica, costela');
    adicionarCaixa('CARBOIDRATOS', 'Batata, polenta, broa, farofa, batatinha frita');
    adicionarCaixa('SALADAS', 'Verde, tomate, aipim, maionese, coleslaw');
    adicionarCaixa('SOBREMESAS', 'Brigadeiro, pave, pudim, sorvete, fruta');

    posY += 2;
    adicionarSubtitulo('Modo Manual + Cardapios Especiais:');
    adicionarTexto('Tem VEGANOS? Tem CELIACOS? A Tela 2B cria cardapios especiais apenas para eles. A calculadora soma com o resto automaticamente!', 10, corBranco);

    posY += 2;
    adicionarTexto('DICA: Salve seus cardapios favoritos. Reutilize em eventos similares!', 10, corOuro);

    // ── PAGINA 7: TELA 3 - VOLUMES ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 3: Volumes e Horas Excedentes');
    adicionarTexto('A magica acontece aqui! A calculadora sabe QUANTO de cada coisa voce precisa.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('Como Calcula os Volumes:');
    adicionarTexto('Cada item tem uma GRAMAGEM padrao por pessoa. Exemplo:', 10, corBranco);
    adicionarTexto('- Picanha: 450g/pessoa > Para 30 pessoas = 13,5 kg', 10, corCinza);
    adicionarTexto('- Batata: 200g/pessoa > Para 30 pessoas = 6 kg', 10, corCinza);
    adicionarTexto('- Salada: 150g/pessoa > Para 30 pessoas = 4,5 kg', 10, corCinza);

    posY += 3;
    adicionarSubtitulo('HORAS EXCEDENTES (MUITO IMPORTANTE!):');
    adicionarCaixa('ISSO VALE DINHEIRO!',
        'Se o cliente combina 4 horas e acaba durando 5 horas, voce precisa calcular quanto ganha a MAIS. EventCalc faz isso automaticamente! Sua taxa/hora x horas extras = DINHEIRO A MAIS!',
        'vermelho'
    );

    adicionarSubtitulo('Perdas (Encolhimento):');
    adicionarTexto('Carnes encolhem quando assam. EventCalc pergunta: qual sua taxa de perda?', 10, corBranco);
    adicionarTexto('Se 10% de perda, ela compra 10% a mais para compensar. NUNCA mais voce falta carne!', 10, corBranco);

    // ── PAGINA 8: TELA 4 ABA 1 - CUSTOS ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 4, Aba 1: Calcular Custos');
    adicionarTexto('Aqui voce VE TODO O DINHEIRO: quanto custa, quanto voce ganha.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('Todos os Custos Inclusos:');
    adicionarCaixa('MATERIA-PRIMA', 'Carne, temperos, verduras... a calculadora ja sabe o preco!');
    adicionarCaixa('CARVAO / LENHA', 'Quanto voce gasta em combustivel');
    adicionarCaixa('TEMPEROS & ALIMENTOS', 'Sal, alho, oleo, maionese, acem');
    adicionarCaixa('MAO DE OBRA', 'QUANTO VOCE QUER GANHAR POR HORA!');
    adicionarCaixa('ALUGUEL DO LOCAL', 'Se precisar alugar espaco');
    adicionarCaixa('TAXA LIMPEZA', 'Deixar tudo impecavel tem um preco!');
    adicionarCaixa('LUCRO', 'Sua margem de ganho (20%? 30%? 50%?)');

    posY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corVermelho);
    doc.text('>> RESULTADO FINAL: Aparece em TEMPO REAL!', margemEsq, posY);

    // ── PAGINA 9: TELA 4 ABA 2 - RELATORIO ASSADOR ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 4, Aba 2: Seu Relatorio Privado');
    adicionarTexto('Esse documento e SO PARA VOCE! Com tudo que voce precisa no dia do evento.', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('O que tem:');
    adicionarCaixa('DADOS DO EVENTO', 'Data, hora, local, quantas pessoas, tipo de refeicao');
    adicionarCaixa('CARDAPIO COMPLETO', 'Tudo o que vai servir (com cardapios especiais se houver)');
    adicionarCaixa('LISTA DE COMPRAS', 'Quanto de CADA COISA voce precisa buscar na feira');
    adicionarCaixa('MODO DE PREPARO', 'Peso por pessoa, ordem de preparo, dicas');
    adicionarCaixa('RESUMO FINANCEIRO', 'Quanto custou tudo e quanto voce vai ganhar');

    posY += 2;
    adicionarTexto('DICA: IMPRIMA ou baixe como PDF. Leve no bolso no dia do evento!', 10, corOuro);
    adicionarTexto('Voce marca os itens conforme prepara. Nada e esquecido!', 10, corCinza);

    // ── PAGINA 10: TELA 4 ABA 3 - PROPOSTA CLIENTE ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('TELA 4, Aba 3: Proposta para Cliente');
    adicionarTexto('Esse e o documento PROFISSIONAL que voce envia ao cliente. E BONITO, e COMPLETO, e IRRESISTIVEL!', 11, corBranco);

    posY += 3;
    adicionarSubtitulo('O que tem:');
    adicionarCaixa('SEUS DADOS', 'Nome, WhatsApp, email, Instagram, foto sua');
    adicionarCaixa('DADOS DO EVENTO', 'Tudo o que cliente pediu: data, hora, local, pessoas');
    adicionarCaixa('CARDAPIO BONITO', 'Menu apresentado de forma linda e apetitosa');
    adicionarCaixa('O QUE INCLUI', 'Decoracao? Bebida? Louca? Fotos? Tudo claro!');
    adicionarCaixa('PRECO FINAL', 'O valor que ele vai pagar. CLARO e SEM DUVIDAS');
    adicionarCaixa('COMO PAGAR', 'PIX, transferencia, dinheiro. Seus dados de pagamento');

    posY += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corOuro);
    doc.text('>> ESSA PROPOSTA VENDE SOZINHA!', margemEsq, posY);

    // ── PAGINA 11: PASSO A PASSO ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Passo a Passo Completo');
    adicionarTexto('Do pedido do cliente ate receber o dinheiro:', 11, corBranco);

    posY += 2;
    var passos = [
        ' 1.  Cliente pede orcamento',
        ' 2.  Voce clica em "Comecar" na landing',
        ' 3.  Preenche o Questionario (Tela 1)',
        ' 4.  Escolhe o Cardapio (Tela 2)',
        ' 5.  Se tiver restricoes, cria cardapio especial (Tela 2B)',
        ' 6.  Calcula os Volumes (Tela 3)',
        ' 7.  Se tiver restricoes, calcula especiais (Tela 3B)',
        ' 8.  Preenche os Custos e ve o lucro (Tela 4, Aba 1)',
        ' 9.  Ve seu relatorio privado (Tela 4, Aba 2)',
        '10.  Gera a Proposta bonita (Tela 4, Aba 3)',
        '11.  Envia ao cliente por WhatsApp/Email',
        '12.  Cliente aprova e paga',
        '13.  Voce recebe o dinheiro!'
    ];

    passos.forEach(function(passo) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(...corOuro);
        doc.text(passo, margemEsq, posY);
        posY += 6;
    });

    // ── PAGINA 12: DICAS & FAQ ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Dicas & Perguntas Frequentes');

    adicionarSubtitulo('Dica 1: Teste Tudo');
    adicionarTexto('Antes de mandar a primeira proposta, crie 2-3 orcamentos ficticios. Voce aprende como funciona!', 10);

    adicionarSubtitulo('Dica 2: Suas Informacoes');
    adicionarTexto('Na landing (botao de editar), adicione seu nome, WhatsApp, email, PIX. Isso aparece em TODA proposta automaticamente!', 10);

    adicionarSubtitulo('Dica 3: Cardapios Salvos');
    adicionarTexto('Guarde seus cardapios! Proximo evento similar, voce copia. Economiza 5 minutos!', 10);

    adicionarSubtitulo('Posso mudar depois?');
    adicionarTexto('SIM! Voce volta em qualquer tela, muda o que quiser, tudo recalcula automaticamente!', 10, corBranco);

    adicionarSubtitulo('Preciso de internet?');
    adicionarTexto('Para ABRIR sim. Depois, tudo fica guardado no seu navegador. Funciona offline!', 10, corBranco);

    adicionarSubtitulo('Quanto tempo leva?');
    adicionarTexto('Primeira vez: 15-20 minutos aprendendo. Depois: 5-8 minutos por orcamento. Logo voce faz em 2-3 minutos!', 10, corBranco);

    // ── PAGINA 13: CONCLUSAO ──
    doc.addPage();
    novaPagemComFundo();

    posY = 80;
    doc.setFont('times', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...corOuro);
    doc.text('Voce Esta Pronto!', 105, posY, { align: 'center' });

    posY += 20;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(...corBranco);
    doc.text('Voce aprendeu TUDO sobre EventCalc.', 105, posY, { align: 'center' });

    posY += 7;
    doc.setFontSize(11);
    doc.setTextColor(...corCinza);
    doc.text('Agora e hora de USAR e comecar a economizar', 105, posY, { align: 'center' });
    doc.text('HORAS de trabalho e AUMENTAR seu LUCRO!', 105, posY + 5, { align: 'center' });

    posY += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corOuro);
    doc.text('>> Economize 2 HORAS por orcamento', 105, posY, { align: 'center' });
    posY += 6;
    doc.text('>> Aumente seu LUCRO automaticamente', 105, posY, { align: 'center' });
    posY += 6;
    doc.text('>> Seja mais profissional que a concorrencia', 105, posY, { align: 'center' });

    posY += 20;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...corVermelho);
    doc.text('Proximo passo: Abra EventCalc e crie seu primeiro orcamento!', 105, posY, { align: 'center' });

    // ── PAGINA 14: CTA - PRODUTOS CLUB CARNIVORISTA ──
    doc.addPage();
    novaPagemComFundo();

    if (LOGO_CLUB_BASE64) {
        try { doc.addImage(LOGO_CLUB_BASE64, 'JPEG', 87.5, 15, 35, 25); } catch(e) {}
        posY = 50;
    }

    adicionarTitulo('Quer Aprender Mais?');

    posY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...corCinza);
    const textoIntroCTA = 'Gostou do EventCalc? O Club Carnivorista tem outros produtos que vao levar seu negocio para o proximo nivel.';
    const linhasIntroCTA = doc.splitTextToSize(textoIntroCTA, 180);
    doc.text(linhasIntroCTA, margemEsq, posY);
    posY += linhasIntroCTA.length * 5 + 10;

    const produtos = [
        {
            titulo: 'A ARTE DO CHURRASCO: Do Fogo ao Primeiro Corte',
            desc: 'O ponto de partida do verdadeiro churrasqueiro. Dominio da grelha, escolha de utensilios, acendimento do carvao, tipos de cortes, ponto perfeito da carne e os erros que ninguem te conta. Com quizzes interativos ao final de cada capitulo.',
            link: 'https://go.hotmart.com/D100305376G?dp=1'
        },
        {
            titulo: 'ENTRE DOIS PAES: O Guia do Hamburguer Artesanal',
            desc: 'Nao e so um livro de receitas - e um manifesto. Para quem leva hamburguer a serio: blends, ponto da carne, paes artesanais, cortes premium, molhos que emocionam. Inclui quizzes com humor e super quiz interativo final.',
            link: 'https://go.hotmart.com/S100382006A'
        }
    ];

    produtos.forEach(function(produto) {
        if (posY > 220) {
            doc.addPage();
            novaPagemComFundo();
            posY = 30;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        var linhasDesc = doc.splitTextToSize(produto.desc, 170);
        var alturaDescricao = linhasDesc.length * 4;
        var alturaBox = 16 + alturaDescricao + 14;

        doc.setDrawColor(...corOuro);
        doc.setLineWidth(0.5);
        doc.roundedRect(13, posY - 4, 184, alturaBox, 3, 3);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(...corOuro);
        var linhasTitProd = doc.splitTextToSize(produto.titulo, 175);
        doc.text(linhasTitProd, 18, posY + 2);

        var yDesc = posY + 4 + (linhasTitProd.length * 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...corCinza);
        doc.text(linhasDesc, 18, yDesc);

        var yCTA = yDesc + alturaDescricao + 4;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...corOuro);
        doc.text('>> ADQUIRA AGORA:', 18, yCTA);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...corBranco);
        doc.text(produto.link, 18, yCTA + 5);

        posY += alturaBox + 8;
    });

    posY += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...corCinza);
    doc.text('Cada produto foi pensado para ajudar profissionais como voce a crescer.', 105, posY, { align: 'center' });
    posY += 6;
    doc.text('Sem pressa, sem pressao. Quando estiver pronto, estamos aqui!', 105, posY, { align: 'center' });

    // ── PAGINA 15: TEASER - ASSADOR 5 MINUTOS ──
    doc.addPage();
    novaPagemComFundo();

    doc.setDrawColor(...corOuro);
    doc.setLineWidth(0.8);
    doc.line(15, 22, 195, 22);
    doc.line(15, 28, 195, 28);

    doc.setFillColor(...corOuro);
    doc.roundedRect(80, 32, 50, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corPreto);
    doc.text('EM BREVE', 105, 38, { align: 'center' });

    posY = 55;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(...corOuro);
    doc.text('E se voce respondesse', 105, posY, { align: 'center' });
    posY += 9;
    doc.text('um orcamento as 23h...', 105, posY, { align: 'center' });
    posY += 9;
    doc.setTextColor(...corBranco);
    doc.text('em apenas 5 MINUTOS?', 105, posY, { align: 'center' });

    posY += 18;
    doc.setDrawColor(...corOuro);
    doc.setLineWidth(0.3);
    doc.line(70, posY, 140, posY);
    posY += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...corCinza);
    var paragrafosTeaser = [
        '73% dos clientes fecham com QUEM RESPONDE PRIMEIRO.',
        '',
        'Enquanto voce calcula no caderno depois do almoco,',
        'seu concorrente ja respondeu e fechou o evento.',
        '',
        'Estamos construindo algo NOVO para o Club Carnivorista:',
        ''
    ];
    paragrafosTeaser.forEach(function(linha) {
        doc.text(linha, 105, posY, { align: 'center' });
        posY += 6;
    });

    posY += 4;
    doc.setFillColor(20, 20, 20);
    doc.setDrawColor(...corOuro);
    doc.setLineWidth(1.5);
    doc.roundedRect(25, posY, 160, 50, 4, 4, 'FD');

    posY += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...corOuro);
    doc.text('ASSADOR 5 MINUTOS', 105, posY, { align: 'center' });

    posY += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corBranco);
    doc.text('Seu WhatsApp virando uma maquina', 105, posY, { align: 'center' });
    posY += 5;
    doc.text('de fechar eventos - automaticamente.', 105, posY, { align: 'center' });

    posY += 9;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('Cliente manda os dados. Sistema calcula tudo.', 105, posY, { align: 'center' });
    posY += 5;
    doc.text('Voce revisa e envia o orcamento. Em minutos.', 105, posY, { align: 'center' });

    posY += 18;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corOuro);
    doc.text('O QUE VOCE GANHA:', 105, posY, { align: 'center' });
    posY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    var beneficiosAssador = [
        '+ Orcamento profissional em 5 minutos (sem caderno, sem Excel)',
        '+ Responde clientes 24h por dia - mesmo dormindo',
        '+ Fecha mais eventos por ser o PRIMEIRO a responder',
        '+ Tempo de volta com sua familia (nao mais 2h calculando)'
    ];
    beneficiosAssador.forEach(function(b) {
        doc.text(b, 30, posY);
        posY += 6;
    });

    posY += 8;
    doc.setFillColor(...corOuro);
    doc.roundedRect(35, posY, 140, 22, 3, 3, 'F');

    posY += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corPreto);
    doc.text('VAGAS LIMITADAS no BETA', 105, posY, { align: 'center' });
    posY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Os primeiros 10 testadores garantem condicoes exclusivas vitalicias', 105, posY, { align: 'center' });

    posY += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...corOuro);
    doc.text('>> QUER SER UM DOS PRIMEIROS A TESTAR? <<', 105, posY, { align: 'center' });
    posY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...corBranco);
    doc.text('Responda este email com a frase "QUERO O BETA"', 105, posY, { align: 'center' });
    posY += 5;
    doc.text('ou chame no WhatsApp - link na proxima pagina.', 105, posY, { align: 'center' });

    // ── PAGINA 16: CONTATO ──
    doc.addPage();
    novaPagemComFundo();

    adicionarTitulo('Duvidas? Contato!');

    posY += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...corOuro);
    doc.text('Estamos aqui para AJUDAR!', 105, posY, { align: 'center' });

    posY += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corBranco);
    doc.text('E-MAIL:', margemEsq, posY);
    posY += 6;
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('jm.dryaged@gmail.com', margemEsq + 5, posY);

    posY += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...corBranco);
    doc.text('WHATSAPP:', margemEsq, posY);
    posY += 6;
    doc.setFontSize(9);
    doc.setTextColor(...corCinza);
    doc.text('+55 47 99668-1010', margemEsq + 5, posY);

    posY += 15;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...corOuro);
    doc.text('Respondo em ate 24 horas!', 105, posY, { align: 'center' });

    posY += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...corBranco);
    doc.text('Muito sucesso com seus eventos!', 105, posY, { align: 'center' });

    doc.save('EventCalc-Tutorial-Gratuito.pdf');
}
