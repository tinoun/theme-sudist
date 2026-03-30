if(!customElements.get('dual-media-slideshow')) {
  class DualMediaSlideshow extends HTMLDivElement {
    constructor() {
      super();
      // console.log('DualMediaSlideshow', this);
      this.swiperLeft = this.querySelector('[data-swiper-left]');
      this.swiperRight = this.querySelector('[data-swiper-right]');
      this.swiperMobile = this.querySelector('[data-swiper-mobile]');
      if(Shopify.designMode) {
        document.addEventListener('shopify:block:select', (event) => {
          const target = event.target;
          if(target.classList.contains('dual-media-slide')) {
            const index = target.dataset.swiperSlideIndex;
            console.log('index', index);
            if(this.swiperLeft?.swiper) {
              this.swiperLeft.swiper.slideTo(index);
            }
            if(this.swiperRight?.swiper) {
              this.swiperRight.swiper.slideTo(index);
            }
            if(this.swiperMobile?.swiper) {
              this.swiperMobile.swiper.slideTo(index);
            }
          }
        });
      }
    }
    connectedCallback() {
      if(this.swiperLeft) {
        this.swiperLeft.swiper = new Swiper(this.swiperLeft, JSON.parse(this.swiperLeft.getAttribute('data-swiper-left')));
      }
      if(this.swiperRight) {
        this.swiperRight.swiper = new Swiper(this.swiperRight, JSON.parse(this.swiperRight.getAttribute('data-swiper-right')));
      }
      if(this.swiperMobile) {
        this.swiperMobile.swiper = new Swiper(this.swiperMobile, JSON.parse(this.swiperMobile.getAttribute('data-swiper-mobile')));
      }
      
      // Add synchronized controls
      this.setupSynchronizedControls();
    }
    
    setupSynchronizedControls() {
      if (!this.swiperLeft?.swiper || !this.swiperRight?.swiper) return;
      
      // Left swiper controls right swiper
      this.swiperLeft.swiper.on('slideChange', () => {
        setTimeout(() => {
          if (this.swiperRight?.swiper) {
            this.swiperRight.swiper.slideTo(this.swiperLeft.swiper.activeIndex);
          }
        }, 300);
      });
      
      // Right swiper controls left swiper
      this.swiperRight.swiper.on('slideChange', () => {
        setTimeout(() => {
          if (this.swiperLeft?.swiper) {
            this.swiperLeft.swiper.slideTo(this.swiperRight.swiper.activeIndex);
          }
        }, 300);
      });
    }

    disconnectedCallback() {
      if(this.swiperLeft) {
        this.swiperLeft.swiper.destroy();
      }
      if(this.swiperRight) {
        this.swiperRight.swiper.destroy();
      }
    }

    
  }
  customElements.define('dual-media-slideshow', DualMediaSlideshow, { extends: 'div' });
}