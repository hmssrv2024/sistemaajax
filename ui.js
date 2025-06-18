// ============================================================================
// REMEEX VISA Banking - Sistema de Interfaz de Usuario
// Versión: 4.2 (Modular)
// ============================================================================

"use strict";

window.REMEEX_UI = {
  
  // Actualizar interfaz de usuario
  updateUserUI() {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      if (currentUser.name) {
        const userInitials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        
        const headerAvatar = document.getElementById('header-avatar');
        if (headerAvatar) headerAvatar.textContent = userInitials;
        
        const balanceLabelName = document.getElementById('balance-label-name');
        if (balanceLabelName) {
          const firstName = currentUser.name.split(' ')[0];
          balanceLabelName.textContent = `${firstName}, tu saldo disponible`;
        }
      }
      
      this.updateDashboardUI();
    } catch (error) {
      console.error('Error updating user UI:', error);
    }
  },

  // Actualizar dashboard
  updateDashboardUI() {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const mainBalanceValue = document.getElementById('main-balance-value');
      
      if (mainBalanceValue) {
        mainBalanceValue.textContent = REMEEX_UTILS.formatCurrency(currentUser.balance.bs, 'bs').replace('Bs ', '');
      }
      
      const balanceEquivalents = document.querySelectorAll('.balance-equivalent');
      if (balanceEquivalents.length >= 2) {
        const usdSpan = balanceEquivalents[0].querySelector('span');
        const eurSpan = balanceEquivalents[1].querySelector('span');
        
        if (usdSpan) usdSpan.textContent = `≈ ${REMEEX_UTILS.formatCurrency(currentUser.balance.usd, 'usd')}`;
        if (eurSpan) eurSpan.textContent = `≈ ${REMEEX_UTILS.formatCurrency(currentUser.balance.eur, 'eur')}`;
      }
      
      this.updatePendingTransactionsBadge();
      this.updateRecentTransactions();
      this.updateDateDisplay();
    } catch (error) {
      console.error('Error updating dashboard UI:', error);
    }
  },

  // Actualizar fecha
  updateDateDisplay() {
    try {
      const balanceDate = document.getElementById('balance-date');
      if (balanceDate) balanceDate.textContent = REMEEX_UTILS.getCurrentDate();
    } catch (error) {
      console.error('Error updating date display:', error);
    }
  },

  // Actualizar contador de usuarios online
  updateOnlineUsersCount() {
    try {
      const min = 98;
      const max = 142;
      REMEEX_GLOBALS.activeUsersCount = Math.floor(Math.random() * (max - min + 1)) + min;
      
      const userCountElement = document.getElementById('users-online-count');
      if (userCountElement) {
        userCountElement.textContent = `${REMEEX_GLOBALS.activeUsersCount} usuarios conectados`;
      }
    } catch (error) {
      console.error('Error updating online users count:', error);
    }
  },

  // Actualizar badge de transacciones pendientes
  updatePendingTransactionsBadge() {
    const { pendingTransactions } = REMEEX_GLOBALS;
    
    try {
      const pendingBadge = document.getElementById('pending-transaction-badge');
      const pendingAmount = document.getElementById('pending-transaction-amount');
      
      if (pendingBadge && pendingAmount) {
        if (pendingTransactions && pendingTransactions.length > 0) {
          const totalPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
          pendingAmount.textContent = `${REMEEX_UTILS.formatCurrency(totalPending, 'usd')} en proceso de verificación`;
          pendingBadge.style.display = 'flex';
        } else {
          pendingBadge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Error updating pending transactions badge:', error);
    }
  },

  // Crear elemento de transacción
  createTransactionElement(transaction) {
    try {
      const element = document.createElement('div');
      element.className = 'transaction-item';
      element.setAttribute('aria-label', `Transacción: ${transaction.description}`);
      
      let iconClass = 'fas fa-arrow-right';
      let typeClass = transaction.type;
      let amountPrefix = '';
      let statusBadge = '';
      
      // Determinar icono y prefijo
      if (transaction.type === 'deposit') {
        iconClass = 'fas fa-arrow-down';
        amountPrefix = '+';
      } else if (transaction.type === 'withdraw') {
        iconClass = 'fas fa-arrow-up';
        amountPrefix = '-';
      }
      
      // Determinar estado
      if (transaction.status === 'pending') {
        iconClass = 'fas fa-clock';
        typeClass = 'pending';
        statusBadge = '<span class="transaction-badge pending"><i class="fas fa-clock"></i> Pendiente</span>';
      } else if (transaction.status === 'rejected') {
        iconClass = 'fas fa-times-circle';
        typeClass = 'rejected';
        statusBadge = '<span class="transaction-badge rejected"><i class="fas fa-times"></i> Rechazado</span>';
      } else if (transaction.status === 'processing') {
        iconClass = 'fas fa-spinner fa-spin';
        typeClass = 'processing';
        statusBadge = '<span class="transaction-badge processing"><i class="fas fa-spinner"></i> Procesando</span>';
      }
      
      const safeDescription = REMEEX_UTILS.escapeHTML(transaction.description);
      const safeDate = REMEEX_UTILS.escapeHTML(transaction.date);
      
      let transactionHTML = `
        <div class="transaction-icon ${typeClass}">
          <i class="${iconClass}"></i>
        </div>
        <div class="transaction-content">
          <div class="transaction-title">${safeDescription}
            ${statusBadge}
          </div>
          <div class="transaction-details">
            <div class="transaction-date">
              <i class="far fa-calendar"></i>
              <span>${safeDate}</span>
            </div>
      `;
      
      if (transaction.card) {
        const safeCard = REMEEX_UTILS.escapeHTML(transaction.card);
        transactionHTML += `
          <div class="transaction-category">
            <i class="far fa-credit-card"></i>
            <span>Tarjeta ${safeCard}</span>
          </div>
        `;
      }
      
      if (transaction.reference) {
        const safeReference = REMEEX_UTILS.escapeHTML(transaction.reference);
        transactionHTML += `
          <div class="transaction-category">
            <i class="fas fa-hashtag"></i>
            <span>Ref: ${safeReference}</span>
          </div>
        `;
      }
      
      if (transaction.concept) {
        const safeConcept = REMEEX_UTILS.escapeHTML(transaction.concept);
        transactionHTML += `
          <div class="transaction-category">
            <i class="fas fa-comment"></i>
            <span>Concepto: ${safeConcept}</span>
          </div>
        `;
      }
      
      if (transaction.destination) {
        const safeDestination = REMEEX_UTILS.escapeHTML(transaction.destination);
        transactionHTML += `
          <div class="transaction-category">
            <i class="far fa-user"></i>
            <span>Destino: ${safeDestination}</span>
          </div>
        `;
      }
      
      transactionHTML += `
          </div>
        </div>
        <div class="transaction-amounts">
          <div class="transaction-amount ${typeClass}">
            ${amountPrefix}${REMEEX_UTILS.formatCurrency(transaction.amount, 'usd')}
          </div>
      `;
      
      if (transaction.balanceAfter) {
        transactionHTML += `
          <div class="transaction-balance-after">
            Saldo: ${REMEEX_UTILS.formatCurrency(transaction.balanceAfter / CONFIG.EXCHANGE_RATES.USD_TO_BS, 'usd')}
          </div>
        `;
      }
      
      transactionHTML += `
        </div>
      `;
      
      element.innerHTML = transactionHTML;
      
      return element;
    } catch (error) {
      console.error('Error creating transaction element:', error);
      return document.createElement('div');
    }
  },

  // Actualizar transacciones recientes
  updateRecentTransactions() {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const recentTransactions = document.getElementById('recent-transactions');
      
      if (recentTransactions) {
        recentTransactions.innerHTML = '';
        
        if (currentUser.transactions.length === 0) {
          const noTransactionsMsg = document.createElement('div');
          noTransactionsMsg.className = 'transaction-item';
          noTransactionsMsg.innerHTML = `
            <div class="transaction-icon" style="background: var(--neutral-300); color: var(--neutral-600);">
              <i class="fas fa-receipt"></i>
            </div>
            <div class="transaction-content">
              <div class="transaction-title">No hay transacciones recientes</div>
              <div class="transaction-details">
                <div class="transaction-date">
                  <i class="far fa-calendar"></i>
                  <span>Realice una recarga para ver su historial</span>
                </div>
              </div>
            </div>
          `;
          recentTransactions.appendChild(noTransactionsMsg);
        } else {
          const limit = Math.min(currentUser.transactions.length, 3);
          for (let i = 0; i < limit; i++) {
            const transactionElement = this.createTransactionElement(currentUser.transactions[i]);
            recentTransactions.appendChild(transactionElement);
          }
        }
      }
    } catch (error) {
      console.error('Error updating recent transactions:', error);
    }
  },

  // Mostrar modal de bienvenida
  showWelcomeModal() {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const welcomeModal = document.getElementById('welcome-modal');
      const welcomeSubtitle = document.getElementById('welcome-subtitle');
      
      if (welcomeModal && welcomeSubtitle) {
        const firstName = currentUser.name ? currentUser.name.split(' ')[0] : 'Usuario';
        welcomeSubtitle.textContent = `Estamos felices de tenerte con nosotros, ${firstName}`;
        welcomeModal.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error showing welcome modal:', error);
    }
  },

  // Actualizar UI de tarjeta guardada
  updateSavedCardUI() {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const savedCardContainer = document.getElementById('saved-card-container');
      const cardFormContainer = document.getElementById('card-form-container');
      const useSavedCard = document.getElementById('use-saved-card');
      
      if (savedCardContainer && cardFormContainer) {
        if (currentUser.hasSavedCard) {
          savedCardContainer.style.display = 'block';
          
          if (useSavedCard && useSavedCard.checked) {
            cardFormContainer.style.display = 'none';
          } else {
            cardFormContainer.style.display = 'block';
          }
        } else {
          savedCardContainer.style.display = 'none';
          cardFormContainer.style.display = 'block';
        }
      }
    } catch (error) {
      console.error('Error updating saved card UI:', error);
    }
  },

  // Actualizar información de pago móvil
  updateMobilePaymentInfo() {
    const { currentUser, verificationStatus } = REMEEX_GLOBALS;
    
    try {
      const nameValue = document.getElementById('mobile-payment-name-value');
      const rifValue = document.getElementById('mobile-payment-rif-value');
      const phoneValue = document.getElementById('mobile-payment-phone-value');
      
      const nameCopyBtn = document.querySelector('#mobile-payment-name .copy-btn');
      const rifCopyBtn = document.querySelector('#mobile-payment-rif .copy-btn');
      const phoneCopyBtn = document.querySelector('#mobile-payment-phone .copy-btn');
      
      if (nameValue && currentUser.name) {
        nameValue.textContent = currentUser.name;
        if (nameCopyBtn) {
          nameCopyBtn.setAttribute('data-copy', currentUser.name);
        }
      }
      
      if (['verified', 'pending'].includes(verificationStatus.status)) {
        if (rifValue && verificationStatus.idNumber) {
          rifValue.textContent = verificationStatus.idNumber;
          if (rifCopyBtn) {
            rifCopyBtn.setAttribute('data-copy', verificationStatus.idNumber);
          }
        }
        
        if (phoneValue && verificationStatus.phoneNumber) {
          const formattedPhone = verificationStatus.phoneNumber.replace(/(\d{4})(\d{7})/, '$1-$2');
          phoneValue.textContent = formattedPhone;
          if (phoneCopyBtn) {
            phoneCopyBtn.setAttribute('data-copy', formattedPhone);
          }
        }
        
        if (verificationStatus.idNumber && verificationStatus.phoneNumber) {
          const mobilePaymentSuccess = document.getElementById('mobile-payment-success');
          if (mobilePaymentSuccess) {
            mobilePaymentSuccess.style.display = 'flex';
          }
        }
      }
    } catch (error) {
      console.error('Error updating mobile payment info:', error);
    }
  },

  // Actualizar tasas de cambio en displays
  updateExchangeRateDisplays() {
    try {
      const exchangeRateDisplay = document.getElementById('exchange-rate-display');
      if (exchangeRateDisplay) {
        exchangeRateDisplay.textContent = `Tasa: 1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_BS.toFixed(2)} Bs | 1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_EUR.toFixed(2)} EUR`;
      }
      
      const displays = [
        'card-exchange-rate-display',
        'bank-exchange-rate-display', 
        'mobile-exchange-rate-display'
      ];
      
      const rateText = `1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_BS.toFixed(2)} Bs | 1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_EUR.toFixed(2)} EUR`;
      
      displays.forEach(id => {
        const display = document.getElementById(id);
        if (display) display.textContent = rateText;
      });
    } catch (error) {
      console.error('Error updating exchange rate displays:', error);
    }
  },

  // Actualizar equivalentes de balance
  updateBalanceEquivalents() {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const usdEquivalent = document.getElementById('usd-equivalent');
      const eurEquivalent = document.getElementById('eur-equivalent');
      
      if (usdEquivalent) {
        usdEquivalent.textContent = `≈ ${REMEEX_UTILS.formatCurrency(currentUser.balance.usd, 'usd')}`;
      }
      
      if (eurEquivalent) {
        eurEquivalent.textContent = `≈ ${REMEEX_UTILS.formatCurrency(currentUser.balance.eur, 'eur')}`;
      }
    } catch (error) {
      console.error('Error updating balance equivalents:', error);
    }
  },

  // Actualizar opciones de selector de monto
  updateAmountSelectOptions(selectId) {
    try {
      const select = document.getElementById(selectId);
      if (!select) return;
      
      const currentValue = select.value;
      
      Array.from(select.options).forEach(option => {
        if (!option.value || option.disabled) return;
        
        const usdValue = parseInt(option.value);
        const bsValue = Math.round(usdValue * CONFIG.EXCHANGE_RATES.USD_TO_BS);
        const eurValue = (usdValue * CONFIG.EXCHANGE_RATES.USD_TO_EUR).toFixed(1);
        
        option.dataset.bs = bsValue;
        option.dataset.eur = eurValue;
        
        const formattedBs = bsValue.toLocaleString('es-VE');
        const formattedUsd = usdValue.toLocaleString('es-VE');
        const formattedEur = parseFloat(eurValue).toLocaleString('es-VE');
        
        option.textContent = `$${formattedUsd} ≈ Bs ${formattedBs},00 ≈ €${formattedEur}`;
      });
      
      select.value = currentValue;
      
      // Actualizar monto seleccionado si coincide
      const { selectedPaymentMethod, selectedAmount } = REMEEX_GLOBALS;
      const methodMap = {
        'card-amount-select': 'card-payment',
        'bank-amount-select': 'bank-payment',
        'mobile-amount-select': 'mobile-payment'
      };
      
      if (methodMap[selectId] === selectedPaymentMethod && select.value) {
        const option = select.options[select.selectedIndex];
        selectedAmount.usd = parseInt(option.value) || 0;
        selectedAmount.bs = parseInt(option.dataset.bs) || 0;
        selectedAmount.eur = parseFloat(option.dataset.eur) || 0;
        
        if (window.REMEEX_PAYMENTS) {
          window.REMEEX_PAYMENTS.updateSubmitButtonsState();
        }
      }
    } catch (error) {
      console.error('Error updating amount select options:', error);
    }
  },

  // Actualizar tasa de cambio
  updateExchangeRate(newRate) {
    try {
      CONFIG.EXCHANGE_RATES.USD_TO_BS = newRate;
      
      REMEEX_UTILS.calculateCurrencyEquivalents();
      
      this.updateAmountSelectOptions('card-amount-select');
      this.updateAmountSelectOptions('bank-amount-select');
      this.updateAmountSelectOptions('mobile-amount-select');
      this.updateExchangeRateDisplays();
      this.updateDashboardUI();
      this.updateBalanceEquivalents();
      
      if (window.REMEEX_PAYMENTS) {
        window.REMEEX_PAYMENTS.updateSubmitButtonsState();
      }
    } catch (error) {
      console.error('Error updating exchange rate:', error);
    }
  },

  // Mostrar modal de funcionalidad bloqueada
  showFeatureBlockedModal() {
    const { verificationStatus } = REMEEX_GLOBALS;
    
    try {
      const externalVerificationModal = document.getElementById('feature-blocked-modal');
      
      if (externalVerificationModal) {
        if (['pending', 'processing', 'bank_validation'].includes(verificationStatus.status)) {
          const title = document.querySelector('.feature-blocked-title');
          const message = document.querySelector('.feature-blocked-message');
          
          if (title) title.textContent = 'Verificación en Proceso';
          if (message) message.textContent = 
            'Su proceso de verificación está siendo revisado. Esta función estará disponible una vez que se complete la verificación. Puede contactar a soporte para verificar el estado.';
        }
        
        externalVerificationModal.style.display = 'flex';
      }
    } catch (error) {
      console.error('Error showing feature blocked modal:', error);
    }
  },

  // Función de copia de texto mejorada
  copyToClipboard(text, successMessage = 'Copiado') {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          REMEEX_UTILS.showToast('success', successMessage, 'Texto copiado al portapapeles');
        }).catch(() => {
          this.fallbackCopyText(text, successMessage);
        });
      } else {
        this.fallbackCopyText(text, successMessage);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      REMEEX_UTILS.showToast('error', 'Error', 'No se pudo copiar el texto');
    }
  },

  // Copia de texto de respaldo
  fallbackCopyText(text, successMessage) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        REMEEX_UTILS.showToast('success', successMessage, 'Texto copiado al portapapeles');
      } catch (err) {
        REMEEX_UTILS.showToast('error', 'Error', 'No se pudo copiar el texto');
      }
      
      document.body.removeChild(textarea);
    } catch (error) {
      console.error('Error in fallback copy text:', error);
      REMEEX_UTILS.showToast('error', 'Error', 'No se pudo copiar el texto');
    }
  },

  // Resetear formulario de tarjeta
  resetCardForm() {
    try {
      const fields = [
        { id: 'cardNumber', display: 'card-number-display', default: '•••• •••• •••• ••••' },
        { id: 'cardName', display: 'card-holder-display', default: '••••••• •••••••' },
        { id: 'cardMonth', display: 'card-month-display', default: '••' },
        { id: 'cardYear', display: 'card-year-display', default: '••' },
        { id: 'cardCvv', display: 'card-cvv-display', default: '•••' }
      ];
      
      fields.forEach(field => {
        const input = document.getElementById(field.id);
        const display = document.getElementById(field.display);
        
        if (input) input.value = '';
        if (display) display.textContent = field.default;
      });
      
      if (window.REMEEX_PAYMENTS) {
        window.REMEEX_PAYMENTS.resetAmountSelectors();
      }
    } catch (error) {
      console.error('Error resetting card form:', error);
    }
  },

  // Limpiar todas las formas
  clearAllForms() {
    try {
      this.resetCardForm();
      
      const formIds = [
        'registration-form',
        'login-form'
      ];
      
      formIds.forEach(id => {
        const form = document.getElementById(id);
        if (form) form.reset();
      });
      
      // Limpiar errores
      document.querySelectorAll('.error-message').forEach(error => {
        error.style.display = 'none';
      });
    } catch (error) {
      console.error('Error clearing all forms:', error);
    }
  }
};

console.log('✅ UI.js cargado correctamente');