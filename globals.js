// ============================================================================
// REMEEX VISA Banking - Variables Globales
// Versión: 4.2 (Modular) - SISTEMA GLOBAL CORREGIDO
// ============================================================================

"use strict";

// Estados de evolución del sistema
window.STATUS_EVOLUTION = {
  STATES: {
    FIRST_RECHARGE: 'first-recharge',
    NEEDS_VERIFICATION: 'needs-verification', 
    PROCESSING_DOCS: 'processing-docs',
    READY_FOR_BANKING: 'ready-for-banking',
    BANKING_VALIDATED: 'banking-validated',
    FIRST_MOBILE_PAYMENT: 'first-mobile-payment'
  },
  
  STORAGE_KEYS: {
    CURRENT_STATE: 'remeexEvolutionState',
    PROCESSING_START: 'remeexProcessingStart',
    BANK_DATA: 'remeexBankData',
    LAST_INTERACTION: 'remeexLastInteraction'
  },
  
  TIMERS: {
    PROCESSING_DURATION: 10 * 60 * 1000, // 10 minutos
    REMINDER_INTERVALS: [1, 3, 6, 12, 24], // horas
    UPDATE_INTERVAL: 30000 // 30 segundos
  }
};

// Variables globales del sistema
window.REMEEX_GLOBALS = {
  // Datos del usuario actual
  currentUser: {
    name: '',
    email: '',
    deviceId: '',
    idNumber: '',
    phoneNumber: '',
    balance: {
      bs: 0,
      usd: 0,
      eur: 0
    },
    transactions: [],
    hasSavedCard: false,
    cardRecharges: 0,
    hasMadeFirstRecharge: false
  },

  // Datos de registro
  registrationData: {
    name: '',
    email: '',
    password: '',
    isRegistered: false,
    registrationDate: null
  },

  // Estado de verificación
  verificationStatus: {
    status: 'unverified', // unverified, pending, processing, verified, rejected
    isVerified: false,
    hasUploadedId: false,
    idNumber: '',
    phoneNumber: '',
    verificationDate: null
  },

  // Transacciones pendientes
  pendingTransactions: [],

  // Método de pago seleccionado
  selectedPaymentMethod: 'card-payment',
  
  // Monto seleccionado para recarga
  selectedAmount: {
    usd: 0,
    bs: 0,
    eur: 0
  },

  // Usuarios activos (simulado)
  activeUsersCount: 124,

  // Sistema evolutivo
  statusEvolution: null,

  // Temporizadores
  inactivityTimer: null,
  inactivityCountdown: null,

  // Manager de persistencia
  persistenceManager: null,

  // Validador de pagos móviles
  mobilePaymentValidator: null
};

// Configuraciones adicionales faltantes
window.CONFIG = window.CONFIG || {};

// Agregar configuraciones faltantes a CONFIG
Object.assign(window.CONFIG, {
  // Configuración de inactividad corregida
  INACTIVITY_TIMEOUT: 5 * 60 * 1000, // 5 minutos
  INACTIVITY_WARNING: 30 * 1000, // 30 segundos antes

  // Storage keys adicionales
  STORAGE_KEYS: {
    ...window.CONFIG.STORAGE_KEYS,
    DEVICE_ID: 'remeexDeviceId',
    HAS_MADE_FIRST_RECHARGE: 'remeexFirstRecharge',
    VERIFICATION_DATA: 'remeexVerificationData_v4'
  }
});

console.log('✅ GLOBALS.js cargado correctamente - Variables Globales Inicializadas');