// ============================================================================
// REMEEX VISA Banking - Sistema Evolutivo
// Versión: 4.2 (Modular)
// ============================================================================

"use strict";

// Manager de estados evolutivos
class StatusEvolutionManager {
  constructor() {
    this.currentState = this.loadCurrentState();
    this.processingTimer = null;
    this.reminderTimers = [];
    this.bankData = this.loadBankData();
    this.container = null;
    this.isExpanded = false;
    this.exchangeRate = CONFIG.EXCHANGE_RATES.USD_TO_BS;
    this.lastInteraction = Date.now();
    
    this.init();
  }

  init() {
    this.createContainer();
    this.bindEvents();
    this.updateCard();
    this.startReminderSystem();
    this.checkForProcessingCompletion();
  }

  createContainer() {
    this.removeDuplicateBanners();
    
    const securityBanner = document.getElementById('security-device-notice');
    if (securityBanner) {
      this.container = document.createElement('div');
      this.container.className = 'evolution-status-card';
      this.container.id = 'evolution-status-card';
      this.container.innerHTML = '<div class="evolution-card-inner" id="evolution-card-inner"></div>';
      
      securityBanner.insertAdjacentElement('afterend', this.container);
    }
  }

  removeDuplicateBanners() {
    const duplicateSelectors = [
      '#dashboard-verify-banner',
      '#verification-processing-banner', 
      '#first-recharge-banner',
      '.bank-validation-card',
      '.pending-bank-card',
      '.verify-banner',
      '.verification-success-banner'
    ];
    
    duplicateSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  getCurrentState() {
    const { currentUser, verificationStatus } = REMEEX_GLOBALS;
    
    if (!currentUser.hasMadeFirstRecharge) {
      return STATUS_EVOLUTION.STATES.FIRST_RECHARGE;
    }
    
    const hasPendingMobilePayment = this.checkPendingMobilePayment();
    if (hasPendingMobilePayment) {
      return STATUS_EVOLUTION.STATES.FIRST_MOBILE_PAYMENT;
    }
    
    if (verificationStatus.status === 'unverified') {
      return STATUS_EVOLUTION.STATES.NEEDS_VERIFICATION;
    }
    
    if (this.isDocumentProcessing()) {
      return STATUS_EVOLUTION.STATES.PROCESSING_DOCS;
    }
    
    if (verificationStatus.status === 'verified' || this.bankData) {
      return STATUS_EVOLUTION.STATES.READY_FOR_BANKING;
    }
    
    if (verificationStatus.status === 'bank_validated') {
      return STATUS_EVOLUTION.STATES.BANKING_VALIDATED;
    }
    
    return STATUS_EVOLUTION.STATES.FIRST_RECHARGE;
  }

  checkPendingMobilePayment() {
    const { currentUser } = REMEEX_GLOBALS;
    return currentUser.transactions.some(t => 
      t.method === 'mobile_payment' && 
      t.amount >= 25 && 
      (t.status === 'processing' || t.status === 'pending_review')
    );
  }

  updateCard() {
    if (!this.container) return;
    
    const state = this.getCurrentState();
    const cardInner = this.container.querySelector('.evolution-card-inner');
    
    this.container.className = `evolution-status-card ${state}`;
    cardInner.innerHTML = this.generateCardContent(state);
    
    this.applyStateAnimations(state);
    this.saveCurrentState(state);
    this.updateWithdrawButton(state);
  }

  generateCardContent(state) {
    const { currentUser } = REMEEX_GLOBALS;
    const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Usuario';
    
    switch (state) {
      case STATUS_EVOLUTION.STATES.FIRST_RECHARGE:
        return this.generateFirstRechargeContent(firstName);
      case STATUS_EVOLUTION.STATES.NEEDS_VERIFICATION:
        return this.generateVerificationNeededContent(firstName);
      case STATUS_EVOLUTION.STATES.PROCESSING_DOCS:
        return this.generateProcessingContent(firstName);
      case STATUS_EVOLUTION.STATES.READY_FOR_BANKING:
        return this.generateBankingValidationContent(firstName);
      case STATUS_EVOLUTION.STATES.BANKING_VALIDATED:
        return this.generateBankingValidatedContent(firstName);
      case STATUS_EVOLUTION.STATES.FIRST_MOBILE_PAYMENT:
        return this.generateFirstMobilePaymentContent(firstName);
      default:
        return this.generateFirstRechargeContent(firstName);
    }
  }

  generateFirstRechargeContent(firstName) {
    return `
      <div class="evolution-header">
        <div class="evolution-title-container">
          <div class="evolution-icon recharge">
            <i class="fas fa-credit-card"></i>
          </div>
          <div class="evolution-title">¡Hola ${firstName}! Activa tu cuenta</div>
        </div>
        <div class="evolution-progress">
          <svg class="evolution-progress-circle" viewBox="0 0 36 36">
            <circle class="evolution-progress-bg" cx="18" cy="18" r="16"></circle>
            <circle class="evolution-progress-fill recharge" cx="18" cy="18" r="16" 
                    stroke-dasharray="25, 100" stroke-dashoffset="0"></circle>
          </svg>
          <div class="evolution-progress-text">25%</div>
        </div>
      </div>
      
      <div class="evolution-content">
        <div class="evolution-subtitle">Recarga desde $25 y desbloquea el poder de las transferencias internacionales</div>
        
        <div class="evolution-benefits">
          <div class="benefit-item">
            <i class="fas fa-globe"></i>
            <span>Transferencias globales</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-shield-alt"></i>
            <span>Seguridad bancaria</span>
          </div>
        </div>
        
        <div class="evolution-personalized-message">
          Acceso inmediato a tu ecosistema financiero digital
        </div>
      </div>
      
      <div class="evolution-actions">
        <button class="evolution-action-btn primary" onclick="REMEEX_GLOBALS.statusEvolution.startRecharge()">
          <i class="fas fa-plus-circle"></i>
          Recargar
        </button>
      </div>
    `;
  }

  generateVerificationNeededContent(firstName) {
    const timeSinceRecharge = this.getTimeSinceLastRecharge();
    let motivationalMessage = this.getMotivationalMessage('verification', timeSinceRecharge);
    
    return `
      <div class="evolution-header">
        <div class="evolution-title-container">
          <div class="evolution-icon verification">
            <i class="fas fa-id-card"></i>
          </div>
          <div class="evolution-title">Verificar identidad</div>
        </div>
        <div class="evolution-progress">
          <svg class="evolution-progress-circle" viewBox="0 0 36 36">
            <circle class="evolution-progress-bg" cx="18" cy="18" r="16"></circle>
            <circle class="evolution-progress-fill verification" cx="18" cy="18" r="16" 
                    stroke-dasharray="50, 100" stroke-dashoffset="0"></circle>
          </svg>
          <div class="evolution-progress-text">50%</div>
        </div>
      </div>
      
      <div class="evolution-content">
        <div class="evolution-subtitle">Desbloquea todas las funciones verificando tu identidad</div>
        
        <div class="evolution-benefits">
          <div class="benefit-item">
            <i class="fas fa-credit-card"></i>
            <span>Tarjeta Virtual</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-university"></i>
            <span>Retiros ilimitados</span>
          </div>
          <div class="benefit-item">
            <i class="fas fa-mobile-alt"></i>
            <span>Zelle Venezuela</span>
          </div>
        </div>
        
        <div class="evolution-personalized-message">
          ${motivationalMessage}
        </div>
      </div>
      
      <div class="evolution-actions">
        <button class="evolution-action-btn primary" onclick="REMEEX_GLOBALS.statusEvolution.startVerification()">
          <i class="fas fa-shield-alt"></i>
          Verificar
        </button>
        <a href="https://wa.me/+17373018059?text=${this.getWhatsAppMessage('verification')}" 
           class="evolution-action-btn whatsapp" target="_blank">
          <i class="fab fa-whatsapp"></i>
          Soporte
        </a>
      </div>
    `;
  }

  generateProcessingContent(firstName) {
    const progress = this.getProcessingProgress();
    const timeRemaining = this.getTimeRemaining();
    
    return `
      <div class="evolution-header">
        <div class="evolution-title-container">
          <div class="evolution-icon processing">
            <div class="processing-spinner"></div>
          </div>
          <div class="evolution-title">Procesando documentos</div>
        </div>
        <div class="evolution-progress">
          <svg class="evolution-progress-circle" viewBox="0 0 36 36">
            <circle class="evolution-progress-bg" cx="18" cy="18" r="16"></circle>
            <circle class="evolution-progress-fill processing" cx="18" cy="18" r="16" 
                    stroke-dasharray="${progress * 0.75}, 100" stroke-dashoffset="0"></circle>
          </svg>
          <div class="evolution-progress-text">${progress}%</div>
        </div>
      </div>
      
      <div class="evolution-content">
        <div class="evolution-subtitle">Validando información y estableciendo conexión bancaria segura</div>
        
        <div class="evolution-processing-steps">
          <div class="processing-step ${progress > 30 ? 'completed' : 'active'}">
            <i class="fas ${progress > 30 ? 'fa-check' : 'fa-id-card'}"></i>
            <span>Verificando documentos de identidad</span>
          </div>
          <div class="processing-step ${progress > 70 ? 'completed' : progress > 30 ? 'active' : ''}">
            <i class="fas ${progress > 70 ? 'fa-check' : 'fa-university'}"></i>
            <span>Conectando con ${this.bankData?.name || 'tu banco'}</span>
          </div>
          <div class="processing-step ${progress > 90 ? 'completed' : progress > 70 ? 'active' : ''}">
            <i class="fas ${progress > 90 ? 'fa-check' : 'fa-cog'}"></i>
            <span>Configuración final</span>
          </div>
        </div>
        
        <div class="evolution-personalized-message">
          ${timeRemaining} • Proceso automatizado en curso
        </div>
      </div>
      
      <div class="evolution-actions">
        <button class="evolution-action-btn primary" onclick="REMEEX_GLOBALS.statusEvolution.expandDetails()">
          <i class="fas fa-info-circle"></i>
          Ver detalles
        </button>
      </div>
    `;
  }

  generateBankingValidationContent(firstName) {
    const timeSinceVerification = this.getTimeSinceVerification();
    let motivationalMessage = this.getMotivationalMessage('banking', timeSinceVerification);
    
    return `
      <div class="evolution-header">
        <div class="evolution-title-container">
          <div class="evolution-icon banking">
            <i class="fas fa-university"></i>
          </div>
          <div class="evolution-title">Preparando retiros</div>
        </div>
        <div class="evolution-progress">
          <svg class="evolution-progress-circle" viewBox="0 0 36 36">
            <circle class="evolution-progress-bg" cx="18" cy="18" r="16"></circle>
            <circle class="evolution-progress-fill banking" cx="18" cy="18" r="16" 
                    stroke-dasharray="90, 100" stroke-dashoffset="0"></circle>
          </svg>
          <div class="evolution-progress-text">90%</div>
        </div>
      </div>
      
      <div class="evolution-content">
        <div class="evolution-subtitle">Documentos verificados. Último paso: validar cuenta bancaria</div>
        
        <div class="evolution-bank-connection">
          <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnBzNdjl6bNp-nIdaiHVENczJhwlJNA7ocsyiOObMmzbu8at0dY5yGcZ9cLxLF39qI6gwNfqBxlkTDC0txVULEwQVwGkeEzN0Jq9MRTRagA48mh18UqTlR4WhsXOLAEZugUyhqJHB19xJgnkpe-S5VOWFgzpKFwctv3XP9XhH41vNTvq0ZS-nik58Qhr-O/s320/remeex.png" 
               alt="REMEEX" class="remeex-logo">
          <div class="connection-arrow">
            <i class="fas fa-chevron-right"></i>
            <i class="fas fa-chevron-right"></i>
            <i class="fas fa-chevron-right"></i>
          </div>
          ${this.bankData ? 
            `<img src="${this.bankData.logo || 'https://via.placeholder.com/36x36/059669/ffffff?text=B'}" alt="${this.bankData.name}" class="bank-logo">` :
            `<div class="bank-logo"><i class="fas fa-university"></i></div>`
          }
        </div>
        
        ${this.bankData ? this.generateBankInfoCompact() : ''}
        
        <div class="evolution-security-note">
          <i class="fas fa-lock"></i>
          <span>Solo podrás retirar a la cuenta registrada</span>
        </div>
        
        <div class="evolution-personalized-message">
          ${motivationalMessage}
        </div>
      </div>
      
      <div class="evolution-actions">
        <a href="validacion.html" class="evolution-action-btn banking">
          <i class="fas fa-university"></i>
          Validar cuenta
        </a>
        <button class="evolution-action-btn primary" onclick="REMEEX_GLOBALS.statusEvolution.showDetails()">
          <i class="fas fa-info-circle"></i>
          Ver datos
        </button>
      </div>
    `;
  }

  generateBankingValidatedContent(firstName) {
    return `
      <div class="evolution-header">
        <div class="evolution-title-container">
          <div class="evolution-icon validated">
            <i class="fas fa-check-double"></i>
          </div>
          <div class="evolution-title">¡Cuenta verificada!</div>
        </div>
        <div class="evolution-progress">
          <svg class="evolution-progress-circle" viewBox="0 0 36 36">
            <circle class="evolution-progress-bg" cx="18" cy="18" r="16"></circle>
            <circle class="evolution-progress-fill banking" cx="18" cy="18" r="16" 
                    stroke-dasharray="100, 100" stroke-dashoffset="0"></circle>
          </svg>
          <div class="evolution-progress-text">100%</div>
        </div>
      </div>
      
      <div class="evolution-content">
        <div class="evolution-subtitle">Acceso completo desbloqueado. Todas las funciones disponibles</div>
        
        <div class="evolution-features-unlocked">
          <div class="feature-unlocked">
            <i class="fas fa-credit-card"></i>
            <span>Tarjeta VISA</span>
          </div>
          <div class="feature-unlocked">
            <i class="fas fa-university"></i>
            <span>Retiros</span>
          </div>
          <div class="feature-unlocked">
            <i class="fas fa-mobile-alt"></i>
            <span>Zelle</span>
          </div>
        </div>
        
        <div class="evolution-limits">
          <div class="limit-item">
            <div class="limit-label">Pago Móvil</div>
            <div class="limit-value">Bs 250.000</div>
          </div>
          <div class="limit-item">
            <div class="limit-label">Transferencias</div>
            <div class="limit-value">Bs 1.000.000</div>
          </div>
        </div>
      </div>
      
      <div class="evolution-actions">
        <button class="evolution-action-btn success" onclick="REMEEX_GLOBALS.statusEvolution.exploreFeatures()">
          <i class="fas fa-rocket"></i>
          Explorar
        </button>
      </div>
    `;
  }

  generateFirstMobilePaymentContent(firstName) {
    const { currentUser } = REMEEX_GLOBALS;
    const pendingTransaction = currentUser.transactions
      .find(t => t.method === 'mobile_payment' && t.amount >= 25 && 
                (t.status === 'processing' || t.status === 'pending_review'));
    
    if (!pendingTransaction) return this.generateVerificationNeededContent(firstName);
    
    const isProcessing = pendingTransaction.status === 'processing';
    const isPendingReview = pendingTransaction.status === 'pending_review';
    
    return `
      <div class="evolution-header">
        <div class="evolution-icon ${isProcessing ? 'processing' : 'pending'}">
          ${isProcessing ? '<div class="processing-spinner"></div>' : '<i class="fas fa-clock"></i>'}
        </div>
        <div class="evolution-content">
          <div class="evolution-title">
            ${isProcessing ? `Validando tu pago, ${firstName}` : `Revisando manualmente, ${firstName}`}
          </div>
          <div class="evolution-subtitle">
            ${isProcessing ? 
              'Estamos procesando tu pago móvil y validando el concepto utilizado' :
              'Tu pago requiere revisión manual, esto puede tomar unos minutos'
            }
          </div>
        </div>
      </div>
      
      <div class="evolution-payment-details">
        <div class="payment-detail-row">
          <span>Monto:</span>
          <span>${REMEEX_UTILS.formatCurrency(pendingTransaction.amount, 'usd')}</span>
        </div>
        <div class="payment-detail-row">
          <span>Referencia:</span>
          <span>${pendingTransaction.reference}</span>
        </div>
        <div class="payment-detail-row">
          <span>Concepto:</span>
          <span>${pendingTransaction.concept}</span>
        </div>
      </div>
      
      <div class="evolution-progress-container">
        <div class="evolution-progress-bar ${isProcessing ? 'processing' : 'reviewing'}" 
             style="width: ${isProcessing ? '60%' : '80%'}"></div>
      </div>
      <div class="evolution-progress-text">
        ${isProcessing ? 
          'Validando datos del comprobante...' :
          'En revisión manual - Tiempo estimado: 5-10 min'
        }
      </div>
      
      <div class="evolution-actions">
        <a href="https://wa.me/+17373018059?text=${encodeURIComponent(`Consulta sobre mi pago móvil: Ref ${pendingTransaction.reference}`)}" 
           class="evolution-action-btn whatsapp" target="_blank">
          <i class="fab fa-whatsapp"></i>
          Consultar Estado
        </a>
      </div>
    `;
  }

  generateBankInfoCompact() {
    if (!this.bankData) return '';
    
    const accountMask = this.bankData.accountNumber ? 
      `****${this.bankData.accountNumber.slice(-4)}` : '****';
    
    return `
      <div class="evolution-bank-info">
        <div class="bank-info-row">
          <span class="bank-info-label">Banco:</span>
          <span class="bank-info-value">${this.bankData.name}</span>
        </div>
        <div class="bank-info-row">
          <span class="bank-info-label">Cuenta:</span>
          <span class="bank-info-value">${accountMask}</span>
        </div>
      </div>
    `;
  }

  // Métodos de control y utilidades
  startRecharge() {
    const dashboardContainer = document.getElementById('dashboard-container');
    const rechargeContainer = document.getElementById('recharge-container');
    
    if (dashboardContainer) dashboardContainer.style.display = 'none';
    if (rechargeContainer) rechargeContainer.style.display = 'block';
  }

  startVerification() {
    window.location.href = 'verificacion.html';
  }

  startProcessing() {
    const startTime = Date.now();
    localStorage.setItem(STATUS_EVOLUTION.STORAGE_KEYS.PROCESSING_START, startTime.toString());
    
    this.updateCard();
    
    this.processingTimer = setTimeout(() => {
      this.completeProcessing();
    }, STATUS_EVOLUTION.TIMERS.PROCESSING_DURATION);
  }

  completeProcessing() {
    const { verificationStatus } = REMEEX_GLOBALS;
    
    localStorage.removeItem(STATUS_EVOLUTION.STORAGE_KEYS.PROCESSING_START);
    verificationStatus.status = 'verified';
    REMEEX_PERSISTENCE.saveVerificationData();
    
    this.updateCard();
    
    REMEEX_UTILS.showToast('success', '¡Documentos Validados!', 
             'Tus documentos han sido verificados exitosamente. Completa el último paso para habilitar retiros.', 8000);
  }

  expandDetails() {
    const overlay = document.createElement('div');
    overlay.className = 'evolution-overlay active';
    overlay.innerHTML = `
      <div class="evolution-overlay-content">
        <button class="evolution-close-btn" onclick="this.closest('.evolution-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
        <h3>Proceso de Validación</h3>
        <div class="processing-details">
          <p>Estamos procesando tu información de forma segura...</p>
          <div class="processing-timeline">
            <div class="timeline-item completed">
              <i class="fas fa-check"></i>
              <span>Documentos recibidos</span>
            </div>
            <div class="timeline-item active">
              <i class="fas fa-spinner fa-spin"></i>
              <span>Verificación en curso</span>
            </div>
            <div class="timeline-item">
              <i class="fas fa-university"></i>
              <span>Conexión bancaria</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  showDetails() {
    const overlay = document.createElement('div');
    overlay.className = 'evolution-overlay active';
    overlay.innerHTML = `
      <div class="evolution-overlay-content">
        <button class="evolution-close-btn" onclick="this.closest('.evolution-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
        
        <div class="overlay-section">
          <div class="overlay-section-title">
            <i class="fas fa-university"></i>
            Conexión Bancaria
          </div>
          <div class="overlay-bank-connection">
            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhnBzNdjl6bNp-nIdaiHVENczJhwlJNA7ocsyiOObMmzbu8at0dY5yGcZ9cLxLF39qI6gwNfqBxlkTDC0txVULEwQVwGkeEzN0Jq9MRTRagA48mh18UqTlR4WhsXOLAEZugUyhqJHB19xJgnkpe-S5VOWFgzpKFwctv3XP9XhH41vNTvq0ZS-nik58Qhr-O/s320/remeex.png" 
                 alt="REMEEX" class="remeex-logo">
            <div class="connection-arrow">
              <i class="fas fa-chevron-right"></i>
              <i class="fas fa-chevron-right"></i>
              <i class="fas fa-chevron-right"></i>
            </div>
            ${this.bankData ? 
              `<img src="${this.bankData.logo || 'https://via.placeholder.com/48x48/059669/ffffff?text=B'}" alt="${this.bankData.name}" class="bank-logo">` :
              `<div class="bank-logo"><i class="fas fa-university"></i></div>`
            }
          </div>
        </div>
        
        <div class="evolution-actions">
          <a href="validacion.html" class="evolution-action-btn banking">
            <i class="fas fa-university"></i>
            Validar Cuenta Bancaria
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  exploreFeatures() {
    REMEEX_UTILS.showToast('success', '¡Bienvenido!', 
             'Ahora tienes acceso completo a todas las funciones de REMEEX. ¡Explora y disfruta!', 5000);
  }

  // Métodos de datos y persistencia
  loadCurrentState() {
    return localStorage.getItem(STATUS_EVOLUTION.STORAGE_KEYS.CURRENT_STATE) || 
           STATUS_EVOLUTION.STATES.FIRST_RECHARGE;
  }

  saveCurrentState(state) {
    localStorage.setItem(STATUS_EVOLUTION.STORAGE_KEYS.CURRENT_STATE, state);
  }

  loadBankData() {
    try {
      const sources = [
        'remeexVerificationBanking',
        'remeexBankValidationData'
      ];
      
      for (const source of sources) {
        const data = localStorage.getItem(source);
        if (data) {
          const parsed = JSON.parse(data);
          if (parsed.bankName || parsed['bank-name']) {
            return {
              name: parsed.bankName || parsed['bank-name'],
              accountNumber: parsed.accountNumber || parsed['account-number'],
              logo: parsed.bankLogo || parsed['bank-logo']
            };
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  isDocumentProcessing() {
    const startTime = localStorage.getItem(STATUS_EVOLUTION.STORAGE_KEYS.PROCESSING_START);
    if (!startTime) return false;
    
    const elapsed = Date.now() - parseInt(startTime);
    return elapsed < STATUS_EVOLUTION.TIMERS.PROCESSING_DURATION;
  }

  getProcessingProgress() {
    const startTime = localStorage.getItem(STATUS_EVOLUTION.STORAGE_KEYS.PROCESSING_START);
    if (!startTime) return 0;
    
    const elapsed = Date.now() - parseInt(startTime);
    const progress = Math.min(Math.round((elapsed / STATUS_EVOLUTION.TIMERS.PROCESSING_DURATION) * 100), 100);
    
    return progress;
  }

  getTimeRemaining() {
    const startTime = localStorage.getItem(STATUS_EVOLUTION.STORAGE_KEYS.PROCESSING_START);
    if (!startTime) return 'Iniciando...';
    
    const elapsed = Date.now() - parseInt(startTime);
    const remaining = STATUS_EVOLUTION.TIMERS.PROCESSING_DURATION - elapsed;
    
    if (remaining <= 0) return 'Finalizando...';
    
    const minutes = Math.ceil(remaining / (1000 * 60));
    return `${minutes} min restantes`;
  }

  getTimeSinceLastRecharge() {
    const lastRecharge = localStorage.getItem('remeexLastRechargeTime');
    if (!lastRecharge) return 0;
    
    const elapsed = Date.now() - parseInt(lastRecharge);
    return Math.floor(elapsed / (1000 * 60 * 60));
  }

  getTimeSinceVerification() {
    const lastVerification = localStorage.getItem('remeexLastVerificationTime');
    if (!lastVerification) return 0;
    
    const elapsed = Date.now() - parseInt(lastVerification);
    return Math.floor(elapsed / (1000 * 60 * 60));
  }

  getMotivationalMessage(type, timePassed) {
    const { currentUser } = REMEEX_GLOBALS;
    const messages = {
      verification: {
        0: '🚀 Verifica ahora y desbloquea tu tarjeta virtual VISA',
        1: `⏰ ${currentUser.name.split(' ')[0]}, lleva 1 hora sin verificar. ¡Tu cuenta está esperando!`,
        3: `📈 Han pasado 3 horas. El dólar sube, no pierdas valor en tu dinero`,
        6: `💰 6 horas sin verificar. Tus fondos están seguros pero no productivos`,
        12: `🔔 ${currentUser.name.split(' ')[0]}, medio día sin verificar. ¡Activa todas las funciones!`,
        24: `⚠️ 24 horas. Tus fondos esperan por ti, verifica para mayor seguridad`
      },
      banking: {
        0: '🏦 Valida tu cuenta bancaria y completa tu verificación',
        1: `💳 ${currentUser.name.split(' ')[0]}, falta poco para retirar a ${this.bankData?.name || 'tu banco'}`,
        3: `📊 3 horas sin validar. El mercado se mueve, ¡no dejes tu dinero inmóvil!`,
        6: `🔐 Tus fondos están protegidos hasta que valides tu cuenta bancaria`,
        12: `⭐ Estamos estableciendo conexión con ${this.bankData?.name || 'tu banco'}...`,
        24: `🎯 24 horas esperando. ${this.bankData?.name || 'Tu banco'} está listo para recibir tu depósito`
      }
    };
    
    const timeKey = this.getTimeKey(timePassed);
    return messages[type][timeKey] || messages[type][0];
  }

  getTimeKey(hours) {
    if (hours < 1) return 0;
    if (hours < 3) return 1;
    if (hours < 6) return 3;
    if (hours < 12) return 6;
    if (hours < 24) return 12;
    return 24;
  }

  getWhatsAppMessage(type) {
    const { currentUser } = REMEEX_GLOBALS;
    const baseMessage = `Hola, soy ${currentUser.name}. Mi saldo actual es ${REMEEX_UTILS.formatCurrency(currentUser.balance.usd, 'usd')}.`;
    
    const messages = {
      verification: `${baseMessage} Necesito ayuda con la verificación de mi cuenta.`,
      banking: `${baseMessage} Mi banco registrado es ${this.bankData?.name || '[Banco]'}. Necesito ayuda con la validación bancaria.`
    };
    
    return encodeURIComponent(messages[type] || baseMessage);
  }

  startReminderSystem() {
    this.reminderTimers = STATUS_EVOLUTION.TIMERS.REMINDER_INTERVALS.map(hours => {
      return setTimeout(() => {
        this.updateCard();
      }, hours * 60 * 60 * 1000);
    });
  }

  bindEvents() {
    setInterval(() => {
      this.updateCard();
    }, 60000);
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'remeexVerificationBanking' || e.key === 'remeexVerificationStatus') {
        this.bankData = this.loadBankData();
        this.updateCard();
      }
    });
  }

  applyStateAnimations(state) {
    if (!this.container) return;
    
    if (state === STATUS_EVOLUTION.STATES.PROCESSING_DOCS) {
      this.container.classList.add('evolution-glow-effect');
    } else {
      this.container.classList.remove('evolution-glow-effect');
    }
  }

  checkForProcessingCompletion() {
    const startTime = localStorage.getItem(STATUS_EVOLUTION.STORAGE_KEYS.PROCESSING_START);
    if (startTime) {
      const elapsed = Date.now() - parseInt(startTime);
      if (elapsed >= STATUS_EVOLUTION.TIMERS.PROCESSING_DURATION) {
        this.completeProcessing();
      } else {
        const remaining = STATUS_EVOLUTION.TIMERS.PROCESSING_DURATION - elapsed;
        this.processingTimer = setTimeout(() => {
          this.completeProcessing();
        }, remaining);
      }
    }
  }

  updateWithdrawButton(state) {
    const withdrawBtn = document.getElementById('send-btn');
    if (!withdrawBtn) return;
    
    if (state === STATUS_EVOLUTION.STATES.READY_FOR_BANKING || 
        state === STATUS_EVOLUTION.STATES.BANKING_VALIDATED) {
      const bankData = this.bankData;
      if (bankData && bankData.name) {
        withdrawBtn.innerHTML = `<i class="fas fa-upload"></i> Retirar a ${bankData.name}`;
      }
    }
  }

  // Hooks para eventos externos
  onUserRecharge() {
    const { currentUser } = REMEEX_GLOBALS;
    currentUser.hasMadeFirstRecharge = true;
    REMEEX_PERSISTENCE.saveFirstRechargeStatus(true);
    localStorage.setItem('remeexLastRechargeTime', Date.now().toString());
    this.updateCard();
  }

  onVerificationComplete() {
    localStorage.setItem('remeexLastVerificationTime', Date.now().toString());
    this.startProcessing();
  }

  onBankDataReceived(bankData) {
    this.bankData = bankData;
    localStorage.setItem(STATUS_EVOLUTION.STORAGE_KEYS.BANK_DATA, JSON.stringify(bankData));
    this.updateCard();
  }

  onMobilePaymentSubmitted(paymentData) {
    this.updateCard();
    
    if (paymentData.amount >= 25) {
      this.checkForVerificationCompletion();
    }
  }

  checkForVerificationCompletion() {
    const verificationBanking = localStorage.getItem('remeexVerificationBanking');
    const lastVerificationCheck = localStorage.getItem('remeexLastVerificationCheck');
    
    if (verificationBanking) {
      try {
        const data = JSON.parse(verificationBanking);
        const dataTimestamp = data.timestamp || 0;
        const lastCheckTimestamp = parseInt(lastVerificationCheck || '0');
        
        if (dataTimestamp > lastCheckTimestamp) {
          localStorage.setItem('remeexLastVerificationCheck', dataTimestamp.toString());
          this.onVerificationComplete();
          
          REMEEX_UTILS.showToast('info', 'Procesando Documentos', 
                   'Hemos recibido tu información. Iniciando proceso de validación...', 5000);
        }
      } catch (error) {
        console.error('Error checking verification completion:', error);
      }
    }
  }

  destroy() {
    if (this.processingTimer) {
      clearTimeout(this.processingTimer);
    }
    
    this.reminderTimers.forEach(timer => clearTimeout(timer));
    this.reminderTimers = [];
    
    if (this.container) {
      this.container.remove();
    }
  }
}

// Sistema de evolución
window.REMEEX_EVOLUTION = {
  // Inicializar sistema evolutivo
  initializeEvolutionSystem() {
    try {
      if (REMEEX_GLOBALS.statusEvolution) {
        REMEEX_GLOBALS.statusEvolution.destroy();
      }
      
      REMEEX_GLOBALS.statusEvolution = new StatusEvolutionManager();
      this.checkForVerificationCompletion();
    } catch (error) {
      console.error('Error initializing evolution system:', error);
    }
  },

  // Verificar completion de verificación
  checkForVerificationCompletion() {
    try {
      const verificationBanking = localStorage.getItem('remeexVerificationBanking');
      const lastVerificationCheck = localStorage.getItem('remeexLastVerificationCheck');
      
      if (verificationBanking) {
        try {
          const data = JSON.parse(verificationBanking);
          const dataTimestamp = data.timestamp || 0;
          const lastCheckTimestamp = parseInt(lastVerificationCheck || '0');
          
          if (dataTimestamp > lastCheckTimestamp) {
            localStorage.setItem('remeexLastVerificationCheck', dataTimestamp.toString());
            
            if (REMEEX_GLOBALS.statusEvolution) {
              REMEEX_GLOBALS.statusEvolution.onVerificationComplete();
            }
            
            REMEEX_UTILS.showToast('info', 'Procesando Documentos', 
                     'Hemos recibido tu información. Iniciando proceso de validación...', 5000);
          }
        } catch (error) {
          console.error('Error checking verification completion:', error);
        }
      }
    } catch (error) {
      console.error('Error in verification completion check:', error);
    }
  }
};

console.log('✅ EVOLUTION.js cargado correctamente');