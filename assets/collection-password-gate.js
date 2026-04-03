/**
 * Collection Password Gate
 * Protects a collection page behind a password popup.
 * Reusable on any collection template via the theme editor.
 */
class CollectionPasswordGate extends HTMLElement {
  constructor() {
    super();
    this.password = this.dataset.password;
    this.sessionKey = this.dataset.sessionKey || 'collection_access';
    this.persistenceMode = this.dataset.persistenceMode || 'session';
    this.persistenceDuration = parseInt(this.dataset.persistenceDuration || '24', 10);
    this.sectionId = this.dataset.sectionId;
    this.popupAttr = `data-collection-password-popup-${this.sectionId}`;
  }

  connectedCallback() {
    if (Shopify.designMode) return;
    if (this.isAuthenticated()) {
      this.revealContent();
      return;
    }
    this.hideContent();
    this.openPopup();
    this.bindEvents();
  }

  /* ---- Storage helpers ---- */

  isAuthenticated() {
    if (this.persistenceMode === 'duration') {
      const stored = localStorage.getItem(this.sessionKey);
      if (!stored) return false;
      try {
        const { expiresAt } = JSON.parse(stored);
        if (Date.now() < expiresAt) return true;
        localStorage.removeItem(this.sessionKey);
        return false;
      } catch {
        localStorage.removeItem(this.sessionKey);
        return false;
      }
    }
    return sessionStorage.getItem(this.sessionKey) === 'true';
  }

  storeAccess() {
    if (this.persistenceMode === 'duration') {
      const expiresAt = Date.now() + this.persistenceDuration * 60 * 60 * 1000;
      localStorage.setItem(this.sessionKey, JSON.stringify({ expiresAt }));
    } else {
      sessionStorage.setItem(this.sessionKey, 'true');
    }
  }

  /* ---- DOM helpers ---- */

  getPopupModal() {
    return document.querySelector(`[${this.popupAttr}]`);
  }

  getSiblings() {
    const thisSection = this.closest('.shopify-section');
    const siblings = [];
    let el = thisSection?.nextElementSibling;
    while (el) {
      if (el.classList.contains('shopify-section')) siblings.push(el);
      el = el.nextElementSibling;
    }
    return siblings;
  }

  hideContent() {
    this.getSiblings().forEach(el => {
      el.style.display = 'none';
    });
  }

  revealContent() {
    this.getSiblings().forEach(el => {
      el.style.display = '';
    });
  }

  /* ---- Popup control ---- */

  openPopup() {
    const modal = this.getPopupModal();
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('show');
      document.body.classList.add('overflow-hidden');
      const input = modal.querySelector('[data-collection-password-input]');
      if (input) input.focus();
    });
  }

  closePopup() {
    const modal = this.getPopupModal();
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('overflow-hidden');
  }

  /* ---- Events ---- */

  bindEvents() {
    const modal = this.getPopupModal();
    if (!modal) return;

    const input = modal.querySelector('[data-collection-password-input]');
    const submitBtn = modal.querySelector('[data-collection-password-submit]');
    const errorEl = modal.querySelector('[data-collection-password-error]');

    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.validate(input, errorEl);
      });
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.validate(input, errorEl);
        }
      });
    }

    // Prevent closing the popup while not authenticated
    modal.querySelectorAll('[data-popup-close]').forEach(el => {
      el.addEventListener('click', (e) => {
        if (!this.isAuthenticated()) {
          e.stopImmediatePropagation();
          e.preventDefault();
        }
      }, true);
    });

    // Prevent Escape key from closing the popup
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isAuthenticated()) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }

  /* ---- Validation ---- */

  validate(input, errorEl) {
    if (!input) return;
    if (input.value === this.password) {
      this.storeAccess();
      if (errorEl) errorEl.style.display = 'none';
      this.closePopup();
      this.revealContent();
    } else {
      if (errorEl) errorEl.style.display = 'block';
      input.classList.add('collection-gate-shake');
      input.addEventListener('animationend', () => {
        input.classList.remove('collection-gate-shake');
      }, { once: true });
      input.focus();
    }
  }
}

customElements.define('collection-password-gate', CollectionPasswordGate);
