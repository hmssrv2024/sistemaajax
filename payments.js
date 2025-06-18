// ============================================================================
// REMEEX VISA Banking - Sistema de Pagos
// Versión: 4.2 (Modular) - PAGOS MÓVILES CORREGIDO
// ============================================================================

"use strict";

// Validador de pagos móviles mejorado
class MobilePaymentValidator {
  constructor() {
    this.validConcepts = [
      '4454651',
      '04454651',
      'REMEEX4454651',
      '4454651REMEEX'
    ];
    this.processingTime = 15000; // 15 segundos
    this.rejectionDelay = 30000; // 30 segundos
  }

  // Validar concepto con tolerancia
  validateConcept(userConcept) {
    if (!userConcept) return false;
    
    const normalized = userConcept.trim().toUpperCase().replace(/\s+/g, '');
    
    return this.validConcepts.some(validConcept => {
      const normalizedValid = validConcept.toUpperCase();
      
      if (normalized === normalizedValid) return true;
      if (normalized.includes(normalizedValid)) return true;
      if (normalizedValid.includes(normalized)) return true;
      
      return false;
    });
  }

  // CORREGIDO: Procesar pago móvil con nueva lógica
  async processMobilePayment(paymentData) {
    const { currentUser } = REMEEX_GLOBALS;
    
    const transaction = {
      id: 'MP_' + Date.now(),
      type: 'deposit',
      method: 'mobile_payment',
      amount: parseFloat(paymentData.amount),
      amountBs: parseFloat(paymentData.amount) * CONFIG.EXCHANGE_RATES.USD_TO_BS,
      amountEur: parseFloat(paymentData.amount) * CONFIG.EXCHANGE_RATES.USD_TO_EUR,
      reference: paymentData.reference,
      concept: paymentData.concept,
      date: REMEEX_UTILS.getCurrentDateTime(),
      description: 'Pago Móvil',
      status: 'processing',
      timestamp: Date.now(),
      receiptUploaded: !!paymentData.receiptFile,
      balanceBefore: currentUser.balance.bs,
      balanceAfter: currentUser.balance.bs // Se actualizará según el resultado
    };

    // Guardar transacción inmediatamente como procesando
    this.saveTransaction(transaction);
    this.showProcessingStatus(transaction);

    // Simular procesamiento de 15 segundos
    setTimeout(() => {
      this.processConceptValidation(transaction);
    }, this.processingTime);

    return transaction;
  }

  // CORREGIDO: Nueva lógica de validación
  async processConceptValidation(transaction) {
    const isValidConcept = this.validateConcept(transaction.concept);
    
    if (isValidConcept) {
      // CAMBIO: Concepto válido = "pending" (no "completed")
      await this.setPendingTransaction(transaction);
    } else {
      // Concepto inválido = esperar 30 segundos más y rechazar
      await this.initiateRejectionProcess(transaction);
    }
  }

  // NUEVO: Establecer como pendiente de acreditación
  async setPendingTransaction(transaction) {
    transaction.status = 'pending';
    transaction.statusLabel = 'Pendiente de Acreditación';
    transaction.approvedAt = Date.now();
    
    // NO acreditar saldo automáticamente, mantener como pendiente
    this.updateTransaction(transaction);
    this.removeProcessingElement(transaction.id);
    
    REMEEX_UTILS.showToast('info', 'Pago Aceptado', 
             `Tu pago móvil por ${REMEEX_UTILS.formatCurrency(transaction.amount, 'usd')} ha sido aceptado y está pendiente de acreditación.`, 8000);
    
    if (window.REMEEX_UI) {
      window.REMEEX_UI.updateDashboardUI();
    }
  }

  // Proceso de rechazo (sin cambios)
  async initiateRejectionProcess(transaction) {
    transaction.status = 'pending_review';
    transaction.conceptValidation = 'failed';
    
    this.updateTransaction(transaction);
    this.showPendingReview(transaction);
    
    setTimeout(() => {
      this.rejectTransaction(transaction);
    }, this.rejectionDelay);
  }

  async rejectTransaction(transaction) {
    transaction.status = 'rejected';
    transaction.statusLabel = 'Rechazado - Concepto Incorrecto';
    transaction.rejectedAt = Date.now();
    transaction.rejectionReason = 'Concepto de pago no coincide con el requerido';
    
    this.updateTransaction(transaction);
    this.removeProcessingElement(transaction.id);
    
    REMEEX_UTILS.showToast('error', 'Pago Rechazado', 
             'El concepto utilizado no coincide. Usa exactamente: 4454651', 8000);
    
    this.showRejectionNotification(transaction);
  }

  // CORREGIDO: Guardar transacción usando sistema global
  saveTransaction(transaction) {
    try {
      // Usar el sistema de pagos global en lugar del local
      if (window.REMEEX_PAYMENTS) {
        window.REMEEX_PAYMENTS.addTransaction(transaction);
      } else {
        // Fallback directo
        const { currentUser } = REMEEX_GLOBALS;
        currentUser.transactions.unshift(transaction);
        REMEEX_PERSISTENCE.saveTransactionsData();
        
        if (window.REMEEX_UI) {
          window.REMEEX_UI.updateRecentTransactions();
          window.REMEEX_UI.updatePendingTransactionsBadge();
        }
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  loadTransactions() {
    const { currentUser } = REMEEX_GLOBALS;
    return currentUser.transactions || [];
  }

  updateTransaction(transaction) {
    const { currentUser } = REMEEX_GLOBALS;
    const transactions = this.loadTransactions();
    const index = transactions.findIndex(t => t.id === transaction.id);
    
    if (index !== -1) {
      transactions[index] = transaction;
      currentUser.transactions = transactions;
      REMEEX_PERSISTENCE.saveTransactionsData();
      
      if (window.REMEEX_UI) {
        window.REMEEX_UI.updateRecentTransactions();
        window.REMEEX_UI.updatePendingTransactionsBadge();
      }
    }
  }

  showProcessingStatus(transaction) {
    const statusElement = document.createElement('div');
    statusElement.className = 'mobile-payment-processing';
    statusElement.id = `processing-${transaction.id}`;
    statusElement.innerHTML = `
      <div class="processing-header">
        <div class="processing-icon">
          <div class="processing-spinner"></div>
        </div>
        <div class="processing-content">
          <div class="processing-title">Procesando Pago Móvil</div>
          <div class="processing-subtitle">Validando comprobante #${transaction.reference}</div>
        </div>
      </div>
      <div class="processing-details">
        <div class="processing-amount">${REMEEX_UTILS.formatCurrency(transaction.amount, 'usd')}</div>
        <div class="processing-concept">Concepto: ${transaction.concept}</div>
      </div>
    `;

    const transactionContainer = document.getElementById('recent-transactions');
    if (transactionContainer) {
      transactionContainer.insertBefore(statusElement, transactionContainer.firstChild);
    }
  }

  showPendingReview(transaction) {
    const processingElement = document.getElementById(`processing-${transaction.id}`);
    if (processingElement) {
      processingElement.innerHTML = `
        <div class="pending-review-header">
          <div class="pending-review-icon">
            <i class="fas fa-clock"></i>
          </div>
          <div class="pending-review-content">
            <div class="pending-review-title">En Revisión Manual</div>
            <div class="pending-review-subtitle">Verificando datos del comprobante</div>
          </div>
        </div>
        <div class="pending-review-details">
          <div class="pending-review-amount">${REMEEX_UTILS.formatCurrency(transaction.amount, 'usd')}</div>
          <div class="pending-review-reference">Ref: ${transaction.reference}</div>
        </div>
      `;
      processingElement.className = 'mobile-payment-pending-review';
    }
  }

 showRejectionNotification(transaction) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="rejection-icon" style="width: 60px; height: 60px; border-radius: 50%; background: var(--danger); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 1.25rem;">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="modal-title">Pago Móvil Rechazado</div>
        <div class="modal-subtitle" style="margin-bottom: 1.5rem;">
          No pudimos procesar su pago móvil debido a que el concepto utilizado no coincide con el requerido.
        </div>
        
        <div class="rejection-details" style="background: var(--neutral-200); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-weight: 600;">Monto:</span>
            <span>${REMEEX_UTILS.formatCurrency(transaction.amount, 'usd')}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span style="font-weight: 600;">Referencia:</span>
            <span>${transaction.reference}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="font-weight: 600;">Su concepto:</span>
            <span style="color: var(--danger);">${transaction.concept}</span>
          </div>
        </div>
        
        <div class="rejection-instructions" style="background: rgba(255, 77, 77, 0.1); border-left: 3px solid var(--danger); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <strong>Para procesar correctamente su pago:</strong><br>
          1. Realice un nuevo pago móvil<br>
          2. Use exactamente el concepto: <strong>4454651</strong><br>
          3. Suba el nuevo comprobante en la sección de recarga
        </div>
        
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); window.location.reload();">
            <i class="fas fa-redo"></i> Realizar Nuevo Pago
          </button>
          <a href="https://wa.me/+17373018059?text=${encodeURIComponent(`Necesito ayuda con mi pago móvil rechazado. Referencia: ${transaction.reference}`)}" 
             class="btn btn-outline" target="_blank" onclick="this.closest('.modal-overlay').remove();">
            <i class="fab fa-whatsapp"></i> Contactar Soporte
          </a>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
    }, 30000);
  }

  removeProcessingElement(transactionId) {
    const element = document.getElementById(`processing-${transactionId}`);
    if (element) {
      element.remove();
    }
  }
}

// Sistema principal de pagos
window.REMEEX_PAYMENTS = {
  validator: new MobilePaymentValidator(),

  // Procesar pago con tarjeta guardada
  processSavedCardPayment(amountToDisplay) {
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'flex';
      
      const progressBar = document.getElementById('progress-bar');
      const loadingText = document.getElementById('loading-text');
      
      if (progressBar && loadingText && typeof gsap !== 'undefined') {
        gsap.to(progressBar, {
          width: '100%',
          duration: 2,
          ease: 'power1.inOut',
          onUpdate: () => {
            loadingText.textContent = "Procesando pago con tarjeta guardada...";
          },
          onComplete: () => {
            setTimeout(() => {
              this.completeCardPayment(amountToDisplay);
            }, 500);
          }
        });
      } else {
        setTimeout(() => {
          this.completeCardPayment(amountToDisplay);
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing saved card payment:', error);
    }
  },

  // Procesar pago con tarjeta
  processCardPayment(amountToDisplay) {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'flex';
      
      const progressBar = document.getElementById('progress-bar');
      const loadingText = document.getElementById('loading-text');
      
      if (progressBar && loadingText && typeof gsap !== 'undefined') {
        gsap.to(progressBar, {
          width: '30%',
          duration: 1,
          ease: 'power1.inOut',
          onUpdate: () => {
            loadingText.textContent = "Verificando tarjeta...";
          },
          onComplete: () => {
            gsap.to(progressBar, {
              width: '70%',
              duration: 1.5,
              ease: 'power1.inOut',
              onUpdate: () => {
                loadingText.textContent = "Procesando recarga...";
              },
              onComplete: () => {
                gsap.to(progressBar, {
                  width: '100%',
                  duration: 1,
                  ease: 'power1.inOut',
                  onUpdate: () => {
                    loadingText.textContent = "¡Recarga completada con éxito!";
                  },
                  onComplete: () => {
                    setTimeout(() => {
                      this.completeCardPayment(amountToDisplay);
                    }, 800);
                  }
                });
              }
            });
          }
        });
      } else {
        setTimeout(() => {
          this.completeCardPayment(amountToDisplay);
        }, 4000);
      }
    } catch (error) {
      console.error('Error processing card payment:', error);
    }
  },

  // Completar pago con tarjeta
  completeCardPayment(amountToDisplay) {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'none';
      
      // Sumar saldo
      currentUser.balance.bs += amountToDisplay.bs;
      REMEEX_UTILS.calculateCurrencyEquivalents();
      
      currentUser.cardRecharges++;
      
      if (!currentUser.hasMadeFirstRecharge) {
        REMEEX_PERSISTENCE.saveFirstRechargeStatus(true);
        if (REMEEX_GLOBALS.statusEvolution) {
          REMEEX_GLOBALS.statusEvolution.onUserRecharge();
        }
      }
      
      REMEEX_PERSISTENCE.saveBalanceData();
      REMEEX_PERSISTENCE.saveCardData();
      
      const saveCard = document.getElementById('save-card');
      if (saveCard && saveCard.checked) {
        currentUser.hasSavedCard = true;
        REMEEX_PERSISTENCE.saveCardData();
      }
      
      this.addTransaction({
        type: 'deposit',
        amount: amountToDisplay.usd,
        amountBs: amountToDisplay.bs,
        amountEur: amountToDisplay.eur,
        date: REMEEX_UTILS.getCurrentDateTime(),
        description: 'Recarga con Tarjeta',
        card: '****3009',
        status: 'completed'
      });
      
      this.resetAmountSelectors();
      
      const successAmount = document.getElementById('success-amount');
      if (successAmount) successAmount.textContent = REMEEX_UTILS.formatCurrency(amountToDisplay.usd, 'usd');
      
      const successContainer = document.getElementById('success-container');
      if (successContainer) successContainer.style.display = 'flex';
      
      setTimeout(() => {
        if (typeof confetti !== 'undefined') {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }, 500);
    } catch (error) {
      console.error('Error completing card payment:', error);
    }
  },

  // Procesar transferencia bancaria
  processBankTransfer(amountToDisplay, referenceNumber) {
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'flex';
      
      const progressBar = document.getElementById('progress-bar');
      const loadingText = document.getElementById('loading-text');
      
      if (progressBar && loadingText && typeof gsap !== 'undefined') {
        gsap.to(progressBar, {
          width: '100%',
          duration: 2,
          ease: 'power1.inOut',
          onUpdate: function() {
            const progress = Math.round(this.progress() * 100);
            if (progress < 30) {
              loadingText.textContent = "Subiendo comprobante...";
            } else if (progress < 70) {
              loadingText.textContent = "Verificando información...";
            } else {
              loadingText.textContent = "Registrando transferencia...";
            }
          },
          onComplete: () => {
            setTimeout(() => {
              this.completeBankTransfer(amountToDisplay, referenceNumber);
            }, 500);
          }
        });
      } else {
        setTimeout(() => {
          this.completeBankTransfer(amountToDisplay, referenceNumber);
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing bank transfer:', error);
    }
  },

  // Completar transferencia bancaria
  completeBankTransfer(amountToDisplay, referenceNumber) {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'none';
      
      if (!currentUser.hasMadeFirstRecharge) {
        REMEEX_PERSISTENCE.saveFirstRechargeStatus(true);
        if (REMEEX_GLOBALS.statusEvolution) {
          REMEEX_GLOBALS.statusEvolution.onUserRecharge();
        }
      }
      
      this.addTransaction({
        type: 'deposit',
        amount: amountToDisplay.usd,
        amountBs: amountToDisplay.bs,
        amountEur: amountToDisplay.eur,
        date: REMEEX_UTILS.getCurrentDateTime(),
        description: 'Transferencia Bancaria',
        reference: referenceNumber,
        status: 'pending'
      });
      
      this.resetAmountSelectors();
      
      const transferModal = document.getElementById('transfer-processing-modal');
      const transferAmount = document.getElementById('transfer-amount');
      const transferReference = document.getElementById('transfer-reference');
      
      if (transferModal) transferModal.style.display = 'flex';
      if (transferAmount) transferAmount.textContent = REMEEX_UTILS.formatCurrency(amountToDisplay.usd, 'usd');
      if (transferReference) transferReference.textContent = referenceNumber;
      
      // Limpiar formulario
      this.clearBankForm();
    } catch (error) {
      console.error('Error completing bank transfer:', error);
    }
  },

  // CORREGIDO: Procesar pago móvil con validación
  async processMobilePaymentWithValidation(paymentData) {
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'flex';
      
      const progressBar = document.getElementById('progress-bar');
      const loadingText = document.getElementById('loading-text');
      
      if (progressBar && loadingText && typeof gsap !== 'undefined') {
        gsap.to(progressBar, {
          width: '100%',
          duration: 2,
          ease: 'power1.inOut',
          onUpdate: function() {
            const progress = Math.round(this.progress() * 100);
            if (progress < 30) {
              loadingText.textContent = "Subiendo comprobante...";
            } else if (progress < 70) {
              loadingText.textContent = "Validando concepto...";
            } else {
              loadingText.textContent = "Procesando pago móvil...";
            }
          },
          onComplete: () => {
            setTimeout(() => {
              this.completeMobilePaymentWithValidation(paymentData);
            }, 500);
          }
        });
      } else {
        setTimeout(() => {
          this.completeMobilePaymentWithValidation(paymentData);
        }, 3000);
      }
    } catch (error) {
      console.error('Error processing mobile payment with validation:', error);
    }
  },

  // CORREGIDO: Completar pago móvil con validación
  async completeMobilePaymentWithValidation(paymentData) {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'none';
      
      // Procesar con el validador (nueva lógica)
      const transaction = await this.validator.processMobilePayment(paymentData);
      
      if (!currentUser.hasMadeFirstRecharge) {
        REMEEX_PERSISTENCE.saveFirstRechargeStatus(true);
        if (REMEEX_GLOBALS.statusEvolution) {
          REMEEX_GLOBALS.statusEvolution.onUserRecharge();
          REMEEX_GLOBALS.statusEvolution.onMobilePaymentSubmitted(paymentData);
        }
      }
      
      this.resetAmountSelectors();
      
      const transferModal = document.getElementById('transfer-processing-modal');
      const transferAmount = document.getElementById('transfer-amount');
      const transferReference = document.getElementById('transfer-reference');
      
      if (transferModal) transferModal.style.display = 'flex';
      if (transferAmount) transferAmount.textContent = REMEEX_UTILS.formatCurrency(paymentData.amount, 'usd');
      if (transferReference) transferReference.textContent = paymentData.reference;
      
      // Limpiar formulario
      this.clearMobileForm();
      
      REMEEX_UTILS.showToast('info', 'Pago Enviado', 
               'Su pago móvil está siendo procesado. Le notificaremos el resultado en breve.', 5000);
    } catch (error) {
      console.error('Error completing mobile payment with validation:', error);
    }
  },

  // Agregar transacción
  addTransaction(transaction) {
    const { currentUser } = REMEEX_GLOBALS;
    
    try {
      transaction.id = transaction.id || Date.now().toString();
      transaction.balanceBefore = currentUser.balance.bs;
      
      if (transaction.status === 'completed' && transaction.type === 'deposit') {
        transaction.balanceAfter = currentUser.balance.bs + transaction.amountBs;
      } else {
        transaction.balanceAfter = currentUser.balance.bs;
      }
      
      currentUser.transactions.unshift(transaction);
      
      if (['pending', 'processing', 'pending_review'].includes(transaction.status)) {
        REMEEX_GLOBALS.pendingTransactions = currentUser.transactions.filter(t => 
          ['pending', 'processing', 'pending_review'].includes(t.status)
        );
      }
      
      REMEEX_PERSISTENCE.saveTransactionsData();
      
      if (window.REMEEX_UI) {
        window.REMEEX_UI.updateRecentTransactions();
        window.REMEEX_UI.updatePendingTransactionsBadge();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  },

  // Validar formulario de tarjeta
  validateCardForm() {
    try {
      const cardNumber = document.getElementById('cardNumber');
      const cardName = document.getElementById('cardName');
      const cardMonth = document.getElementById('cardMonth');
      const cardYear = document.getElementById('cardYear');
      const cardCvv = document.getElementById('cardCvv');
      
      const errors = {
        number: document.getElementById('card-number-error'),
        name: document.getElementById('card-name-error'),
        date: document.getElementById('card-date-error'),
        cvv: document.getElementById('card-cvv-error')
      };
      
      // Limpiar errores
      Object.values(errors).forEach(error => {
        if (error) error.style.display = 'none';
      });
      
      let isValid = true;
      
      if (!cardName || !cardName.value.trim()) {
        if (errors.name) {
          errors.name.style.display = 'block';
          errors.name.textContent = 'Por favor, introduce el nombre del titular.';
        }
        isValid = false;
      }
      
      if (!cardNumber || !cardNumber.value.trim()) {
        if (errors.number) {
          errors.number.style.display = 'block';
          errors.number.textContent = 'Por favor, introduce un número de tarjeta.';
        }
        isValid = false;
      } else {
        const cleanedCardNumber = cardNumber.value.replace(/\s/g, '');
        if (cleanedCardNumber !== CONFIG.VALID_CARD && !REMEEX_UTILS.validators.validateCardNumber(cleanedCardNumber)) {
          if (errors.number) {
            errors.number.style.display = 'block';
            errors.number.textContent = 'Número de tarjeta no válido.';
          }
          isValid = false;
        }
      }
      
      if (!cardMonth || !cardMonth.value || !cardYear || !cardYear.value) {
        if (errors.date) {
          errors.date.style.display = 'block';
          errors.date.textContent = 'Por favor, selecciona una fecha válida.';
        }
        isValid = false;
      } else {
        const currentDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(parseInt(cardYear.value), parseInt(cardMonth.value), 1);
        expiryDate.setDate(0);
        
        if (expiryDate < currentDate) {
          if (errors.date) {
            errors.date.style.display = 'block';
            errors.date.textContent = 'La tarjeta ha expirado.';
          }
          isValid = false;
        }
      }
      
      if (!cardCvv || !cardCvv.value || cardCvv.value.length < 3 || !/^\d+$/.test(cardCvv.value)) {
        if (errors.cvv) {
          errors.cvv.style.display = 'block';
          errors.cvv.textContent = 'CVV inválido.';
        }
        isValid = false;
      }
      
      return isValid;
    } catch (error) {
      console.error('Error validating card form:', error);
      return false;
    }
  },

  // Resetear selectores de monto
  resetAmountSelectors() {
    try {
      const selectors = [
        'card-amount-select',
        'bank-amount-select', 
        'mobile-amount-select'
      ];
      
      selectors.forEach(id => {
        const select = document.getElementById(id);
        if (select) select.selectedIndex = 0;
      });
      
      REMEEX_GLOBALS.selectedAmount = {
        usd: 0,
        bs: 0,
        eur: 0
      };
      
      this.updateSubmitButtonsState();
    } catch (error) {
      console.error('Error resetting amount selectors:', error);
    }
  },

  // Actualizar estado de botones
  updateSubmitButtonsState() {
    const { selectedAmount } = REMEEX_GLOBALS;
    
    try {
      const buttons = [
        { id: 'submit-payment', icon: 'fas fa-credit-card', text: 'Recargar' },
        { id: 'saved-card-pay-btn', icon: 'fas fa-credit-card', text: 'Recargar' },
        { id: 'submit-bank-transfer', icon: 'fas fa-paper-plane', text: 'Enviar Comprobante' },
        { id: 'submit-mobile-payment', icon: 'fas fa-paper-plane', text: 'Enviar Comprobante' }
      ];
      
      buttons.forEach(btn => {
        const element = document.getElementById(btn.id);
        if (element) {
          if (selectedAmount.usd <= 0) {
            element.disabled = true;
            element.innerHTML = `<i class="${btn.icon}"></i> Seleccione un monto`;
          } else {
            element.disabled = false;
            if (btn.text === 'Recargar') {
              element.innerHTML = `<i class="${btn.icon}"></i> ${btn.text} ${REMEEX_UTILS.formatCurrency(selectedAmount.usd, 'usd')}`;
            } else {
              element.innerHTML = `<i class="${btn.icon}"></i> ${btn.text}`;
            }
          }
        }
      });
    } catch (error) {
      console.error('Error updating submit buttons state:', error);
    }
  },

  // Limpiar formulario bancario
  clearBankForm() {
    try {
      const referenceNumber = document.getElementById('reference-number');
      const receiptFile = document.getElementById('receipt-file');
      const receiptPreview = document.getElementById('receipt-preview');
      const receiptUpload = document.getElementById('receipt-upload');
      
      if (referenceNumber) referenceNumber.value = '';
      if (receiptFile) receiptFile.value = '';
      if (receiptPreview) receiptPreview.style.display = 'none';
      if (receiptUpload) receiptUpload.style.display = 'block';
    } catch (error) {
      console.error('Error clearing bank form:', error);
    }
  },

  // Limpiar formulario móvil
  clearMobileForm() {
    try {
      const referenceNumber = document.getElementById('mobile-reference-number');
      const conceptField = document.getElementById('mobile-concept');
      const receiptFile = document.getElementById('mobile-receipt-file');
      const receiptPreview = document.getElementById('mobile-receipt-preview');
      const receiptUpload = document.getElementById('mobile-receipt-upload');
      
      if (referenceNumber) referenceNumber.value = '';
      if (conceptField) conceptField.value = '';
      if (receiptFile) receiptFile.value = '';
      if (receiptPreview) receiptPreview.style.display = 'none';
      if (receiptUpload) receiptUpload.style.display = 'block';
    } catch (error) {
      console.error('Error clearing mobile form:', error);
    }
  }
};

// Asignar validator global
REMEEX_GLOBALS.mobilePaymentValidator = REMEEX_PAYMENTS.validator;

console.log('✅ PAYMENTS.js cargado correctamente - Sistema de Pagos CORREGIDO');