// ============================================================================
// REMEEX VISA Banking - Sistema de Inactividad
// Versión: 4.2 (Modular)
// ============================================================================

"use strict";

window.REMEEX_INACTIVITY = {
  timer: null,
  countdown: null,
  seconds: 30,

  // Configurar manejo de inactividad
  setupInactivityHandler() {
    try {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      events.forEach(event => {
        document.addEventListener(event, () => {
          this.resetInactivityTimer();
        });
      });
      
      this.resetInactivityTimer();
    } catch (error) {
      console.error('Error setting up inactivity handler:', error);
    }
  },

  // Resetear timer de inactividad
  resetInactivityTimer() {
    try {
      if (this.timer) clearTimeout(this.timer);
      if (this.countdown) clearInterval(this.countdown);
      
      const inactivityModal = document.getElementById('inactivity-modal');
      if (inactivityModal) inactivityModal.style.display = 'none';
      
      if (!REMEEX_UTILS.isLoggedIn()) return;
      
      this.timer = setTimeout(() => {
        this.showInactivityWarning();
      }, CONFIG.INACTIVITY_TIMEOUT - CONFIG.INACTIVITY_WARNING);
    } catch (error) {
      console.error('Error resetting inactivity timer:', error);
    }
  },

  // Mostrar advertencia de inactividad
  showInactivityWarning() {
    try {
      const inactivityModal = document.getElementById('inactivity-modal');
      const inactivityTimerEl = document.getElementById('inactivity-timer');
      
      if (inactivityModal && inactivityTimerEl) {
        inactivityModal.style.display = 'flex';
        
        this.seconds = 30;
        inactivityTimerEl.textContent = this.seconds;
        
        this.countdown = setInterval(() => {
          this.seconds--;
          inactivityTimerEl.textContent = this.seconds;
          if (this.seconds <= 0) {
            clearInterval(this.countdown);
            if (window.REMEEX_AUTH) {
              window.REMEEX_AUTH.logout();
            }
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Error showing inactivity warning:', error);
    }
  }
};

console.log('✅ INACTIVITY.js cargado correctamente');