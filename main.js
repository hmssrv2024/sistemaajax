// ============================================================================
// REMEEX VISA Banking - Inicialización Principal
// Versión: 4.2 (Modular) - SOLUCIÓN INTEGRAL
// ============================================================================

"use strict";

// Sistema principal de inicialización mejorado
window.REMEEX_MAIN = {
  initialized: false,
  initializationPhase: 0,
  maxRetries: 3,
  currentRetry: 0,

  // Inicializar aplicación completa
  async initializeApp() {
    if (this.initialized) return;
    
    this.currentRetry++;
    console.log(`🚀 Iniciando REMEEX VISA Banking - Versión 4.2 (Intento ${this.currentRetry}/${this.maxRetries})...`);
    
    try {
      // FASE 1: Verificar módulos base
      this.initializationPhase = 1;
      await this.waitForBaseModules();
      
      // FASE 2: Verificar módulos principales
      this.initializationPhase = 2;
      await this.waitForMainModules();
      
      // FASE 3: Verificar módulos específicos
      this.initializationPhase = 3;
      await this.waitForSpecificModules();
      
      // FASE 4: Inicialización completa
      this.initializationPhase = 4;
      await this.performFullInitialization();
      
      this.initialized = true;
      console.log('✅ REMEEX VISA Banking inicializado correctamente');
      console.log('📊 Estadísticas del sistema:', this.getSystemStats());
      
    } catch (error) {
      console.error('❌ Error durante la inicialización:', error);
      this.handleInitializationError(error);
    }
  },

  // FASE 1: Esperar módulos base
  async waitForBaseModules() {
    const baseModules = ['CONFIG', 'REMEEX_GLOBALS', 'REMEEX_UTILS'];
    await this.waitForModules(baseModules, 'módulos base', 5000);
    console.log('✅ Módulos base cargados');
  },

  // FASE 2: Esperar módulos principales
  async waitForMainModules() {
    const mainModules = ['REMEEX_PERSISTENCE', 'REMEEX_AUTH', 'REMEEX_UI'];
    await this.waitForModules(mainModules, 'módulos principales', 10000);
    console.log('✅ Módulos principales cargados');
  },

  // FASE 3: Esperar módulos específicos
  async waitForSpecificModules() {
    const specificModules = ['REMEEX_EVENTS', 'REMEEX_PAYMENTS', 'REMEEX_EVOLUTION', 'REMEEX_INACTIVITY'];
    await this.waitForModulesOptional(specificModules, 'módulos específicos', 8000);
    console.log('✅ Módulos específicos verificados');
  },

  // Función genérica para esperar módulos con timeout
  async waitForModules(moduleList, description, timeout = 10000) {
    let attempts = 0;
    const maxAttempts = timeout / 50; // 50ms por intento
    
    while (attempts < maxAttempts) {
      const missing = moduleList.filter(module => !window[module]);
      
      if (missing.length === 0) {
        return true;
      }
      
      if (attempts % 40 === 0) { // Log cada 2 segundos
        console.log(`⏳ Esperando ${description}: ${missing.join(', ')}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    
    const missing = moduleList.filter(module => !window[module]);
    throw new Error(`Timeout esperando ${description}. Faltantes: ${missing.join(', ')}`);
  },

  // Función para esperar módulos opcionales (no bloquean la inicialización)
  async waitForModulesOptional(moduleList, description, timeout = 8000) {
    let attempts = 0;
    const maxAttempts = timeout / 50;
    
    while (attempts < maxAttempts) {
      const missing = moduleList.filter(module => !window[module]);
      
      if (missing.length === 0) {
        return true;
      }
      
      if (attempts % 40 === 0) {
        console.log(`⏳ Esperando ${description}: ${missing.join(', ')}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 50));
      attempts++;
    }
    
    // Para módulos opcionales, solo advertir pero no fallar
    const missing = moduleList.filter(module => !window[module]);
    if (missing.length > 0) {
      console.warn(`⚠️ Algunos ${description} no están disponibles: ${missing.join(', ')}`);
    }
    
    return true;
  },

  // FASE 4: Realizar inicialización completa
  async performFullInitialization() {
    // 1. Configurar dispositivo
    this.setupDevice();
    
    // 2. Cargar estado de la aplicación
    await this.loadAppState();
    
    // 3. Configurar interfaz inicial
    this.setupInitialUI();
    
    // 4. Configurar sistemas
    this.setupSystems();
    
    // 5. Configurar eventos
    this.setupEvents();
    
    // 6. Verificar sesión existente
    this.checkExistingSession();
    
    // 7. Inicializar servicios externos
    this.initializeExternalServices();
    
    // 8. Configurar actualizaciones periódicas
    this.setupPeriodicUpdates();
  },

  // Configurar dispositivo
  setupDevice() {
    try {
      const { currentUser } = REMEEX_GLOBALS;
      if (!currentUser.deviceId) {
        currentUser.deviceId = REMEEX_UTILS.generateDeviceId();
      }
      console.log('📱 Dispositivo configurado:', currentUser.deviceId);
    } catch (error) {
      console.error('Error setting up device:', error);
    }
  },

  // Cargar estado de la aplicación
  async loadAppState() {
    try {
      // Verificar si el usuario está registrado
      if (window.REMEEX_AUTH && typeof REMEEX_AUTH.checkRegistrationStatus === 'function') {
        if (REMEEX_AUTH.checkRegistrationStatus()) {
          // Cargar datos persistentes
          if (window.REMEEX_PERSISTENCE) {
            if (REMEEX_PERSISTENCE.loadBalanceData) REMEEX_PERSISTENCE.loadBalanceData();
            if (REMEEX_PERSISTENCE.loadTransactionsData) REMEEX_PERSISTENCE.loadTransactionsData();
            if (REMEEX_PERSISTENCE.loadVerificationData) REMEEX_PERSISTENCE.loadVerificationData();
            if (REMEEX_PERSISTENCE.loadCardData) REMEEX_PERSISTENCE.loadCardData();
            if (REMEEX_PERSISTENCE.loadFirstRechargeStatus) REMEEX_PERSISTENCE.loadFirstRechargeStatus();
          }
          
          // Calcular equivalentes de moneda
          if (window.REMEEX_UTILS && REMEEX_UTILS.calculateCurrencyEquivalents) {
            REMEEX_UTILS.calculateCurrencyEquivalents();
          }
          
          console.log('💾 Estado de la aplicación cargado');
        }
      }
    } catch (error) {
      console.error('Error loading app state:', error);
    }
  },

  // Configurar interfaz inicial
  setupInitialUI() {
    try {
      if (window.REMEEX_UI) {
        if (REMEEX_UI.updateDateDisplay) REMEEX_UI.updateDateDisplay();
        if (REMEEX_UI.updateOnlineUsersCount) REMEEX_UI.updateOnlineUsersCount();
        if (REMEEX_UI.updateExchangeRateDisplays) REMEEX_UI.updateExchangeRateDisplays();
      }
      
      if (window.REMEEX_AUTH && REMEEX_AUTH.showAppropriateForm) {
        REMEEX_AUTH.showAppropriateForm();
      }
      
      console.log('🎨 Interfaz inicial configurada');
    } catch (error) {
      console.error('Error setting up initial UI:', error);
    }
  },

  // Configurar sistemas
  setupSystems() {
    try {
      // Sistema de inactividad
      if (window.REMEEX_INACTIVITY && REMEEX_INACTIVITY.setupInactivityHandler) {
        REMEEX_INACTIVITY.setupInactivityHandler();
      }
      
      // Limpiar datos corruptos si existen
      this.cleanupCorruptedData();
      
      console.log('⚙️ Sistemas configurados');
    } catch (error) {
      console.error('Error setting up systems:', error);
    }
  },

  // Configurar eventos
  setupEvents() {
    try {
      if (window.REMEEX_EVENTS && typeof REMEEX_EVENTS.setupEventListeners === 'function') {
        REMEEX_EVENTS.setupEventListeners();
        console.log('🔗 Eventos configurados correctamente');
      } else {
        console.warn('⚠️ REMEEX_EVENTS no disponible, configurando eventos básicos');
        this.setupBasicEvents();
      }
      
      // Evento para detectar retorno de transferencias
      this.checkReturnFromTransfer();
      
    } catch (error) {
      console.error('Error setting up events:', error);
      this.setupBasicEvents();
    }
  },

  // Eventos básicos como respaldo
  setupBasicEvents() {
    try {
      // Event delegation básico para funcionalidad crítica
      document.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.id;
        
        // Logout buttons
        if (id === 'logout-btn' || id === 'logout-header-btn') {
          if (confirm('¿Está seguro que desea cerrar sesión?')) {
            if (window.REMEEX_AUTH && REMEEX_AUTH.logout) {
              REMEEX_AUTH.logout();
            }
          }
          return;
        }
        
        // Recharge buttons
        if (id === 'recharge-btn' || id === 'quick-recharge') {
          const dashboardContainer = document.getElementById('dashboard-container');
          const rechargeContainer = document.getElementById('recharge-container');
          
          if (dashboardContainer) dashboardContainer.style.display = 'none';
          if (rechargeContainer) rechargeContainer.style.display = 'block';
          
          if (window.REMEEX_UI && REMEEX_UI.updateSavedCardUI) {
            REMEEX_UI.updateSavedCardUI();
          }
          return;
        }
        
        // Back button from recharge
        if (id === 'recharge-back') {
          const rechargeContainer = document.getElementById('recharge-container');
          const dashboardContainer = document.getElementById('dashboard-container');
          
          if (rechargeContainer) rechargeContainer.style.display = 'none';
          if (dashboardContainer) dashboardContainer.style.display = 'block';
          return;
        }
        
        // Copy buttons
        if (target.closest('.copy-btn')) {
          const copyBtn = target.closest('.copy-btn');
          const textToCopy = copyBtn.getAttribute('data-copy');
          if (textToCopy && window.REMEEX_UI && REMEEX_UI.copyToClipboard) {
            REMEEX_UI.copyToClipboard(textToCopy);
          }
          return;
        }
      });
      
      // Formularios básicos
      document.addEventListener('submit', (e) => {
        if (e.target.id === 'registration-form') {
          e.preventDefault();
          if (window.REMEEX_EVENTS && REMEEX_EVENTS.handleRegistration) {
            REMEEX_EVENTS.handleRegistration();
          }
        }
        
        if (e.target.id === 'login-form') {
          e.preventDefault();
          if (window.REMEEX_AUTH && REMEEX_AUTH.handleEnhancedLogin) {
            REMEEX_AUTH.handleEnhancedLogin();
          }
        }
      });
      
      console.log('✅ Eventos básicos configurados como respaldo');
    } catch (error) {
      console.error('Error configurando eventos básicos:', error);
    }
  },

  // Verificar sesión existente
  checkExistingSession() {
    try {
      if (window.REMEEX_PERSISTENCE && REMEEX_PERSISTENCE.loadSessionData) {
        if (REMEEX_PERSISTENCE.loadSessionData()) {
          const { currentUser } = REMEEX_GLOBALS;
          
          // Cargar datos del usuario logueado
          if (REMEEX_PERSISTENCE.loadUserData) REMEEX_PERSISTENCE.loadUserData();
          if (REMEEX_PERSISTENCE.loadBalanceData) REMEEX_PERSISTENCE.loadBalanceData();
          if (REMEEX_PERSISTENCE.loadTransactionsData) REMEEX_PERSISTENCE.loadTransactionsData();
          if (REMEEX_PERSISTENCE.loadVerificationData) REMEEX_PERSISTENCE.loadVerificationData();
          if (REMEEX_PERSISTENCE.loadCardData) REMEEX_PERSISTENCE.loadCardData();
          if (REMEEX_PERSISTENCE.loadFirstRechargeStatus) REMEEX_PERSISTENCE.loadFirstRechargeStatus();
          
          // Actualizar UI
          if (window.REMEEX_UI) {
            if (REMEEX_UI.updateUserUI) REMEEX_UI.updateUserUI();
            if (REMEEX_UI.updateMobilePaymentInfo) REMEEX_UI.updateMobilePaymentInfo();
          }
          
          // Inicializar sistema evolutivo
          if (window.REMEEX_EVOLUTION && REMEEX_EVOLUTION.initializeEvolutionSystem) {
            setTimeout(() => {
              REMEEX_EVOLUTION.initializeEvolutionSystem();
            }, 500);
          }
          
          // Mostrar dashboard
          this.showDashboard();
          
          console.log('👤 Sesión existente restaurada');
        }
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  },

  // Inicializar servicios externos
  initializeExternalServices() {
    try {
      // Cargar Tawk.to después de un delay
      setTimeout(() => {
        this.loadTawkTo();
      }, 1000);
      
      console.log('🌐 Servicios externos iniciados');
    } catch (error) {
      console.error('Error initializing external services:', error);
    }
  },

  // Configurar actualizaciones periódicas
  setupPeriodicUpdates() {
    try {
      // Actualizar usuarios online cada minuto
      setInterval(() => {
        if (window.REMEEX_UI && REMEEX_UI.updateOnlineUsersCount) {
          REMEEX_UI.updateOnlineUsersCount();
        }
      }, 60000);
      
      // Verificar completación de verificaciones cada 30 segundos
      setInterval(() => {
        if (window.REMEEX_EVOLUTION && REMEEX_EVOLUTION.checkForVerificationCompletion) {
          REMEEX_EVOLUTION.checkForVerificationCompletion();
        }
      }, 30000);
      
      // Actualizar preview de cuenta cada 30 segundos (si está en login)
      setInterval(() => {
        if (window.REMEEX_AUTH && !REMEEX_UTILS.isLoggedIn() && REMEEX_AUTH.updateAccountPreviewRealistic) {
          REMEEX_AUTH.updateAccountPreviewRealistic();
        }
      }, 30000);
      
      console.log('🔄 Actualizaciones periódicas configuradas');
    } catch (error) {
      console.error('Error setting up periodic updates:', error);
    }
  },

  // Cargar Tawk.to
  loadTawkTo() {
    try {
      if (window.Tawk_API) return; // Ya cargado
      
      window.Tawk_API = window.Tawk_API || {};
      window.Tawk_LoadStart = new Date();
      
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://embed.tawk.to/6755320c4304e3196ae8c0b3/1ier3m8s5';
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      
      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      }
      
      console.log('💬 Tawk.to cargado');
    } catch (error) {
      console.error('Error loading Tawk.to:', error);
    }
  },

  // Mostrar dashboard
  showDashboard() {
    try {
      const loginContainer = document.getElementById('login-container');
      const appHeader = document.getElementById('app-header');
      const dashboardContainer = document.getElementById('dashboard-container');
      const bottomNav = document.getElementById('bottom-nav');
      
      if (loginContainer) loginContainer.style.display = 'none';
      if (appHeader) appHeader.style.display = 'flex';
      if (dashboardContainer) dashboardContainer.style.display = 'block';
      if (bottomNav) bottomNav.style.display = 'flex';
    } catch (error) {
      console.error('Error showing dashboard:', error);
    }
  },

  // Verificar retorno de transferencias
  checkReturnFromTransfer() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      if (urlParams.get('from') === 'transfer') {
        setTimeout(() => {
          if (window.REMEEX_UTILS && REMEEX_UTILS.showToast) {
            REMEEX_UTILS.showToast('info', 'Bienvenido de Nuevo', 'Está de vuelta en su cuenta principal.');
          }
          
          // Limpiar URL
          const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }, 1000);
      }
    } catch (error) {
      console.error('Error checking return from transfer:', error);
    }
  },

  // Limpiar datos corruptos
  cleanupCorruptedData() {
    try {
      if (!window.CONFIG) return;
      
      const keys = [
        CONFIG.STORAGE_KEYS.BALANCE,
        CONFIG.STORAGE_KEYS.TRANSACTIONS,
        CONFIG.STORAGE_KEYS.VERIFICATION,
        CONFIG.STORAGE_KEYS.CARD_DATA
      ];
      
      keys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            JSON.parse(data); // Verificar si es JSON válido
          }
        } catch (e) {
          console.warn(`Eliminando datos corruptos para ${key}`);
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up corrupted data:', error);
    }
  },

  // Obtener estadísticas del sistema
  getSystemStats() {
    try {
      const { currentUser, pendingTransactions } = REMEEX_GLOBALS;
      
      return {
        version: '4.2 (Modular)',
        userLoggedIn: window.REMEEX_UTILS ? REMEEX_UTILS.isLoggedIn() : false,
        deviceId: currentUser ? currentUser.deviceId : 'N/A',
        totalBalance: currentUser ? currentUser.balance.usd : 0,
        pendingTransactions: pendingTransactions ? pendingTransactions.length : 0,
        modulesLoaded: Object.keys(window).filter(key => key.startsWith('REMEEX_')).length,
        storageUsed: this.getStorageUsage(),
        initializationPhase: this.initializationPhase
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      return { error: 'Stats unavailable' };
    }
  },

  // Obtener uso de storage
  getStorageUsage() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length;
        }
      }
      return `${(total / 1024).toFixed(2)} KB`;
    } catch (error) {
      return 'No disponible';
    }
  },

  // Manejar error de inicialización
  handleInitializationError(error) {
    console.error('❌ Error crítico durante la inicialización:', error);
    
    // Si no hemos agotado los reintentos, intentar de nuevo
    if (this.currentRetry < this.maxRetries) {
      console.log(`🔄 Reintentando inicialización en 2 segundos... (${this.currentRetry}/${this.maxRetries})`);
      setTimeout(() => {
        this.initializeApp();
      }, 2000);
      return;
    }
    
    // Mostrar pantalla de error final
    this.showErrorScreen(error);
  },

  // Mostrar pantalla de error
  showErrorScreen(error) {
    const errorContainer = document.createElement('div');
    errorContainer.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        color: white;
        font-family: 'Segoe UI', Arial, sans-serif;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="max-width: 600px;">
          <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
          <h2 style="color: #ff4757; margin-bottom: 20px; font-size: 1.5rem;">
            Error de Inicialización
          </h2>
          <p style="margin-bottom: 20px; line-height: 1.5; color: #ddd;">
            Ha ocurrido un error al cargar la aplicación después de ${this.maxRetries} intentos.
          </p>
          <div style="margin-bottom: 20px; color: #ffa502;">
            <strong>Fase de error:</strong> ${this.initializationPhase}/4
          </div>
          <details style="margin-bottom: 20px; text-align: left; background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px;">
            <summary style="cursor: pointer; color: #ffa502; font-weight: bold;">Ver detalles técnicos</summary>
            <pre style="color: #ff6b6b; margin-top: 15px; font-size: 0.85rem; overflow: auto; white-space: pre-wrap;">${error.message}</pre>
          </details>
          <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
            <button onclick="location.reload()" style="
              background: #2f3542;
              color: white;
              border: none;
              padding: 15px 25px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              transition: all 0.2s;
              font-weight: bold;
            " onmouseover="this.style.background='#57606f'" onmouseout="this.style.background='#2f3542'">
              🔄 Recargar Página
            </button>
            <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload();" style="
              background: #ff4757;
              color: white;
              border: none;
              padding: 15px 25px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              transition: all 0.2s;
              font-weight: bold;
            " onmouseover="this.style.background='#ff3838'" onmouseout="this.style.background='#ff4757'">
              🗑️ Limpiar y Recargar
            </button>
          </div>
          <p style="margin-top: 25px; font-size: 0.9rem; color: #999; line-height: 1.4;">
            Si el problema persiste, contacte con soporte técnico a través de WhatsApp.
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
  }
};

// Función de inicialización diferida mejorada
function initializeWhenReady() {
  // Verificar estado del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitialization);
  } else {
    startInitialization();
  }
}

function startInitialization() {
  // Pequeño delay para asegurar que todos los scripts se carguen
  setTimeout(async () => {
    try {
      await window.REMEEX_MAIN.initializeApp();
    } catch (error) {
      console.error('Error during app initialization:', error);
      window.REMEEX_MAIN.handleInitializationError(error);
    }
  }, 150); // Aumentado ligeramente para dar más tiempo
}

// Inicializar cuando esté listo
initializeWhenReady();

console.log('✅ MAIN.js cargado correctamente - Sistema de Inicialización Integral');