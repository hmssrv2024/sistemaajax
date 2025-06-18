// ============================================================================
// REMEEX VISA Banking - Configuraciones Globales
// Versión: 4.2 (Modular) - CORREGIDO
// ============================================================================

"use strict";

window.CONFIG = {
  // Información del banco
  BANK_NAME: "REMEEX VISA",
  APP_VERSION: "4.2 (Modular)",
  
  // Códigos de validación
  LOGIN_CODE: "12345678901234567890",
  OTP_CODE: "2468",
  
  // Datos de tarjeta válida (para demostración)
  VALID_CARD: "4111111111111111",
  VALID_CARD_EXP_MONTH: "12",
  VALID_CARD_EXP_YEAR: "2028",
  VALID_CARD_CVV: "123",
  
  // Límites de recargas
  MAX_CARD_RECHARGES: 3,
  MAX_UNVERIFIED_BALANCE: 1000, // USD
  
  // Tasas de cambio (actualizadas dinámicamente)
  EXCHANGE_RATES: {
    USD_TO_BS: 36.85,
    USD_TO_EUR: 0.92,
    EUR_TO_USD: 1.09
  },
  
  // Opciones de recarga disponibles
  RECHARGE_OPTIONS: [
    { usd: 50, bs: 1842, eur: 46 },
    { usd: 100, bs: 3685, eur: 92 },
    { usd: 200, bs: 7370, eur: 184 },
    { usd: 500, bs: 18425, eur: 460 },
    { usd: 1000, bs: 36850, eur: 920 },
    { usd: 2000, bs: 73700, eur: 1840 }
  ],
  
  // Información bancaria para transferencias
  BANK_INFO: {
    BANK_NAME: "Banco Provincial",
    ACCOUNT_HOLDER: "REMEEX VISA CORP",
    ACCOUNT_NUMBER: "0108-0123-45-1234567890",
    ACCOUNT_TYPE: "Corriente",
    IDENTIFICATION: "J-40123456-7",
    EMAIL: "pagos@remeexvisa.com"
  },
  
  // Información de pago móvil
  MOBILE_PAYMENT_INFO: {
    BANK_NAME: "Banco de Venezuela",
    PHONE: "0414-1234567",
    HOLDER_ID: "V-12345678",
    HOLDER_NAME: "REMEEX PAYMENTS"
  },
  
  // Claves de almacenamiento local
  STORAGE_KEYS: {
    USER_REGISTRATION: 'remeexUserRegistration',
    IS_REGISTERED: 'remeexIsRegistered',
    BALANCE: 'remeexBalance',
    TRANSACTIONS: 'remeexTransactions',
    VERIFICATION: 'remeexVerificationStatus',
    CARD_DATA: 'remeexCardData',
    FIRST_RECHARGE: 'remeexFirstRecharge',
    USER_DATA: 'remeexUserData'
  },
  
  // Claves de sesión
  SESSION_KEYS: {
    LOGGED_IN: 'remeexLoggedIn',
    SESSION_ID: 'remeexSessionId',
    BALANCE: 'remeexCurrentBalance',
    EXCHANGE_RATE: 'remeexExchangeRate'
  },
  
  // Estados de verificación
  VERIFICATION_STATUSES: {
    UNVERIFIED: 'unverified',
    PENDING: 'pending',
    PROCESSING: 'processing',
    BANK_VALIDATION: 'bank_validation',
    VERIFIED: 'verified',
    REJECTED: 'rejected'
  },
  
  // Estados de transacciones
  TRANSACTION_STATUSES: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    PENDING_REVIEW: 'pending_review',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled'
  },
  
  // Tipos de transacciones
  TRANSACTION_TYPES: {
    DEPOSIT: 'deposit',
    WITHDRAWAL: 'withdrawal',
    TRANSFER: 'transfer',
    CARD_PAYMENT: 'card_payment',
    BANK_TRANSFER: 'bank_transfer',
    MOBILE_PAYMENT: 'mobile_payment'
  },
  
  // Configuración de inactividad
  INACTIVITY: {
    WARNING_TIME: 4.5 * 60 * 1000, // 4.5 minutos
    LOGOUT_TIME: 5 * 60 * 1000,    // 5 minutos
    COUNTDOWN_TIME: 30 * 1000      // 30 segundos de countdown
  },
  
  // Configuración de toasts
  TOAST_CONFIG: {
    DURATION: {
      SHORT: 3000,
      MEDIUM: 5000,
      LONG: 7000
    },
    TYPES: {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info'
    }
  },
  
  // URLs de contacto
  CONTACT_URLS: {
    WHATSAPP: 'https://wa.me/+17373018059',
    TELEGRAM: 'https://t.me/+17373018059',
    SUPPORT_EMAIL: 'soporte@remeexvisa.com'
  },
  
  // Configuración de la app
  APP_CONFIG: {
    AUTO_SAVE_INTERVAL: 30000, // 30 segundos
    MAX_TRANSACTION_HISTORY: 50,
    DEFAULT_CURRENCY: 'USD',
    SUPPORTED_CURRENCIES: ['USD', 'BS', 'EUR'],
    DEVICE_ID_LENGTH: 32
  },
  
  // Configuración de validaciones
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_REQUIREMENTS: {
      UPPERCASE: true,
      LOWERCASE: true,
      NUMBERS: true,
      SPECIAL_CHARS: true
    },
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[0-9+\-\s()]+$/,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 50
  },
  
  // Mensajes del sistema
  MESSAGES: {
    WELCOME: {
      MORNING: "Buenos días",
      AFTERNOON: "Buenas tardes", 
      EVENING: "Buenas noches",
      NIGHT: "Buenas noches"
    },
    ERRORS: {
      NETWORK: "Error de conexión. Verifique su internet.",
      VALIDATION: "Por favor complete todos los campos requeridos.",
      GENERIC: "Ha ocurrido un error. Intente nuevamente.",
      SESSION_EXPIRED: "Su sesión ha expirado. Inicie sesión nuevamente."
    },
    SUCCESS: {
      REGISTRATION: "Registro completado exitosamente.",
      LOGIN: "Inicio de sesión exitoso.",
      PAYMENT: "Pago procesado exitosamente.",
      VERIFICATION: "Verificación completada."
    }
  },
  
  // Configuración de balance inicial
  INITIAL_BALANCE: {
    USD: 0,
    BS: 0,
    EUR: 0
  },
  
  // Configuración de usuarios online (simulado)
  ONLINE_USERS: {
    MIN: 847,
    MAX: 1247,
    UPDATE_INTERVAL: 60000 // 1 minuto
  },
  
  // Configuración de animaciones
  ANIMATIONS: {
    FADE_DURATION: 300,
    SLIDE_DURATION: 500,
    BOUNCE_DURATION: 400,
    LOADING_DOTS_INTERVAL: 500
  },
  
  // Configuración de archivos
  FILE_CONFIG: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
  },
  
  // Configuración de evolución de estado
  EVOLUTION_CONFIG: {
    UPDATE_INTERVAL: 5000, // 5 segundos
    ANIMATION_DURATION: 2000,
    STATUS_COLORS: {
      unverified: '#ff4757',
      pending: '#ffa502',
      processing: '#3742fa',
      bank_validation: '#2f3542',
      verified: '#2ed573'
    }
  },
  
  // Datos de demostración para tarjeta guardada
  DEMO_SAVED_CARD: {
    last4: "1111",
    brand: "visa",
    holderName: "USUARIO DEMO",
    expMonth: "12",
    expYear: "28"
  },
  
  // URLs de imágenes (CDN o local)
  IMAGES: {
    CARD_BRANDS: {
      visa: 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png',
      mastercard: 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png',
      amex: 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/amex.png',
      discover: 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/discover.png'
    },
    LOGO: './assets/logo.png',
    BACKGROUND: './assets/background.jpg'
  },
  
  // Configuración de debugging
  DEBUG: {
    ENABLED: true,
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    CONSOLE_COLORS: {
      info: '#3498db',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c',
      debug: '#9b59b6'
    }
  }
};

// Función para actualizar tasas de cambio (simulada)
CONFIG.updateExchangeRates = function() {
  try {
    // Simular pequeñas fluctuaciones en las tasas
    const variation = (Math.random() - 0.5) * 0.02; // ±1% de variación
    
    this.EXCHANGE_RATES.USD_TO_BS = 36.85 * (1 + variation);
    this.EXCHANGE_RATES.USD_TO_EUR = 0.92 * (1 + variation * 0.5);
    this.EXCHANGE_RATES.EUR_TO_USD = 1 / this.EXCHANGE_RATES.USD_TO_EUR;
    
    // Actualizar opciones de recarga con nuevas tasas
    this.RECHARGE_OPTIONS.forEach(option => {
      option.bs = Math.round(option.usd * this.EXCHANGE_RATES.USD_TO_BS);
      option.eur = Math.round(option.usd * this.EXCHANGE_RATES.USD_TO_EUR);
    });
    
    console.log('💱 Tasas de cambio actualizadas:', this.EXCHANGE_RATES);
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('exchangeRatesUpdated', {
      detail: this.EXCHANGE_RATES
    }));
    
  } catch (error) {
    console.error('Error updating exchange rates:', error);
  }
};

// Función para validar configuración
CONFIG.validate = function() {
  const requiredKeys = ['BANK_NAME', 'LOGIN_CODE', 'OTP_CODE', 'EXCHANGE_RATES'];
  const missing = requiredKeys.filter(key => !this[key]);
  
  if (missing.length > 0) {
    throw new Error(`Configuración incompleta. Faltan: ${missing.join(', ')}`);
  }
  
  console.log('✅ Configuración validada correctamente');
  return true;
};

// Función para obtener configuración específica
CONFIG.get = function(path, defaultValue = null) {
  try {
    const keys = path.split('.');
    let value = this;
    
    for (const key of keys) {
      value = value[key];
      if (value === undefined) {
        return defaultValue;
      }
    }
    
    return value;
  } catch (error) {
    console.warn(`Error getting config for ${path}:`, error);
    return defaultValue;
  }
};

// Función para establecer configuración específica
CONFIG.set = function(path, value) {
  try {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = this;
    
    for (const key of keys) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      target = target[key];
    }
    
    target[lastKey] = value;
    console.log(`⚙️ Configuración actualizada: ${path} = ${value}`);
    return true;
  } catch (error) {
    console.error(`Error setting config for ${path}:`, error);
    return false;
  }
};

// Función para exportar configuración
CONFIG.export = function() {
  const exportData = {
    version: this.APP_VERSION,
    timestamp: new Date().toISOString(),
    exchangeRates: this.EXCHANGE_RATES,
    rechargeOptions: this.RECHARGE_OPTIONS
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Función para importar configuración
CONFIG.import = function(configData) {
  try {
    const data = typeof configData === 'string' ? JSON.parse(configData) : configData;
    
    if (data.exchangeRates) {
      Object.assign(this.EXCHANGE_RATES, data.exchangeRates);
    }
    
    if (data.rechargeOptions) {
      this.RECHARGE_OPTIONS = data.rechargeOptions;
    }
    
    console.log('📥 Configuración importada exitosamente');
    return true;
  } catch (error) {
    console.error('Error importing config:', error);
    return false;
  }
};

// Inicializar configuración
try {
  CONFIG.validate();
  console.log('✅ CONFIG.js cargado correctamente - Configuraciones Globales Inicializadas');
} catch (error) {
  console.error('❌ Error en configuración:', error);
}

// Actualizar tasas de cambio automáticamente cada 5 minutos
setInterval(() => {
  CONFIG.updateExchangeRates();
}, 5 * 60 * 1000);

// Congelar el objeto CONFIG para prevenir modificaciones accidentales
// Object.freeze(CONFIG); // Comentado para permitir actualizaciones dinámicas