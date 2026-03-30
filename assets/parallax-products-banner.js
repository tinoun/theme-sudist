if (!customElements.get('parallax-products-banner')) {
  customElements.define('parallax-products-banner',
    class CollectionsBanner extends HTMLElement {
      constructor() {
        super();
        this.handleScroll = this.handleScroll.bind(this);
        this.bannerItems = this.querySelectorAll('[data-banner-item]');
        this.contentCards = this.querySelectorAll('[data-content-card]');
        this.bgImages = this.querySelectorAll('[data-bg-image] img');
        this.productItems = this.querySelectorAll('[data-product-item]');
        this.scrollTimeout = null;
      }

      connectedCallback() {
        this.classList.add('parallax-products-banner');
        window.addEventListener('scroll', this.handleScroll);
        window.addEventListener('resize', this.handleScroll);

        if(Shopify.designMode){
          document.addEventListener('shopify:section:load', this.handleScroll.bind(this));
          document.addEventListener('shopify:section:unload', this.handleScroll.bind(this));
          document.addEventListener('shopify:block:select', this.handleBlockSelect.bind(this));
        }

        gsap.set(this.contentCards, {
          scale: 0.5,
        });
        this.productItems.forEach((item) => {
          const infoBox = item.querySelector('[data-item-info]');
          // const infoBox = item;
          item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            if (infoBox) {
              infoBox.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
              infoBox.style.opacity = '1';
            }
          });

          item.addEventListener('mouseleave', () => {
            if (infoBox) {
              infoBox.style.opacity = '0';
            }
          });
        });
      }

      disconnectedCallback() {
        // Clear any pending scroll timeout
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleScroll);
        if(Shopify.designMode){
          document.removeEventListener('shopify:section:load', this.handleScroll.bind(this));
          document.removeEventListener('shopify:section:unload', this.handleScroll.bind(this));
          document.removeEventListener('shopify:block:select', this.handleBlockSelect.bind(this));
        }
      }

      handleBlockSelect(event) {
        // Clear any existing timeout to prevent duplicate execution
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }
        
        // Debounce the scroll action to prevent duplicate execution
        this.scrollTimeout = setTimeout(() => {
          // Find the selected block element
          const selectedBlock = event.target;
          if (selectedBlock && selectedBlock.closest('[data-banner-item]')) {
            const bannerItem = selectedBlock.closest('[data-banner-item]');
            this.scrollToBlock(bannerItem);
          }
        }, 100); // 100ms debounce delay
      }

      scrollToBlock(blockElement) {
        console.log(blockElement);
        if (!blockElement) return;
        
        // For sticky elements, we need to calculate the scroll position
        // that will make the selected block visible
        const allBannerItems = Array.from(this.bannerItems);
        const selectedIndex = allBannerItems.indexOf(blockElement);
        if (selectedIndex === -1) return;
        // Get the section container
        const section = this.closest('.section-parallax-products-banner') || this.closest('section');
        if (!section) return;
        
        // Calculate the scroll position needed to show the selected block
        // Each block takes up 120vh, so we need to scroll by (index * 120vh)
        const viewportHeight = window.innerHeight;
        const blockHeight = viewportHeight * 1.2; // 120vh
        const targetScrollY = section.offsetTop + (selectedIndex * blockHeight);
        
        // Smooth scroll to the calculated position
        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth'
        });
      }

      handleScroll() {
        const rect = this.getBoundingClientRect();
        const singleItemHeight = rect.height / this.bannerItems.length;
        const midpoint = singleItemHeight / 2;

        // console.log(rect.top, rect.bottom, midpoint, rect);
        
        if(rect.top <= midpoint && rect.top > 0){
          // Calculate progress from midpoint to 0
          const progress = (midpoint - rect.top) / midpoint;
          const scale = 0.5 + (0.5 * progress); // Scale from 0.5 to 1
          gsap.set(this.contentCards, {
            scale: scale
          });
        }
        if(rect.top <= 0){
          gsap.set(this.contentCards, {
            scale: 1
          });
        }

        if(rect.bottom <= midpoint && rect.bottom > 0){
          const progress = (midpoint - rect.bottom) / midpoint;
          const scale = 1 - (0.5 * progress); // Scale from 1 to 0.5
          gsap.set(this.contentCards, {
            scale: scale
          });
        }
        if(rect.bottom <= 0){
          gsap.set(this.contentCards, {
            scale: 0.5
          });
        }

        this.bgImages.forEach((bgImage, index) => {
          const bgImageContainer = bgImage.closest('[data-bg-image]');
          const itemRect = bgImageContainer.closest('[data-banner-item]').getBoundingClientRect();
          const windowHeight = window.innerHeight;
          
          // Calculate parallax offset based on scroll position
          // When the item is in view, move the image at a different speed than the scroll
          const parallaxSpeed = 0.2; // Adjust this value to control parallax intensity
          const yPos = -(itemRect.top * parallaxSpeed);
          
          // Apply the parallax transform
          gsap.set(bgImage, {
            y: yPos,
            force3D: true
          });
        });
      }

      handleScrollNEW() {
        // Use requestAnimationFrame for better performance
        if (this.scrollAnimationFrame) {
          cancelAnimationFrame(this.scrollAnimationFrame);
        }
        
        this.scrollAnimationFrame = requestAnimationFrame(() => {
          const rect = this.getBoundingClientRect();
          const singleItemHeight = rect.height / this.bannerItems.length;
          const midpoint = singleItemHeight / 2;
      
          // Batch all GSAP updates together
          const updates = [];
          
          if(rect.top <= midpoint && rect.top > 0){
            const progress = (midpoint - rect.top) / midpoint;
            const scale = 0.5 + (0.5 * progress);
            updates.push({ targets: this.contentCards, scale: scale });
          }
          
          if(rect.top <= 0){
            updates.push({ targets: this.contentCards, scale: 1 });
          }
      
          if(rect.bottom <= midpoint && rect.bottom > 0){
            const progress = (midpoint - rect.bottom) / midpoint;
            const scale = 1 - (0.5 * progress);
            updates.push({ targets: this.contentCards, scale: scale });
          }
          
          if(rect.bottom <= 0){
            updates.push({ targets: this.contentCards, scale: 0.5 });
          }
      
          // Batch update all GSAP animations
          if (updates.length > 0) {
            gsap.set(updates);
          }
      
          // Optimize parallax images
          this.bgImages.forEach((bgImage, index) => {
            const bgImageContainer = bgImage.closest('[data-bg-image]');
            const itemRect = bgImageContainer.closest('[data-banner-item]').getBoundingClientRect();
            
            const parallaxSpeed = 0.2;
            const yPos = -(itemRect.top * parallaxSpeed);
            
            gsap.set(bgImage, {
              y: yPos,
              force3D: true
            });
          });
        });
      }
    }
  );
}