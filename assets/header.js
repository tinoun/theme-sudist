function getHeaderSpacing() {
  const header = document.querySelector('[data-header-section]');
  const headerHeight = header.getBoundingClientRect().height.toFixed(2);
  document.body.style.setProperty('--header_height', `${headerHeight}px`);
  if(header.classList.contains('section-spacing')) {
    const headerSpacingTopDesktop = header.dataset.topSpacingDesktop;
    const headerSpacingBottomDesktop = header.dataset.bottomSpacingDesktop;
    const headerSpacingTopMobile = header.dataset.topSpacingMobile;
    const headerSpacingBottomMobile = header.dataset.bottomSpacingMobile;
    document.body.style.setProperty('--header_top_spacing', `${headerSpacingTopDesktop}px`);
    document.body.style.setProperty('--header_bottom_spacing', `${headerSpacingBottomDesktop}px`);
    document.body.style.setProperty('--header_top_spacing_mobile', `${headerSpacingTopMobile}px`);
    document.body.style.setProperty('--header_bottom_spacing_mobile', `${headerSpacingBottomMobile}px`);
  }
}
if(!customElements.get('sticky-on-scroll')) {
  class StickyOnScroll extends HTMLElement {
    constructor() {
      super();
      this.currentScrollTop = 0;
      window.addEventListener('scroll', this.onScroll.bind(this), false);

      const resizeObserver = new ResizeObserver(this.onScroll.bind(this));
      resizeObserver.observe(this);
      getHeaderSpacing();
    }

    onScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const headerHeight = this.getBoundingClientRect().height.toFixed(2);

      const isScrollingDown = scrollTop > this.currentScrollTop;
      const LogoStyle = this.dataset.logo;
      const isDesktop = window.innerWidth >= 1024;

      // Avoid excessive DOM reads/writes in different places
      this.currentScrollTop = scrollTop;

      // Sticky logic
      if (scrollTop > 100) {
        this.classList.add('is-sticky');
        if (isScrollingDown) {
          // Hide header
          this.classList.add('is-hidden');
          this.closest('header').classList.add('is-hidden-header');
          document.body.classList.remove('header-sticky');
          document.body.style.setProperty('--dynamic_header_height', `0px`);
        } else {
          // Show header
          this.classList.remove('is-hidden');
          this.closest('header').classList.remove('is-hidden-header');
          document.body.classList.add('header-sticky');
          document.body.style.setProperty('--dynamic_header_height', `${headerHeight}px`);
        }

        if (isDesktop && LogoStyle === "true" && this.querySelector('.half-width-menu')) {
          this.querySelector('.header--logo')?.classList.add("hidden");
        }
      } else {
        // Reset to default when top
        this.classList.remove('is-sticky', 'is-hidden');
        this.closest('header').classList.remove('is-hidden-header');
        document.body.classList.add('header-sticky');
        document.body.style.setProperty('--dynamic_header_height', `${headerHeight}px`);

        if (isDesktop && LogoStyle === "true" && this.querySelector('.half-width-menu')) {
          this.querySelector('.header--logo')?.classList.remove("hidden");
        }
      }
    }

  }
  customElements.define('sticky-on-scroll', StickyOnScroll);
}

if(!customElements.get('sticky-always')) {
  class StickyAlways extends HTMLElement {
    constructor() {
      super();
      this.currentScrollTop = 0;
      this.halfwidthMenuTransitionWidth();
      window.addEventListener('scroll', this.onScroll.bind(this), false);
      this.headerElement();
      this.resizeObserver = new ResizeObserver(this.halfwidthMenuTransitionWidth.bind(this));
      this.resizeObserver.observe(this.querySelector('[data-header-navigation]'));
      getHeaderSpacing();
    }
    onScroll() {

      this.headerHeight = this?.getBoundingClientRect().height;

      document.body.style.setProperty('--dynamic_header_height', `${this.headerHeight}px`);

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const LogoStyle = this.dataset.logo;
      if (scrollTop > 100) {
        if (this.classList.contains('is-sticky')) return;
        this.classList.add('is-sticky');
        // this.closest('header').classList.remove('section-spacing');
        if (window.innerWidth >= 1024) {
          if (LogoStyle == "true" && this.querySelector('.half-width-menu')) {
            this.querySelector('.header--logo').classList.add("hidden");
          }
        }
      } else {
        this.classList.remove('is-sticky');
        // this.closest('header').classList.add('section-spacing');
        if (window.innerWidth >= 1024) {
          if (LogoStyle == "true" && this.querySelector('.half-width-menu')) {
            this.querySelector('.header--logo').classList.remove("hidden");
          }
        }
      }

    }

    headerElement() {
      this.headerHeight = this?.getBoundingClientRect().height;

      document.body.style.setProperty('--dynamic_header_height', `${this.headerHeight}px`);
    }

    halfwidthMenuTransitionWidth() {
      this.transitionWidth = this.querySelector('[data-header-navigation]').getBoundingClientRect().width - this.querySelector('[data-header-right]').getBoundingClientRect().width
      this.querySelector('[data-header-navigation]').style.setProperty('--half_width_transition', `${this.transitionWidth}px`);

      this.headerElement();
    }
  }
  customElements.define('sticky-always', StickyAlways);
}

if(!customElements.get('hamburger-menu')) {
  class HamburgerMenu extends HTMLElement {
    constructor() {
      super();
      document.body.classList.remove('hamburger-menu-open');
      this.menuItems = this.querySelectorAll('li[data-hamburger-menu]');
      this.header = this.closest('header');
      this.toggler = this.header.querySelector('[data-hamburger-toggler]');
      this.closeBtn = this.querySelector('.cross_button')
      if (this.menuItems[0].hasAttribute('data-hamburger-item')) {
        this.menuItems[0].classList.add('active')
      }
      this.menuItems.forEach((menu) => {
        menu.addEventListener('mouseenter', function() {
          if (menu.classList.contains('active')) return;
          const currentActive = this.querySelector('[data-hamburger-menu].active');
          if (currentActive) {
            currentActive.classList.remove('active');
          }
          menu.classList.add('active');
          if (menu.hasAttribute('data-hamburger-item')) {}
        }.bind(this));
      })
      if (this.toggler) {
        this.toggler.addEventListener('click', this.toggleHamburger.bind(this))
      }
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.closeHamburger.bind(this))
      }
      this.updateHeaderHeight();
      this.resizeObserver = new ResizeObserver(this.updateHeaderHeight.bind(this));
      this.resizeObserver.observe(this);
      getHeaderSpacing();
    }


    toggleHamburger() {
      if (this.toggler.classList.contains('active')) {
        this.closeHamburger();
      } else {
        this.openHamburger();
      }
    }

    openHamburger() {
      this.toggler.classList.add('active')
      setTimeout(() => {
        this.classList.add('active')
        document.body.classList.add('hamburger-menu-open', 'overflow-hidden')
      }, 150);

      this.style.display = 'flex'
      setTimeout(() => {
        this.querySelectorAll('[data-hamburger-menu]').forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animate');
          }, index * 100); // 100ms delay for each item
        });
      }, 600);


    }
    closeHamburger() {
      this.classList.remove('active')
      setTimeout(() => {
        this.toggler.classList.remove('active')
        this.style.display = 'none'
        document.body.classList.remove('hamburger-menu-open', 'overflow-hidden')
        this.querySelectorAll('[data-hamburger-menu]').forEach((item, index) => {
          item.classList.remove('animate');
        });
      }, 800);
    }

    updateHeaderHeight() {
      this.announcementbarHeight = document.querySelector('.announcement-bar--main')?.getBoundingClientRect().height.toFixed(2) || 0;
      this.headerHeight = this.closest('[data-header-section]')?.getBoundingClientRect().height.toFixed(2) || 0;
      document.body.style.setProperty('--announcement_height', `${this.announcementbarHeight}px`);
      document.body.style.setProperty('--header_height', `${this.headerHeight}px`);

      const hasBothClasses = this.closest('[data-header-section]').classList.contains('desktop-transparent') || this.closest('[data-header-section]').classList.contains('mobile-transparent');
      if (hasBothClasses) {
        document.body.style.setProperty('--desktop_transparent_header_height', `${this.headerHeight}px`);
        document.body.style.setProperty('--mobile_transparent_header_height', `${this.headerHeight}px`);
      }
    }

  }
  customElements.define('hamburger-menu', HamburgerMenu);
}

if(!customElements.get('header-menu')) {
  class HeaderMenu extends HTMLElement {
    constructor() {
      super();
      this.wrapper = this.closest('[data-header-navigation]');
      this.parent = this.closest('.header--menu-item');
      this.innerMenu = this.querySelector('[header-menu-inner]');
      this.headerMenuMegaMenu = this.querySelector('[data-header-menu-megamenu]');
      this.headerElement = this.closest('.shopify-section');
      this.headerTag = this.headerElement?.querySelector('header');
      this.hideTimeout = null;
      this.windowScrollTop = window.scrollY;
      this.currentScrollTop = 0;
      this.parent.addEventListener('keyup', this.onKeyUpEscape.bind(this));
      if (this.dataset.headerNavigation == 'hover') {
        this.addEventListener('mouseenter', this.showContent.bind(this));
        this.addEventListener('mouseleave', this.delayedHideContent.bind(this));
      } else {
        // this.querySelectorAll('[data-child]').forEach((item) => item.addEventListener('click', this.submenuInitializer.bind(this, item)));
        this.addEventListener('click', this.toggleContent.bind(this));
      }
      // if(this.dataset.menuType == 'dropdown'){
      this.querySelectorAll('[data-child]').forEach((item) => item.addEventListener('mouseenter', this.submenuInitializer.bind(this, item)));
      // }
      this.initHeader();
      this.addScrollListener();
      this.dropDownMenuPositions();
      this.offsetForDropDown();
      this.resizeObserver = new ResizeObserver(this.dropDownMenuPositions.bind(this));
      this.resizeObserver.observe(this.closest('[data-header-section]'));
      const resizeObserverDropdown = new ResizeObserver(this.offsetForDropDown.bind(this));
      resizeObserverDropdown.observe(this.closest('[data-header-section]'));
      getHeaderSpacing();
    }

    onKeyUpEscape() {
      if (event.code.toUpperCase() !== 'ESCAPE') return;
      if (event.currentTarget.classList.contains('active')) {
        this.deactivateAllMenus();
      }
    }

    offsetForDropDown() {
      const submenu = this.querySelector('[header-menu-inner]');
      if (submenu && this.classList.contains('header-dropdown')) {
        const container = this.closest('ul[is="menu-slide"]');
        if (!container) {
          //console.info('Parent container not found for header-menu.');
          return;
        }
        const containerRect = container.getBoundingClientRect();
        const menuRect = this.getBoundingClientRect();
        const submenuRect = submenu.getBoundingClientRect();
        const gap = 70;
        let offsetLeft = menuRect.left - containerRect.left;
        // Calculate the right boundary offset within the container
        const maxOffsetLeft = containerRect.width - submenuRect.width - gap;
        // If the submenu goes beyond the right edge of the container
        if (offsetLeft + submenuRect.width > containerRect.width - gap) {
          offsetLeft = maxOffsetLeft;
        }

        // Ensure the submenu stays within the left edge of the container
        offsetLeft = Math.max(offsetLeft, gap);
        // Apply the calculated offset to the submenu
        submenu.style.left = `${offsetLeft}px`;
      }
    }


    submenuInitializer(item) {
      if (item.querySelector('[data-grand-child-list]')) {

        if (item.querySelector('[data-grand-child-list]').classList.contains('active')) return;
        Array.from(item.closest('header-menu').querySelectorAll('[data-child]')).map((childlist) => {
          childlist.classList.remove('active');
        });
        Array.from(item.closest('header-menu').querySelectorAll('[data-grand-child-list]')).map((grandchildlist) => {
          grandchildlist.classList.remove('active');
        });
        item.classList.add('active');
        item.querySelector('[data-grand-child-list]').classList.add('active')
      } else {
        Array.from(item.closest('header-menu').querySelectorAll('[data-child]')).map((childlist) => {
          childlist.classList.remove('active');
        });
        Array.from(item.closest('header-menu').querySelectorAll('[data-grand-child-list]')).map((grandchildlist) => {
          grandchildlist.classList.remove('active');
        });
      }
    }

    dropDownMenuPositions() {
      if (window.innerWidth < 992) return false;
      this.querySelector('[header-menu-inner]').classList.remove("menu-position-left");
      const windowSize = window.innerWidth - 200;
      const rect = this.getBoundingClientRect();
      let currentPosition = rect.left + rect.width;

      const grandChildList = this.querySelector("[header-menu-inner]");
      if (grandChildList) {
        currentPosition += grandChildList.getBoundingClientRect().width;
      }

      if (currentPosition >= windowSize) {
        this.querySelector('[header-menu-inner]').classList.add("menu-position-left");
      }
    }

    connectedCallback() {
      if (this.headerElement) {
        this.resizeObserver = new ResizeObserver(this.updateHeaderHeight.bind(this));
        this.resizeObserver.observe(this.headerElement);
      }
      document.body.addEventListener('click', this.handleClickOutside.bind(this));
      this.innerMenu?.addEventListener('click', this.stopPropagation);
    }

    disconnectedCallback() {
      if (this.headerElement) {
        this.resizeObserver.unobserve(this.headerElement);
      }
      document.removeEventListener('click', this.handleClickOutside.bind(this));
      this.innerMenu?.removeEventListener('click', this.stopPropagation);
    }

    initHeader() {
      if (this.headerTag) {
        this.stickyHeader = this.headerTag.classList.contains('d-sticky-true');
        if (this.stickyHeader) {
          this.headerElement.classList.add('sticky-active');
          this.updateHeaderHeight();
        }
      }
    }

    addScrollListener() {
      window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    handleScroll() {

      if (!this.stickyHeader) return;
      const scrollY = window.scrollY;
      const isScrollingDown = this.windowScrollTop < scrollY;
      this.headerElement.classList.toggle('is-sticky', scrollY > this.headerHeight);
      document.body.style.setProperty('--header_height', this.headerElement.classList.contains('is-hidden') ? '0px' : `${this.headerHeight}px`);
      this.windowScrollTop = scrollY;
    }

    updateHeaderHeight() {
      this.announcementbarHeight = document.querySelector('.announcement-bar--main')?.getBoundingClientRect().height.toFixed(2) || 0;
      this.headerHeight = this.headerElement.querySelector('[data-header-section]')?.getBoundingClientRect().height.toFixed(2) || 0;
      document.body.style.setProperty('--announcement_height', `${this.announcementbarHeight}px`);
      document.body.style.setProperty('--header_height', `${this.headerHeight}px`);

      const hasBothClasses = this.headerElement.querySelector('[data-header-section]').classList.contains('desktop-transparent') || this.headerElement.querySelector('[data-header-section]').classList.contains('mobile-transparent');
      if (hasBothClasses) {
        document.body.style.setProperty('--desktop_transparent_header_height', `${this.headerHeight}px`);
        document.body.style.setProperty('--mobile_transparent_header_height', `${this.headerHeight}px`);
      }
    }


    deactivateAllMenus() {
      document.querySelectorAll('header-menu.active').forEach(menu => {
        menu.classList.remove('active');
        // menu.querySelector('[header-menu-inner]')?.classList.add('hidden');
        menu.closest('.header--menu-item')?.classList.remove('active');
        menu.closest('[data-header-navigation]')?.classList.remove('active');
        if (menu.querySelector('[data-header-menu-megamenu]')) {
          menu.querySelector('[data-header-menu-megamenu]').style.clipPath = 'polygon(0 0,100% 0,100% 0%,0 0%)'
        }
        // Remove individual menu item states
        Array.from(menu.querySelectorAll('[data-child]'), (item) => {
          item.classList.remove('active');
        });
      });
      // Remove `megamenu-open` only if no active menus remain
      if (!document.querySelector('header-menu.active')) {
        if (document.body.classList.contains('megamenu-open')) {
          document.body.classList.remove('megamenu-open');
        }

      }
    }


    showContent() {
      clearTimeout(this.hideTimeout);
      this.deactivateAllMenus();
      // this.innerMenu?.classList.remove('hidden'); 
      setTimeout(() => {
        if (this.classList.contains('header-megamenu') || this.classList.contains('header-dropdown')) {
          document.body.classList.add('megamenu-open');
        }

        if (this.parent.classList.contains('has-children')) {
          this.wrapper.classList.add('active');
          this.parent.classList.add('active');
          this.headerMenuMegaMenu && (this.headerMenuMegaMenu.style.clipPath = 'polygon(0 0,100% 0,100% 100%,0 100%)')
          this.classList.add('active');
        }
      }, 150);
    }


    hideContent() {
      this.classList.remove('active');
      this.wrapper.classList.remove('active');
      this.parent.classList.remove('active');
      this.headerMenuMegaMenu && (this.headerMenuMegaMenu.style.clipPath = 'polygon(0 0,100% 0,100% 0%,0 0%)');

      setTimeout(() => {
        if (!this.classList.contains('active')) {
          // this.innerMenu?.classList.add('hidden');
        }
      }, 150);

      if (this.classList.contains('header-dropdown')) {
        Array.from(this.querySelectorAll('[data-child]'), (item) => {
          item.classList.remove('active');
        });
      }

      // After hiding, check if any menus are still active
      if (!document.querySelector('header-menu.active')) {
        document.body.classList.remove('megamenu-open');
      }
    }


    delayedHideContent() {
      this.hideTimeout = setTimeout(this.hideContent.bind(this), 300);
    }

    toggleContent(e) {
      e.preventDefault();
      this.classList.contains('active') ? this.hideContent() : this.showContent();
    }

    handleClickOutside(event) {
      if (this.contains(event.target)) {
        return;
      } else {
        this.deactivateAllMenus();
      }
    }

    stopPropagation(event) {
      event.stopPropagation();
    }
  }
  customElements.define('header-menu', HeaderMenu);
}

if(!customElements.get('quick-short-menu')) {
  class QuickShortMenu extends HTMLElement {
    constructor() {
      super();

      this.quickButton = document.querySelector('quick-short-menu');
      this.threshold = 300;
      this.isDesktop = window.innerWidth >= 1024;

      // Bind methods
      this.handleScroll = this.handleScroll.bind(this);
      this.updateParameters = this.updateParameters.bind(this);


      // Initialize
      this.handleScroll();
      window.addEventListener('scroll', this.handleScroll);
      window.addEventListener("resize", this.updateParameters);

      this.button = this.querySelector(".short-menu--button");
      this.icon = this.button.querySelector(".short-menu--button-icon");
      this.menuWrapper = this.querySelector('[data-menu]');
      this.menuLinks = this.querySelectorAll('[data-quick-menu-link]');

      this.updateParameters();
      this.setupEventListeners();
    }

    handleScroll() {
      if (window.scrollY > this.threshold) {
        this.fadeOut();
      } else {
        this.fadeIn();
      }
    }

    fadeOut() {
      if (!this.classList.contains('fade-in')) {
        this.classList.add('fade-in');
        this.classList.remove('fade-out');
        this.toggleLogoVisibility(false); // Hide logo
      }
    }

    fadeIn() {
      if (!this.classList.contains('fade-out')) {
        this.classList.add('fade-out');
        this.classList.remove('fade-in');
        this.toggleLogoVisibility(true); // Show logo
      }
    }

    toggleLogoVisibility(visible) {
      const logo = document.querySelector('.header--logo'); // Change selector as needed
      if (this.isDesktop) {
        logo.classList.toggle('hidden', !visible);
      }
    }

    setupEventListeners() {
      this.button.addEventListener('click', () => {
        this.menuWrapper.classList.add('active');
        setTimeout(() => {
          this.menuWrapper.style.setProperty("pointer-events", `auto`);
        }, 350);
      });

      // Event listener for body click
      document.body.addEventListener('click', (event) => {
        const isClickInside = this.menuWrapper.contains(event.target) || this.button.contains(event.target);
        if (this.menuWrapper.classList.contains('active') && !isClickInside) {
          this.menuWrapper.classList.remove('active');
          this.menuWrapper.style.setProperty("opacity", `1`);
          setTimeout(() => {
            this.menuWrapper.style.removeProperty("opacity");
          }, 150);
          this.style.setProperty("--background-translate", `0`);
          this.menuWrapper.style.removeProperty("pointer-events");
          this.menuLinks.forEach(link => link.classList.remove('active'));
          this.querySelector('[data-index="0"]').classList.add('active');
        }
      });

      this.menuWrapper.addEventListener('mouseleave', () => {
        this.menuWrapper.classList.remove('active');
        this.menuWrapper.style.setProperty("opacity", `1`);
        setTimeout(() => {
          this.menuWrapper.style.removeProperty("opacity");
        }, 150);
        this.style.setProperty("--background-translate", `0`);
        this.menuWrapper.style.removeProperty("pointer-events");
        this.menuLinks.forEach(link => link.classList.remove('active'));
        this.querySelector('[data-index="0"]').classList.add('active');
      });

      this.menuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
          let index = parseInt(link.dataset.index, 10);
          let translateY = Array.from(this.menuLinks)
            .slice(0, index)
            .reduce((total, sibling) => total + sibling.getBoundingClientRect().height, 0);

          this.style.setProperty("--background-translate", `${index}`);
          this.style.setProperty("--short-item-height", `${link.getBoundingClientRect().height}px`);
          link.classList.add('active');

          this.menuLinks.forEach(sibling => {
            if (sibling !== link) {
              sibling.classList.remove('active');
            }
          });
        });
      });
    }
    updateParameters() {
      this.styleValues = getComputedStyle(this.button);
      this.childElementsGap = parseFloat(this.styleValues.gap) || 0;
      this.iconWidth = this.icon.clientWidth;

      const menuLinks = this.querySelectorAll('.short-menu--menu-link');
      let maxTextWidth = Math.max(...Array.from(menuLinks).map(link => link.textContent.length));

      this.buttonWidth = maxTextWidth > 25 ? 895 : maxTextWidth > 12 ? 655 : 395;

      if (this.isDesktop) {
        this.style.setProperty("--menu-max-width", `${this.buttonWidth}px`);
        //this.style.setProperty("--menu-width", `${this.buttonWidth}px`);
      } else {
        this.style.setProperty("--menu-max-width", `195px`);
        //this.style.setProperty("--menu-width", `195px`);
      }
      this.style.setProperty("--motion-translate", `170px`);

      this.height = 'auto';
      this.menuList = this.querySelector('.short-menu--menu-list');
      if (this.menuList) {
        let menuItemHeight = this.menuLinks[0].clientHeight;
        let menuWrapperStyles = getComputedStyle(this.menuList);
        this.height = `${(this.menuLinks.length * menuItemHeight) + 3 + parseInt(menuWrapperStyles.paddingBottom) + parseInt(menuWrapperStyles.paddingTop)}px`;
      }

      // Update --translate-height based on device or viewport size
      this.style.setProperty("--translate-height", '415px');
    }

    getTextWidth(text, font) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = font;
      return context.measureText(text).width;
    }
  }
  customElements.define('quick-short-menu', QuickShortMenu);
}

function isSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

if (isSafari()) {
  function setupMenuSlide() {
    if (window.innerWidth <= 768) {
      return; // Exit the function if not on desktop
    }
    const container = document.querySelector('[data-menus-container]');
    const leftArrow = document.querySelector('[data-arrow-left]');
    const rightArrow = document.querySelector('[data-arrow-right]');
    const menuContent = document.querySelector('[is="menu-slide"]');
    const scrollStep = 40;

    function scrollLeft() {

      menuContent?.scrollBy({
        left: -scrollStep,
        behavior: 'smooth'
      });
      updateArrowsImmediate(-scrollStep);
    }

    function scrollRight() {

      menuContent?.scrollBy({
        left: scrollStep,
        behavior: 'smooth'
      });
      updateArrowsImmediate(scrollStep);
    }

    function updateArrows() {

      const maxScrollLeft = menuContent?.scrollWidth - menuContent?.clientWidth;
      if (menuContent?.scrollLeft === 0) {
        leftArrow.style.display = 'none';
      } else {
        leftArrow.style.display = 'flex';
      }

      if (menuContent.scrollLeft >= maxScrollLeft) {
        rightArrow.style.display = 'none';
      } else {
        rightArrow.style.display = 'flex';
      }
    }

    function updateArrowsImmediate(scrollChange) {
      const maxScrollLeft = menuContent.scrollWidth - menuContent.clientWidth;
      const newScrollLeft = Math.max(0, Math.min(menuContent.scrollLeft + scrollChange, maxScrollLeft));

      if (newScrollLeft === 0) {
        leftArrow.style.display = 'none';
      } else {
        leftArrow.style.display = 'flex';
      }

      if (newScrollLeft >= maxScrollLeft) {
        rightArrow.style.display = 'none';
      } else {
        rightArrow.style.display = 'flex';
      }
    }

    function callOffsetForDropDown() {

      const headerMenus = menuContent.querySelectorAll('li header-menu');
      headerMenus.forEach(headerMenu => {
        if (headerMenu.offsetForDropDown) {
          headerMenu.offsetForDropDown();
        }
      });
    }

    updateArrows();
    callOffsetForDropDown();

    leftArrow.addEventListener('click', scrollLeft);
    rightArrow.addEventListener('click', scrollRight);
    window.addEventListener('resize', updateArrows);
  }

  // Call the setup function once the DOM is fully loaded
  document.addEventListener('DOMContentLoaded', setupMenuSlide);
} else {
  if(!customElements.get('menu-slide')) {
    class MenuSlide extends HTMLUListElement {
      constructor() {
        super();
        this.scrollStep = 40; // Set the scroll step to 50 pixels
        this.container = null;
        this.leftArrow = null;
        this.rightArrow = null;
      }

      connectedCallback() {
        this.headerMenu = document.querySelector('header-menu');
        this.container = this.closest('[data-menus-container]');
        this.leftArrow = this.container.querySelector('[data-arrow-left]');
        this.rightArrow = this.container.querySelector('[data-arrow-right]');

        this.leftArrow.addEventListener('click', this.scrollLeftFun.bind(this));
        this.rightArrow.addEventListener('click', this.scrollRightFun.bind(this));

        window.addEventListener('resize', this.updateArrows.bind(this));
        this.updateArrows();
        this.callOffsetForDropDown();
      }

      scrollLeftFun() {

        this.scrollBy({
          left: -this.scrollStep,
          behavior: 'smooth'
        });
        // this.updateArrows();
        this.updateArrowsImmediate(-this.scrollStep);
        this.callOffsetForDropDown();
      }

      scrollRightFun() {
        const maxScrollLeft = this.scrollWidth - this.clientWidth;
        this.scrollBy({
          left: this.scrollStep,
          behavior: 'smooth'
        });
        // this.updateArrows();
        this.updateArrowsImmediate(this.scrollStep);
        this.callOffsetForDropDown();
      }

      updateArrows() {
        const maxScrollLeft = this.scrollWidth - this.clientWidth;
        if (this.scrollLeft === 0) {
          this.leftArrow.style.display = 'none';
        } else {
          this.leftArrow.style.display = 'flex';
        }

        if (this.scrollLeft >= maxScrollLeft) {
          this.rightArrow.style.display = 'none';
        } else {
          this.rightArrow.style.display = 'flex';
        }
      }

      updateArrowsImmediate(scrollChange) {
        const maxScrollLeft = this.scrollWidth - this.clientWidth;
        const newScrollLeft = Math.max(0, Math.min(this.scrollLeft + scrollChange, maxScrollLeft));

        if (newScrollLeft === 0) {
          this.leftArrow.style.display = 'none';
        } else {
          this.leftArrow.style.display = 'flex';
        }

        if (newScrollLeft >= maxScrollLeft) {
          this.rightArrow.style.display = 'none';
        } else {
          this.rightArrow.style.display = 'flex';
        }
      }

      callOffsetForDropDown() {
        // Find all `header-menu` elements within `li` tags
        const headerMenus = this.querySelectorAll('li header-menu');
        headerMenus.forEach(headerMenu => {
          if (headerMenu.offsetForDropDown) {
            headerMenu.offsetForDropDown();
          }
        });
      }
    }
    customElements.define('menu-slide', MenuSlide, {
      extends: 'ul'
    });
  }
}

if(!customElements.get('mobile-menu')) {
  class MobileMenu extends HTMLElement {
    constructor() {
      super();

      this.header = this.closest('header');
      this.preventToggle = false; // Flag to prevent re-triggering

      this.header.querySelector('[data-mobile-toggler]').addEventListener('click', this.toggleMobileMenu.bind(this));

      Array.from(this.querySelectorAll('[data-menu-item]'), (element) => {
        element.addEventListener('click', (event) => {
          if (!this.preventToggle) {
            this.openMenus(element);
          }
        });
      });

      Array.from(this.querySelectorAll('[data-back-to-menu]'), (item) => {
        item.addEventListener('click', (event) => {
          this.backToMenu(item);
          this.preventToggle = true; // Set the flag to prevent re-triggering
          setTimeout(() => {
            this.preventToggle = false; // Reset the flag after a short delay
          }, 100); // Adjust the delay as needed
        });
      });
      getHeaderSpacing();
    }

    openMenus(element) {
      element.classList.add('active');
    }

    backToMenu(item) {
      const parentMenuItem = item.closest('[data-menu-item]');
      if (parentMenuItem) {
        parentMenuItem.classList.remove('active');
      } else {
        console.info('Parent menu item not found.');
      }
    }

    toggleMobileMenu() {
      if (document.querySelector(`[data-drawer="mobile-menu-drawer"]`)) {
        setTimeout(() => {
          document.querySelector(`[data-drawer="mobile-menu-drawer"]`).classList.add('show');
          document.body.classList.add('overflow-hidden');
        }, 400);
        document.querySelector(`[data-drawer="mobile-menu-drawer"]`).style.display = 'flex';
      }

      setTimeout(() => {
        this.header.querySelectorAll('[data-mobile-item]').forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('animate');
          }, index * 100); // 100ms delay for each item
        });
      }, 600);
    }
  }
  customElements.define('mobile-menu', MobileMenu);
}