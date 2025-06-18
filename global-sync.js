// ============================================================================
// REMEEX VISA Banking - SISTEMA DE SINCRONIZACIÓN GLOBAL UNIFICADO
// Versión: 4.2 - SINCRONIZACIÓN TOTAL DE DATOS
// ============================================================================

"use strict";

class GlobalSyncManager {
  constructor() {
    this.syncKey = 'remeex_global_sync';
    this.lockKey = 'remeex_sync_lock';
    this.versionKey = 'remeex_data_version';
    this.heartbeatInterval = 5000; // 5 segundos
    this.syncVersion = Date.now();
    this.isLocked = false;
    this.listeners = new Map();
    this.dataKeys = [
      'userData', 'balance', 'exchangeRates', 'verificationStatus',
      'transactions', 'deviceInfo', 'sessionData', 'appState'
    ];
    
    this.initializeGlobalSync();
  }

  // =================== INICIALIZACIÓN ===================
  initializeGlobalSync() {
    try {
      this.setupStorageListener();
      this.createGlobalDataStructure();
      this.startHeartbeat();
      this.setupCrossTabCommunication();
      this.registerGlobalAPI();
      
      console.log('🌐 Sistema de sincronización global inicializado');
    } catch (error) {
      console.error('Error initializing global sync:', error);
    }
  }

  createGlobalDataStructure() {
    const globalData = this.getGlobalData() || {};
    
    // Estructura unificada de datos
    const unifiedStructure = {
      // DATOS DEL USUARIO
      userData: {
        id: globalData.userData?.id || this.generateUserId(),
        name: globalData.userData?.name || '',
        email: globalData.userData?.email || '',
        deviceId: globalData.userData?.deviceId || this.generateDeviceId(),
        registrationDate: globalData.userData?.registrationDate || null,
        lastLoginDate: new Date().toISOString(),
        preferences: globalData.userData?.preferences || {
          currency: 'USD',
          language: 'es',
          notifications: true
        }
      },

      // BALANCE UNIFICADO
      balance: {
        primary: globalData.balance?.primary || 0, // Bolívares (moneda base)
        usd: globalData.balance?.usd || 0,
        eur: globalData.balance?.eur || 0,
        lastUpdated: globalData.balance?.lastUpdated || Date.now(),
        pendingAmount: globalData.balance?.pendingAmount || 0,
        lockedAmount: globalData.balance?.lockedAmount || 0 // Para transferencias en proceso
      },

      // TASAS DE CAMBIO GLOBALES
      exchangeRates: {
        USD_TO_BS: globalData.exchangeRates?.USD_TO_BS || 36.85,
        USD_TO_EUR: globalData.exchangeRates?.USD_TO_EUR || 0.92,
        EUR_TO_USD: globalData.exchangeRates?.EUR_TO_USD || 1.09,
        lastUpdated: globalData.exchangeRates?.lastUpdated || Date.now(),
        source: globalData.exchangeRates?.source || 'internal',
        updateInterval: 300000 // 5 minutos
      },

      // ESTADO DE VERIFICACIÓN
      verificationStatus: {
        level: globalData.verificationStatus?.level || 'unverified', // unverified, basic, full, premium
        documents: globalData.verificationStatus?.documents || {
          identity: { uploaded: false, verified: false, date: null },
          address: { uploaded: false, verified: false, date: null },
          banking: { uploaded: false, verified: false, date: null }
        },
        limits: globalData.verificationStatus?.limits || {
          daily: { amount: 100, remaining: 100 },
          monthly: { amount: 1000, remaining: 1000 },
          transaction: { max: 50 }
        },
        idNumber: globalData.verificationStatus?.idNumber || '',
        phoneNumber: globalData.verificationStatus?.phoneNumber || '',
        bankingData: globalData.verificationStatus?.bankingData || null
      },

      // TRANSACCIONES GLOBALES
      transactions: {
        list: globalData.transactions?.list || [],
        pending: globalData.transactions?.pending || [],
        completed: globalData.transactions?.completed || [],
        failed: globalData.transactions?.failed || [],
        totalCount: globalData.transactions?.totalCount || 0,
        lastTransactionId: globalData.transactions?.lastTransactionId || null
      },

      // INFORMACIÓN DEL DISPOSITIVO
      deviceInfo: {
        id: this.generateDeviceId(),
        fingerprint: this.generateDeviceFingerprint(),
        firstAccess: globalData.deviceInfo?.firstAccess || Date.now(),
        lastAccess: Date.now(),
        platform: this.detectPlatform(),
        browser: this.detectBrowser(),
        trusted: globalData.deviceInfo?.trusted || false
      },

      // DATOS DE SESIÓN
      sessionData: {
        isActive: false,
        startTime: Date.now(),
        lastActivity: Date.now(),
        pageViews: globalData.sessionData?.pageViews || 0,
        currentPage: window.location.pathname,
        referrer: document.referrer
      },

      // ESTADO DE LA APLICACIÓN
      appState: {
        version: '4.2',
        isFirstTime: globalData.appState?.isFirstTime ?? true,
        hasCompletedOnboarding: globalData.appState?.hasCompletedOnboarding || false,
        lastFeatureUsed: globalData.appState?.lastFeatureUsed || null,
        preferences: globalData.appState?.preferences || {
          theme: 'light',
          animations: true,
          autoSave: true
        }
      },

      // METADATOS DE SINCRONIZACIÓN
      _sync: {
        version: this.syncVersion,
        lastSync: Date.now(),
        checksum: '',
        source: window.location.pathname
      }
    };

    // Calcular checksum
    unifiedStructure._sync.checksum = this.calculateChecksum(unifiedStructure);
    
    // Guardar estructura unificada
    this.setGlobalData(unifiedStructure);
    
    console.log('📊 Estructura global de datos creada:', unifiedStructure);
  }

  // =================== GESTIÓN DE DATOS ===================
  getGlobalData() {
    try {
      const sources = [
        () => JSON.parse(localStorage.getItem(this.syncKey) || 'null'),
        () => JSON.parse(sessionStorage.getItem(this.syncKey) || 'null'),
        () => JSON.parse(localStorage.getItem(this.syncKey + '_backup') || 'null')
      ];

      for (const source of sources) {
        try {
          const data = source();
          if (data && this.validateDataStructure(data)) {
            return data;
          }
        } catch (error) {
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting global data:', error);
      return null;
    }
  }

  setGlobalData(data) {
    try {
      data._sync.lastSync = Date.now();
      data._sync.version = this.syncVersion++;
      data._sync.checksum = this.calculateChecksum(data);

      const serialized = JSON.stringify(data);
      
      // Guardar en múltiples ubicaciones
      localStorage.setItem(this.syncKey, serialized);
      sessionStorage.setItem(this.syncKey, serialized);
      localStorage.setItem(this.syncKey + '_backup', serialized);
      localStorage.setItem(this.versionKey, data._sync.version.toString());

      // Notificar cambios
      this.notifyDataChange(data);
      
      return true;
    } catch (error) {
      console.error('Error setting global data:', error);
      return false;
    }
  }

  // =================== MÉTODOS DE SINCRONIZACIÓN ESPECÍFICOS ===================
  
  // Actualizar datos del usuario
  updateUserData(newUserData) {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    globalData.userData = { ...globalData.userData, ...newUserData };
    globalData.userData.lastUpdated = Date.now();
    
    return this.setGlobalData(globalData);
  }

  // Actualizar balance
  updateBalance(newBalance) {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    // Validar que el balance no sea negativo
    if (newBalance.primary < 0) {
      console.warn('⚠️ Intento de establecer balance negativo');
      return false;
    }

    globalData.balance = { ...globalData.balance, ...newBalance };
    globalData.balance.lastUpdated = Date.now();
    
    // Recalcular equivalentes automáticamente
    this.recalculateCurrencyEquivalents(globalData);
    
    return this.setGlobalData(globalData);
  }

  // Actualizar tasas de cambio
  updateExchangeRates(newRates) {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    globalData.exchangeRates = { ...globalData.exchangeRates, ...newRates };
    globalData.exchangeRates.lastUpdated = Date.now();
    
    // Recalcular todos los balances con las nuevas tasas
    this.recalculateCurrencyEquivalents(globalData);
    
    return this.setGlobalData(globalData);
  }

  // Agregar transacción
  addTransaction(transaction) {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    // Generar ID único si no existe
    if (!transaction.id) {
      transaction.id = this.generateTransactionId();
    }

    // Añadir timestamp
    transaction.timestamp = transaction.timestamp || Date.now();
    transaction.deviceId = globalData.userData.deviceId;

    // Agregar a la lista principal
    globalData.transactions.list.unshift(transaction);
    
    // Categorizar por estado
    if (transaction.status === 'pending') {
      globalData.transactions.pending.push(transaction);
    } else if (transaction.status === 'completed') {
      globalData.transactions.completed.push(transaction);
      
      // Actualizar balance si es necesario
      if (transaction.type === 'deposit') {
        globalData.balance.primary += transaction.amountBs || 0;
      } else if (transaction.type === 'withdraw') {
        globalData.balance.primary -= transaction.amountBs || 0;
      }
    } else if (transaction.status === 'failed') {
      globalData.transactions.failed.push(transaction);
    }

    globalData.transactions.totalCount++;
    globalData.transactions.lastTransactionId = transaction.id;

    // Mantener solo las últimas 100 transacciones en memoria
    if (globalData.transactions.list.length > 100) {
      globalData.transactions.list = globalData.transactions.list.slice(0, 100);
    }

    this.recalculateCurrencyEquivalents(globalData);
    return this.setGlobalData(globalData);
  }

  // Actualizar estado de verificación
  updateVerificationStatus(newStatus) {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    globalData.verificationStatus = { ...globalData.verificationStatus, ...newStatus };
    globalData.verificationStatus.lastUpdated = Date.now();
    
    // Actualizar límites basados en el nivel de verificación
    this.updateLimitsBasedOnVerification(globalData);
    
    return this.setGlobalData(globalData);
  }

  // =================== CÁLCULOS AUTOMÁTICOS ===================
  recalculateCurrencyEquivalents(globalData) {
    const { balance, exchangeRates } = globalData;
    
    if (balance.primary > 0) {
      balance.usd = balance.primary / exchangeRates.USD_TO_BS;
      balance.eur = balance.usd * exchangeRates.USD_TO_EUR;
    } else {
      balance.usd = 0;
      balance.eur = 0;
    }

    balance.lastCalculated = Date.now();
  }

  updateLimitsBasedOnVerification(globalData) {
    const { verificationStatus } = globalData;
    
    switch (verificationStatus.level) {
      case 'unverified':
        verificationStatus.limits = {
          daily: { amount: 100, remaining: 100 },
          monthly: { amount: 500, remaining: 500 },
          transaction: { max: 50 }
        };
        break;
      case 'basic':
        verificationStatus.limits = {
          daily: { amount: 1000, remaining: 1000 },
          monthly: { amount: 10000, remaining: 10000 },
          transaction: { max: 500 }
        };
        break;
      case 'full':
        verificationStatus.limits = {
          daily: { amount: 10000, remaining: 10000 },
          monthly: { amount: 100000, remaining: 100000 },
          transaction: { max: 5000 }
        };
        break;
      case 'premium':
        verificationStatus.limits = {
          daily: { amount: 50000, remaining: 50000 },
          monthly: { amount: 500000, remaining: 500000 },
          transaction: { max: 25000 }
        };
        break;
    }
  }

  // =================== COMUNICACIÓN ENTRE PÁGINAS ===================
  setupCrossTabCommunication() {
    // Listener para cambios en localStorage
    window.addEventListener('storage', (e) => {
      if (e.key === this.syncKey) {
        this.handleExternalDataChange(e.newValue);
      }
    });

    // Listener para eventos personalizados
    window.addEventListener('remeex-sync-update', (e) => {
      this.handleSyncEvent(e.detail);
    });
  }

  setupStorageListener() {
    // Monitorear cambios en tiempo real
    const observer = new MutationObserver(() => {
      this.checkDataIntegrity();
    });

    observer.observe(document, { childList: true, subtree: true });
  }

  // Transferir datos a página externa
  transferToExternalPage(targetPage, additionalData = {}) {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    const transferPackage = {
      ...globalData,
      _transfer: {
        targetPage,
        transferTime: Date.now(),
        additionalData,
        returnUrl: window.location.href
      }
    };

    // Guardar paquete de transferencia
    const transferKey = `remeex_transfer_${targetPage}`;
    localStorage.setItem(transferKey, JSON.stringify(transferPackage));
    sessionStorage.setItem(transferKey, JSON.stringify(transferPackage));

    console.log(`📤 Datos transferidos a ${targetPage}:`, transferPackage);
    return transferPackage;
  }

  // Recibir datos de página externa
  receiveFromExternalPage() {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const transferKey = `remeex_transfer_${currentPage}`;

    try {
      const sources = [
        localStorage.getItem(transferKey),
        sessionStorage.getItem(transferKey)
      ];

      for (const source of sources) {
        if (source) {
          const transferData = JSON.parse(source);
          
          // Validar que no haya expirado (5 minutos)
          const age = Date.now() - transferData._transfer.transferTime;
          if (age < 300000) {
            console.log(`📥 Datos recibidos en ${currentPage}:`, transferData);
            return transferData;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error receiving transfer data:', error);
      return null;
    }
  }

  // =================== API GLOBAL ===================
  registerGlobalAPI() {
    // API global accesible desde cualquier página
    window.REMEEX_GLOBAL = {
      // Getters
      getUserData: () => this.getGlobalData()?.userData,
      getBalance: () => this.getGlobalData()?.balance,
      getExchangeRates: () => this.getGlobalData()?.exchangeRates,
      getVerificationStatus: () => this.getGlobalData()?.verificationStatus,
      getTransactions: () => this.getGlobalData()?.transactions,
      getFullData: () => this.getGlobalData(),

      // Setters
      updateUser: (data) => this.updateUserData(data),
      updateBalance: (balance) => this.updateBalance(balance),
      updateRates: (rates) => this.updateExchangeRates(rates),
      updateVerification: (status) => this.updateVerificationStatus(status),
      addTransaction: (transaction) => this.addTransaction(transaction),

      // Utilidades
      formatCurrency: (amount, currency) => this.formatCurrency(amount, currency),
      calculateEquivalent: (amount, fromCurrency, toCurrency) => this.calculateEquivalent(amount, fromCurrency, toCurrency),
      
      // Transferencias
      transferToPage: (page, data) => this.transferToExternalPage(page, data),
      receiveTransferData: () => this.receiveFromExternalPage(),
      
      // Sincronización
      forceSync: () => this.forceSynchronization(),
      checkIntegrity: () => this.checkDataIntegrity(),
      
      // Eventos
      on: (event, callback) => this.addEventListener(event, callback),
      off: (event, callback) => this.removeEventListener(event, callback),
      emit: (event, data) => this.emitEvent(event, data)
    };

    console.log('🌐 API Global REMEEX_GLOBAL registrada');
  }

  // =================== UTILIDADES ===================
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  generateDeviceId() {
    let deviceId = localStorage.getItem('remeex_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('remeex_device_id', deviceId);
    }
    return deviceId;
  }

  generateTransactionId() {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
  }

  generateDeviceFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    return btoa(JSON.stringify({
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    })).substring(0, 32);
  }

  detectPlatform() {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }

  detectBrowser() {
    const ua = navigator.userAgent;
    if (/Chrome/i.test(ua)) return 'Chrome';
    if (/Firefox/i.test(ua)) return 'Firefox';
    if (/Safari/i.test(ua)) return 'Safari';
    if (/Edge/i.test(ua)) return 'Edge';
    return 'Unknown';
  }

  calculateChecksum(data) {
    const str = JSON.stringify(data, Object.keys(data).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  validateDataStructure(data) {
    return data && 
           typeof data === 'object' && 
           data.userData && 
           data.balance && 
           data.exchangeRates && 
           data._sync;
  }

  formatCurrency(amount, currency) {
    if (isNaN(amount)) amount = 0;
    
    switch (currency.toLowerCase()) {
      case 'usd':
        return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'bs':
        return 'Bs ' + amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'eur':
        return '€' + amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      default:
        return amount.toFixed(2);
    }
  }

  calculateEquivalent(amount, fromCurrency, toCurrency) {
    const rates = this.getGlobalData()?.exchangeRates;
    if (!rates) return 0;

    let baseAmount = amount;

    // Convertir a USD como base
    if (fromCurrency === 'BS') {
      baseAmount = amount / rates.USD_TO_BS;
    } else if (fromCurrency === 'EUR') {
      baseAmount = amount * rates.EUR_TO_USD;
    }

    // Convertir a moneda destino
    if (toCurrency === 'BS') {
      return baseAmount * rates.USD_TO_BS;
    } else if (toCurrency === 'EUR') {
      return baseAmount * rates.USD_TO_EUR;
    }

    return baseAmount; // USD
  }

  // =================== SISTEMA DE EVENTOS ===================
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }

    // También emitir como evento DOM
    window.dispatchEvent(new CustomEvent(`remeex-${event}`, { detail: data }));
  }

  notifyDataChange(data) {
    this.emitEvent('data-changed', data);
    this.emitEvent('balance-updated', data.balance);
    this.emitEvent('rates-updated', data.exchangeRates);
  }

  // =================== HEARTBEAT Y MANTENIMIENTO ===================
  startHeartbeat() {
    setInterval(() => {
      this.performHeartbeat();
    }, this.heartbeatInterval);
  }

  performHeartbeat() {
    try {
      const globalData = this.getGlobalData();
      if (globalData) {
        globalData.sessionData.lastActivity = Date.now();
        globalData.sessionData.pageViews++;
        this.setGlobalData(globalData);
      }

      this.checkDataIntegrity();
      this.cleanupExpiredData();
    } catch (error) {
      console.error('Error in heartbeat:', error);
    }
  }

  checkDataIntegrity() {
    const globalData = this.getGlobalData();
    if (!globalData) return false;

    const currentChecksum = this.calculateChecksum(globalData);
    if (currentChecksum !== globalData._sync.checksum) {
      console.warn('⚠️ Integridad de datos comprometida, restaurando...');
      this.restoreDataIntegrity();
      return false;
    }

    return true;
  }

  restoreDataIntegrity() {
    try {
      // Intentar restaurar desde backup
      const backup = localStorage.getItem(this.syncKey + '_backup');
      if (backup) {
        const backupData = JSON.parse(backup);
        if (this.validateDataStructure(backupData)) {
          this.setGlobalData(backupData);
          console.log('✅ Datos restaurados desde backup');
          return true;
        }
      }

      // Si no hay backup válido, reinicializar
      this.createGlobalDataStructure();
      console.log('🔄 Datos reinicializados');
      return true;
    } catch (error) {
      console.error('Error restoring data integrity:', error);
      return false;
    }
  }

  cleanupExpiredData() {
    try {
      // Limpiar transferencias expiradas
      const transferKeys = Object.keys(localStorage).filter(key => key.startsWith('remeex_transfer_'));
      
      transferKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const age = Date.now() - (data._transfer?.transferTime || 0);
          
          if (age > 300000) { // 5 minutos
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired data:', error);
    }
  }

  forceSynchronization() {
    try {
      const globalData = this.getGlobalData();
      if (globalData) {
        globalData._sync.lastSync = Date.now();
        globalData._sync.version = this.syncVersion++;
        this.setGlobalData(globalData);
        this.emitEvent('sync-forced', globalData);
        console.log('🔄 Sincronización forzada completada');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error forcing synchronization:', error);
      return false;
    }
  }

  // =================== MÉTODOS DE DIAGNÓSTICO ===================
  getDiagnosticInfo() {
    const globalData = this.getGlobalData();
    
    return {
      isInitialized: !!globalData,
      dataVersion: globalData?._sync?.version,
      lastSync: globalData?._sync?.lastSync,
      storageSize: this.getStorageSize(),
      integrityValid: this.checkDataIntegrity(),
      deviceId: globalData?.userData?.deviceId,
      sessionActive: globalData?.sessionData?.isActive,
      transactionCount: globalData?.transactions?.totalCount || 0
    };
  }

  getStorageSize() {
    try {
      const data = localStorage.getItem(this.syncKey);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      return 0;
    }
  }
}

// =================== INICIALIZACIÓN GLOBAL ===================
window.REMEEX_SYNC = new GlobalSyncManager();

console.log('🌐 Sistema de Sincronización Global REMEEX cargado correctamente');