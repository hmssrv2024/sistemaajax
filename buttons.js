class UltraButtonManager {
  constructor() {
    this.buttons = [];
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.setupButtons();
    });
  }

  setupButtons() {
    const buttons = document.querySelectorAll('.ultra-btn');
    
    buttons.forEach(button => {
      this.setupButton(button);
    });
  }

  setupButton(button) {
    const buttonInner = button.querySelector('.button-inner');
    const pressEcho = button.querySelector('.press-echo');
    let isPressed = false;
    let buttonRect;
    let memoryTimer;
    
    // Seguimiento de movimiento del ratón para reflejos dinámicos
    button.addEventListener('mousemove', (e) => {
      if (!buttonRect) buttonRect = button.getBoundingClientRect();
      
      // Calcular posición relativa del cursor dentro del botón (0-100%)
      const x = ((e.clientX - buttonRect.left) / buttonRect.width) * 100;
      const y = ((e.clientY - buttonRect.top) / buttonRect.height) * 100;
      
      // Actualizar posición del reflejo
      buttonInner.style.setProperty('--x', `${x}%`);
      buttonInner.style.setProperty('--y', `${y}%`);
      
      // Rotar ligeramente el ángulo del gradiente basado en la posición del cursor
      const angle = (x - 50) * 0.2; // Efecto sutil
      buttonInner.style.setProperty('--angle', `${angle}deg`);
      
      // Si el botón está presionado, ajustar el efecto de hundimiento basado en la posición
      if (isPressed) {
        this.updatePressEffect(e, button, buttonInner, pressEcho);
      }
    });
    
    // Manejo del evento de presionar físicamente el botón
    button.addEventListener('mousedown', (e) => {
      isPressed = true;
      buttonRect = button.getBoundingClientRect();
      
      // Clase temporal para el efecto físico de hundimiento
      button.classList.add('pressed');
      
      // Aplicar efecto de hundimiento localizado
      this.updatePressEffect(e, button, buttonInner, pressEcho);
      
      // Vibración en dispositivos compatibles
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    });
    
    // Al liberar el botón
    button.addEventListener('mouseup', () => {
      isPressed = false;
      button.classList.remove('pressed');
      
      // Añadir efecto de memoria temporal
      button.classList.add('released');
      
      // Eliminar la clase después de la animación
      clearTimeout(memoryTimer);
      memoryTimer = setTimeout(() => {
        button.classList.remove('released');
      }, 300);
      
      // Toggle del estado activo (encendido/apagado)
      button.classList.toggle('active');
      
      // Disparar acción del botón
      const action = button.dataset.action;
      this.handleButtonAction(action, button);
    });
    
    // Eliminar solo el efecto de hundimiento si el cursor sale durante la presión
    button.addEventListener('mouseleave', () => {
      isPressed = false;
      button.classList.remove('pressed');
      buttonRect = null; // Resetear el rectángulo al salir
    });
    
    // Restablecer el rectángulo cuando el cursor vuelve a entrar
    button.addEventListener('mouseenter', () => {
      buttonRect = null;
    });
    
    // Soporte mejorado para dispositivos táctiles
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isPressed = true;
      
      const touch = e.touches[0];
      buttonRect = button.getBoundingClientRect();
      
      button.classList.add('pressed');
      
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
      };
      
      this.updatePressEffect(simulatedEvent, button, buttonInner, pressEcho);
      
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    });
    
    button.addEventListener('touchend', () => {
      isPressed = false;
      button.classList.remove('pressed');
      
      button.classList.add('released');
      
      clearTimeout(memoryTimer);
      memoryTimer = setTimeout(() => {
        button.classList.remove('released');
      }, 300);
      
      button.classList.toggle('active');
      
      const action = button.dataset.action;
      this.handleButtonAction(action, button);
    });
    
    // Manejar movimiento durante el toque
    button.addEventListener('touchmove', (e) => {
      if (isPressed) {
        const touch = e.touches[0];
        
        const simulatedEvent = {
          clientX: touch.clientX,
          clientY: touch.clientY
        };
        
        this.updatePressEffect(simulatedEvent, button, buttonInner, pressEcho);
      }
    });
  }

  updatePressEffect(e, button, buttonInner, pressEcho) {
    const buttonRect = button.getBoundingClientRect();
    
    // Calcular la posición exacta del clic
    const x = ((e.clientX - buttonRect.left) / buttonRect.width) * 100;
    const y = ((e.clientY - buttonRect.top) / buttonRect.height) * 100;
    
    // Determinar el origen de la transformación basado en la posición
    const originX = `${x}%`;
    const originY = `${y}%`;
    
    const scaleBase = 0.94;
    
    const distanceFromCenterX = (x - 50) / 100;
    const distanceFromCenterY = (y - 50) / 100;
    
    const transform = `scale(${scaleBase}) 
                       perspective(800px) 
                       rotateX(${distanceFromCenterY * 3}deg) 
                       rotateY(${distanceFromCenterX * -3}deg)`;
    
    buttonInner.style.setProperty('--press-transform', transform);
    buttonInner.style.setProperty('--press-origin', `${originX} ${originY}`);
    
    pressEcho.style.setProperty('--echo-x', `${x}%`);
    pressEcho.style.setProperty('--echo-y', `${y}%`);
    
    pressEcho.style.animation = 'none';
    setTimeout(() => {
      pressEcho.style.animation = 'echo 500ms ease-out forwards';
    }, 10);
  }

  handleButtonAction(action, button) {
    const buttonText = button.querySelector('span').textContent;
    const isActive = button.classList.contains('active');
    
    console.log(`Botón "${buttonText}" ${isActive ? 'ACTIVADO' : 'DESACTIVADO'}`);
    
    // Disparar evento personalizado
    window.dispatchEvent(new CustomEvent('ultraButtonAction', {
      detail: {
        action: action,
        text: buttonText,
        active: isActive,
        button: button
      }
    }));
    
    // Acciones específicas según el tipo de botón
    switch (action) {
      case 'register':
        this.handleRegister();
        break;
      case 'login':
        this.handleLogin();
        break;
      case 'create':
        this.handleCreate();
        break;
      case 'continue':
        this.handleContinue();
        break;
      default:
        console.log(`Acción no definida: ${action}`);
    }
  }

  handleRegister() {
    // Lógica para registro
    console.log('Iniciando proceso de registro...');
  }

  handleLogin() {
    // Lógica para login
    console.log('Iniciando sesión...');
  }

  handleCreate() {
    // Lógica para crear cuenta
    console.log('Creando nueva cuenta...');
  }

  handleContinue() {
    // Lógica para continuar
    console.log('Continuando proceso...');
  }

  // Método público para activar/desactivar botones programáticamente
  setButtonState(selector, active) {
    const button = document.querySelector(selector);
    if (button) {
      if (active) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    }
  }

  // Método para deshabilitar/habilitar botones
  setButtonEnabled(selector, enabled) {
    const button = document.querySelector(selector);
    if (button) {
      if (enabled) {
        button.style.pointerEvents = '';
        button.style.opacity = '';
      } else {
        button.style.pointerEvents = 'none';
        button.style.opacity = '0.5';
      }
    }
  }
}

// Crear instancia global
window.ultraButtonManager = new UltraButtonManager();

// Export for module use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UltraButtonManager;
}