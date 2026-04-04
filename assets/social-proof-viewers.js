/**
 * Social Proof Viewers
 * Shows a simulated "X people are viewing this product" counter.
 */
class SocialProofViewers extends HTMLElement {
  constructor() {
    super();
    this.min = parseInt(this.dataset.min || '3', 10);
    this.max = parseInt(this.dataset.max || '15', 10);
    this.interval = parseInt(this.dataset.interval || '30', 10) * 1000;
    this.currentCount = this.randomBetween(this.min, this.max);
    this.timer = null;
  }

  connectedCallback() {
    if (Shopify.designMode) {
      this.render();
      return;
    }
    this.render();
    this.timer = setInterval(() => this.update(), this.interval);
  }

  disconnectedCallback() {
    if (this.timer) clearInterval(this.timer);
  }

  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  update() {
    const delta = this.randomBetween(-2, 2);
    this.currentCount = Math.max(this.min, Math.min(this.max, this.currentCount + delta));
    const countEl = this.querySelector('[data-viewer-count]');
    if (countEl) {
      countEl.classList.add('is-updating');
      setTimeout(() => {
        countEl.textContent = this.currentCount;
        countEl.classList.remove('is-updating');
      }, 200);
    }
  }

  render() {
    const text = this.dataset.text || '{count} personnes consultent ce produit';
    const parts = text.split('{count}');
    this.innerHTML = `
      <span class="social-proof-viewers--dot"></span>
      <span>${parts[0] || ''}<span class="social-proof-viewers--count" data-viewer-count>${this.currentCount}</span>${parts[1] || ''}</span>
    `;
  }
}

customElements.define('social-proof-viewers', SocialProofViewers);
