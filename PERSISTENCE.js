// ============================================================================
// REMEEX VISA Banking - Sistema de Persistencia
// Versión: 4.2 (Modular) - ACTUALIZADO PARA WIZARD
// ============================================================================

"use strict";

// Clase principal de manejo de persistencia
class PersistenceManager {
  constructor() {
    this.storageAvailable = this.checkStorageAvailable();
    this.dataVersion = '4.2';
    this.compressionEnabled = true;
  }

  checkStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('localStorage no disponible:', e);
      return false;
    }
  }

  // Compresión simple para optimizar espacio
  compress(data) {
    if (!this.compressionEnabled) return data;
    try {
      return btoa(JSON.stringify(data));
    } catch (e) {
      return JSON.stringify(data);
    }
  }

  decompress(data) {
    if (!this.compressionEnabled) return JSON.parse(data);
    try {
      return JSON.parse(atob(data));
    } catch (e) {
      return JSON.parse(data);
    }
  }

  // Generar checksum para verificar integridad
  generateChecksum(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  verifyChecksum(data, checksum) {
    return this.generateChecksum(data) === checksum;
  }

  // Guardar datos con múltiples verificaciones
  saveData(key, data, metadata = {}) {
    if (!this.storageAvailable) return false;

    const payload = {
      data: data,
      metadata: {
        timestamp: Date.now(),
        version: this.dataVersion,
        deviceId: REMEEX_UTILS.generateDeviceId(),
        checksum: this.generateChecksum(data),
        ...metadata
      }
    };

    try {
      const compressed = this.compress(payload);
      localStorage.setItem(key, compressed);
      
      // Verificación inmediata
      const verification = this.loadData(key);
      if (!verification || !this.verifyData(verification.data, payload.data)) {
        console.error('Verificación falló para:', key);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('Error guardando datos:', key, e);
      return false;
    }
  }

  // Cargar datos con verificación
  loadData(key) {
    if (!this.storageAvailable) return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const payload = this.decompress(stored);
      
      // Verificar integridad
      if (!this.verifyChecksum(payload.data, payload.metadata.checksum)) {
        console.warn('Checksum inválido para:', key);
        return null;
      }

      return payload;
    } catch (e) {
      console.error('Error cargando datos:', key, e);
      return null;
    }
  }

  verifyData(data1, data2) {
    return JSON.stringify(data1) === JSON.stringify(data2);
  }
}

// Sistema de manejo de datos específicos
window.REMEEX_PERSISTENCE = {
  manager: new PersistenceManager(),

  // Guardar datos de usuario (ACTUALIZADO para incluir datos del wizard)
  saveUserData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const userData = {
        name: currentUser.name,
        email: currentUser.email,
        deviceId: currentUser.deviceId,
        idNumber: currentUser.idNumber,
        phoneNumber: currentUser.phoneNumber,
        // Nuevos campos del wizard
        country: currentUser.country,
        securityQuestion: currentUser.securityQuestion,
        securityAnswer: currentUser.securityAnswer,
        cardStyle: currentUser.cardStyle,
        cardName: currentUser.cardName,
        hasZelleAccount: currentUser.hasZelleAccount
      };

      const success = this.manager.saveData(CONFIG.STORAGE_KEYS.USER_DATA, userData);
      
      if (!success) {
        console.error('Error guardando datos de usuario');
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  },

  // Cargar datos de usuario (ACTUALIZADO para incluir datos del wizard)
  loadUserData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const data = this.manager.loadData(CONFIG.STORAGE_KEYS.USER_DATA);
      if (data && data.data.deviceId === currentUser.deviceId) {
        currentUser.name = data.data.name || '';
        currentUser.email = data.data.email || '';
        currentUser.idNumber = data.data.idNumber || '';
        currentUser.phoneNumber = data.data.phoneNumber || '';
        
        // Cargar datos adicionales del wizard
        currentUser.country = data.data.country || '';
        currentUser.securityQuestion = data.data.securityQuestion || '';
        currentUser.securityAnswer = data.data.securityAnswer || '';
        currentUser.cardStyle = data.data.cardStyle || 'gradient-blue';
        currentUser.cardName = data.data.cardName || '';
        currentUser.hasZelleAccount = data.data.hasZelleAccount || false;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading user data:', error);
      return false;
    }
  },

  // Guardar balance
  saveBalanceData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const success = this.manager.saveData(CONFIG.STORAGE_KEYS.BALANCE, {
        bs: currentUser.balance.bs,
        deviceId: currentUser.deviceId,
        lastUpdated: Date.now()
      });
      
      if (!success) {
        console.error('Error guardando balance');
        // Respaldo directo
        localStorage.setItem(CONFIG.STORAGE_KEYS.BALANCE + '_backup', JSON.stringify({
          bs: currentUser.balance.bs,
          deviceId: currentUser.deviceId,
          lastUpdated: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error saving balance data:', error);
    }
  },

  // Cargar balance
  loadBalanceData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const data = this.manager.loadData(CONFIG.STORAGE_KEYS.BALANCE);
      
      if (data && data.data.deviceId === currentUser.deviceId) {
        currentUser.balance.bs = data.data.bs || 0;
        REMEEX_UTILS.calculateCurrencyEquivalents();
        return true;
      } else {
        // Intentar cargar respaldo
        const backup = localStorage.getItem(CONFIG.STORAGE_KEYS.BALANCE + '_backup');
        if (backup) {
          const backupData = JSON.parse(backup);
          if (backupData.deviceId === currentUser.deviceId) {
            currentUser.balance.bs = backupData.bs || 0;
            REMEEX_UTILS.calculateCurrencyEquivalents();
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error loading balance data:', error);
      return false;
    }
  },

  // Guardar transacciones
  saveTransactionsData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const success = this.manager.saveData(CONFIG.STORAGE_KEYS.TRANSACTIONS, {
        transactions: currentUser.transactions,
        deviceId: currentUser.deviceId,
        lastUpdated: Date.now()
      });
      
      if (!success) {
        console.error('Error guardando transacciones');
      }
    } catch (error) {
      console.error('Error saving transactions data:', error);
    }
  },

  // Cargar transacciones
  loadTransactionsData() {
    const { currentUser, pendingTransactions } = REMEEX_GLOBALS;
    try {
      const data = this.manager.loadData(CONFIG.STORAGE_KEYS.TRANSACTIONS);
      
      if (data && data.data.deviceId === currentUser.deviceId) {
        currentUser.transactions = data.data.transactions || [];
        REMEEX_GLOBALS.pendingTransactions = currentUser.transactions.filter(t => 
          t.status === 'pending' || t.status === 'processing' || t.status === 'pending_review'
        );
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading transactions data:', error);
      return false;
    }
  },

  // Guardar estado de verificación
  saveVerificationData() {
    const { verificationStatus } = REMEEX_GLOBALS;
    try {
      const success = this.manager.saveData(CONFIG.STORAGE_KEYS.VERIFICATION_DATA, {
        idNumber: verificationStatus.idNumber,
        phoneNumber: verificationStatus.phoneNumber,
        status: verificationStatus.status
      });
      
      if (!success) {
        console.error('Error guardando datos de verificación');
      }
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.VERIFICATION, verificationStatus.status);
    } catch (error) {
      console.error('Error saving verification data:', error);
    }
  },

  // Cargar estado de verificación
  loadVerificationData() {
    const { verificationStatus } = REMEEX_GLOBALS;
    try {
      const status = localStorage.getItem(CONFIG.STORAGE_KEYS.VERIFICATION);
      if (status) {
        verificationStatus.status = status;
        
        if (status === 'verified') {
          verificationStatus.isVerified = true;
          verificationStatus.hasUploadedId = true;
        } else if (['pending', 'processing', 'bank_validation'].includes(status)) {
          verificationStatus.isVerified = false;
          verificationStatus.hasUploadedId = true;
        } else {
          verificationStatus.isVerified = false;
          verificationStatus.hasUploadedId = false;
        }
        
        const data = this.manager.loadData(CONFIG.STORAGE_KEYS.VERIFICATION_DATA);
        if (data) {
          verificationStatus.idNumber = data.data.idNumber || '';
          verificationStatus.phoneNumber = data.data.phoneNumber || '';
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading verification data:', error);
      return false;
    }
  },

  // Guardar datos de tarjeta
  saveCardData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const success = this.manager.saveData(CONFIG.STORAGE_KEYS.CARD_DATA, {
        hasSavedCard: currentUser.hasSavedCard,
        cardRecharges: currentUser.cardRecharges,
        deviceId: currentUser.deviceId,
        // Datos adicionales del wizard
        cardStyle: currentUser.cardStyle,
        cardName: currentUser.cardName
      });
      
      if (!success) {
        console.error('Error guardando datos de tarjeta');
      }
    } catch (error) {
      console.error('Error saving card data:', error);
    }
  },

  // Cargar datos de tarjeta
  loadCardData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const data = this.manager.loadData(CONFIG.STORAGE_KEYS.CARD_DATA);
      
      if (data && data.data.deviceId === currentUser.deviceId) {
        currentUser.hasSavedCard = data.data.hasSavedCard || false;
        currentUser.cardRecharges = data.data.cardRecharges || 0;
        
        // Cargar datos adicionales del wizard
        currentUser.cardStyle = data.data.cardStyle || 'gradient-blue';
        currentUser.cardName = data.data.cardName || '';
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading card data:', error);
      return false;
    }
  },

  // Guardar estado de primera recarga
  saveFirstRechargeStatus(hasRecharge) {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      currentUser.hasMadeFirstRecharge = hasRecharge;
      localStorage.setItem(CONFIG.STORAGE_KEYS.HAS_MADE_FIRST_RECHARGE, hasRecharge.toString());
    } catch (error) {
      console.error('Error saving first recharge status:', error);
    }
  },

  // Cargar estado de primera recarga
  loadFirstRechargeStatus() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const hasRecharge = localStorage.getItem(CONFIG.STORAGE_KEYS.HAS_MADE_FIRST_RECHARGE);
      currentUser.hasMadeFirstRecharge = hasRecharge === 'true';
      return currentUser.hasMadeFirstRecharge;
    } catch (error) {
      console.error('Error loading first recharge status:', error);
      return false;
    }
  },

  // Guardar datos de sesión (ACTUALIZADO)
  saveSessionData() {
    const { currentUser, registrationData } = REMEEX_GLOBALS;
    try {
      sessionStorage.setItem('remeexSession', 'active');
      
      const sessionUserData = {
        name: currentUser.name || registrationData.name,
        email: currentUser.email || registrationData.email,
        deviceId: currentUser.deviceId,
        idNumber: currentUser.idNumber,
        phoneNumber: currentUser.phoneNumber,
        // Datos adicionales del wizard
        country: currentUser.country || registrationData.country,
        cardStyle: currentUser.cardStyle || registrationData.cardStyle,
        cardName: currentUser.cardName || registrationData.cardName,
        hasZelleAccount: currentUser.hasZelleAccount || registrationData.hasZelleAccount
      };
      
      sessionStorage.setItem('remeexUser', JSON.stringify(sessionUserData));
    } catch (error) {
      console.error('Error saving session data:', error);
    }
  },

  // Cargar datos de sesión (ACTUALIZADO)
  loadSessionData() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      const isActiveSession = sessionStorage.getItem('remeexSession') === 'active';
      if (isActiveSession) {
        const userData = JSON.parse(sessionStorage.getItem('remeexUser') || '{}');
        currentUser.name = userData.name || '';
        currentUser.email = userData.email || '';
        currentUser.deviceId = userData.deviceId || REMEEX_UTILS.generateDeviceId();
        currentUser.idNumber = userData.idNumber || '';
        currentUser.phoneNumber = userData.phoneNumber || '';
        
        // Cargar datos adicionales del wizard
        currentUser.country = userData.country || '';
        currentUser.cardStyle = userData.cardStyle || 'gradient-blue';
        currentUser.cardName = userData.cardName || '';
        currentUser.hasZelleAccount = userData.hasZelleAccount || false;
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading session data:', error);
      return false;
    }
  },

  // Limpiar datos de sesión
  clearSessionData() {
    try {
      sessionStorage.removeItem('remeexSession');
      sessionStorage.removeItem('remeexUser');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  }
};

// Inicializar manager global
REMEEX_GLOBALS.persistenceManager = REMEEX_PERSISTENCE.manager;

console.log('✅ PERSISTENCE.js cargado correctamente - ACTUALIZADO PARA WIZARD');