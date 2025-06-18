// ============================================================================
// REMEEX VISA Banking - Funciones Utilitarias
// Versión: 4.2 (Modular)
// ============================================================================

"use strict";

// Funciones de utilidad general
window.REMEEX_UTILS = {
  
  // Escapar HTML para prevenir XSS
  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  // Formatear moneda
  formatCurrency(amount, currency) {
    try {
      if (isNaN(amount)) amount = 0;
      if (currency === 'usd') {
        return '$' + amount.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else if (currency === 'bs') {
        return 'Bs ' + amount.toLocaleString('es-VE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      } else if (currency === 'eur') {
        return '€' + amount.toLocaleString('de-DE', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      }
    } catch (error) {
      console.error('Error formatting currency:', error);
      return currency === 'usd' ? '$0.00' : currency === 'bs' ? 'Bs 0,00' : '€0.00';
    }
  },

  // Obtener fecha actual
  getCurrentDate() {
    try {
      const date = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error getting current date:', error);
      return new Date().toLocaleDateString();
    }
  },

  // Obtener fecha y hora actual
  getCurrentDateTime() {
    try {
      const date = new Date();
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('es-ES', options) + 
             ' ' + date.toLocaleTimeString('es-ES', { 
               hour: '2-digit', 
               minute: '2-digit' 
             });
    } catch (error) {
      console.error('Error getting current datetime:', error);
      return new Date().toLocaleString();
    }
  },

  // Obtener tiempo actual
  getCurrentTime() {
    try {
      const now = new Date();
      return now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Error getting current time:', error);
      return new Date().toLocaleTimeString();
    }
  },

  // Formatear tamaño de archivo
  formatFileSize(bytes) {
    try {
      if (bytes < 1024) {
        return bytes + " B";
      } else if (bytes < 1048576) {
        return (bytes / 1024).toFixed(1) + " KB";
      } else {
        return (bytes / 1048576).toFixed(1) + " MB";
      }
    } catch (error) {
      console.error('Error formatting file size:', error);
      return "0 B";
    }
  },

  // Generar ID de dispositivo único
  generateDeviceId() {
    try {
      let deviceId = localStorage.getItem(CONFIG.STORAGE_KEYS.DEVICE_ID);
      if (!deviceId) {
        deviceId = 'device_' + Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
        localStorage.setItem(CONFIG.STORAGE_KEYS.DEVICE_ID, deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error generating device ID:', error);
      return 'device_' + Date.now();
    }
  },

  // Saludo basado en hora
  getTimeBasedGreeting() {
    try {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        return 'Buenos días';
      } else if (hour >= 12 && hour < 18) {
        return 'Buenas tardes';
      } else {
        return 'Buenas noches';
      }
    } catch (error) {
      console.error('Error getting time-based greeting:', error);
      return 'Hola';
    }
  },

  // Validaciones
  validators: {
    validateName(name) {
      try {
        if (!name || typeof name !== 'string') return false;
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) return false;
        
        const nameParts = name.trim().split(/\s+/);
        if (nameParts.length < 2) return false;
        
        for (const part of nameParts) {
          if (part.length < 2) return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error validating name:', error);
        return false;
      }
    },

    validateCardNumber(cardNumber) {
      try {
        if (!cardNumber) return false;
        cardNumber = cardNumber.replace(/\D/g, '');
        
        if (!/^\d+$/.test(cardNumber)) return false;
        if (cardNumber.length < 13 || cardNumber.length > 19) return false;
        
        if (cardNumber === CONFIG.VALID_CARD) return true;
        
        // Algoritmo de Luhn
        let sum = 0;
        let double = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
          let digit = parseInt(cardNumber.charAt(i));
          
          if (double) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          
          sum += digit;
          double = !double;
        }
        
        return (sum % 10) === 0;
      } catch (error) {
        console.error('Error validating card number:', error);
        return false;
      }
    },

    validateIdNumber(idNumber) {
      try {
        if (!idNumber) return false;
        const regex = /^[VE]\d{7,8}$/;
        return regex.test(idNumber);
      } catch (error) {
        console.error('Error validating ID number:', error);
        return false;
      }
    },

    validatePhoneNumber(phoneNumber) {
      try {
        if (!phoneNumber) return false;
        const regex = /^(0412|0414|0416|0424|0426)\d{7}$/;
        return regex.test(phoneNumber);
      } catch (error) {
        console.error('Error validating phone number:', error);
        return false;
      }
    }
  },

  // Calcular equivalentes de moneda
  calculateCurrencyEquivalents() {
    const { currentUser } = REMEEX_GLOBALS;
    try {
      if (currentUser.balance.bs > 0) {
        currentUser.balance.usd = currentUser.balance.bs / CONFIG.EXCHANGE_RATES.USD_TO_BS;
        currentUser.balance.eur = currentUser.balance.usd * CONFIG.EXCHANGE_RATES.USD_TO_EUR;
      } else {
        currentUser.balance.usd = 0;
        currentUser.balance.eur = 0;
      }
    } catch (error) {
      console.error('Error calculating currency equivalents:', error);
      currentUser.balance.usd = 0;
      currentUser.balance.eur = 0;
    }
  },

  // Verificar si está logueado
  isLoggedIn() {
    try {
      return sessionStorage.getItem('remeexSession') === 'active';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Mostrar toast/notificación
  showToast(type, title, message, duration = 3000) {
    try {
      const toastContainer = document.getElementById('toast-container');
      
      if (!toastContainer) return;
      
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      
      const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
      };
      
      const content = `
        <div class="toast-icon">
          <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
        </div>
        <div class="toast-content">
          <div class="toast-title">${this.escapeHTML(title)}</div>
          <div class="toast-message">${this.escapeHTML(message)}</div>
        </div>
        <div class="toast-close">
          <i class="fas fa-times"></i>
        </div>
      `;
      
      toast.innerHTML = content;
      toastContainer.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.remove();
          }
        }, 300);
      }, duration);
      
      const closeBtn = toast.querySelector('.toast-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function() {
          toast.style.opacity = '0';
          setTimeout(() => {
            if (toast.parentNode) {
              toast.remove();
            }
          }, 300);
        });
      }
    } catch (error) {
      console.error('Error showing toast:', error);
    }
  }
};

console.log('✅ UTILS.js cargado correctamente');