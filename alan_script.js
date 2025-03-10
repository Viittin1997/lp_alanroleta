document.addEventListener('DOMContentLoaded', function() {
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
            const n8nEndpoint = 'https://edtn8n.meumenu2023.uk/webhook-test/fbclid-landingpage';
            
            // Enviar dados para o n8n via POST
            fetch(n8nEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                console.log('Resposta do n8n:', response.status);
                // Redirecionar para o Telegram após o envio dos dados
                window.location.href = telegramUrl;
            })
            .catch(error => {
                // Em caso de erro, redirecionar mesmo assim
                console.error('Erro ao enviar dados:', error);
                window.location.href = telegramUrl;
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
