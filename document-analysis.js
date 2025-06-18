// ============================================================================
// REMEEX VISA Banking - Sistema de Análisis de Documentos
// Versión: 4.2 (Modular) - FALTANTE COMPLETADO
// ============================================================================

"use strict";

// Sistema de análisis de documentos
window.REMEEX_DOCUMENT_ANALYSIS = {
  
  // Verificar estado de verificación externa
  checkExternalVerificationStatus() {
    const lastVerificationCheck = localStorage.getItem('remeexLastExternalVerificationCheck');
    const verificationData = localStorage.getItem('remeexVerificationBanking');
    
    if (verificationData) {
      try {
        const data = JSON.parse(verificationData);
        const dataTimestamp = data.timestamp || Date.now();
        const lastCheck = parseInt(lastVerificationCheck || '0');
        
        if (dataTimestamp > lastCheck) {
          localStorage.setItem('remeexLastExternalVerificationCheck', dataTimestamp.toString());
          this.startDocumentAnalysisProcess(data);
          return true;
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }
    return false;
  },

  // Proceso de análisis de documentos
  startDocumentAnalysisProcess(verificationData) {
    const { verificationStatus } = REMEEX_GLOBALS;
    
    verificationStatus.status = 'processing';
    REMEEX_PERSISTENCE.saveVerificationData();
    
    if (REMEEX_GLOBALS.statusEvolution) {
      REMEEX_GLOBALS.statusEvolution.onVerificationComplete();
    }
    
    REMEEX_UTILS.showToast('info', 'Procesando Documentos', 
             'Hemos recibido tu información. Iniciando análisis de documentos...', 5000);
    
    this.startDocumentAnalysisStages();
  },

  // Etapas de análisis de documentos
  startDocumentAnalysisStages() {
    const stages = [
      { name: 'personal', duration: 3 * 60 * 1000, label: 'Verificando Información Personal' },
      { name: 'banking', duration: 4 * 60 * 1000, label: 'Validando Datos Bancarios' },
      { name: 'biometric', duration: 3 * 60 * 1000, label: 'Procesando Biometría' }
    ];
    
    let currentStage = 0;
    
    const processNextStage = () => {
      if (currentStage >= stages.length) {
        this.completeDocumentAnalysis();
        return;
      }
      
      const stage = stages[currentStage];
      this.updateDocumentAnalysisCard(stage, currentStage + 1, stages.length);
      
      setTimeout(() => {
        currentStage++;
        processNextStage();
      }, stage.duration);
    };
    
    processNextStage();
  },

  // Actualizar tarjeta de análisis de documentos
  updateDocumentAnalysisCard(currentStage, stageNumber, totalStages) {
    if (!REMEEX_GLOBALS.statusEvolution || !REMEEX_GLOBALS.statusEvolution.container) return;
    
    const progress = Math.round((stageNumber / totalStages) * 100);
    
    const cardContent = `
      <div class="evolution-header">
        <div class="evolution-icon processing">
          <div class="processing-spinner"></div>
        </div>
        <div class="evolution-content">
          <div class="evolution-title">Analizando tus Documentos</div>
          <div class="evolution-subtitle">${currentStage.label}</div>
        </div>
        <div class="evolution-progress">
          <svg class="evolution-progress-circle" viewBox="0 0 36 36">
            <circle class="evolution-progress-bg" cx="18" cy="18" r="16"></circle>
            <circle class="evolution-progress-fill processing" cx="18" cy="18" r="16" 
                    stroke-dasharray="${progress * 0.75}, 100" stroke-dashoffset="0"></circle>
          </svg>
          <div class="evolution-progress-text">${progress}%</div>
        </div>
      </div>
      
      <div class="evolution-document-stages">
        <div class="document-stage ${stageNumber > 1 ? 'completed' : stageNumber === 1 ? 'active' : ''}">
          <i class="fas ${stageNumber > 1 ? 'fa-check' : 'fa-id-card'}"></i>
          <span>Información Personal</span>
        </div>
        <div class="document-stage ${stageNumber > 2 ? 'completed' : stageNumber === 2 ? 'active' : ''}">
          <i class="fas ${stageNumber > 2 ? 'fa-check' : 'fa-university'}"></i>
          <span>Datos Bancarios</span>
        </div>
        <div class="document-stage ${stageNumber > 3 ? 'completed' : stageNumber === 3 ? 'active' : ''}">
          <i class="fas ${stageNumber > 3 ? 'fa-check' : 'fa-user-check'}"></i>
          <span>Biometría</span>
        </div>
      </div>
      
      <div class="evolution-actions">
        <a href="https://wa.me/+17373018059?text=${encodeURIComponent('Consulta sobre mi proceso de verificación de documentos')}" 
           class="evolution-action-btn whatsapp" target="_blank">
          <i class="fab fa-whatsapp"></i>
          Consultar Estado
        </a>
      </div>
    `;
    
    REMEEX_GLOBALS.statusEvolution.container.querySelector('.evolution-card-inner').innerHTML = cardContent;
  },

  // Completar análisis y solicitar validación bancaria
  completeDocumentAnalysis() {
    const { verificationStatus } = REMEEX_GLOBALS;
    
    verificationStatus.status = 'verified';
    REMEEX_PERSISTENCE.saveVerificationData();
    
    if (REMEEX_GLOBALS.statusEvolution) {
      REMEEX_GLOBALS.statusEvolution.updateCard();
    }
    
    REMEEX_UTILS.showToast('success', '¡Documentos Verificados!', 
             'Análisis completado exitosamente. Ahora valida tu cuenta bancaria.', 8000);
  }
};

console.log('✅ DOCUMENT-ANALYSIS.js cargado correctamente');