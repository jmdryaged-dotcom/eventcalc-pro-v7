/**
 * Remove fundo branco da logo do Club Carnivorista
 * Processa imagem em canvas e torna fundo transparente
 */

function removerFundoLogo(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    // Esperar imagem carregar
    if (!imgElement.complete) {
        imgElement.onload = () => processarImagem(imgElement, canvas, ctx);
        return;
    }

    processarImagem(imgElement, canvas, ctx);
}

function processarImagem(imgElement, canvas, ctx) {
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;

    // Desenhar imagem no canvas
    ctx.drawImage(imgElement, 0, 0);

    // Obter dados dos pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Detectar cor de fundo (pixel do canto superior esquerdo)
    const bgColor = {
        r: data[0],
        g: data[1],
        b: data[2]
    };

    // Tolerância para detectar pixels de fundo (por causa de anti-aliasing)
    const tolerancia = 30;

    // Iterar por todos os pixels
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Se cor está dentro da tolerância da cor de fundo
        if (
            Math.abs(r - bgColor.r) < tolerancia &&
            Math.abs(g - bgColor.g) < tolerancia &&
            Math.abs(b - bgColor.b) < tolerancia &&
            a > 200 // Apenas pixels opacos
        ) {
            // Tornar transparente
            data[i + 3] = 0;
        }
    }

    // Aplicar dados modificados
    ctx.putImageData(imageData, 0, 0);

    // Converter canvas para PNG e substituir src
    const pngUrl = canvas.toDataURL('image/png');
    imgElement.src = pngUrl;
    imgElement.style.backgroundColor = 'transparent';
}

// Executar quando documento estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Encontrar todas as imagens da logo
    const logos = document.querySelectorAll('img[src="logo-club.jpeg"]');
    logos.forEach(logo => {
        removerFundoLogo(logo);
    });
});
