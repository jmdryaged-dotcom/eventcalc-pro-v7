const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Remove query string
    let filePath = req.url.split('?')[0];

    // Padrão: se for / redireciona para /index_v7.html
    if (filePath === '/') {
        filePath = '/index_v7.html';
    }

    // Construir caminho do arquivo
    const fullPath = path.join(__dirname, filePath);

    // Determinar tipo MIME
    const ext = path.extname(fullPath);
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[ext] || 'text/plain';

    // Ler e servir arquivo
    fs.readFile(fullPath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Arquivo não encontrado</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Erro no servidor', 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║  🚀 EventCalc Pro v7 - Servidor Local Iniciado!          ║
║                                                           ║
║  📍 Acesse: http://localhost:3000                         ║
║                                                           ║
║  Pressione Ctrl+C para parar o servidor                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
