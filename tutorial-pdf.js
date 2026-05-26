// ════════════════════════════════════════════════════════════════════════════
// GERADOR DE PDF DO TUTORIAL - VERSÃO LIMPA E DETALHADA
// ════════════════════════════════════════════════════════════════════════════

const { jsPDF } = require('jspdf');

function gerarTutorialPDF() {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const fundoPreto = [26, 26, 26];
    const ouro = [212, 175, 55];
    const branco = [255, 255, 255];
    const cinza = [211, 211, 211];

    let y = 0;

    function novaPage() {
        doc.addPage();
        doc.setFillColor(...fundoPreto);
        doc.rect(0, 0, 210, 297, 'F');
        y = 15;
    }

    function titulo(texto) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(...ouro);
        doc.text('>>> ' + texto.toUpperCase(), 15, y);
        y += 10;
    }

    function subtitulo(texto) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(...ouro);
        doc.text('>> ' + texto, 15, y);
        y += 8;
    }

    function paragrafo(texto) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...cinza);
        const linhas = doc.splitTextToSize(texto, 180);
        doc.text(linhas, 15, y);
        y += linhas.length * 4 + 5;
    }

    function destaque(titulo_txt, descricao) {
        doc.setTextColor(...ouro);
        doc.setFont('helvetica', 'bold');
        doc.text('* ' + titulo_txt, 15, y);
        y += 4;
        doc.setTextColor(...cinza);
        doc.setFont('helvetica', 'normal');
        const linhas = doc.splitTextToSize(descricao, 170);
        doc.text(linhas, 20, y);
        y += linhas.length * 3 + 5;
    }

    // ════════ PÁGINA 1: CAPA ════════
    doc.setFillColor(...fundoPreto);
    doc.rect(0, 0, 210, 297, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.setTextColor(...ouro);
    doc.text('EventCalc Pro v7', 105, 90, { align: 'center' });

    doc.setFontSize(16);
    doc.setTextColor(...branco);
    doc.text('TUTORIAL COMPLETO', 105, 115, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(...cinza);
    doc.text('Aprenda PASSO A PASSO como criar orcamentos profissionais', 105, 135, { align: 'center' });
    doc.text('em poucos MINUTOS', 105, 145, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(...cinza);
    doc.text('Versao 7.0 - 2026', 105, 260, { align: 'center' });

    // ════════ PÁGINA 2: O QUE É EVENTCALC? ════════
    novaPage();
    titulo('O Que eh EventCalc Pro v7?');

    paragrafo('EventCalc Pro v7 é uma calculadora profissional para criar orçamentos de eventos (churrascos, catering, festas). É um programa que funciona no navegador e ajuda você a:');

    y += 2;
    doc.setTextColor(...ouro);
    doc.setFont('helvetica', 'bold');
    doc.text('O Que EventCalc Faz Para Você:', 15, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...cinza);

    const beneficios = [
        '1. Criar orçamentos rápidos e PRECISOS',
        '2. Calcular custos AUTOMATICAMENTE',
        '3. Gerar propostas profissionais em PDF',
        '4. ECONOMIZAR HORAS de trabalho manual',
        '5. Aumentar seu lucro com mais orçamentos por dia'
    ];

    beneficios.forEach(b => {
        doc.text(b, 15, y);
        y += 5;
    });

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...branco);
    doc.text('O Resultado:', 15, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...cinza);
    paragrafo('Antes: Você passava 2-3 HORAS fazendo contas manualmente. Depois: Você preenche algumas informações e PRONTO! Tudo calculado em MENOS DE 10 MINUTOS!');

    // ════════ PÁGINA 3: COMO FUNCIONA (VISÃO GERAL) ════════
    novaPage();
    titulo('Como Funciona - Os 5 Passos');

    paragrafo('O EventCalc funciona como se você estivesse montando blocos. Você monta um bloco em cima do outro até formar algo completo. Assim:');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Os 5 Blocos que Voce vai Montar:', 15, y);
    y += 7;

    const blocos = [
        { num: '1.', nome: 'TELA 1: Dados do Evento', desc: 'Você coloca as informacoes basicas (data, local, numero de pessoas)' },
        { num: '2.', nome: 'TELA 2: Escolher Cardapio', desc: 'Você escolhe QUAIS CARNES e QUAIS ACOMPANHAMENTOS vai servir' },
        { num: '3.', nome: 'TELA 3: Definir Volumes', desc: 'O sistema calcula QUANTAS GRAMAS de cada coisa você precisa' },
        { num: '4.', nome: 'TELA 4: Revisar Consumo', desc: 'Você vê quanto cada pessoa vai comer (opcional)' },
        { num: '5.', nome: 'TELA 5: Gerar Proposta', desc: 'O sistema cria um documento LINDO para enviar ao cliente' }
    ];

    blocos.forEach(bloco => {
        doc.setTextColor(...ouro);
        doc.setFont('helvetica', 'bold');
        doc.text(bloco.num + ' ' + bloco.nome, 15, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...cinza);
        const linhas = doc.splitTextToSize(bloco.desc, 170);
        doc.text(linhas, 20, y);
        y += linhas.length * 3 + 4;
    });

    // ════════ PÁGINA 4: TELA 1 - PRIMEIRA PARTE ════════
    novaPage();
    titulo('Tela 1: Informacoes do Evento');

    paragrafo('Esta é a PRIMEIRA tela que você vê. Aqui você vai contar ao sistema TUDO sobre o seu evento. Pensa que o EventCalc é um assistente que quer aprender sobre o seu trabalho!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Campos Que Voce vai Preencher:', 15, y);
    y += 7;

    const campos = [
        {
            nome: 'LOCAL DO EVENTO',
            desc: 'Onde vai acontecer? Digite aqui. Exemplos: "Casa da Maria", "Salao do Joao", "Praia da Barra".'
        },
        {
            nome: 'DATA DO EVENTO',
            desc: 'Que dia vai ser? Clique no campo e aparece um calendario. Você so clica no dia que quer.'
        },
        {
            nome: 'HORARIO DO EVENTO',
            desc: 'Que horas vai comecar? Digite tipo "12:00" para meio-dia, ou "19:00" para 7 da noite.'
        },
        {
            nome: 'DURACAO DO EVENTO',
            desc: 'Quanto tempo vai durar? 2 horas? 3 horas? 4 horas? Digite aqui. O EventCalc usa isso para calcular melhor!'
        },
        {
            nome: 'TIPO DE REFEICAO',
            desc: 'Vai ser: CAFE (manha), ALMOCO (meio-dia), LANCHE (tarde), ou JANTAR (noite)? Cada refeição tem um padrao diferente de quanto as pessoas comem.'
        }
    ];

    campos.forEach(campo => {
        if (y > 270) novaPage();
        destaque(campo.nome, campo.desc);
    });

    // ════════ PÁGINA 5: TELA 1 - SEGUNDA PARTE ════════
    novaPage();
    titulo('Tela 1: Continuacao - Mais Campos');

    const campos2 = [
        {
            nome: 'NUMERO DE ADULTOS',
            desc: 'Quantas PESSOAS ADULTAS vao comer? Digite o numero! Adultos comem MAIS que criancas. Por isso o EventCalc quer saber separado!'
        },
        {
            nome: 'NUMERO DE CRIANCAS',
            desc: 'Quantas CRIANCAS vao comer? As criancas comem MENOS, entao o EventCalc calcula diferente.'
        },
        {
            nome: 'TIPO DE CARDAPIO',
            desc: 'Voce quer um cardapio SIMPLES (so carne e acompanhamento) ou COMPLETO (carne, acompanhamento, salada E sobremesa)?'
        },
        {
            nome: 'TIPOS DE CORTES',
            desc: 'Que TIPO de CARNES você vai usar? Picanha? Costela? Frango? Clique em "+ADICIONAR CORTE" para cada uma que escolher.'
        },
        {
            nome: 'NUMERO DE VEGANOS',
            desc: 'Tem pessoas que NAO comem NENHUM tipo de carne? Quantas tem no seu evento? Digite aqui!'
        },
        {
            nome: 'NUMERO DE VEGETARIANOS',
            desc: 'Tem pessoas que comem OVOS e QUEIJO, mas NAO comem carnes? Quantas tem? Digite aqui!'
        },
        {
            nome: 'EQUIPAMENTOS',
            desc: 'MARQUE qual equipamento você vai LEVAR. Exemplo: fogo de chao, varal de defumacao, churrasqueira, gelo, carvao.'
        }
    ];

    campos2.forEach(campo => {
        if (y > 270) novaPage();
        destaque(campo.nome, campo.desc);
    });

    // ════════ PÁGINA 6: O BOTÃO DE EDITAR ════════
    novaPage();
    titulo('O Magico Botao de Editar');

    paragrafo('Aqui vai a MELHOR NOTICIA: VOCE PODE MUDAR TUDO SEMPRE! Depois que preenche a Tela 1 e clica em PROXIMO, pode VOLTAR E MUDAR QUALQUER COISA!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Como Funciona esse Botao Magico:', 15, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...cinza);

    paragrafo('Quando você estiver na Tela 2, 3, 4 ou 5, você verá um RESUMO dos dados que preencheu na Tela 1. Ao lado deste resumo, há um BOTAO com um icone de LAPIZ ou escrito EDITAR. Clique nele!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Passo a Passo para EDITAR:', 15, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...cinza);

    const passos = [
        '1. Voce está na Tela 2, 3, 4 ou 5',
        '2. Você vê um RESUMO dos dados da Tela 1',
        '3. Ao lado, TEM UM BOTAO COM LAPIZ ou escrito "EDITAR"',
        '4. CLIQUE NESSE BOTAO',
        '5. Você VOLTA para a Tela 1 com todos seus dados preenchidos',
        '6. MUDE o que quiser',
        '7. Clique PROXIMO',
        '8. Você volta AUTOMATICAMENTE para a tela que estava antes'
    ];

    passos.forEach(passo => {
        doc.text(passo, 15, y);
        y += 4;
    });

    // ════════ PÁGINA 7: TELA 2 - CARDÁPIO ════════
    novaPage();
    titulo('Tela 2: Escolhendo o Cardapio');

    paragrafo('Bem-vindo a TELA 2! Aqui você vai escolher EXATAMENTE o que vai servir no seu evento. É como montar um MENU no restaurante!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('As 5 Categorias de Comida:', 15, y);
    y += 7;

    const categorias = [
        {
            nome: 'APERITIVO',
            desc: 'Sao as COMIDINHAS que as pessoas comem ANTES do prato principal. Pao frances, queijo, presunto, pate, azeitona.'
        },
        {
            nome: 'PROTEINA (A ESTRELA!)',
            desc: 'SAO AS CARNES! Picanha, costela, frango grelhado, linguica. ESTA É A MAIS IMPORTANTE! O cliente PAGA mais caro por CARNE BOA!'
        },
        {
            nome: 'CARBOIDRATO',
            desc: 'Sao os acompanhamentos. Arroz, batata frita, batata doce, polenta, mandioca. Serve para "encher a barriga" junto com a carne!'
        },
        {
            nome: 'SALADA',
            desc: 'Sao as verduras: tomate, alface, cenoura ralada, rucula. Faz bem a saude! Algumas pessoas preferem salada.'
        },
        {
            nome: 'SOBREMESA',
            desc: 'Sao os DOCES! Bolo, pudim, brownie, fruta fresca. Muitas pessoas comem MESMO que nao queiram parecer!'
        }
    ];

    categorias.forEach(cat => {
        if (y > 270) novaPage();
        destaque(cat.nome, cat.desc);
    });

    // ════════ PÁGINA 8: TELA 2 - COMO USAR ════════
    novaPage();
    titulo('Tela 2: Como Usar o Cardapio');

    paragrafo('Agora você vai VER a tela com 5 CAIXAS (uma para cada categoria). Em cada caixa, tem VARIAS OPCOES. Como você escolhe?');

    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Os 3 Passos Magicos:', 15, y);
    y += 7;

    const passosCardi = [
        {
            num: '1.',
            titulo: 'MARQUE com o checkbox',
            desc: 'Cada item tem um quadradinho (checkbox) a esquerda. Clique nele para MARCAR ou DESMARCAR um item.'
        },
        {
            num: '2.',
            titulo: 'ESCOLHA quantos ITENS quer de cada categoria',
            desc: 'Para um evento normal: 1-2 carnes, 2 acompanhamentos, 1 salada, 1 sobremesa. Simples e bom!'
        },
        {
            num: '3.',
            titulo: 'Clique em +NOVO ITEM se quiser algo diferente',
            desc: 'Se você quer algo que NAO está na lista, clique em +NOVO ITEM e DIGITE o que quer!'
        }
    ];

    passosCardi.forEach(passo => {
        if (y > 270) novaPage();
        destaque(passo.num + ' ' + passo.titulo, passo.desc);
    });

    // ════════ PÁGINA 9: TELA 3 - VOLUMES ════════
    novaPage();
    titulo('Tela 3: Volumes e Compras');

    paragrafo('CHEGOU A PARTE MAIS LEGAL! Aqui o EventCalc faz a MAGIA acontecer! O sistema CALCULA AUTOMATICAMENTE quanto de cada coisa você precisa COMPRAR!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Como o EventCalc Calcula:', 15, y);
    y += 7;

    paragrafo('Lembra que você disse quantas pessoas vao, que tipo de refeição é, e qual cardapio escolheu? O EventCalc USA ESSAS INFORMACOES para calcular automaticamente!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...branco);
    doc.text('EXEMPLO PRATICO:', 15, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...cinza);
    doc.text('Voce disse: 20 PESSOAS, ALMOCO, com PICANHA', 20, y);
    y += 4;
    doc.text('O EventCalc pensa: "Almoco, picanha... cada pessoa come 450g"', 20, y);
    y += 4;
    doc.text('CALCULO: 20 pessoas x 450g = 9 QUILOS', 20, y);
    y += 4;
    doc.text('RESULTADO: Voce precisa COMPRAR 9 quilos de PICANHA', 20, y);

    // ════════ PÁGINA 10: TELA 3 - TABELA ════════
    novaPage();
    titulo('Tela 3: Entendendo a Tabela');

    paragrafo('Quando você abre a Tela 3, aparece uma TABELA GRANDE com muitas colunas. Vamos aprender cada coluna:');

    y += 3;

    const colunas = [
        {
            nome: 'COLUNA 1: NOME DO ITEM',
            desc: 'Qual é a comida? Picanha, Frango, Arroz, etc. O EventCalc já preenche baseado no que escolheu!'
        },
        {
            nome: 'COLUNA 2: QUANTIDADE (em kg)',
            desc: 'Quanto de cada coisa você precisa COMPRAR? O EventCalc CALCULA automaticamente. Mas você pode EDITAR se quiser!'
        },
        {
            nome: 'COLUNA 3: PRECO (por kg)',
            desc: 'Quanto custa cada quilo? Voce COLOCA esse valor! Pergunta no açougue e digita aqui. MUITO IMPORTANTE: O PRECO MUDA SEMPRE! Sempre atualize!'
        },
        {
            nome: 'COLUNA 4: PERDA (em %)',
            desc: 'Quando você cozinha carne, PERDE gordura! A "PERDA" é essa quantidade que nao vira comida. EventCalc ja coloca um padrao, mas você pode mudar!'
        },
        {
            nome: 'COLUNA 5: TOTAL',
            desc: 'Quanto você VAI GASTAR nesse item? O EventCalc CALCULA tudo sozinho! Quantidade x Preco = TOTAL!'
        }
    ];

    colunas.forEach(col => {
        if (y > 270) novaPage();
        destaque(col.nome, col.desc);
    });

    // ════════ PÁGINA 11: TELA 5 - AS 3 ABAS ════════
    novaPage();
    titulo('Tela 5: As 3 Abas Especiais');

    paragrafo('Você chegou na TELA 5! Essa tela é ESPECIAL porque tem 3 ABAS diferentes. Cada aba é como um "ponto de vista" diferente do mesmo evento!');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('As 3 Abas da Tela 5:', 15, y);
    y += 7;

    const abas = [
        {
            num: '1.',
            nome: 'ABA 1: CUSTOS DETALHADOS',
            desc: 'Esta aba é PARA VOCE VER! Mostra QUANTO você vai gastar, QUANTO vai ganhar, e qual é seu LUCRO. Voce nao mostra essa aba para o cliente!'
        },
        {
            num: '2.',
            nome: 'ABA 2: RELATORIO DO ASSADOR',
            desc: 'Esta aba é PARA SEU CHEF E AJUDANTES ler! Mostra EXATAMENTE o que comprar, QUANTO de cada coisa, e COMO preparar.'
        },
        {
            num: '3.',
            nome: 'ABA 3: PROPOSTA PARA O CLIENTE',
            desc: 'ESTA ABA VOCE ENVIA PARA O CLIENTE! É o documento LINDO, PROFISSIONAL, que mostra tudo que ele vai receber. É seu CONTRATO!'
        }
    ];

    abas.forEach(aba => {
        if (y > 270) novaPage();
        destaque(aba.num + ' ' + aba.nome, aba.desc);
    });

    // ════════ PÁGINA 12: RESUMO FINAL ════════
    novaPage();
    titulo('Resumo: Seu Caminho para o Sucesso');

    y += 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...ouro);
    doc.text('Os 10 Passos do Sucesso:', 15, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...cinza);

    const sucessoSteps = [
        '1. Abra EventCalc e clique em NOVO ORCAMENTO',
        '2. Preencha TODOS os campos da Tela 1 com calma',
        '3. Escolha o CARDAPIO na Tela 2',
        '4. REVISE os precos na Tela 3 e ajuste o que precisar',
        '5. Vá para Tela 5 e verifique seus CUSTOS e LUCRO',
        '6. Crie o RELATORIO DO CHEF na Aba 2',
        '7. Gere a PROPOSTA CLIENTE bonita na Aba 3',
        '8. ENVIE a proposta para o cliente',
        '9. Quando confirmado, prepare tudo com calma',
        '10. Avance para o proximo evento com confianca!'
    ];

    sucessoSteps.forEach(step => {
        doc.text(step, 15, y);
        y += 4;
    });

    // ════════ PÁGINA 13: DICAS FINAIS ════════
    novaPage();
    titulo('Dicas Profissionais Finais');

    y += 3;

    const dicas = [
        {
            titulo: 'Dica 1: Sempre Atualize Precos',
            desc: 'O preco da carne MUDA todo mes! Antes de enviar uma proposta, SEMPRE ligue no açougue e confirme os precos. Proposta com preco errado = LUCRO errado!'
        },
        {
            titulo: 'Dica 2: Comece Simples',
            desc: 'Nao tente fazer cardapio complicado para impressionar. Comece com 2-3 carnes, 2 acompanhamentos, 1 salada. Quando ficar expert, complica!'
        },
        {
            titulo: 'Dica 3: Salve Cada Orcamento',
            desc: 'O EventCalc SALVA automaticamente. Mas você pode NOMEAR cada orcamento: "Joao Silva - 25 pessoas - 15 de junho". Assim acha facil depois!'
        },
        {
            titulo: 'Dica 4: Seja Honesto com o Cliente',
            desc: 'Nao minta sobre quantidade de pessoas ou tipo de refeicao. A mentira descobrem depois... e voce PERDE o cliente e a reputacao!'
        },
        {
            titulo: 'Dica 5: Tire Duvidas',
            desc: 'Se nao entender algo, PERGUNTE! Melhor perguntar "besteira" agora do que fazer errado no evento!'
        }
    ];

    dicas.forEach(dica => {
        if (y > 270) novaPage();
        destaque(dica.titulo, dica.desc);
    });

    // ════════ PÁGINA 14: CONTATO ════════
    novaPage();
    titulo('Duvidas? Contato!');

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...ouro);
    doc.text('Estamos aqui para AJUDAR!', 105, y, { align: 'center' });

    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...branco);
    doc.text('E-MAIL:', 15, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...cinza);
    doc.text('jm.dryaged@gmail.com', 20, y);

    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...branco);
    doc.text('WHATSAPP:', 15, y);
    y += 6;
    doc.setFontSize(9);
    doc.setTextColor(...cinza);
    doc.text('+55 47 99668-1010', 20, y);

    y += 15;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...ouro);
    doc.text('Respondo em até 24 horas!', 105, y, { align: 'center' });

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...branco);
    doc.text('Muito sucesso com seus eventos!', 105, y, { align: 'center' });

    // Retornar buffer do PDF
    return Buffer.from(doc.output('arraybuffer'));
}

module.exports = { gerarTutorialPDF };
