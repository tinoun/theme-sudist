if (!customElements.get('reveal-media')) {
  customElements.define(
    'reveal-media',
    class revealMedia extends HTMLElement {
        constructor() {
            super();
            this.sectionId = this.dataset.sectionId;
            this.waveTl = null;
            this.svg = null;
            this.svgLine = null;
            this.svgSize = null;
            this.widthTween = null;
            this.initateAnimation();
            this.handleResize = this.handleResize.bind(this);

        }
        connectedCallback() {
            window.addEventListener('resize', this.handleResize);
            this.svg = this.querySelector('[data-svg]');
            if (!this.svg) {
                // console.error('SVG element not found!');
                return;
            }
            this.svgLine = this.svg.querySelector('.line');
            if (!this.svgLine) {
                // console.error('SVG <path> element not found!');
                return;
            } 
            this.svgSize = {
                w: this.svg.viewBox.baseVal.width,
                h: this.svg.viewBox.baseVal.height
            };
            gsap.set(this.svgLine, {
                attr: { d: this.generatePathData() }
            });
            this.animationLoop();
        } 
        
        disconnectedCallback() {
            if (this.waveTl) this.waveTl.kill();
            if (this.widthTween) this.widthTween.kill();
        }
        handleResize(){
            setTimeout(() => {
                const width = window.innerWidth;
                if(width < 1025){
                    this.classList.remove('revealing-view');
                }
                ScrollTrigger.refresh();
            }, 500);
        }
        initateAnimation(){
            ScrollTrigger.getAll().forEach(st => {
                if (this.contains(st.trigger)) st.kill();
            }); 
                 
            let matchMediaCheck = gsap.matchMedia();
            matchMediaCheck.add('(min-width: 1025px)', () => {
                const leftRevealCard = this.querySelector('[reveal-card-left]');
                const centerRevealCard = this.querySelector('[reveal-card-center]');
                const rightRevealCard = this.querySelector('[reveal-card-right]');
                // const revalDataContainer = this.querySelector('[data-reveal-container]');
                const revealHeading = this.querySelector('[data-reveal-heading]');
                const startPosition = revealHeading ? 'top top' : 'top center';
       
                gsap.set(leftRevealCard,{opacity:0})
                gsap.set(rightRevealCard,{opacity:0})
                const revealSecondTimeline = gsap.timeline({
                    scrollTrigger:{
                        id: this.sectionId,
                        trigger:this,
                        start: startPosition,
                        end:'bottom bottom',
                        onEnter: () => {
                            this.classList.add('revealing-view');
                            setTimeout(() => {
                             ScrollTrigger.refresh();
                            }, 200);
                        },
                        onLeaveBack: () => {
                            this.classList.remove('revealing-view');
                            setTimeout(() => {
                             ScrollTrigger.refresh();
                            }, 200);
                        }
                    }          
                })
            });
        }
        random(min, max) {
            return min + Math.random() * (max - min);
        }
        generatePathData() {
            let path = '';
            const freq = this.random(0.005, 0.015);
            const maxAmplitude = this.svgSize.h * this.random(0.3, 0.45);
            const centerY = this.svgSize.h / 2;

            for (let i = 0; i < this.svgSize.w; i += 2) {
                const x = i;
                const y = maxAmplitude * Math.sin(x * freq) + centerY;
                path += i === 0 ? `M${x},${y}` : `L${x},${y}`;
            }
            return path;
        }
        animationLoop() {
            this.waveTl = gsap.to(this.svgLine, {
                duration: 1.5,
                attr: { d: this.generatePathData() },
                ease: 'power2.easeInOut',
                onComplete: () => this.animationLoop()
            });
        }
    }
  );
}
