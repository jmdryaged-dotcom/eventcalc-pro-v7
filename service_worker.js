// Service Worker para EventCalc Pro v7 - Modo Offline

const CACHE_NAME = 'eventcalc-pro-v7-cache-v1';
const urlsParaCache = [
    './',
    './index_v7.html',
    './event_calculator_pro_v7_questionario.html',
    './event_calculator_pro_v7_cardapio.html',
    './event_calculator_pro_v7_cardapio_2b.html',
    './event_calculator_pro_v7_volumes.html',
    './event_calculator_pro_v7_proposta.html',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lora:wght@400;500;600&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Instalar o Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('✅ Cache aberto - EventCalc Pro v7');
                return cache.addAll(urlsParaCache).catch((err) => {
                    console.warn('⚠️ Algumas URLs não foram cacheadas:', err);
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Ativar o Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Estratégia: Cache First, Fall back to Network
self.addEventListener('fetch', (event) => {
    // Ignorar requisições não-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorar requisições para APIs externas críticas
    if (event.request.url.includes('/api/') && !event.request.url.includes('googleapis')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Se encontrou no cache, retornar
                if (response) {
                    // Atualizar cache em background (se online)
                    if (navigator.onLine) {
                        fetch(event.request).then((freshResponse) => {
                            if (freshResponse && freshResponse.ok) {
                                caches.open(CACHE_NAME).then((cache) => {
                                    cache.put(event.request, freshResponse.clone());
                                });
                            }
                        }).catch(() => {});
                    }
                    return response;
                }

                // Se não está em cache, tentar buscar da rede
                return fetch(event.request)
                    .then((response) => {
                        // Não cachear respostas inválidas
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clonar a resposta
                        const responseToCache = response.clone();

                        // Cachecar a resposta bem-sucedida
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Se falhar na rede e não está em cache, retornar offline page
                        // Por enquanto, retornar erro genérico
                        return new Response('❌ Offline - Página não disponível no cache', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Sincronização em background (quando voltar online)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-dados') {
        event.waitUntil(
            // Aqui você poderia sincronizar dados salvos em localStorage
            // com um servidor, quando a conexão voltar
            Promise.resolve().then(() => {
                console.log('✅ Sincronizando dados com servidor...');
            })
        );
    }
});
