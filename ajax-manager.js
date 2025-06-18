// ============================================================================
// REMEEX VISA Banking - Sistema AJAX Manager
// Versión: 4.2 - COMUNICACIÓN ENTRE PÁGINAS
// ============================================================================

"use strict";

class AjaxManager {
  constructor() {
    this.baseUrl = window.location.origin;
    this.sessionKey = 'remeexAjaxSession';
    this.pendingRequests = new Map();
    this.retryAttempts = 3;
    this.timeout = 10000; // 10 segundos
    
    this.initializeSession();
  }

  // Inicializar sesión AJAX
  initializeSession() {
    const sessionData = {
      timestamp: Date.now(),
      deviceId: REMEEX_GLOBALS.currentUser.deviceId,
      sessionId: this.generateSessionId()
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
  }

  generateSessionId() {
    return 'ajax_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  // MÉTODO PRINCIPAL: Enviar datos a página externa
  async sendToExternalPage(targetPage, data, options = {}) {
    try {
      const requestId = this.generateRequestId();
      const payload = this.preparePayload(data, targetPage);
      
      // Guardar datos para la página de destino
      await this.storeDataForTarget(targetPage, payload);
      
      // Configurar callback de retorno
      this.setupReturnCallback(requestId, options.onReturn);
      
      // Navegar a la página
      this.navigateToPage(targetPage, requestId);
      
      return { success: true, requestId };
    } catch (error) {
      console.error('Error sending to external page:', error);
      return { success: false, error: error.message };
    }
  }

  // Preparar payload con datos del usuario
  preparePayload(data, targetPage) {
    const { currentUser, verificationStatus } = REMEEX_GLOBALS;
    
    const basePayload = {
      timestamp: Date.now(),
      deviceId: currentUser.deviceId,
      targetPage: targetPage,
      userData: {
        name: currentUser.name,
        email: currentUser.email,
        balance: { ...currentUser.balance },
        hasVerification: verificationStatus.status !== 'unverified'
      },
      exchangeRate: CONFIG.EXCHANGE_RATES.USD_TO_BS,
      sessionData: JSON.parse(sessionStorage.getItem(this.sessionKey))
    };

    return { ...basePayload, ...data };
  }

  // Almacenar datos para página de destino
  async storeDataForTarget(targetPage, payload) {
    const storageKey = `remeex_${targetPage}_data`;
    
    try {
      // Usar múltiples métodos de storage para redundancia
      localStorage.setItem(storageKey, JSON.stringify(payload));
      sessionStorage.setItem(storageKey + '_session', JSON.stringify(payload));
      
      // Almacenamiento temporal con expiración
      const expiredData = {
        ...payload,
        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutos
      };
      
      localStorage.setItem(storageKey + '_temp', JSON.stringify(expiredData));
      
      return true;
    } catch (error) {
      console.error('Error storing data for target:', error);
      return false;
    }
  }

  // Configurar callback de retorno
  setupReturnCallback(requestId, callback) {
    if (callback && typeof callback === 'function') {
      const callbackKey = `remeex_callback_${requestId}`;
      
      // Almacenar referencia al callback
      window[callbackKey] = callback;
      localStorage.setItem('remeex_active_callback', callbackKey);
    }
  }

  // Navegar a página con parámetros
  navigateToPage(targetPage, requestId) {
    const url = new URL(`${targetPage}.html`, this.baseUrl);
    url.searchParams.set('from', 'remeex_main');
    url.searchParams.set('requestId', requestId);
    url.searchParams.set('timestamp', Date.now());
    
    window.location.href = url.toString();
  }

  generateRequestId() {
    return 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }

  // MÉTODO: Recibir datos de retorno
  async receiveReturnData() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const returnData = this.extractReturnData(urlParams);
      
      if (returnData) {
        await this.processReturnData(returnData);
        this.executeCallback(returnData);
        this.cleanupReturnData();
        return returnData;
      }
      
      return null;
    } catch (error) {
      console.error('Error receiving return data:', error);
      return null;
    }
  }

  extractReturnData(urlParams) {
    const sources = [
      () => this.getDataFromUrl(urlParams),
      () => this.getDataFromStorage('remeex_return_data'),
      () => this.getDataFromStorage('remeex_transfer_result'),
      () => this.getDataFromStorage('remeex_validation_result')
    ];

    for (const source of sources) {
      try {
        const data = source();
        if (data) return data;
      } catch (error) {
        console.warn('Error extracting from source:', error);
      }
    }

    return null;
  }

  getDataFromUrl(urlParams) {
    if (urlParams.get('from') === 'transfer' || urlParams.get('from') === 'validation') {
      return {
        source: urlParams.get('from'),
        success: urlParams.get('success') === 'true',
        amount: parseFloat(urlParams.get('amount')) || 0,
        reference: urlParams.get('reference'),
        timestamp: parseInt(urlParams.get('timestamp')) || Date.now()
      };
    }
    return null;
  }

  getDataFromStorage(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async processReturnData(returnData) {
    const { currentUser } = REMEEX_GLOBALS;

    try {
      if (returnData.source === 'transfer' && returnData.success) {
        // Procesar transferencia exitosa
        const transaction = {
          id: 'TR_' + Date.now(),
          type: 'withdraw',
          amount: returnData.amount,
          amountBs: returnData.amount * CONFIG.EXCHANGE_RATES.USD_TO_BS,
          date: REMEEX_UTILS.getCurrentDateTime(),
          description: `Retiro - ${returnData.destination || 'Transferencia'}`,
          reference: returnData.reference,
          status: 'completed',
          balanceBefore: currentUser.balance.bs,
          balanceAfter: currentUser.balance.bs - (returnData.amount * CONFIG.EXCHANGE_RATES.USD_TO_BS)
        };

        // Actualizar balance
        currentUser.balance.bs -= transaction.amountBs;
        REMEEX_UTILS.calculateCurrencyEquivalents();

        // Agregar transacción
        if (window.REMEEX_PAYMENTS) {
          window.REMEEX_PAYMENTS.addTransaction(transaction);
        }

        // Guardar cambios
        REMEEX_PERSISTENCE.saveBalanceData();
        REMEEX_PERSISTENCE.saveTransactionsData();

      } else if (returnData.source === 'validation' && returnData.success) {
        // Procesar validación exitosa
        const { verificationStatus } = REMEEX_GLOBALS;
        
        verificationStatus.status = 'bank_validated';
        localStorage.setItem('remeexBankValidationData', JSON.stringify(returnData));
        
        REMEEX_PERSISTENCE.saveVerificationData();
      }

      return true;
    } catch (error) {
      console.error('Error processing return data:', error);
      return false;
    }
  }

  executeCallback(returnData) {
    try {
      const callbackKey = localStorage.getItem('remeex_active_callback');
      
      if (callbackKey && window[callbackKey]) {
        window[callbackKey](returnData);
        delete window[callbackKey];
        localStorage.removeItem('remeex_active_callback');
      }
    } catch (error) {
      console.error('Error executing callback:', error);
    }
  }

  cleanupReturnData() {
    try {
      // Limpiar URL
      const url = new URL(window.location);
      url.search = '';
      window.history.replaceState({}, document.title, url.toString());

      // Limpiar storage
      const keysToClean = [
        'remeex_return_data',
        'remeex_transfer_result', 
        'remeex_validation_result',
        'remeex_active_callback'
      ];

      keysToClean.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error cleaning up return data:', error);
    }
  }

  // MÉTODO: Verificar conexión con página externa
  async pingExternalPage(targetPage) {
    try {
      const response = await fetch(`${targetPage}.html`, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      return response.ok;
    } catch (error) {
      console.warn(`Cannot reach ${targetPage}.html:`, error);
      return false;
    }
  }

  // MÉTODO: Sincronizar datos periódicamente
  startDataSync(interval = 30000) {
    setInterval(() => {
      this.syncWithExternalPages();
    }, interval);
  }

  async syncWithExternalPages() {
    try {
      // Verificar si hay datos de retorno pendientes
      const returnData = await this.receiveReturnData();
      
      if (returnData) {
        console.log('📥 Datos sincronizados desde página externa:', returnData);
        
        // Actualizar UI si está disponible
        if (window.REMEEX_UI) {
          window.REMEEX_UI.updateDashboardUI();
        }
      }
    } catch (error) {
      console.error('Error syncing with external pages:', error);
    }
  }
}

// Instancia global
window.REMEEX_AJAX = new AjaxManager();

console.log('✅ AJAX-MANAGER.js cargado correctamente');