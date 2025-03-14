document.addEventListener('DOMContentLoaded', function() {
    // Inicializar dataLayer para GTM
    window.dataLayer = window.dataLayer || [];
    
    // Animações básicas e interatividade
    initBasicAnimations();
    
    // Tracking de eventos
    trackButtonClicks();
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

// Função para obter todos os parâmetros da URL de uma vez
function getAllUrlParameters() {
    const params = {};
    const queryString = window.location.search.substring(1);
    
    if (queryString) {
        console.log('Query string encontrada:', queryString);
        const pairs = queryString.split('&');
        
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            const key = decodeURIComponent(pair[0]);
            const value = pair.length > 1 ? decodeURIComponent(pair[1]) : '';
            
            // Verificar especificamente parâmetros UTM e fbclid para logging
            if (key.startsWith('utm_') || key === 'fbclid') {
                console.log(`Parâmetro encontrado: ${key}=${value}`);
            }
            
            params[key] = value;
        }
    } else {
        console.log('Nenhum parâmetro encontrado na URL');
    }
    
    return params;
}

// Rastrear cliques nos botões e enviar dados para o n8n antes de redirecionar
function trackButtonClicks() {
    const ctaButtons = document.querySelectorAll('.cta-button');
    
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault(); // Prevenir o comportamento padrão do link
            
            // URL de destino do Telegram
            const telegramUrl = this.getAttribute('href');
            
            // Rastrear evento de clique no Facebook Pixel (Lead)
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Alan Roleta - Grupo de Lives',
                    content_category: 'Telegram Subscription'
                });
            }
            
            // Obter todos os parâmetros da URL de uma vez
            const params = getAllUrlParameters();
            
            // Dados para enviar ao n8n
            const data = {
                expert: 'alanroleta'
            };
            
            // Adicionar todos os parâmetros da URL ao objeto data
            // Usar um método mais direto para garantir que todos os parâmetros sejam incluídos
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    data[key] = params[key];
                    console.log(`Adicionando parâmetro ao objeto de dados: ${key}=${params[key]}`);
                }
            }
            
            console.log('Dados para enviar ao n8n:', data);
            
            // Endpoint do n8n
            const n8nEndpoint = 'https://whkn8n.meumenu2023.uk/webhook/fbclid-landingpage';
            
            // Enviar dados para o n8n via POST
            // Converter para string JSON e registrar no console para depuração
            const jsonData = JSON.stringify(data);
            console.log('JSON a ser enviado:', jsonData);
            
            // Função para tentar novamente o envio em caso de falha
            const sendData = () => {
                fetch(n8nEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=UTF-8',
                    },
                    body: jsonData,
                    mode: 'no-cors'
                })
                .then(response => {
                    console.log('Dados enviados com sucesso para o n8n');
                    // Redirecionar para o Telegram após o envio dos dados
                    window.location.href = telegramUrl;
                })
                .catch(error => {
                    console.error('Erro ao enviar dados para o n8n:', error);
                    // Em caso de erro, redirecionar mesmo assim
                    window.location.href = telegramUrl;
                });
            };
            
            // Enviar dados para o n8n, independentemente de ter fbclid ou não
            sendData();
        });
    });
}

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
