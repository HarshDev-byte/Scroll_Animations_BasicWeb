// ============================================
// CYBERFICTION - Responsive Interactive Experience
// ============================================

const CONFIG = {
    frameCount: 300,
    isMobile: window.innerWidth < 768,
    isTouch: 'ontouchstart' in window,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

const images = [];
let imagesLoaded = 0;
let locoScroll = null;

// ============================================
// Utility Functions
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getFramePath(index) {
    const num = String(index + 1).padStart(4, '0');
    return `./male${num}.png`;
}

// ============================================
// Mobile Menu
// ============================================
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
    
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
        mobileMenu.setAttribute('aria-hidden', !isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
        
        // Animate links
        if (isActive) {
            mobileLinks.forEach((link, i) => {
                link.style.transitionDelay = `${0.1 + i * 0.05}s`;
            });
        } else {
            mobileLinks.forEach(link => {
                link.style.transitionDelay = '0s';
            });
        }
    });

    // Close menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            mobileMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            mobileMenu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        });
    });
}

// ============================================
// Custom Cursor (Desktop Only)
// ============================================
function initCursor() {
    if (CONFIG.isTouch || CONFIG.isMobile) return;
    
    const cursor = document.getElementById('cursor');
    const cursorBlur = document.getElementById('cursor-blur');
    
    if (!cursor || !cursorBlur) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let blurX = 0, blurY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';

        blurX += (mouseX - blurX) * 0.05;
        blurY += (mouseY - blurY) * 0.05;
        cursorBlur.style.left = blurX + 'px';
        cursorBlur.style.top = blurY + 'px';

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .magnetic, .video-preview, input');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
}

// ============================================
// Magnetic Effect (Desktop Only)
// ============================================
function initMagneticButtons() {
    if (CONFIG.isTouch || CONFIG.isMobile) return;
    
    const magneticElements = document.querySelectorAll('.magnetic');
    
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.25,
                y: y * 0.25,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });
}

// ============================================
// Image Preloader
// ============================================
function preloadImages() {
    return new Promise((resolve) => {
        const loaderProgress = document.querySelector('.loader-progress');
        const loaderPercent = document.getElementById('loader-percent');
        const loader = document.getElementById('loader');
        
        // For very slow connections, set a timeout
        const timeout = setTimeout(() => {
            console.warn('Image loading timeout, proceeding anyway');
            resolve();
        }, 30000);
        
        for (let i = 0; i < CONFIG.frameCount; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            
            img.onload = img.onerror = () => {
                imagesLoaded++;
                const progress = Math.round((imagesLoaded / CONFIG.frameCount) * 100);
                
                if (loaderProgress) loaderProgress.style.width = `${progress}%`;
                if (loaderPercent) loaderPercent.textContent = progress;
                if (loader) loader.setAttribute('aria-valuenow', progress);
                
                if (imagesLoaded === CONFIG.frameCount) {
                    clearTimeout(timeout);
                    resolve();
                }
            };
            
            images.push(img);
        }
    });
}

// ============================================
// Locomotive Scroll
// ============================================
function initLocomotiveScroll() {
    gsap.registerPlugin(ScrollTrigger);

    const scrollConfig = {
        el: document.querySelector("#main"),
        smooth: !CONFIG.prefersReducedMotion,
        multiplier: CONFIG.isMobile ? 1 : 0.8,
        lerp: CONFIG.isMobile ? 0.1 : 0.03,
        smartphone: { smooth: !CONFIG.prefersReducedMotion },
        tablet: { smooth: !CONFIG.prefersReducedMotion }
    };

    locoScroll = new LocomotiveScroll(scrollConfig);

    locoScroll.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy("#main", {
        scrollTop(value) {
            return arguments.length
                ? locoScroll.scrollTo(value, 0, 0)
                : locoScroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight
            };
        },
        pinType: document.querySelector("#main").style.transform ? "transform" : "fixed"
    });

    ScrollTrigger.addEventListener("refresh", () => locoScroll.update());
    ScrollTrigger.refresh();
}


// ============================================
// Canvas Frame Animation
// ============================================
function initCanvas() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    
    const context = canvas.getContext("2d");

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    setCanvasSize();

    const imageSeq = { frame: 0 };

    function render() {
        if (images[imageSeq.frame]) {
            scaleImage(images[imageSeq.frame], context);
        }
    }

    function scaleImage(img, ctx) {
        const canvas = ctx.canvas;
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerX = (canvas.width - img.width * ratio) / 2;
        const centerY = (canvas.height - img.height * ratio) / 2;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(
            img,
            0, 0, img.width, img.height,
            centerX, centerY, img.width * ratio, img.height * ratio
        );
    }

    // Frame animation on scroll
    gsap.to(imageSeq, {
        frame: CONFIG.frameCount - 1,
        snap: "frame",
        ease: "none",
        scrollTrigger: {
            scrub: CONFIG.isMobile ? 0.8 : 0.5,
            trigger: "#page>canvas",
            start: "top top",
            end: "600% top",
            scroller: "#main"
        },
        onUpdate: render
    });

    // Pin the canvas
    ScrollTrigger.create({
        trigger: "#page>canvas",
        pin: true,
        scroller: "#main",
        start: "top top",
        end: "600% top"
    });

    // Initial render
    if (images[0]) {
        images[0].onload = render;
        if (images[0].complete) render();
    }

    // Handle resize
    const handleResize = debounce(() => {
        setCanvasSize();
        render();
    }, 250);
    
    window.addEventListener('resize', handleResize);
}

// ============================================
// Page Animations
// ============================================
function initPageAnimations() {
    if (CONFIG.prefersReducedMotion) {
        // Show all content immediately for reduced motion
        gsap.set('.text-inner', { y: 0 });
        gsap.set('.fade-text', { opacity: 1 });
        return;
    }

    // Page 1 - Keywords
    gsap.to("#page1", {
        scrollTrigger: {
            trigger: "#page1",
            start: "top top",
            end: "bottom top",
            pin: true,
            scroller: "#main"
        }
    });

    const page1RightTexts = gsap.utils.toArray("#page1 #right-text .text-inner");
    page1RightTexts.forEach((text, i) => {
        gsap.to(text, {
            y: 0,
            duration: 1,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#page1",
                start: "top 80%",
                scroller: "#main"
            }
        });
    });

    const page1LeftTexts = gsap.utils.toArray("#page1 #left-text .text-inner");
    page1LeftTexts.forEach((text, i) => {
        gsap.to(text, {
            y: 0,
            duration: 1,
            delay: 0.3 + i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#page1",
                start: "top 60%",
                scroller: "#main"
            }
        });
    });

    gsap.to("#page1 .fade-text", {
        opacity: 1,
        duration: 1,
        delay: 0.8,
        scrollTrigger: {
            trigger: "#page1",
            start: "top 50%",
            scroller: "#main"
        }
    });

    // Page 2 - Have Fun
    gsap.to("#page2", {
        scrollTrigger: {
            trigger: "#page2",
            start: "top top",
            end: "bottom top",
            pin: true,
            scroller: "#main"
        }
    });

    const page2Texts = gsap.utils.toArray("#page2 #text1 .text-inner");
    page2Texts.forEach((text, i) => {
        gsap.to(text, {
            y: 0,
            duration: 1.2,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#page2",
                start: "top 60%",
                scroller: "#main"
            }
        });
    });

    gsap.from("#page2 #text2", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#page2 #text2",
            start: "top 85%",
            scroller: "#main"
        }
    });

    if (!CONFIG.isMobile) {
        gsap.from(".video-preview", {
            x: 50,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: "#page2",
                start: "top 50%",
                scroller: "#main"
            }
        });
    }

    // Page 3 - Playground
    gsap.to("#page3", {
        scrollTrigger: {
            trigger: "#page3",
            start: "top top",
            end: "bottom top",
            pin: true,
            scroller: "#main"
        }
    });

    const page3Texts = gsap.utils.toArray("#page3 #text3 .text-inner");
    page3Texts.forEach((text, i) => {
        gsap.to(text, {
            y: 0,
            duration: 1.2,
            delay: i * 0.15,
            ease: "power3.out",
            scrollTrigger: {
                trigger: "#page3",
                start: "top 50%",
                scroller: "#main"
            }
        });
    });

    gsap.from("#page3 .cta-group", {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#page3",
            start: "top 40%",
            scroller: "#main"
        }
    });
}

// ============================================
// Navigation
// ============================================
function initNavAnimation() {
    const nav = document.querySelector("#nav");
    if (!nav || !locoScroll) return;

    locoScroll.on("scroll", (args) => {
        if (args.scroll.y > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// ============================================
// Counter Animation
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.value);
        
        gsap.to(counter, {
            innerHTML: target,
            duration: CONFIG.prefersReducedMotion ? 0 : 2,
            ease: "power2.out",
            snap: { innerHTML: 1 },
            scrollTrigger: {
                trigger: counter,
                start: "top 90%",
                scroller: "#main"
            }
        });
    });
}

// ============================================
// Parallax Effects
// ============================================
function initParallax() {
    if (CONFIG.prefersReducedMotion || CONFIG.isMobile) return;

    gsap.to(".shape-1", {
        y: -80,
        scrollTrigger: {
            trigger: "#page1",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            scroller: "#main"
        }
    });

    gsap.to(".shape-2", {
        y: 100,
        scrollTrigger: {
            trigger: "#page1",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            scroller: "#main"
        }
    });

    gsap.to(".shape-3", {
        y: -60,
        x: 40,
        scrollTrigger: {
            trigger: "#page1",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
            scroller: "#main"
        }
    });
}

// ============================================
// Footer Animation
// ============================================
function initFooterAnimation() {
    if (CONFIG.prefersReducedMotion) return;

    gsap.from(".footer-brand", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#footer",
            start: "top 85%",
            scroller: "#main"
        }
    });

    gsap.from(".footer-col", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#footer",
            start: "top 80%",
            scroller: "#main"
        }
    });

    gsap.from(".footer-newsletter", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#footer",
            start: "top 75%",
            scroller: "#main"
        }
    });
}


// ============================================
// Loader Animation
// ============================================
function hideLoader() {
    const loader = document.getElementById('loader');
    const loaderContent = document.querySelector('.loader-content');
    const loaderBgText = document.querySelector('.loader-bg-text');
    
    if (!loader) return;

    if (CONFIG.prefersReducedMotion) {
        loader.classList.add('hidden');
        startEntryAnimations();
        return;
    }
    
    const tl = gsap.timeline();
    
    tl.to(loaderContent, {
        y: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
    })
    .to(loaderBgText, {
        scale: 1.3,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in"
    }, "-=0.2")
    .to(loader, {
        yPercent: -100,
        duration: 0.7,
        ease: "power3.inOut",
        onComplete: () => {
            loader.classList.add('hidden');
            startEntryAnimations();
        }
    });
}

function startEntryAnimations() {
    if (CONFIG.prefersReducedMotion) return;
    
    const tl = gsap.timeline();
    
    tl.from("#nav", {
        y: -80,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    })
    .from("#loop h1", {
        y: 80,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.4")
    .from(".hero-badge", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
    }, "-=0.4")
    .from(".hero-description", {
        y: 25,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out"
    }, "-=0.2")
    .from(".scroll-indicator", {
        y: 15,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.3");
    
    if (!CONFIG.isMobile) {
        tl.from(".stat", {
            y: 30,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out"
        }, "-=0.4");
    }
}

// ============================================
// Resize Handler
// ============================================
function handleResize() {
    const newIsMobile = window.innerWidth < 768;
    
    if (newIsMobile !== CONFIG.isMobile) {
        CONFIG.isMobile = newIsMobile;
        // Refresh ScrollTrigger on breakpoint change
        if (locoScroll) {
            locoScroll.update();
            ScrollTrigger.refresh();
        }
    }
}

// ============================================
// Initialize
// ============================================
async function init() {
    try {
        // Initialize mobile menu first (works without images)
        initMobileMenu();
        
        // Start cursor immediately on desktop
        initCursor();
        
        // Preload images
        await preloadImages();
        
        // Initialize scroll and animations
        initLocomotiveScroll();
        initCanvas();
        initPageAnimations();
        initNavAnimation();
        initCounters();
        initMagneticButtons();
        initParallax();
        initFooterAnimation();
        
        // Hide loader
        setTimeout(hideLoader, 400);
        
    } catch (error) {
        console.error('Initialization error:', error);
        hideLoader();
    }
}

// ============================================
// Event Listeners
// ============================================
document.addEventListener('DOMContentLoaded', init);

window.addEventListener('resize', debounce(handleResize, 250));

// Handle orientation change on mobile
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        if (locoScroll) {
            locoScroll.update();
            ScrollTrigger.refresh();
        }
    }, 500);
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && locoScroll) {
        locoScroll.update();
    }
});
