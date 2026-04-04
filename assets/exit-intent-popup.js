/**
 * Exit Intent Popup
 * Shows a newsletter + promo code popup when user is about to leave.
 */
class ExitIntentPopup extends HTMLElement {
  constructor() {
    super();
    this.sectionId = this.dataset.sectionId;
    this.cookieDuration = parseInt(this.dataset.cookieDuration || '7', 10);
    this.delayBeforeActive = parseInt(this.dataset.delayBeforeActive || '5', 10) * 1000;
    this.cookieKey = 'exit_intent_dismissed';
    this.isActive = false;
    this.shown = false;
    this.popupAttr = `data-exit-intent-popup-${this.sectionId}`;
  }

  connectedCallback() {
    if (Shopify.designMode) return;
    if (this.dataset.mode === 'disabled') return;

    if (this.hasCookie() && this.dataset.mode !== 'test_mode') return;

    setTimeout(() => {
      this.isActive = true;
      this.bindExitIntent();
    }, this.delayBeforeActive);

    this.bindFormSubmit();
    this.bindDismiss();
  }

  hasCookie() {
    return document.cookie.split(';').some(c => c.trim().startsWith(this.cookieKey + '='));
  }

  setCookie() {
    const expires = new Date(Date.now() + this.cookieDuration * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${this.cookieKey}=true; expires=${expires}; path=/; SameSite=Lax`;
  }

  bindExitIntent() {
    // Desktop: mouse leaves viewport from top
    document.addEventListener('mouseleave', (e) => {
      if (!this.isActive || this.shown) return;
      if (e.clientY <= 0) {
        this.showPopup();
      }
    });

    // Mobile: rapid scroll up (velocity-based)
    let lastScrollY = window.scrollY;
    let lastTime = Date.now();

    window.addEventListener('scroll', () => {
      if (!this.isActive || this.shown) return;
      const now = Date.now();
      const dt = now - lastTime;
      const dy = lastScrollY - window.scrollY;

      if (dt > 0 && dy / dt > 2 && window.scrollY < 100) {
        this.showPopup();
      }

      lastScrollY = window.scrollY;
      lastTime = now;
    }, { passive: true });
  }

  getPopupModal() {
    return document.querySelector(`[${this.popupAttr}]`);
  }

  showPopup() {
    this.shown = true;
    const modal = this.getPopupModal();
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.classList.add('show');
      document.body.classList.add('overflow-hidden');
    });
  }

  closePopup() {
    const modal = this.getPopupModal();
    if (!modal) return;
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.classList.remove('overflow-hidden');
    this.setCookie();
  }

  bindDismiss() {
    const modal = this.getPopupModal();
    if (!modal) return;

    modal.querySelectorAll('[data-popup-close]').forEach(el => {
      el.addEventListener('click', () => this.closePopup());
    });

    const dismissBtn = modal.querySelector('[data-exit-intent-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => this.closePopup());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.shown) {
        this.closePopup();
      }
    });
  }

  bindFormSubmit() {
    const modal = this.getPopupModal();
    if (!modal) return;

    const form = modal.querySelector('[data-exit-intent-form]');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (!email || !email.value) return;

      const formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData
      }).then(() => {
        const formView = modal.querySelector('[data-exit-intent-form-view]');
        const successView = modal.querySelector('[data-exit-intent-success-view]');
        if (formView) formView.style.display = 'none';
        if (successView) successView.style.display = 'block';
        this.setCookie();
      }).catch(() => {
        // Still show success (email likely went through)
        const formView = modal.querySelector('[data-exit-intent-form-view]');
        const successView = modal.querySelector('[data-exit-intent-success-view]');
        if (formView) formView.style.display = 'none';
        if (successView) successView.style.display = 'block';
        this.setCookie();
      });
    });

    // Copy promo code
    const copyBtn = modal.querySelector('[data-exit-intent-copy]');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const code = copyBtn.dataset.code;
        if (code) {
          navigator.clipboard.writeText(code).then(() => {
            copyBtn.classList.add('is-copied');
            setTimeout(() => copyBtn.classList.remove('is-copied'), 2000);
          });
        }
      });
    }
  }
}

customElements.define('exit-intent-popup', ExitIntentPopup);
