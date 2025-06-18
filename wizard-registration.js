// ============================================================================
// REMEEX VISA Banking - Sistema de Registro Wizard
// Versión: 4.2 (Modular) - WIZARD MULTI-PASO
// ============================================================================

"use strict";

window.REMEEX_WIZARD = {
  currentStep: 1,
  totalSteps: 5,
  wizardData: {},

  // Inicializar wizard
  init() {
    this.setupWizardNavigation();
    this.setupFormValidation();
    this.setupCardCustomization();
    this.updateProgress();
  },

  // Configurar navegación del wizard
  setupWizardNavigation() {
    // Botones continuar
    for (let i = 1; i <= this.totalSteps; i++) {
      const continueBtn = document.getElementById(`wizard-continue-${i}`);
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.validateAndContinue(i);
        });
      }

      const backBtn = document.getElementById(`wizard-back-${i}`);
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          this.goToStep(i - 1);
        });
      }
    }

    // Botón completar
    const completeBtn = document.getElementById('wizard-complete');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        this.completeRegistration();
      });
    }

    // Reenvío de código
    const resendBtn = document.getElementById('resend-verification-code');
    if (resendBtn) {
      resendBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resendVerificationCode();
      });
    }
  },

  // Configurar validación de formularios
  setupFormValidation() {
    // Paso 1: Validación de contraseña en tiempo real
    const passwordInput = document.getElementById('wizard-password');
    const confirmPasswordInput = document.getElementById('wizard-confirm-password');

    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        this.updatePasswordStrength(e.target.value);
        if (confirmPasswordInput.value) {
          this.validatePasswordMatch();
        }
      });
    }

    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        this.validatePasswordMatch();
      });
    }

    // Paso 2: País y notificación de moneda
    const countrySelect = document.getElementById('wizard-country');
    if (countrySelect) {
      countrySelect.addEventListener('change', (e) => {
        this.handleCountrySelection(e.target.value);
      });
    }

    // Toggles de contraseña
    this.setupPasswordToggles();
  },

  // Configurar personalización de tarjeta
  setupCardCustomization() {
    // Estilos de tarjeta
    const styleOptions = document.querySelectorAll('.card-style-option');
    styleOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.selectCardStyle(option.dataset.style);
      });
    });
  },

  // Validar y continuar al siguiente paso
  validateAndContinue(currentStep) {
    if (this.validateStep(currentStep)) {
      this.saveStepData(currentStep);
      
      if (currentStep < this.totalSteps) {
        this.goToStep(currentStep + 1);
      }
    }
  },

  // Validar paso específico
  validateStep(step) {
    switch (step) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      case 4:
        return this.validateStep4();
      case 5:
        return this.validateStep5();
      default:
        return true;
    }
  },

  // Validar paso 1 (Información personal)
  validateStep1() {
    const name = document.getElementById('wizard-name');
    const email = document.getElementById('wizard-email');
    const password = document.getElementById('wizard-password');
    const confirmPassword = document.getElementById('wizard-confirm-password');

    let isValid = true;

    // Limpiar errores previos
    this.clearStepErrors(1);

    // Validar nombre
    if (!name.value || !REMEEX_UTILS.validators.validateName(name.value)) {
      this.showError('wizard-name-error', 'Por favor, introduce tu nombre completo y apellidos (mínimo 2 nombres).');
      isValid = false;
    }

    // Validar email
    if (!email.value || !email.value.includes('@')) {
      this.showError('wizard-email-error', 'Por favor, introduce un correo electrónico válido.');
      isValid = false;
    }

    // Validar contraseña
    const passwordStrength = this.evaluatePasswordStrength(password.value);
    if (!password.value || passwordStrength.score < 3) {
      this.showError('wizard-password-error', 'La contraseña debe ser al menos "buena" (cumplir 3+ requisitos).');
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (password.value !== confirmPassword.value) {
      this.showError('wizard-confirm-password-error', 'Las contraseñas no coinciden.');
      isValid = false;
    }

    return isValid;
  },

  // Validar paso 2 (Seguridad y país)
  validateStep2() {
    const securityQuestion = document.querySelector('input[name="security-question"]:checked');
    const securityAnswer = document.getElementById('security-answer');
    const country = document.getElementById('wizard-country');

    let isValid = true;

    this.clearStepErrors(2);

    if (!securityQuestion) {
      REMEEX_UTILS.showToast('error', 'Error', 'Por favor, seleccione una pregunta de seguridad.');
      isValid = false;
    }

    if (!securityAnswer.value || securityAnswer.value.length < 2) {
      this.showError('security-answer-error', 'Por favor, proporcione una respuesta válida.');
      isValid = false;
    }

    if (!country.value) {
      this.showError('wizard-country-error', 'Por favor, seleccione su país de residencia.');
      isValid = false;
    }

    return isValid;
  },

  // Validar paso 3 (Personalización de tarjeta)
  validateStep3() {
    // Paso 3 siempre es válido ya que tiene valores por defecto
    return true;
  },

  // Validar paso 4 (Configuración Zelle)
  validateStep4() {
    // Paso 4 siempre es válido ya que es informativo
    return true;
  },

  // Validar paso 5 (Código de verificación)
  validateStep5() {
    const verificationCode = document.getElementById('verification-code');

    this.clearStepErrors(5);

    if (!verificationCode.value || verificationCode.value.length !== 20) {
      this.showError('verification-code-error', 'Por favor, ingrese el código completo de 20 dígitos.');
      return false;
    }

    // Validar que sea el código correcto (en este caso, el CONFIG.LOGIN_CODE)
    if (verificationCode.value !== CONFIG.LOGIN_CODE) {
      this.showError('verification-code-error', 'El código ingresado no es correcto. Verifique e intente nuevamente.');
      return false;
    }

    return true;
  },

  // Ir a paso específico
  goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > this.totalSteps) return;

    // Ocultar paso actual
    const currentStepEl = document.getElementById(`wizard-step-${this.currentStep}`);
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
    }

    // Mostrar nuevo paso
    const newStepEl = document.getElementById(`wizard-step-${stepNumber}`);
    if (newStepEl) {
      newStepEl.classList.add('active');
    }

    // Actualizar indicadores de paso
    this.updateStepIndicators(stepNumber);

    // Actualizar progreso
    this.currentStep = stepNumber;
    this.updateProgress();

    // Ejecutar acciones específicas del paso
    this.onStepChange(stepNumber);
  },

  // Actualizar indicadores de paso
  updateStepIndicators(stepNumber) {
    const indicators = document.querySelectorAll('.wizard-step');
    indicators.forEach((indicator, index) => {
      const step = index + 1;
      indicator.classList.remove('active', 'completed');
      
      if (step === stepNumber) {
        indicator.classList.add('active');
      } else if (step < stepNumber) {
        indicator.classList.add('completed');
      }
    });
  },

  // Actualizar barra de progreso
  updateProgress() {
    const progressFill = document.getElementById('wizard-progress-fill');
    if (progressFill) {
      const percentage = (this.currentStep / this.totalSteps) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  },

  // Acciones al cambiar de paso
  onStepChange(stepNumber) {
    switch (stepNumber) {
      case 3:
        this.generateCardNameOptions();
        this.updateCardPreview();
        break;
      case 4:
        this.updateZelleConfiguration();
        break;
      case 5:
        this.updateVerificationDisplay();
        break;
    }
  },

  // Guardar datos del paso
  saveStepData(step) {
    switch (step) {
      case 1:
        this.wizardData.name = document.getElementById('wizard-name').value;
        this.wizardData.email = document.getElementById('wizard-email').value;
        this.wizardData.password = document.getElementById('wizard-password').value;
        break;
      case 2:
        this.wizardData.securityQuestion = document.querySelector('input[name="security-question"]:checked').value;
        this.wizardData.securityAnswer = document.getElementById('security-answer').value;
        this.wizardData.country = document.getElementById('wizard-country').value;
        break;
      case 3:
        this.wizardData.cardStyle = document.querySelector('.card-style-option.active').dataset.style;
        this.wizardData.cardName = document.querySelector('.name-option.active')?.dataset.name || this.wizardData.name;
        break;
      case 4:
        // Datos de Zelle ya configurados
        break;
      case 5:
        this.wizardData.verificationCode = document.getElementById('verification-code').value;
        break;
    }
  },

  // Generar opciones de nombre para tarjeta
  generateCardNameOptions() {
    const nameOptionsContainer = document.getElementById('name-options');
    if (!nameOptionsContainer) return;

    const fullName = this.wizardData.name;
    const nameParts = fullName.split(' ');
    
    if (nameParts.length < 2) return;

    const options = [];
    
    // Opción 1: Primer nombre + Primer apellido
    if (nameParts.length >= 2) {
      options.push(`${nameParts[0]} ${nameParts[1]}`);
    }
    
    // Opción 2: Primer nombre + Inicial segundo nombre + Primer apellido
    if (nameParts.length >= 3) {
      options.push(`${nameParts[0]} ${nameParts[1].charAt(0)} ${nameParts[2]}`);
    }
    
    // Opción 3: Segundo nombre + Primer apellido + Inicial segundo apellido
    if (nameParts.length >= 4) {
      options.push(`${nameParts[1]} ${nameParts[2]} ${nameParts[3].charAt(0)}.`);
    }
    
    // Opción 4: Nombre completo (si cabe)
    if (fullName.length <= 26) {
      options.push(fullName);
    }

    nameOptionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
      const optionEl = document.createElement('div');
      optionEl.className = `name-option ${index === 0 ? 'active' : ''}`;
      optionEl.dataset.name = option;
      optionEl.innerHTML = `
        <input type="radio" id="name-option-${index}" name="card-name" value="${option}" ${index === 0 ? 'checked' : ''}>
        <label for="name-option-${index}">${option}</label>
      `;
      
      optionEl.addEventListener('click', () => {
        document.querySelectorAll('.name-option').forEach(opt => opt.classList.remove('active'));
        optionEl.classList.add('active');
        optionEl.querySelector('input').checked = true;
        this.updateCardPreview();
      });
      
      nameOptionsContainer.appendChild(optionEl);
    });
  },

  // Seleccionar estilo de tarjeta
  selectCardStyle(style) {
    document.querySelectorAll('.card-style-option').forEach(option => {
      option.classList.remove('active');
    });
    
    document.querySelector(`[data-style="${style}"]`).classList.add('active');
    this.updateCardPreview();
  },

  // Actualizar vista previa de tarjeta
  updateCardPreview() {
    const card = document.getElementById('virtual-card');
    const cardBackground = card.querySelector('.card-background');
    const cardHolder = document.getElementById('virtual-card-holder');
    const cardExpiry = document.getElementById('virtual-card-expiry');

    // Actualizar estilo
    const activeStyle = document.querySelector('.card-style-option.active');
    if (activeStyle && cardBackground) {
      cardBackground.className = `card-background ${activeStyle.dataset.style}`;
    }

    // Actualizar nombre
    const activeName = document.querySelector('.name-option.active');
    if (activeName && cardHolder) {
      cardHolder.textContent = activeName.dataset.name.toUpperCase();
    }

    // Actualizar fecha de expiración
    if (cardExpiry) {
      const currentDate = new Date();
      const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
      cardExpiry.textContent = `${currentMonth}/32`;
    }
  },

  // Manejar selección de país
  handleCountrySelection(country) {
    const notification = document.getElementById('currency-notification');
    
    if (country === 'venezuela') {
      if (notification) {
        notification.style.display = 'flex';
        setTimeout(() => {
          notification.style.opacity = '1';
        }, 100);
      }
    } else {
      if (notification) {
        notification.style.display = 'none';
      }
    }
  },

  // Actualizar configuración de Zelle
  updateZelleConfiguration() {
    const zelleNameDisplay = document.getElementById('zelle-name-display');
    const zelleEmailDisplay = document.getElementById('zelle-email-display');

    if (zelleNameDisplay) {
      zelleNameDisplay.textContent = this.wizardData.name;
    }

    if (zelleEmailDisplay) {
      zelleEmailDisplay.textContent = this.wizardData.email;
    }
  },

  // Actualizar display de verificación
  updateVerificationDisplay() {
    const verificationEmailDisplay = document.getElementById('verification-email-display');
    
    if (verificationEmailDisplay) {
      verificationEmailDisplay.textContent = this.wizardData.email;
    }
  },

  // Completar registro
  completeRegistration() {
    if (!this.validateStep(5)) return;

    this.saveStepData(5);

    // Guardar datos en globals y persistencia
    const { registrationData } = REMEEX_GLOBALS;
    
    Object.assign(registrationData, {
      name: this.wizardData.name,
      email: this.wizardData.email,
      password: this.wizardData.password,
      securityQuestion: this.wizardData.securityQuestion,
      securityAnswer: this.wizardData.securityAnswer,
      country: this.wizardData.country,
      cardStyle: this.wizardData.cardStyle,
      cardName: this.wizardData.cardName,
      isRegistered: true,
      registrationDate: new Date().toISOString(),
      hasZelleAccount: true,
      verificationCode: this.wizardData.verificationCode
    });

    // Guardar en localStorage
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_REGISTRATION, JSON.stringify(registrationData));
    localStorage.setItem(CONFIG.STORAGE_KEYS.IS_REGISTERED, 'true');

    // Mostrar modal de éxito
    this.showCompletionModal();
  },

  // Mostrar modal de finalización
  showCompletionModal() {
    const modal = document.getElementById('registration-complete-modal');
    if (modal) {
      modal.style.display = 'flex';
      
      // Animación de confetti
      if (typeof confetti !== 'undefined') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 500);
      }

      const completeBtn = document.getElementById('complete-registration-btn');
      if (completeBtn) {
        completeBtn.addEventListener('click', () => {
          this.finalizeRegistration();
        });
      }
    }
  },

  // Finalizar registro y mostrar login
  finalizeRegistration() {
    const modal = document.getElementById('registration-complete-modal');
    const wizardCard = document.getElementById('wizard-registration-card');
    const loginCard = document.getElementById('login-card');

    if (modal) modal.style.display = 'none';
    if (wizardCard) wizardCard.style.display = 'none';
    if (loginCard) loginCard.style.display = 'block';

    // Configurar login personalizado
    if (window.REMEEX_AUTH) {
      REMEEX_AUTH.setupPersonalizedLogin();
    }

    REMEEX_UTILS.showToast('success', '¡Bienvenido!', 'Su cuenta ha sido creada exitosamente. Ahora puede iniciar sesión con sus credenciales.', 5000);
  },

  // Reenviar código de verificación
  resendVerificationCode() {
    REMEEX_UTILS.showToast('success', 'Código Reenviado', `Hemos enviado nuevamente el código de verificación a ${this.wizardData.email}`);
  },

  // Utilidades de validación
  updatePasswordStrength(password) {
    const strength = this.evaluatePasswordStrength(password);
    const strengthFill = document.getElementById('wizard-password-strength-fill');
    const strengthText = document.getElementById('wizard-password-strength-text');

    if (!password) {
      if (strengthFill) {
        strengthFill.className = 'password-strength-fill';
        strengthFill.style.width = '0%';
      }
      if (strengthText) {
        strengthText.textContent = 'Introduce una contraseña';
        strengthText.className = 'password-strength-text';
      }
      return;
    }

    if (strengthFill) {
      strengthFill.className = `password-strength-fill ${strength.level}`;
      strengthFill.style.width = `${(strength.score / 4) * 100}%`;
    }

    if (strengthText) {
      const levelTexts = {
        weak: 'Contraseña débil',
        fair: 'Contraseña regular',
        good: 'Contraseña buena',
        strong: 'Contraseña muy segura'
      };

      strengthText.textContent = levelTexts[strength.level];
      strengthText.className = `password-strength-text ${strength.level}`;
    }
  },

  evaluatePasswordStrength(password) {
    if (!password) return { score: 0, level: 'weak' };

    const requirements = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;

    let score, level;
    if (metRequirements <= 1) {
      score = 1;
      level = 'weak';
    } else if (metRequirements === 2) {
      score = 2;
      level = 'fair';
    } else if (metRequirements === 3 || metRequirements === 4) {
      score = 3;
      level = 'good';
    } else if (metRequirements === 5) {
      score = 4;
      level = 'strong';
    }

    return { score, level, requirements };
  },

  validatePasswordMatch() {
    const password = document.getElementById('wizard-password');
    const confirmPassword = document.getElementById('wizard-confirm-password');
    const errorEl = document.getElementById('wizard-confirm-password-error');

    if (confirmPassword.value && password.value !== confirmPassword.value) {
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.textContent = 'Las contraseñas no coinciden.';
      }
      return false;
    } else {
      if (errorEl) {
        errorEl.style.display = 'none';
      }
      return true;
    }
  },

  setupPasswordToggles() {
    const toggles = [
      { toggle: 'wizard-password-toggle', input: 'wizard-password' },
      { toggle: 'wizard-confirm-password-toggle', input: 'wizard-confirm-password' }
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
  },

  // Utilidades de UI
  showError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  },

  clearStepErrors(step) {
    const stepContainer = document.getElementById(`wizard-step-${step}`);
    if (stepContainer) {
      const errors = stepContainer.querySelectorAll('.error-message');
      errors.forEach(error => {
        error.style.display = 'none';
      });
    }
  }
};

console.log('✅ WIZARD-REGISTRATION.js cargado correctamente');