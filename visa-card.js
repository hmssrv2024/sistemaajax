/**
 * VISA CARD COMPONENT JAVASCRIPT
 * Funcionalidades adicionales para las tarjetas
 */

class VisaCardManager {
    constructor() {
        this.cards = document.querySelectorAll('.visa-card');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.setupCardFlip();
    }

    setupEventListeners() {
        this.cards.forEach(card => {
            // Efecto de hover mejorado
            card.addEventListener('mouseenter', (e) => {
                this.onCardHover(e.target);
            });

            card.addEventListener('mouseleave', (e) => {
                this.onCardLeave(e.target);
            });

            // Click para mostrar detalles
            card.addEventListener('click', (e) => {
                this.onCardClick(e.target);
            });
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        this.cards.forEach(card => {
            observer.observe(card);
        });
    }

    setupCardFlip() {
        // Agregar efecto de volteo en double-click
        this.cards.forEach(card => {
            card.addEventListener('dblclick', (e) => {
                this.flipCard(e.target);
            });
        });
    }

    onCardHover(card) {
        // Pausar animaciones de fondo en hover
        if (card.classList.contains('digital')) {
            card.style.animationPlayState = 'paused';
        }

        // Efecto de brillo
        card.style.transform = 'translateY(-8px) scale(1.02)';
    }

    onCardLeave(card) {
        // Reanudar animaciones
        if (card.classList.contains('digital')) {
            card.style.animationPlayState = 'running';
        }

        // Resetear transformación
        card.style.transform = '';
    }

    onCardClick(card) {
        // Mostrar información adicional o trigger action
        this.showCardDetails(card);
    }

    flipCard(card) {
        card.classList.toggle('flipped');
        
        // Si no tiene la clase flipped, agregarla con estilos
        if (card.classList.contains('flipped')) {
            card.style.transform = 'perspective(1000px) rotateY(180deg)';
            setTimeout(() => {
                card.style.transform = 'perspective(1000px) rotateY(0deg)';
                card.classList.remove('flipped');
            }, 2000);
        }
    }

    showCardDetails(card) {
        const cardHolder = card.querySelector('.visa-card__holder p:last-child').textContent;
        const cardType = card.querySelector('.card-type').textContent;
        
        // Crear modal simple
        this.createModal({
            title: 'Detalles de la Tarjeta',
            content: `
                <p><strong>Tipo:</strong> ${cardType}</p>
                <p><strong>Titular:</strong> ${cardHolder}</p>
                <p><strong>Estado:</strong> ${card.classList.contains('frozen') ? 'Congelada' : 'Activa'}</p>
                <p><strong>Número:</strong> **** **** **** 1234</p>
            `
        });
    }

    createModal({ title, content }) {
        // Remover modal existente
        const existingModal = document.querySelector('.visa-card-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Crear nuevo modal
        const modal = document.createElement('div');
        modal.className = 'visa-card-modal';
        modal.innerHTML = `
            <div class="visa-card-modal__overlay">
                <div class="visa-card-modal__content">
                    <div class="visa-card-modal__header">
                        <h3>${title}</h3>
                        <button class="visa-card-modal__close">&times;</button>
                    </div>
                    <div class="visa-card-modal__body">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // Estilos para el modal
        const modalStyles = `
            <style>
                .visa-card-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }
                
                .visa-card-modal__overlay {
                    background: rgba(0, 0, 0, 0.8);
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .visa-card-modal__content {
                    background: white;
                    border-radius: 10px;
                    max-width: 400px;
                    width: 100%;
                    color: #333;
                    animation: slideIn 0.3s ease;
                }
                
                .visa-card-modal__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                }
                
                .visa-card-modal__header h3 {
                    margin: 0;
                    color: #333;
                }
                
                .visa-card-modal__close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .visa-card-modal__body {
                    padding: 20px;
                }
                
                .visa-card-modal__body p {
                    margin: 10px 0;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideIn {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            </style>
        `;

        // Agregar estilos y modal al documento
        document.head.insertAdjacentHTML('beforeend', modalStyles);
        document.body.appendChild(modal);

        // Event listeners para cerrar
        modal.querySelector('.visa-card-modal__close').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.visa-card-modal__overlay').addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.visa-card-modal__overlay')) {
                modal.remove();
            }
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
            }
        });
    }

    // Método público para crear tarjetas dinámicamente
    createCard({ holder, type = 'Virtual', theme = '', frozen = false, premium = '' }) {
        const cardHTML = `
            <div class="visa-card ${theme ? `digital theme-${theme}` : ''} ${frozen ? 'frozen' : ''} ${premium ? `visa-card--${premium}` : ''}">
                ${frozen ? '<span class="visa-card__frozen-label">Frozen</span>' : ''}
                <div class="visa-card__top">
                    <span class="card-type">${type}</span>
                    <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiASST8U1GA_fD6sqNKJpsqoOcnsp-fiFEgEz_JZU9ac2czvMFvDuYX1LUvC030mdqIGp6VbxqSYYVvmh6D5_duOTKFlxSdyjURh04-Dmi-Hc6ArZ_f_P7cc87af35w4FJkhDqm-h_u90uVoOrhPxXrUPhLF_ozwsrP4Wnvlbs5EFlf4fSunvwMDugQqtBp/w320-h217/remeexzelle.png" 
                         alt="RemeExzelle Logo" class="visa-card__logo">
                </div>
                <div class="visa-card__bottom">
                    <div class="visa-card__holder">
                        <p>Cardholder</p>
                        <p>${holder}</p>
                    </div>
                    <img src="https://assets.codepen.io/14762/visa-virtual.svg" 
                         alt="Visa Logo" class="visa-card__visa-logo">
                </div>
            </div>
        `;

        return cardHTML;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const visaCardManager = new VisaCardManager();
    
    // Hacer disponible globalmente para uso externo
    window.VisaCardManager = visaCardManager;
});

// Función helper para crear tarjetas fácilmente
window.createVisaCard = function(options) {
    const manager = window.VisaCardManager;
    if (manager) {
        return manager.createCard(options);
    }
    return null;
};