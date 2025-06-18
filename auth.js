// ============================================================================
// REMEEX VISA Banking - Sistema de Autenticación
// Versión: 4.2 (Modular) - ACTUALIZADO PARA WIZARD
// ============================================================================

"use strict";

window.REMEEX_AUTH = {
  passwordStrength: {
    score: 0,
    level: 'weak',
    requirements: {
      length: false,
      upper: false,
      lower: false,
      number: false,
      special: false
    }
  },

  // Verificar estado de registro
  checkRegistrationStatus() {
    const { registrationData } = REMEEX_GLOBALS;
    try {
      const isRegistered = localStorage.getItem(CONFIG.STORAGE_KEYS.IS_REGISTERED) === 'true';
      const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_REGISTRATION);
      
      if (isRegistered && userData) {
        try {
          const parsedData = JSON.parse(userData);
          Object.assign(registrationData, parsedData);
          registrationData.isRegistered = true;
          return true;
        } catch (e) {
          console.error('Error parsing registration data:', e);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  },

  // Mostrar formulario apropiado
  showAppropriateForm() {
    try {
      const wizardCard = document.getElementById('wizard-registration-card');
      const loginCard = document.getElementById('login-card');
      
      if (!wizardCard || !loginCard) {
        console.warn('Wizard or login card not found');
        return;
      }
      
      if (this.checkRegistrationStatus()) {
        wizardCard.style.display = 'none';
        loginCard.style.display = 'block';
        this.setupPersonalizedLogin();
      } else {
        wizardCard.style.display = 'block';
        loginCard.style.display = 'none';
        
        // Inicializar wizard si no está inicializado
        if (window.REMEEX_WIZARD) {
          REMEEX_WIZARD.init();
        }
      }
    } catch (error) {
      console.error('Error showing appropriate form:', error);
    }
  },

  // Setup login personalizado con datos del usuario
  setupPersonalizedLogin() {
    const { registrationData } = REMEEX_GLOBALS;
    try {
      if (!registrationData.isRegistered) return;
      
      const greeting = REMEEX_UTILS.getTimeBasedGreeting();
      const personalizedGreeting = document.getElementById('personalized-greeting');
      const firstName = registrationData.name.split(' ')[0];
      
      if (personalizedGreeting) {
        personalizedGreeting.textContent = `${greeting}, ${firstName}!`;
      }

      // Mostrar datos del usuario (no editables)
      const loginNameDisplay = document.getElementById('login-name-display');
      const loginEmailDisplay = document.getElementById('login-email-display');
      
      if (loginNameDisplay) {
        loginNameDisplay.textContent = registrationData.name;
      }
      
      if (loginEmailDisplay) {
        loginEmailDisplay.textContent = registrationData.email;
      }

      // Prellenar campos editables
      const loginPassword = document.getElementById('login-password');
      const loginCode = document.getElementById('login-code');
      
      if (loginPassword) {
        loginPassword.value = registrationData.password;
        loginPassword.placeholder = "Haz clic para editar tu contraseña";
      }
      
      if (loginCode) {
        loginCode.value = registrationData.verificationCode || CONFIG.LOGIN_CODE;
        loginCode.placeholder = "Haz clic para editar tu código de 20 dígitos";
      }

      // Configurar tarjeta personalizada
      this.setupPersonalizedCard();
      
      this.updateAccountPreviewRealistic();
      this.setupEnhancedSlideToUnlock();
    } catch (error) {
      console.error('Error setting up personalized login:', error);
    }
  },

  // Configurar tarjeta personalizada en login
  setupPersonalizedCard() {
    const { registrationData } = REMEEX_GLOBALS;
    
    if (!registrationData.cardStyle || !registrationData.cardName) return;

    const cardBackground = document.getElementById('user-card-background');
    const cardHolder = document.getElementById('preview-name-realistic');
    const cardExpiry = document.getElementById('preview-card-expiry');

    if (cardBackground) {
      cardBackground.className = `card-background ${registrationData.cardStyle}`;
    }

    if (cardHolder) {
      cardHolder.textContent = registrationData.cardName.toUpperCase();
    }

    if (cardExpiry) {
      const currentDate = new Date();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      cardExpiry.textContent = `${currentMonth}/32`;
    }
  },

  // Función mejorada del slide to unlock
  setupEnhancedSlideToUnlock() {
    try {
      const slideContainer = document.getElementById('slide-to-unlock');
      const slideButton = document.getElementById('slide-button');
      const slideText = document.getElementById('slide-text');
      const slideSuccess = document.getElementById('slide-success');
      
      if (!slideContainer || !slideButton) return;
      
      let isDragging = false;
      let startX = 0;
      let currentX = 0;
      const maxX = slideContainer.offsetWidth - slideButton.offsetWidth - 8;
      
      const resetSlideToStart = () => {
        slideButton.style.left = '4px';
        slideButton.style.transition = 'left 0.3s ease';
        slideContainer.classList.remove('completed', 'loading', 'error');
        slideButton.classList.remove('completed');
        
        if (slideText) {
          slideText.classList.remove('hidden');
          slideText.style.opacity = '1';
        }
        if (slideSuccess) {
          slideSuccess.classList.remove('visible');
        }
        
        const buttonIcon = slideButton.querySelector('i');
        if (buttonIcon) {
          buttonIcon.className = 'fas fa-chevron-right';
        }
        
        setTimeout(() => {
          slideButton.style.transition = '';
        }, 300);
      };
      
      const startDrag = (e) => {
        e.preventDefault();
        isDragging = true;
        slideContainer.classList.add('dragging');
        slideButton.classList.add('dragging');
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const rect = slideContainer.getBoundingClientRect();
        startX = clientX - rect.left;
      };
      
      const drag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const rect = slideContainer.getBoundingClientRect();
        currentX = clientX - rect.left - startX + 4;
        
        currentX = Math.max(4, Math.min(currentX, maxX));
        slideButton.style.left = currentX + 'px';
        
        const progress = (currentX - 4) / (maxX - 4);
        if (slideText) slideText.style.opacity = 1 - progress;
        
        const buttonIcon = slideButton.querySelector('i');
        if (buttonIcon) {
          buttonIcon.className = progress > 0.7 ? 'fas fa-check' : 'fas fa-chevron-right';
        }
      };
      
      const endDrag = (e) => {
        if (!isDragging) return;
        
        isDragging = false;
        slideContainer.classList.remove('dragging');
        slideButton.classList.remove('dragging');
        
        const progress = (currentX - 4) / (maxX - 4);
        
        if (progress >= 0.8) {
          this.completeSlide(slideContainer, slideButton, slideText, slideSuccess, maxX, resetSlideToStart);
        } else {
          slideButton.style.left = '4px';
          const buttonIcon = slideButton.querySelector('i');
          if (buttonIcon) buttonIcon.className = 'fas fa-chevron-right';
          if (slideText) slideText.style.opacity = '1';
        }
      };
      
      slideButton.addEventListener('mousedown', startDrag);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', endDrag);
      
      slideButton.addEventListener('touchstart', startDrag, { passive: false });
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('touchend', endDrag);
      
    } catch (error) {
      console.error('Error setting up enhanced slide to unlock:', error);
    }
  },

  // Completar deslizamiento con reset automático
  completeSlide(slideContainer, slideButton, slideText, slideSuccess, maxX, resetCallback) {
    slideButton.style.left = maxX + 'px';
    slideButton.classList.add('completed');
    slideContainer.classList.add('completed');
    
    if (slideText) slideText.classList.add('hidden');
    if (slideSuccess) slideSuccess.classList.add('visible');
    
    const buttonIcon = slideButton.querySelector('i');
    if (buttonIcon) buttonIcon.className = 'fas fa-check';
    
    setTimeout(() => {
      slideContainer.classList.add('loading');
      this.processLogin();
      
      setTimeout(() => {
        resetCallback();
      }, 2000);
    }, 800);
  },

  // Función de preview realista
  updateAccountPreviewRealistic() {
    const { registrationData, currentUser, activeUsersCount } = REMEEX_GLOBALS;
    
    try {
      const previewBalanceMain = document.getElementById('preview-balance-main');
      const previewUsdExternal = document.getElementById('preview-usd-external');
      const previewEurExternal = document.getElementById('preview-eur-external');
      const previewRateExternal = document.getElementById('preview-rate-external');
      const previewTimeExternal = document.getElementById('preview-time-external');
      const previewUsersCount = document.getElementById('preview-users-count');
      
      if (previewBalanceMain) {
        previewBalanceMain.textContent = REMEEX_UTILS.formatCurrency(currentUser.balance.bs, 'bs');
      }
      
      if (previewUsdExternal) {
        previewUsdExternal.textContent = REMEEX_UTILS.formatCurrency(currentUser.balance.usd, 'usd');
      }
      
      if (previewEurExternal) {
        previewEurExternal.textContent = REMEEX_UTILS.formatCurrency(currentUser.balance.eur, 'eur');
      }
      
      if (previewRateExternal) {
        previewRateExternal.textContent = `1 USD = ${CONFIG.EXCHANGE_RATES.USD_TO_BS.toFixed(2)} Bs`;
      }
      
      if (previewTimeExternal) {
        const minutes = Math.floor(Math.random() * 5) + 1;
        previewTimeExternal.textContent = `Actualizado hace ${minutes} min`;
      }
      
      if (previewUsersCount) {
        previewUsersCount.textContent = activeUsersCount;
      }
      
      const realisticCard = document.querySelector('.personalized-credit-card');
      if (realisticCard && !realisticCard.dataset.hoverSetup) {
        realisticCard.dataset.hoverSetup = 'true';
        
        realisticCard.addEventListener('mouseenter', function() {
          this.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(-5deg) translateZ(20px)';
          this.style.transition = 'transform 0.3s ease';
        });
        
        realisticCard.addEventListener('mouseleave', function() {
          this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
          this.style.transition = 'transform 0.6s ease';
        });
      }
      
    } catch (error) {
      console.error('Error updating realistic account preview:', error);
    }
  },

  // Procesar login
  processLogin() {
    this.handleEnhancedLogin();
  },

  // Manejar login mejorado
  handleEnhancedLogin() {
    const { registrationData, currentUser } = REMEEX_GLOBALS;
    
    try {
      const loginPassword = document.getElementById('login-password');
      const loginCode = document.getElementById('login-code');
      const passwordError = document.getElementById('password-error');
      const codeError = document.getElementById('code-error');
      
      if (passwordError) passwordError.style.display = 'none';
      if (codeError) codeError.style.display = 'none';
      
      let isValid = true;
      
      if (!loginPassword || !loginPassword.value || loginPassword.value !== registrationData.password) {
        if (passwordError) passwordError.style.display = 'block';
        isValid = false;
        this.showSlideError();
        return;
      }
      
      // Validar código (puede ser el de registro o el por defecto)
      const validCodes = [registrationData.verificationCode, CONFIG.LOGIN_CODE];
      if (!loginCode || !loginCode.value || !validCodes.includes(loginCode.value)) {
        if (codeError) codeError.style.display = 'block';
        isValid = false;
        this.showSlideError();
        return;
      }
      
      if (!isValid) {
        this.showSlideError();
        return;
      }
      
      try {
        currentUser.name = registrationData.name;
        currentUser.email = registrationData.email;
        currentUser.deviceId = REMEEX_UTILS.generateDeviceId();
        
        // Datos adicionales del wizard
        currentUser.country = registrationData.country;
        currentUser.securityQuestion = registrationData.securityQuestion;
        currentUser.securityAnswer = registrationData.securityAnswer;
        currentUser.cardStyle = registrationData.cardStyle;
        currentUser.cardName = registrationData.cardName;
        currentUser.hasZelleAccount = registrationData.hasZelleAccount;
        
        REMEEX_PERSISTENCE.saveUserData();
        REMEEX_PERSISTENCE.saveSessionData();
        
        REMEEX_PERSISTENCE.loadBalanceData();
        REMEEX_PERSISTENCE.loadTransactionsData();
        REMEEX_PERSISTENCE.loadVerificationData();
        REMEEX_PERSISTENCE.loadCardData();
        REMEEX_PERSISTENCE.loadFirstRechargeStatus();
        
        this.showLoadingScreen();
      } catch (error) {
        console.error('Error during login:', error);
        this.showSlideError();
        REMEEX_UTILS.showToast('error', 'Error', 'Ocurrió un error durante el inicio de sesión. Intente nuevamente.');
      }
    } catch (error) {
      console.error('Error in enhanced login handler:', error);
      this.showSlideError();
    }
  },

  // Manejar recuperación de contraseña
  handlePasswordRecovery() {
    const { registrationData } = REMEEX_GLOBALS;
    
    if (!registrationData.securityQuestion || !registrationData.securityAnswer) {
      REMEEX_UTILS.showToast('error', 'Error', 'No hay pregunta de seguridad configurada. Contacte con soporte.');
      return;
    }

    // Mostrar modal de recuperación con pregunta de seguridad
    this.showPasswordRecoveryModal();
  },

  // Mostrar modal de recuperación de contraseña
  showPasswordRecoveryModal() {
    const { registrationData } = REMEEX_GLOBALS;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal" style="max-width: 400px;">
        <div class="modal-title">Recuperar Contraseña</div>
        <div class="modal-subtitle">Responda su pregunta de seguridad para continuar</div>
        
        <div class="form-group">
          <label class="form-label">Pregunta de Seguridad:</label>
          <div style="font-weight: 600; margin-bottom: 1rem; padding: 0.75rem; background: var(--neutral-200); border-radius: var(--radius-md);">
            ${this.getSecurityQuestionText(registrationData.securityQuestion)}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="recovery-answer">Su Respuesta:</label>
          <input type="text" class="form-control" id="recovery-answer" placeholder="Ingrese su respuesta">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="recovery-email">Email de Verificación:</label>
          <input type="email" class="form-control" id="recovery-email" placeholder="Confirme su email">
        </div>
        
        <div class="form-group">
          <label class="form-label" for="recovery-code">Código de 20 dígitos:</label>
          <input type="text" class="form-control" id="recovery-code" placeholder="Ingrese su código de verificación" maxlength="20">
        </div>
        
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
          <button class="btn btn-primary" onclick="REMEEX_AUTH.validatePasswordRecovery(this.closest('.modal'))">Validar</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },

  // Validar recuperación de contraseña
  validatePasswordRecovery(modalElement) {
    const { registrationData } = REMEEX_GLOBALS;
    
    const answer = document.getElementById('recovery-answer').value;
    const email = document.getElementById('recovery-email').value;
    const code = document.getElementById('recovery-code').value;

    if (answer.toLowerCase() !== registrationData.securityAnswer.toLowerCase() ||
        email !== registrationData.email ||
        code !== (registrationData.verificationCode || CONFIG.LOGIN_CODE)) {
      
      REMEEX_UTILS.showToast('error', 'Error', 'Los datos ingresados no coinciden con los registrados.');
      return;
    }

    // Mostrar formulario de nueva contraseña
    this.showNewPasswordForm(modalElement);
  },

  // Mostrar formulario de nueva contraseña
  showNewPasswordForm(modalElement) {
    modalElement.querySelector('.modal').innerHTML = `
      <div class="modal-title">Nueva Contraseña</div>
      <div class="modal-subtitle">Ingrese su nueva contraseña</div>
      
      <div class="form-group">
        <label class="form-label" for="new-password">Nueva Contraseña:</label>
        <input type="password" class="form-control" id="new-password" placeholder="Ingrese nueva contraseña">
      </div>
      
      <div class="form-group">
        <label class="form-label" for="confirm-new-password">Confirmar Contraseña:</label>
        <input type="password" class="form-control" id="confirm-new-password" placeholder="Confirme nueva contraseña">
      </div>
      
      <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
        <button class="btn btn-outline" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-primary" onclick="REMEEX_AUTH.updatePassword(this.closest('.modal-overlay'))">Actualizar</button>
      </div>
    `;
  },

  // Actualizar contraseña
  updatePassword(modalOverlay) {
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;

    if (!newPassword || newPassword !== confirmPassword) {
      REMEEX_UTILS.showToast('error', 'Error', 'Las contraseñas no coinciden.');
      return;
    }

    const strength = this.evaluatePasswordStrength(newPassword);
    if (strength.score < 3) {
      REMEEX_UTILS.showToast('error', 'Error', 'La contraseña debe ser más segura.');
      return;
    }

    // Actualizar contraseña en datos registrados
    const { registrationData } = REMEEX_GLOBALS;
    registrationData.password = newPassword;
    
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_REGISTRATION, JSON.stringify(registrationData));

    // Actualizar campo de contraseña en login
    const loginPassword = document.getElementById('login-password');
    if (loginPassword) {
      loginPassword.value = newPassword;
    }

    modalOverlay.remove();
    REMEEX_UTILS.showToast('success', 'Contraseña Actualizada', 'Su contraseña ha sido actualizada exitosamente.');
  },

  // Obtener texto de pregunta de seguridad
  getSecurityQuestionText(questionValue) {
    const questions = {
      'birthplace-grandfather': 'Lugar de nacimiento de mi abuelo',
      'mother-favorite-color': 'El color favorito de mi madre'
    };
    return questions[questionValue] || questionValue;
  },

  // Resto de métodos existentes (mantener igual)
showLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    
    if (progressBar && loadingText && typeof gsap !== 'undefined') {
      gsap.to(progressBar, {
        width: '100%',
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: function() {
          const progress = Math.round(this.progress() * 100);
          if (progress < 30) {
            loadingText.textContent = "Conectando con el servidor...";
          } else if (progress < 70) {
            loadingText.textContent = "Verificando credenciales...";
          } else {
            loadingText.textContent = "Acceso concedido. Cargando panel...";
          }
        },
        onComplete: () => {
          setTimeout(() => {
            this.completeLogin();
          }, 500);
        }
      });
    } else {
      setTimeout(() => {
        this.completeLogin();
      }, 2000);
    }
  },

  // Completar login
  completeLogin() {
    const { registrationData } = REMEEX_GLOBALS;
    
    try {
      const loadingOverlay = document.getElementById('loading-overlay');
      if (loadingOverlay) loadingOverlay.style.display = 'none';
      
      const loginContainer = document.getElementById('login-container');
      if (loginContainer) loginContainer.style.display = 'none';
      
      const appHeader = document.getElementById('app-header');
      if (appHeader) appHeader.style.display = 'flex';
      
      const dashboardContainer = document.getElementById('dashboard-container');
      if (dashboardContainer) dashboardContainer.style.display = 'block';
      
      const bottomNav = document.getElementById('bottom-nav');
      if (bottomNav) bottomNav.style.display = 'flex';
      
      if (window.REMEEX_UI) {
        window.REMEEX_UI.updateUserUI();
        window.REMEEX_UI.updatePendingTransactionsBadge();
        window.REMEEX_UI.showWelcomeModal();
      }
      
      if (window.REMEEX_EVOLUTION) {
        window.REMEEX_EVOLUTION.initializeEvolutionSystem();
      }
      
      setTimeout(() => {
        const firstName = registrationData.name.split(' ')[0];
        REMEEX_UTILS.showToast('success', 'Acceso Concedido', `¡Bienvenido de nuevo, ${firstName}!`, 5000);
      }, 500);
      
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error completing login:', error);
    }
  },

  // Mostrar error en slide
  showSlideError() {
    try {
      const slideContainer = document.getElementById('slide-to-unlock');
      if (slideContainer) {
        slideContainer.classList.add('error');
        setTimeout(() => {
          slideContainer.classList.remove('error');
        }, 500);
      }
    } catch (error) {
      console.error('Error showing slide error:', error);
    }
  },

  // Evaluar fortaleza de contraseña
  evaluatePasswordStrength(password) {
    try {
      if (!password) password = '';
      
      this.passwordStrength.requirements = {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      };
      
      const metRequirements = Object.values(this.passwordStrength.requirements).filter(Boolean).length;
      
      if (metRequirements <= 1) {
        this.passwordStrength.score = 1;
        this.passwordStrength.level = 'weak';
      } else if (metRequirements === 2) {
        this.passwordStrength.score = 2;
        this.passwordStrength.level = 'fair';
      } else if (metRequirements === 3 || metRequirements === 4) {
        this.passwordStrength.score = 3;
        this.passwordStrength.level = 'good';
      } else if (metRequirements === 5) {
        this.passwordStrength.score = 4;
        this.passwordStrength.level = 'strong';
      }
      
      return this.passwordStrength;
    } catch (error) {
      console.error('Error evaluating password strength:', error);
      return { score: 0, level: 'weak', requirements: {} };
    }
  },

  // Logout
  logout() {
    try {
      REMEEX_PERSISTENCE.saveBalanceData();
      REMEEX_PERSISTENCE.saveTransactionsData();
      REMEEX_PERSISTENCE.saveVerificationData();
      REMEEX_PERSISTENCE.saveCardData();
      REMEEX_PERSISTENCE.saveUserData();
      
      REMEEX_PERSISTENCE.clearSessionData();
      
      if (REMEEX_GLOBALS.inactivityTimer) clearTimeout(REMEEX_GLOBALS.inactivityTimer);
      if (REMEEX_GLOBALS.inactivityCountdown) clearInterval(REMEEX_GLOBALS.inactivityCountdown);
      
      if (REMEEX_GLOBALS.statusEvolution) {
        REMEEX_GLOBALS.statusEvolution.destroy();
        REMEEX_GLOBALS.statusEvolution = null;
      }
      
      document.querySelectorAll('.modal-overlay, .verification-container, .success-container, .inactivity-modal, .welcome-modal').forEach(modal => {
        modal.style.display = 'none';
      });
      
      this.showLoginForm();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Mostrar formulario de login
  showLoginForm() {
    try {
      const loginContainer = document.getElementById('login-container');
      const appHeader = document.getElementById('app-header');
      const dashboardContainer = document.getElementById('dashboard-container');
      const bottomNav = document.getElementById('bottom-nav');
      const rechargeContainer = document.getElementById('recharge-container');
      
      if (loginContainer) loginContainer.style.display = 'flex';
      if (appHeader) appHeader.style.display = 'none';
      if (dashboardContainer) dashboardContainer.style.display = 'none';
      if (bottomNav) bottomNav.style.display = 'none';
      if (rechargeContainer) rechargeContainer.style.display = 'none';
      
      // Mostrar el formulario apropiado (wizard o login)
      this.showAppropriateForm();
    } catch (error) {
      console.error('Error showing login form:', error);
    }
  }
};

console.log('✅ AUTH.js cargado correctamente - Sistema de Login ACTUALIZADO PARA WIZARD');