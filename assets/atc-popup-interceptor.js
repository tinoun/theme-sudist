/**
 * Add to Cart Popup Interceptor
 * Intercepte le clic sur le bouton Ajouter au panier pour afficher une popup
 */

class ATCPopupInterceptor {
  constructor() {
    this.popup = null;
    this.originalForm = null;
    this.isProcessing = false;
    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.popup = document.querySelector('add-to-cart-popup');
    if (!this.popup) return;

    // Intercepter tous les formulaires d'ajout au panier
    this.interceptForms();
    
    // Écouter l'événement de continuation
    this.popup.addEventListener('popup:continue', (e) => {
      this.submitOriginalForm();
    });
  }

  interceptForms() {
    // Sélectionner tous les formulaires d'ajout au panier
    const forms = document.querySelectorAll(
      'form[action*="/cart/add"]:not([data-popup-intercepted])'
    );

    forms.forEach(form => this.interceptSingleForm(form));

    // Observer les changements DOM pour les formulaires dynamiques
    this.observeNewForms();
  }

  interceptSingleForm(form) {
    if (form.dataset.popupIntercepted === 'true') return;
    form.dataset.popupIntercepted = 'true';

    // Intercepter sur le submit du formulaire (capture phase pour être en premier)
    form.addEventListener('submit', (e) => {
      // Si on a déjà validé via la popup, laisser passer
      if (form.dataset.popupValidated === 'true') {
        form.dataset.popupValidated = 'false';
        return true;
      }

      // Sinon, bloquer et afficher la popup
      e.preventDefault();
      e.stopImmediatePropagation();
      
      this.originalForm = form;
      this.popup.open();
      
      return false;
    }, true);

    // Intercepter aussi le clic sur le bouton submit (capture phase)
    const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
    submitButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Si on a déjà validé via la popup, laisser passer
        if (form.dataset.popupValidated === 'true') {
          return true;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        
        this.originalForm = form;
        this.popup.open();
        
        return false;
      }, true);
    });
  }

  observeNewForms() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches?.('form[action*="/cart/add"]')) {
              this.interceptSingleForm(node);
            }
            const newForms = node.querySelectorAll?.('form[action*="/cart/add"]') || [];
            newForms.forEach(form => this.interceptSingleForm(form));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  submitOriginalForm() {
    if (!this.originalForm || this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Marquer comme validé pour bypasser l'interception
    this.originalForm.dataset.popupValidated = 'true';
    
    // Utiliser requestSubmit si disponible (déclenche les événements submit)
    if (typeof this.originalForm.requestSubmit === 'function') {
      this.originalForm.requestSubmit();
    } else {
      this.originalForm.submit();
    }
    
    // Reset après un délai
    setTimeout(() => {
      this.isProcessing = false;
      if (this.originalForm) {
        this.originalForm.dataset.popupValidated = 'false';
      }
    }, 1000);
  }
}

// Initialiser uniquement si la popup existe
if (document.querySelector('add-to-cart-popup') || document.readyState === 'loading') {
  new ATCPopupInterceptor();
}
