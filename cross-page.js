// ============================================================================
// REMEEX VISA Banking - Sistema Cross-Page Manager Completo
// Versión: 4.2 (Modular) - FALTANTE COMPLETADO
// ============================================================================

"use strict";

// Sistema de sincronización cross-page completo
class CrossPageManager {
  constructor() {
    this.sessionKey = 'remeexCrossPageSession';
    this.dataKeys = [
      'remeexUserData_v4',
      'remeexBalance_v4', 
      'remeexTransactions_v4',
      'remeexVerificationStatus_v4'
    ];
  }
  
  // Sincronizar datos antes de navegar
  syncBeforeNavigation() {
    const { currentUser, verificationStatus, registrationData } = REMEEX_GLOBALS;
    
    const sessionData = {
      timestamp: Date.now(),
      userData: currentUser,
      verificationStatus: verificationStatus,
      registrationData: registrationData
    };
    
    sessionStorage.setItem(this.sessionKey, JSON.stringify(sessionData));
    sessionStorage.setItem('remeexInternalNavigation', 'true');
  }
  
  // Detectar retorno de página externa
  checkReturnFromExternal() {
    const isInternalNav = sessionStorage.getItem('remeexInternalNavigation');
    const sessionData = sessionStorage.getItem(this.sessionKey);
    
    if (isInternalNav && sessionData) {
      try {
        const data = JSON.parse(sessionData);
        
        // Restaurar datos de sesión
        Object.assign(REMEEX_GLOBALS.currentUser, data.userData);
        Object.assign(REMEEX_GLOBALS.verificationStatus, data.verificationStatus);
        Object.assign(REMEEX_GLOBALS.registrationData, data.registrationData);
        
        // Limpiar marcadores
        sessionStorage.removeItem('remeexInternalNavigation');
        
        return true;
      } catch (error) {
        console.error('Error restoring session:', error);
      }
    }
    
    return false;
  }
  
  // Integrar operaciones de páginas externas
  integrateExternalOperations() {
    this.checkPendingTransfers();
    this.checkNewVerifications();
    this.checkNewMobilePayments();
  }
  
  checkPendingTransfers() {
    const transferData = sessionStorage.getItem('remeexTransferData');
    if (transferData) {
      try {
        const data = JSON.parse(transferData);
        
        const transaction = {
          id: 'TR_' + Date.now(),
          type: 'withdraw', 
          amount: parseFloat(data.amount),
          amountBs: parseFloat(data.amount) * CONFIG.EXCHANGE_RATES.USD_TO_BS,
          date: REMEEX_UTILS.getCurrentDateTime(),
          description: `Retiro a ${data.bancoDestino}`,
          status: 'pending',
          destination: data.bancoDestino,
          balanceBefore: REMEEX_GLOBALS.currentUser.balance.bs,
          balanceAfter: REMEEX_GLOBALS.currentUser.balance.bs - (parseFloat(data.amount) * CONFIG.EXCHANGE_RATES.USD_TO_BS)
        };
        
        if (window.REMEEX_PAYMENTS) {
          REMEEX_PAYMENTS.addTransaction(transaction);
        }
        sessionStorage.removeItem('remeexTransferData');
        
        REMEEX_UTILS.showToast('info', 'Retiro Procesado', 
                 `Solicitud de retiro a ${data.bancoDestino} registrada correctamente.`);
      } catch (error) {
        console.error('Error processing transfer:', error);
      }
    }
  }

  checkNewVerifications() {
    const verificationData = localStorage.getItem('remeexVerificationBanking');
    const lastCheck = localStorage.getItem('remeexLastVerificationCheck');
    
    if (verificationData) {
      try {
        const data = JSON.parse(verificationData);
        const dataTimestamp = data.timestamp || 0;
        const lastCheckTimestamp = parseInt(lastCheck || '0');
        
        if (dataTimestamp > lastCheckTimestamp) {
          localStorage.setItem('remeexLastVerificationCheck', dataTimestamp.toString());
          
          if (REMEEX_GLOBALS.statusEvolution) {
            REMEEX_GLOBALS.statusEvolution.onVerificationComplete();
          }
          
          REMEEX_UTILS.showToast('info', 'Procesando Documentos', 
                   'Hemos recibido tu información. Iniciando proceso de validación...', 5000);
        }
      } catch (error) {
        console.error('Error checking new verifications:', error);
      }
    }
  }

  checkNewMobilePayments() {
    const mobileData = localStorage.getItem('remeexNewMobilePayment');
    if (mobileData) {
      try {
        const data = JSON.parse(mobileData);
        
        if (window.REMEEX_PAYMENTS && REMEEX_PAYMENTS.validator) {
          REMEEX_PAYMENTS.validator.processMobilePayment(data);
        }
        
        localStorage.removeItem('remeexNewMobilePayment');
      } catch (error) {
        console.error('Error processing new mobile payment:', error);
      }
    }
  }
}

window.REMEEX_CROSSPAGE = new CrossPageManager();

// Interceptar navegación saliente
window.addEventListener('beforeunload', () => {
  if (REMEEX_UTILS.isLoggedIn()) {
    REMEEX_CROSSPAGE.syncBeforeNavigation();
  }
});

console.log('✅ CROSS-PAGE.js cargado correctamente');