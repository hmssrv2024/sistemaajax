class SpinnerManager {
  constructor() {
    this.spinner = document.getElementById('global-spinner');
    this.isVisible = true;
    this.minimumShowTime = 2000; // Mínimo 2 segundos
    this.startTime = Date.now();
  }

  hide() {
    const elapsedTime = Date.now() - this.startTime;
    const remainingTime = Math.max(0, this.minimumShowTime - elapsedTime);
    
    setTimeout(() => {
      if (this.spinner) {
        this.spinner.classList.add('hidden');
        this.isVisible = false;
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('spinnerHidden'));
        
        // Remover del DOM después de la transición
        setTimeout(() => {
          if (this.spinner && this.spinner.parentNode) {
            this.spinner.remove();
          }
        }, 500);
      }
    }, remainingTime);
  }

  show() {
    if (this.spinner) {
      this.spinner.classList.remove('hidden');
      this.isVisible = true;
      this.startTime = Date.now();
    }
  }

  updateText(text) {
    const textElement = this.spinner?.querySelector('.spinner-text');
    if (textElement) {
      textElement.textContent = text;
    }
  }
}

// Crear instancia global
window.spinnerManager = new SpinnerManager();

// Auto-hide spinner after page load
window.addEventListener('load', () => {
  setTimeout(() => {
    window.spinnerManager.hide();
  }, 1000);
});

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SpinnerManager;
}