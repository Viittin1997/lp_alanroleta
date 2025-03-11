document.addEventListener('DOMContentLoaded', function() {
    // Inicializar dataLayer para GTM se ainda não existir
    window.dataLayer = window.dataLayer || [];
    
    // Registrar evento de visualização de página no GTM
    dataLayer.push({
        'event': 'pageView',
        'pageName': 'Alan Roleta Landing Page',
        'pageType': 'landing_page'
    });
    
    console.log('GTM: Evento pageView enviado');
    
    // Animações básicas e interatividade
    initBasicAnimations();
    
    // Tracking de eventos
    trackButtonClicks();
    
    console.log('Script inicializado com sucesso');
});

// Inicializar animações básicas
function initBasicAnimations() {
    // Animação simples de entrada dos elementos
    const elementsToAnimate = document.querySelectorAll('.profile, .subtitle, .hero, .benefit-card, .bottom-cta');
    
    elementsToAnimate.forEach((element, index) => {
        element.style.opacity = '0';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 100 * index);
    });
    
    // Animação simples para os botões CTA
    setTimeout(() => {
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            button.classList.add('pulse');
        });
    }, 1000);
}

// Função para obter parâmetros da URL
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Rastrear cliques nos botões e enviar dados para o n8n antes de redirecionar
function trackButtonClicks() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir o comportamento padrão do link
            
            // URL de destino do Telegram
            const telegramUrl = this.getAttribute('href');
            
            // Rastrear evento de clique no Facebook Pixel
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Alan Roleta - Grupo de Lives',
                    content_category: 'Telegram Subscription',
                    pixel_id: '953511639762298'
                });
                console.log('Evento de Lead registrado no Facebook Pixel');
            } else {
                console.warn('Facebook Pixel não está disponível');
            }
            
            // Rastrear evento de clique no Google Tag Manager
            if (window.dataLayer) {
                dataLayer.push({
                    'event': 'telegramClick',
                    'eventCategory': 'Engagement',
                    'eventAction': 'Click',
                    'eventLabel': 'Telegram Button'
                });
                console.log('GTM: Evento telegramClick enviado');
            } else {
                console.warn('Google Tag Manager dataLayer não está disponível');
            }
            
            // Obter o parâmetro fbclid da URL
            const fbclid = getUrlParameter('fbclid');
            
            // Dados para enviar ao n8n
            const data = {
                expert: 'alanroleta',
                fbclid: fbclid || 'sem_fbclid'
            };
            
            console.log('Enviando dados para o n8n:', data);
            
            // Endpoint do n8n
            const n8nEndpoint = 'https://whkn8n.meumenu2023.uk/webhook/fbclid-landingpage';
            
            // Enviar dados para o n8n via POST com modo no-cors para evitar problemas de CORS
            fetch(n8nEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(data),
                mode: 'no-cors' // Isso permite que a requisição seja enviada mesmo com restrições de CORS
            })
            .then(response => {
                // Como estamos usando mode: 'no-cors', a resposta será do tipo 'opaque'
                // e não podemos acessar o status ou o corpo da resposta
                console.log('Resposta recebida do n8n (opaque response devido ao modo no-cors)');
                
                // Registrar evento de conversão bem-sucedida no GTM
                if (window.dataLayer) {
                    dataLayer.push({
                        'event': 'webhookSuccess',
                        'eventCategory': 'Conversion',
                        'eventAction': 'Webhook',
                        'eventLabel': 'Success'
                    });
                    console.log('GTM: Evento webhookSuccess enviado');
                }
                
                // Redirecionar para o Telegram após o envio dos dados
                setTimeout(() => {
                    console.log('Redirecionando para:', telegramUrl);
                    window.location.href = telegramUrl;
                }, 300); // Pequeno atraso para garantir que o log seja exibido
            })
            .catch(error => {
                // Em caso de erro, redirecionar mesmo assim
                console.error('Erro ao enviar dados:', error);
                
                // Registrar evento de erro no GTM
                if (window.dataLayer) {
                    dataLayer.push({
                        'event': 'webhookError',
                        'eventCategory': 'Error',
                        'eventAction': 'Webhook',
                        'eventLabel': error.message || 'Unknown Error'
                    });
                    console.log('GTM: Evento webhookError enviado');
                }
                
                // Tentar uma abordagem alternativa com XMLHttpRequest
                console.log('Tentando método alternativo com XMLHttpRequest...');
                const xhr = new XMLHttpRequest();
                xhr.open('POST', n8nEndpoint, true);
                xhr.setRequestHeader('Content-Type', 'application/json');
                
                xhr.onload = function() {
                    console.log('XMLHttpRequest concluído com status:', xhr.status);
                    
                    // Registrar evento de sucesso alternativo no GTM
                    if (window.dataLayer) {
                        dataLayer.push({
                            'event': 'webhookSuccessXHR',
                            'eventCategory': 'Conversion',
                            'eventAction': 'WebhookXHR',
                            'eventLabel': 'Success'
                        });
                    }
                    
                    window.location.href = telegramUrl;
                };
                
                xhr.onerror = function() {
                    console.error('Erro no XMLHttpRequest');
                    
                    // Registrar evento de erro alternativo no GTM
                    if (window.dataLayer) {
                        dataLayer.push({
                            'event': 'webhookErrorXHR',
                            'eventCategory': 'Error',
                            'eventAction': 'WebhookXHR',
                            'eventLabel': 'Network Error'
                        });
                    }
                    
                    window.location.href = telegramUrl;
                };
                
                xhr.send(JSON.stringify(data));
            });
        });
    });
}

// Detectar se o usuário está em um dispositivo móvel
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Adicionar CSS para animações
document.head.insertAdjacentHTML('beforeend', `
<style>
.pulse {
    animation: pulse 1s ease-in-out;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(230, 0, 0, 0.7);
    }
    70% {
        box-shadow: 0 0 0 10px rgba(230, 0, 0, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(230, 0, 0, 0);
    }
}
</style>
`);
