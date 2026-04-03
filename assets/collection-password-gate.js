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
    this.countdownInterval = null;
  }

  connectedCallback() {
    if (Shopify.designMode) return;
    if (this.isAuthenticated()) {
      this.revealContent();
      this.initCountdown();
      return;
    }
    this.hideContent();
    this.openPopup();
    this.bindEvents();
    this.initCountdown();
  }

  disconnectedCallback() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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

  /* ---- Countdown ---- */

  initCountdown() {
    const el = document.querySelector('[data-collection-gate-countdown]');
    if (!el) return;

    const targetDate = new Date(el.dataset.countdownDate).getTime();
    if (isNaN(targetDate)) return;

    const days = el.querySelector('[data-countdown-days]');
    const hours = el.querySelector('[data-countdown-hours]');
    const minutes = el.querySelector('[data-countdown-minutes]');
    const seconds = el.querySelector('[data-countdown-seconds]');

    const update = () => {
      const now = Date.now();
      const diff = targetDate - now;

      if (diff <= 0) {
        el.classList.add('is-expired');
        if (days) days.textContent = '00';
        if (hours) hours.textContent = '00';
        if (minutes) minutes.textContent = '00';
        if (seconds) seconds.textContent = '00';
        clearInterval(this.countdownInterval);
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      if (days) days.textContent = String(d).padStart(2, '0');
      if (hours) hours.textContent = String(h).padStart(2, '0');
      if (minutes) minutes.textContent = String(m).padStart(2, '0');
      if (seconds) seconds.textContent = String(s).padStart(2, '0');
    };

    update();
    this.countdownInterval = setInterval(update, 1000);
  }

  /* ---- Events ---- */

  bindEvents() {
    const modal = this.getPopupModal();
    if (!modal) return;

    const input = modal.querySelector('[data-collection-password-input]');
    const submitBtn = modal.querySelector('[data-collection-password-submit]');
    const errorEl = modal.querySelector('[data-collection-password-error]');
    const toggleBtn = modal.querySelector('[data-collection-password-toggle]');

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

    // Toggle password visibility
    if (toggleBtn && input) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        const eyeIcon = toggleBtn.querySelector('[data-icon-eye]');
        const eyeOffIcon = toggleBtn.querySelector('[data-icon-eye-off]');
        if (eyeIcon) eyeIcon.style.display = isPassword ? 'none' : '';
        if (eyeOffIcon) eyeOffIcon.style.display = isPassword ? '' : 'none';
        input.focus();
      });
    }

    // Close popup → redirect to home if not authenticated
    const redirectUrl = this.dataset.redirectUrl || '/';
    modal.querySelectorAll('[data-popup-close]').forEach(el => {
      el.addEventListener('click', () => {
        if (!this.isAuthenticated()) {
          window.location.href = redirectUrl;
        }
      }, true);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.isAuthenticated()) {
        window.location.href = redirectUrl;
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
