// ============================================================================
// REMEEX VISA Banking - Sistema de Eventos
// Versión: 4.2 (Modular) - ACTUALIZADO PARA WIZARD
// ============================================================================

"use strict";

// SOLUCIÓN INTEGRAL: Definir REMEEX_EVENTS inmediatamente
if (!window.REMEEX_EVENTS) {
  window.REMEEX_EVENTS = {};
  console.log('🔗 REMEEX_EVENTS objeto base creado');
}

window.REMEEX_EVENTS = {
  
  // Configurar todos los event listeners
  setupEventListeners() {
    try {
      this.setupWizardEvents();
      this.setupLoginForm();
      this.setupOTPHandling();
      this.setupBottomNavigation();
      this.setupLogoutButtons();
      this.setupRechargeButtons();
      this.setupPaymentMethodTabs();
      this.setupCopyButtons();
      this.setupReceiptUpload();
      this.setupCardPayment();
      this.setupBankTransfer();
      this.setupMobilePayment();
      this.setupFeatureBlocked();
      this.setupOverlays();
      this.setupInactivityModal();
      this.setupWelcomeModal();
      this.setupPasswordToggles();
      this.setupFormValidation();
      this.setupStorageChangeHandler();
      
      console.log('✅ Event listeners configurados correctamente');
    } catch (error) {
      console.error('❌ Error configurando event listeners:', error);
    }
  },

  // NUEVO: Configurar eventos del wizard
  setupWizardEvents() {
    try {
      // Los eventos del wizard se manejan en wizard-registration.js
      // Aquí solo configuramos eventos adicionales relacionados con el wizard
      
      // Botón de olvido de contraseña en login mejorado
      const forgotPasswordBtn = document.getElementById('forgot-password-btn');
      if (forgotPasswordBtn) {
        forgotPasswordBtn.addEventListener('click', () => {
          if (window.REMEEX_AUTH && REMEEX_AUTH.handlePasswordRecovery) {
            REMEEX_AUTH.handlePasswordRecovery();
          } else {
            // Fallback al comportamiento original
            const { registrationData } = REMEEX_GLOBALS;
            REMEEX_UTILS.showToast('info', 'Contacta con Soporte', 
                      'Para recuperar tu contraseña, contacta con nuestro equipo de soporte a través de WhatsApp.', 5000);
            
            setTimeout(() => {
              const message = encodeURIComponent(
                `Hola, necesito ayuda para recuperar mi contraseña de acceso a mi cuenta REMEEX. Mi correo registrado es: ${registrationData.email || 'No especificado'}`
              );
              window.open(`https://wa.me/+17373018059?text=${message}`, '_blank');
            }, 1000);
          }
        });
      }

      console.log('✅ Eventos del wizard configurados');
    } catch (error) {
      console.error('Error setting up wizard events:', error);
    }
  },

  // Configurar formulario de login (actualizado)
  setupLoginForm() {
    try {
      const loginForm = document.getElementById('login-form');
      
      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          if (window.REMEEX_AUTH) {
            window.REMEEX_AUTH.handleEnhancedLogin();
          }
        });
      }

      // Hacer campos editables al hacer clic
      const editableFields = document.querySelectorAll('.editable-field');
      editableFields.forEach(field => {
        field.addEventListener('focus', () => {
          field.classList.add('editing');
          if (field.placeholder.includes('Haz clic')) {
            field.placeholder = field.id === 'login-password' ? 'Ingrese su contraseña' : 'Ingrese su código de 20 dígitos';
          }
        });

        field.addEventListener('blur', () => {
          field.classList.remove('editing');
          if (!field.value) {
            field.placeholder = field.id === 'login-password' ? 'Haz clic para editar tu contraseña' : 'Haz clic para editar tu código de 20 dígitos';
          }
        });
      });

    } catch (error) {
      console.error('Error setting up login form:', error);
    }
  },

  // Configurar manejo de OTP
  setupOTPHandling() {
    try {
      const otpInputs = document.querySelectorAll('.otp-input');
      otpInputs.forEach(input => {
        input.addEventListener('input', (e) => {
          const value = e.target.value;
          
          if (!/^\d*$/.test(value)) {
            e.target.value = e.target.value.replace(/\D/g, '');
            return;
          }
          
          if (value.length === 1) {
            const nextInput = document.getElementById(e.target.dataset.next);
            if (nextInput) {
              nextInput.focus();
            }
          }
        });
        
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && e.target.value === '') {
            const prevInput = document.getElementById(e.target.dataset.prev);
            if (prevInput) {
              prevInput.focus();
            }
          }
        });
      });
      
      const verifyOtpBtn = document.getElementById('verify-otp-btn');
      if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', () => {
          this.handleOTPVerification();
        });
      }
      
      const resendCode = document.getElementById('resend-code');
      if (resendCode) {
        resendCode.addEventListener('click', (e) => {
          e.preventDefault();
          REMEEX_UTILS.showToast('success', 'Código Enviado', 'Se ha enviado un nuevo código a su teléfono.');
        });
      }
    } catch (error) {
      console.error('Error setting up OTP handling:', error);
    }
  },

  // Configurar navegación inferior
  setupBottomNavigation() {
    try {
      const navItems = document.querySelectorAll('.nav-item');
      
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          const section = item.getAttribute('data-section');
          
          document.querySelectorAll('.service-overlay, .cards-overlay, .customer-service-overlay, .settings-overlay').forEach(overlay => {
            overlay.style.display = 'none';
          });

          if (section === 'services') {
            const serviceOverlay = document.getElementById('service-overlay');
            if (serviceOverlay) serviceOverlay.style.display = 'flex';
          } else if (section === 'cards') {
            const cardsOverlay = document.getElementById('cards-overlay');
            if (cardsOverlay) cardsOverlay.style.display = 'flex';
          } else if (section === 'customer-service') {
            const customerServiceOverlay = document.getElementById('customer-service-overlay');
            if (customerServiceOverlay) customerServiceOverlay.style.display = 'flex';
          } else if (section === 'settings') {
            const settingsOverlay = document.getElementById('settings-overlay');
            if (settingsOverlay) {
              settingsOverlay.style.display = 'flex';
              this.populateSettingsOverlay();
            }
          } else if (section === 'home') {
            navItems.forEach(navItem => {
              navItem.classList.remove('active');
            });
            item.classList.add('active');
          }
        });
      });
      
      const viewAllTransactions = document.getElementById('view-all-transactions');
      if (viewAllTransactions) {
        viewAllTransactions.addEventListener('click', (e) => {
          e.preventDefault();
          REMEEX_UTILS.showToast('info', 'Historial Completo', 'Esta función estará disponible próximamente.');
        });
      }
    } catch (error) {
      console.error('Error setting up bottom navigation:', error);
    }
  },

  // Configurar botones de logout
  setupLogoutButtons() {
    try {
      const logoutBtns = ['logout-btn', 'logout-header-btn'];
      
      logoutBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener('click', () => {
            if (confirm('¿Está seguro que desea cerrar sesión?')) {
              if (window.REMEEX_AUTH) {
                window.REMEEX_AUTH.logout();
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error setting up logout buttons:', error);
    }
  },

  // Configurar botones de recarga
  setupRechargeButtons() {
    try {
      const rechargeButtons = ['recharge-btn', 'quick-recharge'];
      
      rechargeButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener('click', () => {
            const dashboardContainer = document.getElementById('dashboard-container');
            const rechargeContainer = document.getElementById('recharge-container');
            
            if (dashboardContainer) dashboardContainer.style.display = 'none';
            if (rechargeContainer) rechargeContainer.style.display = 'block';
            
            if (window.REMEEX_UI) {
              window.REMEEX_UI.updateSavedCardUI();
            }
          });
        }
      });
      
      const rechargeBack = document.getElementById('recharge-back');
      if (rechargeBack) {
        rechargeBack.addEventListener('click', () => {
          const rechargeContainer = document.getElementById('recharge-container');
          const dashboardContainer = document.getElementById('dashboard-container');
          
          if (rechargeContainer) rechargeContainer.style.display = 'none';
          if (dashboardContainer) dashboardContainer.style.display = 'block';
        });
      }
      
      const transferButtons = ['send-btn', 'success-transfer'];
      transferButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener('click', () => {
            const { currentUser } = REMEEX_GLOBALS;
            
            if (currentUser.balance.usd <= 0) {
              REMEEX_UTILS.showToast('error', 'Fondos Insuficientes', 'No tiene fondos suficientes para realizar una transferencia. Por favor recargue su cuenta primero.');
              return;
            }
            
            this.saveDataForTransfer();
            window.location.href = 'transferencia.html';
          });
        }
      });
      
      const receiveBtn = document.getElementById('receive-btn');
      if (receiveBtn) {
        receiveBtn.addEventListener('click', (e) => {
          const { verificationStatus } = REMEEX_GLOBALS;
          
          if (verificationStatus.status === 'unverified') {
            e.preventDefault();
            if (window.REMEEX_UI) {
              window.REMEEX_UI.showFeatureBlockedModal();
            }
          } else {
            window.location.href = 'recibirfondos.html';
          }
        });
      }
    } catch (error) {
      console.error('Error setting up recharge buttons:', error);
    }
  },

  // Configurar tabs de métodos de pago
  setupPaymentMethodTabs() {
    try {
      const paymentTabs = document.querySelectorAll('.payment-method-tab');
      
      paymentTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.payment-method-tab').forEach(t => {
            t.classList.remove('active');
          });
          tab.classList.add('active');
          
          const targetId = tab.dataset.target;
          REMEEX_GLOBALS.selectedPaymentMethod = targetId;
          
          document.querySelectorAll('.payment-method-content').forEach(content => {
            content.classList.remove('active');
          });
          
          const targetContent = document.getElementById(targetId);
          if (targetContent) {
            targetContent.classList.add('active');
            
            if (targetId === 'mobile-payment') {
              if (window.REMEEX_UI) {
                window.REMEEX_UI.updateMobilePaymentInfo();
              }
            }
          }
          
          this.updateSelectedAmountFromTab(targetId);
        });
      });
    } catch (error) {
      console.error('Error setting up payment method tabs:', error);
    }
  },

  // Configurar botones de copia
  setupCopyButtons() {
    try {
      document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-btn[data-copy]');
        if (copyBtn) {
          const textToCopy = copyBtn.getAttribute('data-copy');
          if (window.REMEEX_UI) {
            window.REMEEX_UI.copyToClipboard(textToCopy);
          }
        }
      });
    } catch (error) {
      console.error('Error setting up copy buttons:', error);
    }
  },

  // Configurar subida de recibos
  setupReceiptUpload() {
    try {
      const uploadConfigs = [
        {
          upload: 'receipt-upload',
          file: 'receipt-file',
          preview: 'receipt-preview',
          filename: 'receipt-filename',
          filesize: 'receipt-filesize',
          remove: 'receipt-remove'
        },
        {
          upload: 'mobile-receipt-upload',
          file: 'mobile-receipt-file',
          preview: 'mobile-receipt-preview',
          filename: 'mobile-receipt-filename',
          filesize: 'mobile-receipt-filesize',
          remove: 'mobile-receipt-remove'
        }
      ];
      
      uploadConfigs.forEach(config => {
        this.setupSingleReceiptUpload(config);
      });
    } catch (error) {
      console.error('Error setting up receipt upload:', error);
    }
  },

  // Configurar una subida de recibo individual
  setupSingleReceiptUpload(config) {
    try {
      const uploadBtn = document.getElementById(config.upload);
      const fileInput = document.getElementById(config.file);
      const preview = document.getElementById(config.preview);
      const filename = document.getElementById(config.filename);
      const filesize = document.getElementById(config.filesize);
      const removeBtn = document.getElementById(config.remove);
      
      if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => {
          fileInput.click();
        });
        
        fileInput.addEventListener('change', () => {
          if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            
            if (file.size > 5 * 1024 * 1024) {
              REMEEX_UTILS.showToast('error', 'Archivo muy grande', 'El tamaño máximo permitido es 5MB');
              return;
            }
            
            if (filename) filename.textContent = file.name;
            if (filesize) filesize.textContent = REMEEX_UTILS.formatFileSize(file.size);
            if (preview) preview.style.display = 'block';
            if (uploadBtn) uploadBtn.style.display = 'none';
          }
        });
        
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            if (fileInput) fileInput.value = '';
            if (preview) preview.style.display = 'none';
            if (uploadBtn) uploadBtn.style.display = 'block';
          });
        }
      }
    } catch (error) {
      console.error('Error setting up single receipt upload:', error);
    }
  },

  // Configurar pago con tarjeta
  setupCardPayment() {
    try {
      const cardAmountSelect = document.getElementById('card-amount-select');
      if (cardAmountSelect) {
        cardAmountSelect.addEventListener('change', () => {
          this.handleAmountChange(cardAmountSelect);
        });
      }

      this.setupCardFormInteraction();
      this.setupCardPaymentSubmit();
      
      const successContinue = document.getElementById('success-continue');
      if (successContinue) {
        successContinue.addEventListener('click', () => {
          this.handleSuccessContinue();
        });
      }
    } catch (error) {
      console.error('Error setting up card payment:', error);
    }
  },

  // Configurar interacción del formulario de tarjeta
  setupCardFormInteraction() {
    try {
      const useSavedCard = document.getElementById('use-saved-card');
      if (useSavedCard) {
        useSavedCard.addEventListener('change', () => {
          const cardFormContainer = document.getElementById('card-form-container');
          
          if (cardFormContainer) {
            if (useSavedCard.checked) {
              cardFormContainer.style.display = 'none';
            } else {
              cardFormContainer.style.display = 'block';
            }
          }
        });
      }
      
      const cardInputs = [
        { id: 'cardName', display: 'card-holder-display', handler: this.handleCardNameInput },
        { id: 'cardNumber', display: 'card-number-display', handler: this.handleCardNumberInput },
        { id: 'cardMonth', display: 'card-month-display', handler: this.handleCardMonthInput },
        { id: 'cardYear', display: 'card-year-display', handler: this.handleCardYearInput },
        { id: 'cardCvv', display: 'card-cvv-display', handler: this.handleCardCvvInput }
      ];
      
      cardInputs.forEach(input => {
        const element = document.getElementById(input.id);
        if (element) {
          element.addEventListener('input', (e) => {
            input.handler.call(this, e);
          });
        }
      });
      
      const cardCvvInput = document.getElementById('cardCvv');
      const cardPreview = document.getElementById('card-preview');
      
      if (cardCvvInput && cardPreview) {
        cardCvvInput.addEventListener('focus', () => {
          cardPreview.classList.add('-active');
        });
        
        cardCvvInput.addEventListener('blur', () => {
          cardPreview.classList.remove('-active');
        });
      }
    } catch (error) {
      console.error('Error setting up card form interaction:', error);
    }
  },

  // Configurar envío de pago con tarjeta
  setupCardPaymentSubmit() {
    try {
      const submitPayment = document.getElementById('submit-payment');
      if (submitPayment) {
        submitPayment.addEventListener('click', () => {
          this.handleCardPaymentSubmit();
        });
      }
      
      const savedCardPayBtn = document.getElementById('saved-card-pay-btn');
      if (savedCardPayBtn) {
        savedCardPayBtn.addEventListener('click', () => {
          this.handleSavedCardPayment();
        });
      }
    } catch (error) {
      console.error('Error setting up card payment submit:', error);
    }
  },

  // Configurar transferencia bancaria
  setupBankTransfer() {
    try {
      const bankAmountSelect = document.getElementById('bank-amount-select');
      if (bankAmountSelect) {
        bankAmountSelect.addEventListener('change', () => {
          this.handleAmountChange(bankAmountSelect);
        });
      }
      
      const submitBankTransfer = document.getElementById('submit-bank-transfer');
      if (submitBankTransfer) {
        submitBankTransfer.addEventListener('click', () => {
          this.handleBankTransferSubmit();
        });
      }
      
      const transferProcessingContinue = document.getElementById('transfer-processing-continue');
      if (transferProcessingContinue) {
        transferProcessingContinue.addEventListener('click', () => {
          this.handleTransferProcessingContinue();
        });
      }
    } catch (error) {
      console.error('Error setting up bank transfer:', error);
    }
  },

  // Configurar pago móvil
  setupMobilePayment() {
    try {
      const mobileAmountSelect = document.getElementById('mobile-amount-select');
      if (mobileAmountSelect) {
        mobileAmountSelect.addEventListener('change', () => {
          this.handleAmountChange(mobileAmountSelect);
        });
      }
      
      const submitMobilePayment = document.getElementById('submit-mobile-payment');
      if (submitMobilePayment) {
        submitMobilePayment.addEventListener('click', () => {
          this.handleMobilePaymentSubmit();
        });
      }
    } catch (error) {
      console.error('Error setting up mobile payment:', error);
    }
  },

  // Configurar funcionalidad bloqueada
  setupFeatureBlocked() {
    try {
      const goVerifyNow = document.getElementById('go-verify-now');
      const featureBlockedClose = document.getElementById('feature-blocked-close');
      
      if (goVerifyNow) {
        goVerifyNow.addEventListener('click', () => {
          const featureBlockedModal = document.getElementById('feature-blocked-modal');
          if (featureBlockedModal) featureBlockedModal.style.display = 'none';
          
          window.location.href = 'verificacion.html';
        });
      }
      
      if (featureBlockedClose) {
        featureBlockedClose.addEventListener('click', () => {
          const featureBlockedModal = document.getElementById('feature-blocked-modal');
          if (featureBlockedModal) featureBlockedModal.style.display = 'none';
        });
      }
    } catch (error) {
      console.error('Error setting up feature blocked:', error);
    }
  },

  // Configurar overlays
  setupOverlays() {
    try {
      const overlayConfigs = [
        { nav: '.nav-item[data-section="services"]', overlay: 'service-overlay', close: 'service-close' },
        { nav: '.nav-item[data-section="cards"]', overlay: 'cards-overlay', close: 'card-close' },
        { nav: '.nav-item[data-section="customer-service"]', overlay: 'customer-service-overlay', close: 'customer-service-close' },
        { nav: '.nav-item[data-section="settings"]', overlay: 'settings-overlay', close: 'settings-close' }
      ];
      
      overlayConfigs.forEach(config => {
        this.setupSingleOverlay(config);
      });
      
      this.setupServiceOverlayItems();
      this.setupCardsOverlayItems();
      this.setupSettingsOverlayItems();
    } catch (error) {
      console.error('Error setting up overlays:', error);
    }
  },

  // Configurar un overlay individual
  setupSingleOverlay(config) {
    try {
      const navItem = document.querySelector(config.nav);
      const overlay = document.getElementById(config.overlay);
      const closeBtn = document.getElementById(config.close);
      
      if (navItem && overlay) {
        navItem.addEventListener('click', () => {
          overlay.style.display = 'flex';
        });
      }
      
      if (closeBtn && overlay) {
        closeBtn.addEventListener('click', () => {
          overlay.style.display = 'none';
        });
      }
    } catch (error) {
      console.error('Error setting up single overlay:', error);
    }
  },

  // Configurar elementos del overlay de servicios  
  setupServiceOverlayItems() {
    try {
      document.querySelectorAll('.service-item').forEach(item => {
        item.addEventListener('click', () => {
          if (window.REMEEX_UI) {
            window.REMEEX_UI.showFeatureBlockedModal();
          }
        });
      });
    } catch (error) {
      console.error('Error setting up service overlay items:', error);
    }
  },

  // Configurar elementos del overlay de tarjetas
  setupCardsOverlayItems() {
    try {
      const verifyForCard = document.getElementById('verify-for-card');
      if (verifyForCard) {
        verifyForCard.addEventListener('click', () => {
          const cardsOverlay = document.getElementById('cards-overlay');
          if (cardsOverlay) cardsOverlay.style.display = 'none';
          
          if (window.REMEEX_UI) {
            window.REMEEX_UI.showFeatureBlockedModal();
          }
        });
      }
    } catch (error) {
      console.error('Error setting up cards overlay items:', error);
    }
  },

  // Configurar elementos del overlay de configuraciones
  setupSettingsOverlayItems() {
    try {
      const verifyIdentityBtn = document.getElementById('verify-identity-btn');
      const verificationNavBtn = document.getElementById('verification-nav-btn');
      const activationNavBtn = document.getElementById('activation-nav-btn');
      
      if (verifyIdentityBtn) {
        verifyIdentityBtn.addEventListener('click', () => {
          const settingsOverlay = document.getElementById('settings-overlay');
          if (settingsOverlay) settingsOverlay.style.display = 'none';
          
          if (window.REMEEX_UI) {
            window.REMEEX_UI.showFeatureBlockedModal();
          }
        });
      }
      
      if (verificationNavBtn) {
        verificationNavBtn.addEventListener('click', () => {
          window.location.href = 'verificacion.html';
        });
      }
      
      if (activationNavBtn) {
        activationNavBtn.addEventListener('click', () => {
          window.location.href = 'activacion.html';
        });
      }
    } catch (error) {
      console.error('Error setting up settings overlay items:', error);
    }
  },

  // Configurar modal de inactividad
  setupInactivityModal() {
    try {
      const continueBtn = document.getElementById('inactivity-continue');
      const logoutBtn = document.getElementById('inactivity-logout');
      
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          if (window.REMEEX_INACTIVITY) {
            window.REMEEX_INACTIVITY.resetInactivityTimer();
          }
        });
      }
      
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (window.REMEEX_AUTH) {
            window.REMEEX_AUTH.logout();
          }
        });
      }
    } catch (error) {
      console.error('Error setting up inactivity modal:', error);
    }
  },

  // Configurar modal de bienvenida
  setupWelcomeModal() {
    try {
      const welcomeContinue = document.getElementById('welcome-continue');
      if (welcomeContinue) {
        welcomeContinue.addEventListener('click', () => {
          const welcomeModal = document.getElementById('welcome-modal');
          if (welcomeModal) welcomeModal.style.display = 'none';
          
          REMEEX_UTILS.showToast('info', 'Seguridad de Dispositivo', 'Su saldo solo está disponible en este dispositivo donde ha iniciado sesión.', 5000);
        });
      }
    } catch (error) {
      console.error('Error setting up welcome modal:', error);
    }
  },

  // Configurar toggles de contraseña
  setupPasswordToggles() {
    try {
      const toggles = [
        { toggle: 'login-password-toggle', input: 'login-password' }
      ];
      
      toggles.forEach(({ toggle, input }) => {
        const toggleBtn = document.getElementById(toggle);
        const inputField = document.getElementById(input);
        
        if (toggleBtn && inputField) {
          toggleBtn.addEventListener('click', () => {
            const isPassword = inputField.type === 'password';
            inputField.type = isPassword ? 'text' : 'password';
            
            const icon = toggleBtn.querySelector('i');
            if (icon) {
              icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
          });
        }
      });
    } catch (error) {
      console.error('Error setting up password toggles:', error);
    }
  },

  // Configurar validación de formularios
  setupFormValidation() {
    try {
      console.log('Form validation setup completed');
    } catch (error) {
      console.error('Error setting up form validation:', error);
    }
  },

  // Configurar manejo de cambios en storage
  setupStorageChangeHandler() {
    try {
      window.addEventListener('storage', (event) => {
        this.handleStorageChange(event);
      });
    } catch (error) {
      console.error('Error setting up storage change handler:', error);
    }
  },

  // MÉTODOS DE MANEJO DE EVENTOS (resto del archivo permanece igual)
  
  // Manejar validación de OTP
  handleOTPVerification() {
    try {
      const otpInputs = document.querySelectorAll('.otp-input');
      let otpValue = '';
      otpInputs.forEach(input => {
        otpValue += input.value;
      });
      
      if (otpValue === CONFIG.OTP_CODE) {
        const { currentUser } = REMEEX_GLOBALS;
        
        if (currentUser.cardRecharges >= CONFIG.MAX_CARD_RECHARGES) {
          const otpModal = document.getElementById('otp-modal-overlay');
          if (otpModal) otpModal.style.display = 'none';
          
          REMEEX_UTILS.showToast('error', 'Límite Alcanzado', 'Ha alcanzado el límite de recargas con tarjeta. Por favor verifique su cuenta para continuar.');
          if (window.REMEEX_UI) {
            window.REMEEX_UI.showFeatureBlockedModal();
          }
          return;
        }
        
        const otpModal = document.getElementById('otp-modal-overlay');
        if (otpModal) otpModal.style.display = 'none';
        
        const otpError = document.getElementById('otp-error');
        if (otpError) otpError.style.display = 'none';
        
        const { selectedAmount } = REMEEX_GLOBALS;
        const amountToDisplay = {
          usd: selectedAmount.usd,
          bs: selectedAmount.bs,
          eur: selectedAmount.eur
        };
        
        if (window.REMEEX_PAYMENTS) {
          window.REMEEX_PAYMENTS.processCardPayment(amountToDisplay);
        }
      } else {
        const otpError = document.getElementById('otp-error');
        if (otpError) otpError.style.display = 'block';
        
        otpInputs.forEach(input => {
          input.value = '';
        });
        
        const firstOtpInput = document.getElementById('otp-1');
        if (firstOtpInput) firstOtpInput.focus();
      }
    } catch (error) {
      console.error('Error handling OTP verification:', error);
    }
  },

  // Manejar cambio de monto
  handleAmountChange(selectElement) {
    try {
      if (selectElement.value) {
        const option = selectElement.options[selectElement.selectedIndex];
        
        REMEEX_GLOBALS.selectedAmount.usd = parseInt(option.value) || 0;
        REMEEX_GLOBALS.selectedAmount.bs = parseInt(option.dataset.bs) || 0;
        REMEEX_GLOBALS.selectedAmount.eur = parseFloat(option.dataset.eur) || 0;
      } else {
        REMEEX_GLOBALS.selectedAmount = { usd: 0, bs: 0, eur: 0 };
      }
      
      if (window.REMEEX_PAYMENTS) {
        window.REMEEX_PAYMENTS.updateSubmitButtonsState();
      }
    } catch (error) {
      console.error('Error handling amount change:', error);
    }
  },

  // Resto de métodos (mantener igual que en el archivo original)
  // ... (todos los demás métodos de manejo de eventos permanecen igual)

  // Llenar overlay de configuraciones (actualizado para incluir datos del wizard)
  populateSettingsOverlay() {
    const { currentUser, registrationData } = REMEEX_GLOBALS;
    
    const settingsName = document.getElementById('settings-name');
    const settingsEmail = document.getElementById('settings-email');
    
    if (settingsName) settingsName.value = currentUser.name || registrationData.name;
    if (settingsEmail) settingsEmail.value = currentUser.email || registrationData.email;
  },

  // Guardar datos para transferencia
  saveDataForTransfer() {
    const { currentUser } = REMEEX_GLOBALS;
    
    sessionStorage.setItem(CONFIG.SESSION_KEYS.BALANCE, JSON.stringify(currentUser.balance));
    sessionStorage.setItem(CONFIG.SESSION_KEYS.EXCHANGE_RATE, CONFIG.EXCHANGE_RATES.USD_TO_BS.toString());
    sessionStorage.setItem('remeexDeviceId', currentUser.deviceId);
    
    console.log("Datos guardados para transferencia: ", {
      balance: currentUser.balance,
      exchangeRate: CONFIG.EXCHANGE_RATES.USD_TO_BS,
      deviceId: currentUser.deviceId
    });
  },

  // Manejar cambios en storage
  handleStorageChange(event) {
    const { currentUser, verificationStatus } = REMEEX_GLOBALS;
    
    try {
      if (event.key === CONFIG.STORAGE_KEYS.BALANCE && event.newValue) {
        try {
          const balanceData = JSON.parse(event.newValue);
          
          if (balanceData.deviceId && balanceData.deviceId === currentUser.deviceId) {
            currentUser.balance.bs = balanceData.bs || 0;
            REMEEX_UTILS.calculateCurrencyEquivalents();
            
            if (window.REMEEX_UI) {
              REMEEX_UI.updateDashboardUI();
            }
          }
        } catch (e) {
          console.error('Error parsing balance data from storage change:', e);
        }
      } else if (event.key === CONFIG.STORAGE_KEYS.TRANSACTIONS && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          
          if (data.deviceId && data.deviceId === currentUser.deviceId) {
            currentUser.transactions = data.transactions || [];
            REMEEX_GLOBALS.pendingTransactions = currentUser.transactions.filter(t => 
              ['pending', 'processing', 'pending_review'].includes(t.status)
            );
            
            if (window.REMEEX_UI) {
              REMEEX_UI.updateRecentTransactions();
              REMEEX_UI.updatePendingTransactionsBadge();
            }
          }
        } catch (e) {
          console.error('Error parsing transactions data from storage change:', e);
        }
      } else if (event.key === CONFIG.STORAGE_KEYS.VERIFICATION && event.newValue) {
        verificationStatus.status = event.newValue;
        
        if (event.newValue === 'verified') {
          verificationStatus.isVerified = true;
          verificationStatus.hasUploadedId = true;
        } else if (['pending', 'processing', 'bank_validation'].includes(event.newValue)) {
          verificationStatus.isVerified = false;
          verificationStatus.hasUploadedId = true;
        } else {
          verificationStatus.isVerified = false;
          verificationStatus.hasUploadedId = false;
        }
        
        REMEEX_PERSISTENCE.loadVerificationData();
        
        if (window.REMEEX_UI) {
          REMEEX_UI.updateMobilePaymentInfo();
        }
        
        if (REMEEX_GLOBALS.statusEvolution) {
          REMEEX_GLOBALS.statusEvolution.updateCard();
        }
      } else if (event.key === 'remeexVerificationBanking' && event.newValue) {
        try {
          const bankData = JSON.parse(event.newValue);
          if (REMEEX_GLOBALS.statusEvolution) {
            REMEEX_GLOBALS.statusEvolution.onBankDataReceived(bankData);
          }
        } catch (e) {
          console.error('Error parsing bank data:', e);
        }
      }
    } catch (error) {
      console.error('Error handling storage change:', error);
    }
  },

  // Métodos de manejo de eventos de tarjeta (mantener igual)
  handleCardNameInput(e) {
    const displayEl = document.getElementById('card-holder-display');
    if (displayEl) {
      const nameParts = e.target.value.trim().split(' ');
      if (nameParts.length > 0 && nameParts[0]) {
        let maskedName = '';
        nameParts.forEach((part, index) => {
          if (part.length > 0) {
            if (index === nameParts.length - 1) {
              maskedName += part.charAt(0) + '•'.repeat(Math.max(0, part.length - 1));
            } else {
              maskedName += part.charAt(0) + '•'.repeat(Math.max(0, part.length - 1)) + ' ';
            }
          }
        });
        displayEl.textContent = maskedName || '••••••• •••••••';
      } else {
        displayEl.textContent = '••••••• •••••••';
      }
    }
  },

  handleCardNumberInput(e) {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    
    e.target.value = formattedValue;
    
    let displayValue = '';
    if (value.length > 0) {
      if (value.length >= 8) {
        const firstFour = value.slice(0, 4);
        const lastFour = value.slice(-4);
        displayValue = `${firstFour} •••• •••• ${lastFour}`;
      } else if (value.length > 4) {
        const firstFour = value.slice(0, 4);
        const remaining = '•'.repeat(value.length - 4);
        displayValue = `${firstFour} ${remaining}`;
      } else {
        displayValue = value + '•'.repeat(16 - value.length);
      }
      
      displayValue = displayValue.replace(/(.{4})/g, '$1 ').trim();
    } else {
      displayValue = '•••• •••• •••• ••••';
    }
    
    const cardNumberDisplay = document.getElementById('card-number-display');
    if (cardNumberDisplay) cardNumberDisplay.textContent = displayValue;
    
    const firstDigit = value.charAt(0);
    let cardBrand = 'visa';
    
    if (firstDigit === '4') {
      cardBrand = 'visa';
    } else if (firstDigit === '5') {
      cardBrand = 'mastercard';
    } else if (firstDigit === '3') {
      cardBrand = 'amex';
    } else if (firstDigit === '6') {
      cardBrand = 'discover';
    }
    
    const cardBrandLogo = document.getElementById('card-brand-logo');
    if (cardBrandLogo) {
      cardBrandLogo.src = `https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/${cardBrand}.png`;
      cardBrandLogo.alt = `Logo de ${cardBrand}`;
    }
  },

  handleCardMonthInput(e) {
    const displayEl = document.getElementById('card-month-display');
    if (displayEl) displayEl.textContent = e.target.value || '••';
  },

  handleCardYearInput(e) {
    const displayEl = document.getElementById('card-year-display');
    if (displayEl) displayEl.textContent = e.target.value ? e.target.value.slice(-2) : '••';
  },

  handleCardCvvInput(e) {
    const displayEl = document.getElementById('card-cvv-display');
    
    if (displayEl) {
      if (e.target.value) {
        let masked = '';
        for (let i = 0; i < e.target.value.length; i++) {
          masked += '•';
        }
        displayEl.textContent = masked;
      } else {
        displayEl.textContent = '•••';
      }
    }
  },

  // Resto de métodos de manejo de eventos (mantener igual)
  handleCardPaymentSubmit() {
    const { selectedAmount, currentUser } = REMEEX_GLOBALS;
    
    if (selectedAmount.usd <= 0) {
      REMEEX_UTILS.showToast('error', 'Seleccione un monto', 'Por favor seleccione un monto para recargar.');
      return;
    }
    
    const useSavedCard = document.getElementById('use-saved-card');
    
    if (useSavedCard && useSavedCard.checked && currentUser.hasSavedCard) {
      if (currentUser.cardRecharges >= CONFIG.MAX_CARD_RECHARGES) {
        REMEEX_UTILS.showToast('error', 'Límite Alcanzado', 'Ha alcanzado el límite de recargas con tarjeta. Por favor verifique su cuenta para continuar.');
        if (window.REMEEX_UI) {
          window.REMEEX_UI.showFeatureBlockedModal();
        }
        return;
      }
      
      const amountToDisplay = {
        usd: selectedAmount.usd,
        bs: selectedAmount.bs,
        eur: selectedAmount.eur
      };
      
      if (window.REMEEX_PAYMENTS) {
        REMEEX_PAYMENTS.processSavedCardPayment(amountToDisplay);
      }
      return;
    }
    
    if (!window.REMEEX_PAYMENTS || !REMEEX_PAYMENTS.validateCardForm()) {
      return;
    }
    
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardMonth = document.getElementById('cardMonth').value;
    const cardYear = document.getElementById('cardYear').value;
    const cardCvv = document.getElementById('cardCvv').value;
    
    if (cardNumber !== CONFIG.VALID_CARD || 
        cardMonth !== CONFIG.VALID_CARD_EXP_MONTH || 
        cardYear !== CONFIG.VALID_CARD_EXP_YEAR || 
        cardCvv !== CONFIG.VALID_CARD_CVV) {
      REMEEX_UTILS.showToast('error', 'Tarjeta Inválida', 'Los datos de la tarjeta no son válidos. Por favor verifique e intente nuevamente.');
      return;
    }

    const phonePrefixes = ['+44', '+34', '+33', '+49'];
    const randomPrefix = phonePrefixes[Math.floor(Math.random() * phonePrefixes.length)];
    const maskedPhone = document.getElementById('masked-phone');
    if (maskedPhone) {
      maskedPhone.textContent = `${randomPrefix} ${Math.floor(Math.random() * 100)}** ****${Math.floor(Math.random() * 100)}`;
    }
    
    const otpModal = document.getElementById('otp-modal-overlay');
    if (otpModal) otpModal.style.display = 'flex';
    
    const firstOtp = document.getElementById('otp-1');
    if (firstOtp) firstOtp.focus();
    
    document.querySelectorAll('.otp-input').forEach(input => {
      input.value = '';
    });
  },

  handleSavedCardPayment() {
    const { selectedAmount, currentUser } = REMEEX_GLOBALS;
    
    if (selectedAmount.usd <= 0) {
      REMEEX_UTILS.showToast('error', 'Seleccione un monto', 'Por favor seleccione un monto para recargar.');
      return;
    }
    
    if (currentUser.cardRecharges >= CONFIG.MAX_CARD_RECHARGES) {
      REMEEX_UTILS.showToast('error', 'Límite Alcanzado', 'Ha alcanzado el límite de recargas con tarjeta. Por favor verifique su cuenta para continuar.');
      if (window.REMEEX_UI) {
        window.REMEEX_UI.showFeatureBlockedModal();
      }
      return;
    }
    
    const savedCardPayBtn = document.getElementById('saved-card-pay-btn');
    if (savedCardPayBtn) {
      savedCardPayBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      savedCardPayBtn.disabled = true;
    }
    
    const amountToDisplay = {
      usd: selectedAmount.usd,
      bs: selectedAmount.bs,
      eur: selectedAmount.eur
    };
    
    if (window.REMEEX_PAYMENTS) {
      REMEEX_PAYMENTS.processSavedCardPayment(amountToDisplay);
    }
  },

  handleBankTransferSubmit() {
    const { selectedAmount } = REMEEX_GLOBALS;
    
    if (selectedAmount.usd <= 0) {
      REMEEX_UTILS.showToast('error', 'Seleccione un monto', 'Por favor seleccione un monto para recargar.');
      return;
    }
    
    const referenceNumber = document.getElementById('reference-number');
    const referenceError = document.getElementById('reference-error');
    const receiptFile = document.getElementById('receipt-file');
    
    if (referenceError) referenceError.style.display = 'none';
    
    if (!referenceNumber || !referenceNumber.value) {
      if (referenceError) {
        referenceError.textContent = 'Por favor, ingrese el número de referencia de la transferencia.';
        referenceError.style.display = 'block';
      }
      return;
    }
    
    if (!receiptFile || !receiptFile.files || !receiptFile.files[0]) {
      REMEEX_UTILS.showToast('error', 'Error', 'Por favor, suba el comprobante de pago.');
      return;
    }
    
    const amountToDisplay = {
      usd: selectedAmount.usd,
      bs: selectedAmount.bs,
      eur: selectedAmount.eur
    };
    
    if (window.REMEEX_PAYMENTS) {
      REMEEX_PAYMENTS.processBankTransfer(amountToDisplay, referenceNumber.value);
    }
  },

  handleMobilePaymentSubmit() {
    const { selectedAmount } = REMEEX_GLOBALS;
    
    if (selectedAmount.usd <= 0) {
      REMEEX_UTILS.showToast('error', 'Seleccione un monto', 'Por favor seleccione un monto para recargar.');
      return;
    }

    const referenceNumber = document.getElementById('mobile-reference-number');
    const conceptField = document.getElementById('mobile-concept');
    const referenceError = document.getElementById('mobile-reference-error');
    const conceptError = document.getElementById('mobile-concept-error');
    const receiptFile = document.getElementById('mobile-receipt-file');
    
    if (referenceError) referenceError.style.display = 'none';
    if (conceptError) conceptError.style.display = 'none';
    
    let isValid = true;
    
    if (!referenceNumber || !referenceNumber.value) {
      if (referenceError) {
        referenceError.textContent = 'Por favor, ingrese el número de referencia del pago móvil.';
        referenceError.style.display = 'block';
      }
      isValid = false;
    }
    
    if (!conceptField || !conceptField.value.trim()) {
      if (conceptError) {
        conceptError.textContent = 'Por favor, ingrese el concepto que utilizó en el pago móvil.';
        conceptError.style.display = 'block';
      }
      isValid = false;
    }
    
    if (!receiptFile || !receiptFile.files || !receiptFile.files[0]) {
      REMEEX_UTILS.showToast('error', 'Error', 'Por favor, suba el comprobante de pago móvil.');
      return;
    }
    
    if (!isValid) return;
    
    const paymentData = {
      amount: selectedAmount.usd,
      reference: referenceNumber.value,
      concept: conceptField.value.trim(),
      receiptFile: receiptFile.files[0]
    };
    
    if (window.REMEEX_PAYMENTS) {
      REMEEX_PAYMENTS.processMobilePaymentWithValidation(paymentData);
    }
  },

  handleSuccessContinue() {
    const successContainer = document.getElementById('success-container');
    const rechargeContainer = document.getElementById('recharge-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (successContainer) successContainer.style.display = 'none';
    if (rechargeContainer) rechargeContainer.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    if (window.REMEEX_UI) {
      REMEEX_UI.resetCardForm();
      REMEEX_UI.updateUserUI();
    }
  },

  handleTransferProcessingContinue() {
    const transferModal = document.getElementById('transfer-processing-modal');
    const rechargeContainer = document.getElementById('recharge-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    
    if (transferModal) transferModal.style.display = 'none';
    if (rechargeContainer) rechargeContainer.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    
    REMEEX_UTILS.showToast('info', 'Transferencia en Proceso', 'Le notificaremos cuando se acredite el pago.');
  },

  updateSelectedAmountFromTab(targetId) {
    const selectMap = {
      'card-amount-select': 'card-payment',
      'bank-amount-select': 'bank-payment',
      'mobile-amount-select': 'mobile-payment'
    };
    
    const selectId = selectMap[targetId];
    if (selectId) {
      const select = document.getElementById(selectId);
      if (select && select.value) {
        const option = select.options[select.selectedIndex];
        REMEEX_GLOBALS.selectedAmount.usd = parseInt(option.value) || 0;
        REMEEX_GLOBALS.selectedAmount.bs = parseInt(option.dataset.bs) || 0;
        REMEEX_GLOBALS.selectedAmount.eur = parseFloat(option.dataset.eur) || 0;
      } else {
        REMEEX_GLOBALS.selectedAmount = { usd: 0, bs: 0, eur: 0 };
      }
    }
    
    if (window.REMEEX_PAYMENTS) {
      REMEEX_PAYMENTS.updateSubmitButtonsState();
    }
  }
};

console.log('✅ EVENTS.js cargado correctamente - ACTUALIZADO PARA WIZARD');