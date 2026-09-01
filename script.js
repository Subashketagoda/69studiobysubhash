/* ==========================================================================
   69 STUDIO — 2026 PREMIUM INTERACTIVE JAVASCRIPT ENGINE
   Award-Winning Creative Studio Experience
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // --------------------------------------------------------------------------
    // 01 — State & Global Configuration
    // --------------------------------------------------------------------------
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --------------------------------------------------------------------------
    // 02 — Theme Management (Dark / Light Mode)
    // --------------------------------------------------------------------------
    const initTheme = () => {
        const themeBtn = document.getElementById('themeToggleBtn');
        const savedTheme = localStorage.getItem('69_theme') || 'dark';
        
        if (savedTheme === 'light') {
            document.documentElement.classList.remove('dark-theme');
            document.documentElement.classList.add('light-theme');
        } else {
            document.documentElement.classList.remove('light-theme');
            document.documentElement.classList.add('dark-theme');
        }

        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const isLight = document.documentElement.classList.contains('light-theme');
                if (isLight) {
                    document.documentElement.classList.remove('light-theme');
                    document.documentElement.classList.add('dark-theme');
                    localStorage.setItem('69_theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark-theme');
                    document.documentElement.classList.add('light-theme');
                    localStorage.setItem('69_theme', 'light');
                }
            });
        }
    };
    initTheme();

    // --------------------------------------------------------------------------
    // 03 — Cinematic Intro Loader & Preloader
    // --------------------------------------------------------------------------
    const initCinematicIntro = () => {
        const intro = document.getElementById('cinematicIntro');
        const skipBtn = document.getElementById('introSkipBtn');
        const progressBar = document.getElementById('introLoaderBar');
        const percentageText = document.getElementById('introPercentage');
        const ripple = document.getElementById('introRipple');
        const logoNumber = document.getElementById('introNumber');

        const sessionSeen = sessionStorage.getItem('69_cinematic_intro_seen');

        const dismissIntro = () => {
            if (!intro) return;
            intro.classList.add('intro-dismissed');
            document.body.classList.remove('is-loading');
            sessionStorage.setItem('69_cinematic_intro_seen', 'true');
            setTimeout(() => {
                intro.style.display = 'none';
            }, 1000);
        };

        if (skipBtn) {
            skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dismissIntro();
            });
        }

        if (intro) {
            intro.addEventListener('click', dismissIntro);
        }

        // Failsafe backup timeout (2.8s max screen lock guard)
        const failsafeTimeout = setTimeout(dismissIntro, 3500);

        // Immediate skip for returning session visitors or prefers-reduced-motion
        if (prefersReducedMotion || sessionSeen) {
            clearTimeout(failsafeTimeout);
            dismissIntro();
            return;
        }

        // Active Loader Progress Engine
        let progress = 0;
        let isPausedAt69 = false;
        let pageIsLoaded = false;

        window.addEventListener('load', () => {
            pageIsLoaded = true;
        });

        const updateLoader = () => {
            if (progress >= 100) {
                if (progressBar) progressBar.style.width = '100%';
                if (percentageText) percentageText.textContent = 'LOADING 100%';
                setTimeout(() => {
                    clearTimeout(failsafeTimeout);
                    dismissIntro();
                }, 250);
                return;
            }

            // Pause moment at 69%
            if (progress === 69 && !isPausedAt69) {
                isPausedAt69 = true;
                
                // Scale logo up slightly & trigger expanding ripple
                if (logoNumber) {
                    logoNumber.style.transform = 'scale(1.08)';
                    logoNumber.style.textShadow = '0 0 70px rgba(204, 255, 0, 0.6)';
                }
                if (ripple) {
                    ripple.classList.add('animate-ripple');
                }

                // Resume loading progress after a brief 180ms delay
                setTimeout(() => {
                    if (logoNumber) {
                        logoNumber.style.transform = 'scale(1)';
                        logoNumber.style.textShadow = '0 0 50px rgba(204, 255, 0, 0.35)';
                    }
                    progress++;
                    updateLoader();
                }, 220);
                return;
            }

            // Dynamically adjust increment speed based on browser load state
            let nextDelay = 12;
            if (progress < 60) {
                progress += 1;
                nextDelay = 10 + Math.random() * 15;
            } else if (progress < 90) {
                if (pageIsLoaded) {
                    progress += 1;
                    nextDelay = 8;
                } else {
                    progress += 0.5; // slow down if resources are still fetching
                    progress = Math.min(88, progress);
                    nextDelay = 35;
                }
            } else {
                progress += 1;
                nextDelay = 10;
            }

            // Handle decimal progress safely
            const roundedProgress = Math.floor(progress);
            if (progressBar) progressBar.style.width = `${roundedProgress}%`;
            if (percentageText) percentageText.textContent = `LOADING ${roundedProgress < 10 ? '0' + roundedProgress : roundedProgress}%`;

            setTimeout(updateLoader, nextDelay);
        };

        // Delay start slightly for black screen grain noise backdrop to establish (~200ms)
        setTimeout(updateLoader, 200);
    };
    initCinematicIntro();

    // --------------------------------------------------------------------------
    // 04 — Lenis Smooth Scrolling Engine & GSAP Integration
    // --------------------------------------------------------------------------
    let lenis = null;
    try {
        if (typeof Lenis !== 'undefined' && !prefersReducedMotion && !isTouch) {
            lenis = new Lenis({
                duration: 1.1,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 0.95,
                touchMultiplier: 1.2,
                infinite: false,
            });

            if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                lenis.on('scroll', (e) => {
                    ScrollTrigger.update();
                    
                    // 24 — Scroll Velocity Subtle Typography Stretching & Settle
                    const velocity = e.velocity || 0;
                    const clampedVel = Math.max(-10, Math.min(10, velocity));
                    const skew = clampedVel * 0.15;
                    const velocityTargets = document.querySelectorAll('.marquee-content');
                    velocityTargets.forEach(el => {
                        el.style.transform = `skewX(${skew}deg)`;
                    });
                });

                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);
            }

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    } catch (e) {
        console.log('Native scroll active');
    }

    // --------------------------------------------------------------------------
    // 05 — Scroll Progress Line, Percentage Counter & Nav Scrollspy
    // --------------------------------------------------------------------------
    const initScrollProgress = () => {
        const progressFill = document.getElementById('progressBarFill');
        const percentageBadge = document.getElementById('scrollPercentage');
        const navPill = document.querySelector('.floating-nav-container');
        const navLinks = document.querySelectorAll('.desktop-nav-menu .nav-link');
        const trackedSections = ['home', 'about', 'services', 'portfolio', 'playground', 'lab', 'builder', 'contact'];

        const onScroll = () => {
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollY = window.scrollY || window.pageYOffset;
            const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
            const percent = Math.round(progress * 100);

            if (progressFill) progressFill.style.width = `${percent}%`;
            if (percentageBadge) percentageBadge.textContent = `${percent < 10 ? '0' + percent : percent}%`;

            // Floating Navigation Pill Morph
            if (navPill) {
                if (scrollY > 50) {
                    navPill.classList.add('is-scrolled');
                } else {
                    navPill.classList.remove('is-scrolled');
                }
            }

            // Active section scrollspy
            let activeId = '';
            const checkpoint = scrollY + 180;
            for (let i = trackedSections.length - 1; i >= 0; i--) {
                const sec = document.getElementById(trackedSections[i]);
                if (sec && sec.offsetTop <= checkpoint) {
                    activeId = trackedSections[i];
                    break;
                }
            }

            if (activeId) {
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === `#${activeId}`) {
                        link.classList.add('active');
                    } else if (href && href.startsWith('#')) {
                        link.classList.remove('active');
                    }
                });
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    };
    initScrollProgress();

    // --------------------------------------------------------------------------
    // 05B — Mobile Navigation Drawer Toggle
    // --------------------------------------------------------------------------
    const initMobileNav = () => {
        const toggleBtn = document.querySelector('.mobile-toggle-btn');
        const drawer = document.querySelector('.mobile-nav-drawer');
        const drawerBg = document.querySelector('.mobile-drawer-bg');
        const drawerLinks = document.querySelectorAll('.mob-link');
        const closeBtn = document.querySelector('.drawer-close-btn');

        if (!toggleBtn || !drawer) return;

        const openDrawer = () => {
            drawer.classList.add('is-open');
            toggleBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeDrawer = () => {
            drawer.classList.remove('is-open');
            toggleBtn.classList.remove('active');
            document.body.style.overflow = '';
        };

        toggleBtn.addEventListener('click', () => {
            if (drawer.classList.contains('is-open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });

        if (drawerBg) drawerBg.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        drawerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                closeDrawer();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        setTimeout(() => {
                            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }, 300);
                    }
                }
            });
        });

        // Smooth scroll for desktop nav links too
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }
            });
        });
    };
    initMobileNav();

    // --------------------------------------------------------------------------
    // 06 — Custom Smart Cursor & Particle Trail (Desktop)
    // --------------------------------------------------------------------------
    const initCustomCursor = () => {
        if (isTouch) return;

        const cursorDot = document.getElementById('cursorDot');
        const cursorRing = document.getElementById('cursorRing');
        const cursorLabel = document.getElementById('cursorLabel');
        const trailContainer = document.getElementById('cursorTrailContainer');

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let lastTrailTime = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            if (cursorDot) {
                cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
            }

            // Spawn subtle particle trail
            const now = Date.now();
            if (trailContainer && now - lastTrailTime > 65) {
                lastTrailTime = now;
                const particle = document.createElement('div');
                particle.className = 'cursor-trail-particle';
                particle.style.left = `${mouseX}px`;
                particle.style.top = `${mouseY}px`;
                trailContainer.appendChild(particle);

                setTimeout(() => {
                    particle.style.opacity = '0';
                    particle.style.transform = 'scale(0.2)';
                    setTimeout(() => particle.remove(), 400);
                }, 50);
            }
        }, { passive: true });

        // Smooth ring lerp
        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;

            if (cursorRing) {
                cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateRing);
        };
        requestAnimationFrame(animateRing);

        // Contextual Cursor Interactions
        const interactiveElements = document.querySelectorAll('[data-cursor]');
        interactiveElements.forEach((el) => {
            const cursorType = el.getAttribute('data-cursor');
            el.addEventListener('mouseenter', () => {
                if (!cursorRing) return;
                cursorRing.className = 'cursor-ring';
                cursorRing.classList.add(`cursor-${cursorType.toLowerCase()}`);
                if (cursorLabel) cursorLabel.textContent = cursorType;
            });
            el.addEventListener('mouseleave', () => {
                if (!cursorRing) return;
                cursorRing.className = 'cursor-ring';
                if (cursorLabel) cursorLabel.textContent = '';
            });
        });
    };
    initCustomCursor();

    // --------------------------------------------------------------------------
    // 07 — Magnetic Physics on Buttons
    // --------------------------------------------------------------------------
    const initMagneticButtons = () => {
        if (isTouch) return;

        const magneticButtons = document.querySelectorAll('.magnetic-btn');
        magneticButtons.forEach((btn) => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const btnX = rect.left + rect.width / 2;
                const btnY = rect.top + rect.height / 2;
                const distX = (e.clientX - btnX) * 0.35;
                const distY = (e.clientY - btnY) * 0.35;

                btn.style.transform = `translate3d(${distX}px, ${distY}px, 0)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate3d(0px, 0px, 0px)';
            });
        });
    };
    initMagneticButtons();

    // --------------------------------------------------------------------------
    // 08 — Three.js Interactive 3D Sculpture (Hero Section)
    // --------------------------------------------------------------------------
    const initThreeHero = () => {
        const canvas = document.getElementById('threeHeroCanvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const container = document.getElementById('heroWebGLContainer');
        const scene = new THREE.Scene();
        
        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 7.5;

        const renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create 3D Geometric Liquid Chrome / Glass Torus Knot
        const geometry = new THREE.TorusKnotGeometry(1.8, 0.55, 150, 32, 2, 3);
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            emissive: 0x050505,
            roughness: 0.15,
            metalness: 0.85,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 0.9,
            wireframe: false,
        });

        const sculpture = new THREE.Mesh(geometry, material);
        scene.add(sculpture);

        // Add Ambient & Dramatic Accent Point Lights (Electric Lime & Cyan Highlights)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const limeLight = new THREE.PointLight(0xccff00, 3.5, 50);
        limeLight.position.set(4, 5, 4);
        scene.add(limeLight);

        const cyanLight = new THREE.PointLight(0x00f3ff, 2.8, 50);
        cyanLight.position.set(-5, -4, 3);
        scene.add(cyanLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
        rimLight.position.set(0, 5, 5);
        scene.add(rimLight);

        // Subtle Ambient Particles
        const particleCount = 80;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 14;
            positions[i + 1] = (Math.random() - 0.5) * 14;
            positions[i + 2] = (Math.random() - 0.5) * 14;
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMat = new THREE.PointsMaterial({
            color: 0xccff00,
            size: 0.05,
            transparent: true,
            opacity: 0.5
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Mouse Parallax Influence
        let targetRotX = 0;
        let targetRotY = 0;

        window.addEventListener('mousemove', (e) => {
            const normX = (e.clientX / window.innerWidth - 0.5) * 2;
            const normY = (e.clientY / window.innerHeight - 0.5) * 2;
            targetRotY = normX * 0.8;
            targetRotX = normY * 0.6;
        }, { passive: true });

        // Animation Loop
        let clock = new THREE.Clock();
        const animate = () => {
            const elapsedTime = clock.getElapsedTime();

            // Continuous rotation + smooth mouse tilt
            sculpture.rotation.y += 0.006;
            sculpture.rotation.x += (targetRotX - sculpture.rotation.x) * 0.05;
            sculpture.rotation.z += (targetRotY - sculpture.rotation.z) * 0.05;

            // Subtle breathing scale
            const scaleFactor = 1 + Math.sin(elapsedTime * 1.2) * 0.03;
            sculpture.scale.set(scaleFactor, scaleFactor, scaleFactor);

            // Particles slow rotation
            particles.rotation.y += 0.001;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // Responsive Resize
        window.addEventListener('resize', () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        });

        // Scroll influence on 3D Object
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            sculpture.position.y = -scrollY * 0.002;
            sculpture.rotation.x = targetRotX + scrollY * 0.0015;
        }, { passive: true });
    };
    initThreeHero();

    // --------------------------------------------------------------------------
    // 09 — GSAP Hero Scroll Transformation & Reading-Scrub Timelines
    // --------------------------------------------------------------------------
    const initScrollTimelines = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        // 06 — Hero Headline Scroll Transformation: Words split, scale, blur, and fade
        const heroWords = document.querySelectorAll('#heroTitle .word-split');
        if (heroWords.length > 0) {
            gsap.to(heroWords, {
                scrollTrigger: {
                    trigger: '#home',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
                y: (i) => (i % 2 === 0 ? -80 : 80),
                scale: 0.88,
                opacity: 0.1,
                filter: 'blur(8px)',
                stagger: 0.04,
            });
        }

        // 10 — About Section Word-by-Word Reading Scrub
        const scrubWords = document.querySelectorAll('.scrub-word');
        if (scrubWords.length > 0) {
            gsap.to(scrubWords, {
                scrollTrigger: {
                    trigger: '#aboutScrubParagraph',
                    start: 'top 75%',
                    end: 'bottom 45%',
                    scrub: 0.8,
                },
                opacity: 1,
                stagger: 0.06,
            });
        }

        // 10B — Metrics Counter Count-up Animation
        const counters = document.querySelectorAll('.counter-trigger');
        counters.forEach((counter) => {
            const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
            gsap.to(counter, {
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                },
                innerText: target,
                duration: 1.8,
                snap: { innerText: 1 },
                ease: 'power2.out',
            });
        });

        // 11 — Pinned Story Sequence (IDEA -> DESIGN -> BUILD -> EXPERIENCE)
        const storyStage = document.getElementById('pinnedStoryStage');
        const storySlides = document.querySelectorAll('.sequence-slide');
        const seqCounter = document.getElementById('seqCurrentStep');
        const seqProgress = document.getElementById('seqProgressFill');

        if (storyStage && storySlides.length > 0) {
            ScrollTrigger.create({
                trigger: '#pinnedStorySection',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const totalSlides = storySlides.length;
                    const activeIndex = Math.min(totalSlides - 1, Math.floor(progress * totalSlides));

                    storySlides.forEach((slide, idx) => {
                        if (idx === activeIndex) {
                            slide.classList.add('active');
                        } else {
                            slide.classList.remove('active');
                        }
                    });

                    if (seqCounter) seqCounter.textContent = `0${activeIndex + 1}`;
                    if (seqProgress) seqProgress.style.width = `${((activeIndex + 1) / totalSlides) * 100}%`;
                },
            });
        }

        // 16 — Big Typography Break Horizontal Kinetic Scrub
        const typoRow1 = document.getElementById('typoRow1');
        const typoRow2 = document.getElementById('typoRow2');
        if (typoRow1 && typoRow2) {
            gsap.to(typoRow1, {
                x: '-16%',
                ease: 'none',
                scrollTrigger: {
                    trigger: '#bigTypoBreak',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                }
            });

            gsap.to(typoRow2, {
                x: '14%',
                ease: 'none',
                scrollTrigger: {
                    trigger: '#bigTypoBreak',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                }
            });
        }

        // 14 — Pinned Horizontal Portfolio Reel
        const portfolioSection = document.getElementById('portfolio');
        const horizontalTrack = document.getElementById('horizontalProjectTrack');

        if (portfolioSection && horizontalTrack && window.innerWidth > 1024) {
            const trackWidth = horizontalTrack.scrollWidth;
            const scrollDistance = trackWidth - window.innerWidth + 120;

            gsap.to(horizontalTrack, {
                x: () => -scrollDistance,
                ease: 'none',
                scrollTrigger: {
                    trigger: portfolioSection,
                    start: 'top top',
                    end: () => `+=${scrollDistance}`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                },
            });
        }

        // 19 — Monumental Statement Compression
        const statementLines = [
            document.getElementById('statLine1'),
            document.getElementById('statLine2'),
            document.getElementById('statLine3'),
            document.getElementById('statLine4')
        ];

        if (statementLines[0]) {
            gsap.from(statementLines, {
                scrollTrigger: {
                    trigger: '#statementSection',
                    start: 'top 80%',
                    end: 'center center',
                    scrub: 1,
                },
                y: 60,
                scale: 0.85,
                opacity: 0.2,
                stagger: 0.1,
            });
        }
    };
    initScrollTimelines();

    // --------------------------------------------------------------------------
    // 10 — Stat Counters (Triggered on scroll)
    // --------------------------------------------------------------------------
    const initCounters = () => {
        const counters = document.querySelectorAll('.counter-trigger');
        let animated = false;

        const runCount = () => {
            counters.forEach((counter) => {
                const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
                let current = 0;
                const increment = target / 45;

                const updateVal = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateVal);
                    } else {
                        counter.textContent = target;
                    }
                };
                requestAnimationFrame(updateVal);
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !animated) {
                    animated = true;
                    runCount();
                }
            });
        }, { threshold: 0.3 });

        const aboutSection = document.getElementById('about');
        if (aboutSection) observer.observe(aboutSection);
    };
    initCounters();

    // --------------------------------------------------------------------------
    // 11 — Sticky Services Interactive Visual Crossfade
    // --------------------------------------------------------------------------
    // 11 — Sticky Services Interactive Visual Crossfade & Scroll Sync
    // --------------------------------------------------------------------------
    const initServicesCrossfade = () => {
        const navItems = document.querySelectorAll('.service-nav-item');
        const visualPanels = document.querySelectorAll('.service-visual-panel');
        const audioBarsContainer = document.getElementById('servicesAudioBars');

        if (navItems.length === 0 || visualPanels.length === 0) return;

        // Populate audio reactive bars in Visual 05
        if (audioBarsContainer && audioBarsContainer.children.length === 0) {
            audioBarsContainer.innerHTML = Array(12).fill(0).map((_, i) => 
                `<span style="display:inline-block; width:3px; height:${Math.floor(10 + Math.random() * 26)}px; background:var(--accent-lime); border-radius:2px; margin:0 2px; animation: barPulse ${0.6 + (i % 5) * 0.15}s infinite ease-in-out alternate;"></span>`
            ).join('');
        }

        let activeIdx = 0;

        const switchService = (index, triggerHaptic = false) => {
            if (index < 0 || index >= navItems.length) return;
            activeIdx = index;

            navItems.forEach((item, i) => {
                if (i === index) item.classList.add('active');
                else item.classList.remove('active');
            });

            visualPanels.forEach((panel, i) => {
                if (i === index) panel.classList.add('active');
                else panel.classList.remove('active');
            });

            if (triggerHaptic && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(8);
            }
        };

        // Desktop Click and Hover Switch
        navItems.forEach((item) => {
            const idx = parseInt(item.getAttribute('data-service'), 10);

            item.addEventListener('mouseenter', () => {
                if (window.innerWidth > 1024) {
                    switchService(idx);
                }
            });

            item.addEventListener('click', () => {
                switchService(idx, true);
            });
        });

        // Scroll Observer: Automatically activate corresponding panel when scrolling past services
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -40% 0px',
            threshold: [0, 0.25, 0.5, 0.75, 1.0]
        };

        const serviceObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const idx = parseInt(entry.target.getAttribute('data-service'), 10);
                    if (!isNaN(idx)) {
                        switchService(idx);
                    }
                }
            });
        }, observerOptions);

        navItems.forEach((item) => serviceObserver.observe(item));

        // Initial state
        switchService(0);
    };
    initServicesCrossfade();

    // --------------------------------------------------------------------------
    // 12 — Before / After Interactive Comparison Slider
    // --------------------------------------------------------------------------
    const initBeforeAfterSlider = () => {
        const container = document.getElementById('baSliderContainer');
        const handle = document.getElementById('baSliderHandle');
        const afterWrapper = document.getElementById('baAfterWrapper');

        if (!container || !handle || !afterWrapper) return;

        let isDragging = false;

        const updatePosition = (clientX) => {
            const rect = container.getBoundingClientRect();
            let offsetX = clientX - rect.left;
            offsetX = Math.max(0, Math.min(offsetX, rect.width));
            const percentage = (offsetX / rect.width) * 100;

            handle.style.left = `${percentage}%`;
            afterWrapper.style.clipPath = `inset(0 0 0 ${percentage}%)`;
        };

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            updatePosition(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updatePosition(e.clientX);
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch Support
        container.addEventListener('touchstart', (e) => {
            isDragging = true;
            if (e.touches[0]) updatePosition(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            if (e.touches[0]) updatePosition(e.touches[0].clientX);
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    };
    initBeforeAfterSlider();

    // --------------------------------------------------------------------------
    // 13 — 69 Playground Interactive Demos
    // --------------------------------------------------------------------------
    const initPlayground = () => {
        // Exp 01: Liquid Ripple Canvas
        const liquidCanvas = document.getElementById('liquidCanvas');
        if (liquidCanvas) {
            const ctx = liquidCanvas.getContext('2d');
            let ripples = [];

            const resizeLiquid = () => {
                liquidCanvas.width = liquidCanvas.clientWidth;
                liquidCanvas.height = liquidCanvas.clientHeight;
            };
            resizeLiquid();
            window.addEventListener('resize', resizeLiquid);

            liquidCanvas.addEventListener('mousemove', (e) => {
                const rect = liquidCanvas.getBoundingClientRect();
                ripples.push({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    radius: 2,
                    opacity: 0.8,
                });
            });

            const drawLiquid = () => {
                ctx.clearRect(0, 0, liquidCanvas.width, liquidCanvas.height);

                for (let i = ripples.length - 1; i >= 0; i--) {
                    const r = ripples[i];
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(204, 255, 0, ${r.opacity})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    r.radius += 2.2;
                    r.opacity -= 0.02;

                    if (r.opacity <= 0) {
                        ripples.splice(i, 1);
                    }
                }
                requestAnimationFrame(drawLiquid);
            };
            drawLiquid();
        }

        // Exp 02: Magnetic Spring Typography
        const magChars = document.querySelectorAll('.mag-char');
        magChars.forEach((char) => {
            char.addEventListener('mouseenter', () => {
                const randomX = (Math.random() - 0.5) * 60;
                const randomY = (Math.random() - 0.5) * 60;
                const randomRot = (Math.random() - 0.5) * 45;
                char.style.transform = `translate3d(${randomX}px, ${randomY}px, 0) rotate(${randomRot}deg) scale(1.2)`;
            });
            char.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    char.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
                }, 150);
            });
        });

        // Exp 03: 3D Wireframe Torus Canvas
        const wireCanvas = document.getElementById('wireframeCanvas');
        if (wireCanvas && typeof THREE !== 'undefined') {
            const wireScene = new THREE.Scene();
            const wireBox = document.getElementById('wireframeBox');
            const wireCamera = new THREE.PerspectiveCamera(45, wireBox.clientWidth / wireBox.clientHeight, 0.1, 100);
            wireCamera.position.z = 4.5;

            const wireRenderer = new THREE.WebGLRenderer({ canvas: wireCanvas, alpha: true, antialias: true });
            wireRenderer.setSize(wireBox.clientWidth, wireBox.clientHeight);

            const wireGeo = new THREE.TorusGeometry(1.2, 0.4, 16, 50);
            const wireMat = new THREE.MeshBasicMaterial({ color: 0xccff00, wireframe: true });
            const wireMesh = new THREE.Mesh(wireGeo, wireMat);
            wireScene.add(wireMesh);

            let isWireDrag = false;
            let prevMouseX = 0;
            let prevMouseY = 0;

            wireCanvas.addEventListener('mousedown', (e) => {
                isWireDrag = true;
                prevMouseX = e.clientX;
                prevMouseY = e.clientY;
            });
            window.addEventListener('mouseup', () => isWireDrag = false);
            window.addEventListener('mousemove', (e) => {
                if (!isWireDrag) return;
                const deltaX = e.clientX - prevMouseX;
                const deltaY = e.clientY - prevMouseY;
                wireMesh.rotation.y += deltaX * 0.01;
                wireMesh.rotation.x += deltaY * 0.01;
                prevMouseX = e.clientX;
                prevMouseY = e.clientY;
            });

            const animateWire = () => {
                if (!isWireDrag) {
                    wireMesh.rotation.x += 0.008;
                    wireMesh.rotation.y += 0.012;
                }
                wireRenderer.render(wireScene, wireCamera);
                requestAnimationFrame(animateWire);
            };
            animateWire();
        }

        // Exp 04: Harmonic Audio Wave Visualizer
        const waveCanvas = document.getElementById('waveCanvas');
        if (waveCanvas) {
            const ctx = waveCanvas.getContext('2d');
            let waveOffset = 0;
            let freq = 0.02;

            const drawWave = () => {
                waveCanvas.width = waveCanvas.clientWidth;
                waveCanvas.height = waveCanvas.clientHeight;
                ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);

                ctx.beginPath();
                ctx.moveTo(0, waveCanvas.height / 2);

                for (let x = 0; x < waveCanvas.width; x++) {
                    const y = waveCanvas.height / 2 + Math.sin(x * freq + waveOffset) * 28 * Math.cos(waveOffset * 0.5);
                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = '#ccff00';
                ctx.lineWidth = 2.5;
                ctx.shadowColor = '#ccff00';
                ctx.shadowBlur = 15;
                ctx.stroke();

                waveOffset += 0.05;
                requestAnimationFrame(drawWave);
            };
            drawWave();

            const synthBtn = document.getElementById('synthToggleBtn');
            if (synthBtn) {
                synthBtn.addEventListener('click', () => {
                    freq = freq === 0.02 ? 0.06 : 0.02;
                    synthBtn.innerHTML = freq === 0.06 ? '<i class="fas fa-bolt"></i> HIGH FREQ' : '<i class="fas fa-play"></i> TEST WAVE';
                });
            }
        }
    };
    initPlayground();

    // --------------------------------------------------------------------------
    // 14 — Case Study Detail Modal
    // --------------------------------------------------------------------------
    const initCaseStudies = () => {
        const modal = document.getElementById('caseStudyModal');
        const modalBody = document.getElementById('modalContentBody');
        const closeBtn = document.getElementById('modalCloseBtn');
        const backdrop = document.getElementById('modalBackdrop');
        const cards = document.querySelectorAll('.project-card[data-project]');

        const projectsData = {
            'roccos': {
                title: "Rocco's Italian Dining Platform & Cloud POS",
                category: "Restaurant Cloud POS & E-Commerce Architecture",
                year: "2026",
                image: "p1.jpg",
                client: "Rocco's Sri Lanka",
                liveUrl: "https://69studiobysubash.online/",
                challenge: "Rocco's required a high-converting digital ordering platform, real-time table reservations, and a synchronized Cloud Point of Sale (POS) with Kitchen Order Ticket (KOT) workflow.",
                solution: "We engineered a bespoke Next.js storefront paired with a real-time Cloud POS and billing engine, delivering sub-second checkout, thermal receipt printing, and a 42% lift in dining orders.",
                stack: ["Custom Cloud POS", "Next.js 15", "Realtime KOT Sync", "Thermal Receipt Engine", "Stripe & PayHere"]
            },
            'ceylon-gems': {
                title: "Real Ceylon Gems Luxury 3D Showcase",
                category: "Luxury Jewelry & WebGL Experience",
                year: "2026",
                image: "p2.jpg",
                client: "Real Ceylon Gems",
                liveUrl: "https://69studiobysubash.online/",
                challenge: "High net worth international buyers needed crystal clear 3D gem visualizers and automated lab certification verification.",
                solution: "Created custom Three.js WebGL refraction shaders enabling full 360° diamond and sapphire inspection in real time.",
                stack: ["Three.js", "GLSL Shaders", "React", "Node.js Cloud API", "Figma Design System"]
            },
            'special-beats': {
                title: "Special Beats Audio Production Hub",
                category: "Entertainment & Media Licensing",
                year: "2026",
                image: "p4.jpg",
                client: "Special Beats",
                liveUrl: "https://69studiobysubash.online/",
                challenge: "Music producers needed instant web-audio waveform previews and automated beat licensing workflows.",
                solution: "Engineered an audio waveform player with zero latency audio synthesis and instantaneous digital contract delivery.",
                stack: ["Web Audio API", "Next.js", "Firebase Storage", "Stripe Connect"]
            },
            'studio-os': {
                title: "69 Studio Enterprise Cloud OS",
                category: "SaaS & Workflow Telemetry",
                year: "2026",
                image: "p3.jpg",
                client: "69 Studio Internal Suite",
                liveUrl: "https://69studiobysubash.online/appointments.html",
                challenge: "Scaling appointments, project lead tracking, and client team chat into a unified real-time portal.",
                solution: "Built a reactive Firebase Realtime system with automated WhatsApp dispatch and appointment scheduling.",
                stack: ["Firebase RTDB", "Next.js", "PWA Architecture", "WhatsApp Cloud API"]
            },
            'cargo-pizza': {
                title: "Cargo Pizza Woodfired Experience",
                category: "Food & Hospitality Digital Platform",
                year: "2026",
                image: "p5.jpg",
                client: "Cargo Pizza Nawala",
                liveUrl: "https://cargopizzeria.online/",
                challenge: "Cargo Pizza needed a high-converting digital storefront to showcase 20+ woodfired varieties, handle peak ordering hours, and promote BOGO campaigns with zero checkout friction.",
                solution: "Engineered a rapid-response mobile-first ordering engine with WhatsApp dispatch integration, sub-second menu filtering, and localized geo-SEO.",
                stack: ["HTML5 / PWA", "Next-Gen CSS", "WhatsApp Cloud Engine", "Dynamic Deal System", "Local SEO & Geo-Targeting"]
            }
        };

        const openModal = (key) => {
            const data = projectsData[key];
            if (!data || !modalBody || !modal) return;

            modalBody.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--accent-lime); font-weight: 700;">
                        ${data.category} // ${data.year}
                    </div>
                    <h2 style="font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 900; line-height: 1;">
                        ${data.title}
                    </h2>
                    <div style="border-radius: var(--radius-lg); overflow: hidden; height: 360px; background: #000;">
                        <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 10px;">
                        <div>
                            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 8px;">The Challenge</h4>
                            <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">${data.challenge}</p>
                        </div>
                        <div>
                            <h4 style="font-family: var(--font-heading); font-size: 1.1rem; color: #fff; margin-bottom: 8px;">Our Solution</h4>
                            <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">${data.solution}</p>
                        </div>
                    </div>
                    <div>
                        <h4 style="font-family: var(--font-heading); font-size: 1rem; color: #fff; margin-bottom: 12px;">Technologies Employed</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            ${data.stack.map(s => `<span style="font-family: var(--font-mono); font-size: 0.75rem; background: rgba(204,255,0,0.1); color: var(--accent-lime); border: 1px solid var(--accent-lime-border); padding: 6px 14px; border-radius: var(--radius-pill);">${s}</span>`).join('')}
                        </div>
                    </div>
                    <div style="margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap;">
                        ${data.liveUrl ? `<a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="nav-cta-btn" style="padding: 12px 24px; font-size: 0.85rem; background: var(--accent-lime); color: #000; font-weight: 700;">VISIT LIVE SITE ↗</a>` : ''}
                        <a href="appointments.html" target="_blank" class="nav-cta-btn" style="padding: 12px 24px; font-size: 0.85rem; border: 1px solid var(--border-subtle); background: transparent; color: #fff;">REQUEST SIMILAR PROJECT ↗</a>
                    </div>
                </div>
            `;

            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            if (!modal) return;
            modal.classList.remove('is-open');
            document.body.style.overflow = '';
        };

        cards.forEach((card) => {
            card.addEventListener('click', () => {
                const key = card.getAttribute('data-project');
                openModal(key);
            });
        });

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    };
    initCaseStudies();

    // --------------------------------------------------------------------------
    // 15 — 5-Step Project Builder Configurator & Estimator
    // --------------------------------------------------------------------------
    const initProjectBuilder = () => {
        const form = document.getElementById('projectBuilderForm');
        if (!form) return;

        const nextButtons = document.querySelectorAll('.btn-next-step');
        const prevButtons = document.querySelectorAll('.btn-prev-step');
        const panels = document.querySelectorAll('.builder-step-panel');
        const indicators = document.querySelectorAll('.step-indicator');
        const summaryBox = document.getElementById('builderSummaryBox');
        const statusBox = document.getElementById('builderStatus');

        const goToStep = (step) => {
            panels.forEach(p => {
                if (parseInt(p.getAttribute('data-step'), 10) === step) p.classList.add('active');
                else p.classList.remove('active');
            });

            indicators.forEach(ind => {
                const indStep = parseInt(ind.getAttribute('data-step'), 10);
                if (indStep <= step) ind.classList.add('active');
                else ind.classList.remove('active');
            });

            if (step === 5) {
                updateSummary();
            }
        };

        nextButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const nextStep = parseInt(btn.getAttribute('data-next'), 10);
                goToStep(nextStep);
            });
        });

        prevButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const prevStep = parseInt(btn.getAttribute('data-prev'), 10);
                goToStep(prevStep);
            });
        });

        const updateSummary = () => {
            const formData = new FormData(form);
            const selectedServices = formData.getAll('services').join(', ') || 'Custom Website';
            const goal = formData.get('goal') || 'Launch Brand';
            const timeline = formData.get('timeline') || 'Standard (3-4 Weeks)';
            const budget = formData.get('budget') || 'Growth Tier';

            if (summaryBox) {
                summaryBox.innerHTML = `
                    <strong>Project Brief Summary:</strong><br>
                    • <strong>Services:</strong> ${selectedServices}<br>
                    • <strong>Primary Goal:</strong> ${goal}<br>
                    • <strong>Timeline:</strong> ${timeline}<br>
                    • <strong>Investment Tier:</strong> ${budget}<br>
                    • <strong>Status:</strong> Senior Tech Lead allocated upon submission.
                `;
            }
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = document.getElementById('submitBriefBtn');
            const origText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'DISPATCHING BRIEF... <i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;

            const formData = new FormData(form);
            const data = {
                name: formData.get('clientName') || 'Inquirer',
                email: formData.get('clientEmail') || '',
                phone: formData.get('clientPhone') || '',
                company: formData.get('company') || 'N/A',
                services: formData.getAll('services').join(', '),
                goal: formData.get('goal') || '',
                timeline: formData.get('timeline') || '',
                budget: formData.get('budget') || '',
                details: formData.get('details') || '',
                timestamp: Date.now()
            };

            // Sync with Firebase if available
            if (window.firebaseDB && window.firebaseRef && window.firebasePush) {
                try {
                    const leadsRef = window.firebaseRef(window.firebaseDB, 'leads');
                    window.firebasePush(leadsRef, data);
                } catch(err) {}
            }

            // WhatsApp Direct Action
            const waText = encodeURIComponent(
                `🔥 *NEW 69 STUDIO PROJECT BRIEF*\n` +
                `👤 *Name:* ${data.name}\n` +
                `🏢 *Company:* ${data.company}\n` +
                `📧 *Email:* ${data.email}\n` +
                `📱 *Phone:* ${data.phone}\n` +
                `🛠 *Services:* ${data.services}\n` +
                `🎯 *Goal:* ${data.goal}\n` +
                `⏳ *Timeline:* ${data.timeline}\n` +
                `💰 *Budget:* ${data.budget}\n` +
                `📝 *Brief:* ${data.details}`
            );

            if (statusBox) {
                statusBox.innerHTML = `
                    <span style="color: var(--accent-lime); font-weight: 700;">
                        ✓ Project Brief Dispatched Successfully!
                    </span><br>
                    <a href="https://wa.me/94789656969?text=${waText}" target="_blank" style="color: #fff; text-decoration: underline; font-size: 0.8rem; margin-top: 6px; display: inline-block;">
                        Open Instant WhatsApp Thread ↗
                    </a>
                `;
            }

            submitBtn.innerHTML = 'BRIEF RECEIVED ✓';
        });
    };
    initProjectBuilder();

    // --------------------------------------------------------------------------
    // 16 — Floating AI Studio Assistant ("ASK 69 STUDIO ✦")
    // --------------------------------------------------------------------------
    const initAIAssistant = () => {
        const triggerBtn = document.getElementById('aiTriggerBtn');
        const chatPanel = document.getElementById('aiChatPanel');
        const closeBtn = document.getElementById('aiCloseBtn');
        const chatForm = document.getElementById('aiChatForm');
        const userInput = document.getElementById('aiUserInput');
        const messagesContainer = document.getElementById('aiMessagesContainer');
        const promptChips = document.querySelectorAll('.prompt-chip');

        if (!triggerBtn || !chatPanel) return;

        triggerBtn.addEventListener('click', () => {
            chatPanel.classList.toggle('is-open');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                chatPanel.classList.remove('is-open');
            });
        }

        const appendMsg = (text, isUser = false) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `ai-msg ${isUser ? 'user-msg' : 'bot-msg'}`;
            msgDiv.innerHTML = isUser
                ? `<div class="msg-bubble">${text}</div>`
                : `<div class="ai-avatar">69</div><div class="msg-bubble">${text}</div>`;
            messagesContainer.appendChild(msgDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        };

        const getAIResponse = (query) => {
            const q = query.toLowerCase();
            if (q.includes('pos') || q.includes('point of sale') || q.includes('billing') || q.includes('inventory') || q.includes('cash register')) {
                return "Yes! <strong>69 Studio develops custom Cloud & Offline Point of Sale (POS) Systems</strong> tailored for retail stores, supermarkets, restaurants, and cafes. Our POS engines include <strong>barcode scanning, 80mm thermal receipt printing, real-time inventory tracking, restaurant KOT kitchen display, and multi-branch cloud syncing</strong>! You can configure your POS requirements in our <a href='#builder' style='color:var(--accent-lime);text-decoration:underline;'>Project Builder</a> or contact Subhash directly.";
            } else if (q.includes('rate') || q.includes('price') || q.includes('cost') || q.includes('how much')) {
                return "Our custom high-performance web development starts from <strong>25,000 LKR ($100)</strong> for starter setups, and <strong>50,000–150,000+ LKR ($200–$500+)</strong> for bespoke Awwwards-grade experiences with 3D/Next.js and POS business engines. You can configure your scope directly in our <a href='#builder' style='color:var(--accent-lime);text-decoration:underline;'>Project Builder</a>!";
            } else if (q.includes('timeline') || q.includes('how long') || q.includes('time')) {
                return "Standard web and POS software projects deliver in <strong>2 to 4 weeks</strong>. We also offer rapid 1-week deployment sprints for urgent business rollouts.";
            } else if (q.includes('website') || q.includes('web design') || q.includes('build')) {
                return "We craft ultra-fast, modern websites and custom software using <strong>Next.js 15, React, Three.js (WebGL), Node.js, and GSAP</strong>. Every solution scores 100/100 on performance.";
            } else if (q.includes('subhash') || q.includes('founder') || q.includes('who')) {
                return "69 Studio was founded by <strong>Subhash Ketagoda</strong>, Lead Creative Technologist based in Colombo & Dubai with over 8 years of engineering experience and 150+ shipped projects.";
            } else if (q.includes('appointment') || q.includes('consultation') || q.includes('book') || q.includes('call')) {
                return "You can schedule a consultation directly on our <a href='appointments.html' target='_blank' style='color:var(--accent-lime);text-decoration:underline;'>Appointments Portal</a> or WhatsApp Subhash at <strong>+94 78 965 6969</strong>.";
            } else {
                return "Thank you for reaching out! We build bespoke websites, custom POS systems, and brand platforms tailored to your business. Would you like to try our <a href='#builder' style='color:var(--accent-lime);text-decoration:underline;'>Project Builder</a> or speak with Subhash on <a href='https://wa.me/94789656969' target='_blank' style='color:var(--accent-lime);text-decoration:underline;'>WhatsApp</a>?";
            }
        };

        const handleUserMessage = (text) => {
            if (!text.trim()) return;
            appendMsg(text, true);
            setTimeout(() => {
                const response = getAIResponse(text);
                appendMsg(response, false);
            }, 400);
        };

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = userInput.value;
                userInput.value = '';
                handleUserMessage(text);
            });
        }

        promptChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const prompt = chip.getAttribute('data-prompt');
                handleUserMessage(prompt);
            });
        });
    };
    initAIAssistant();

    // --------------------------------------------------------------------------
    // 17 — Reviews Render & Submission
    // --------------------------------------------------------------------------
    const initReviews = () => {
        const reviewsGrid = document.getElementById('reviewsGrid');
        const reviewForm = document.getElementById('reviewForm');
        const reviewStatus = document.getElementById('reviewStatus');

        const defaultReviews = [
            {
                name: "Rocco's Italian Dining",
                rating: 5,
                message: "Subhash transformed our restaurant digital footprint into an absolute masterpiece. Our online orders increased by 40% in the first month."
            },
            {
                name: "Real Ceylon Gems Luxury",
                rating: 5,
                message: "The 3D interactive gemstone viewer built by 69 Studio blew away our European and Middle Eastern clients. Unbelievable craftsmanship!"
            },
            {
                name: "Special Beats Audio Group",
                rating: 5,
                message: "Lightning fast delivery, ultra-modern cyberpunk aesthetics, and clean code. The best creative studio experience we've worked with in Sri Lanka."
            }
        ];

        const renderReviews = (list) => {
            if (!reviewsGrid) return;
            reviewsGrid.innerHTML = list.map(r => `
                <div class="review-item-card">
                    <div class="review-card-head">
                        <span class="reviewer-name">${r.name}</span>
                        <span class="review-stars">${'⭐'.repeat(r.rating || 5)}</span>
                    </div>
                    <p class="review-body-text">${r.message}</p>
                </div>
            `).join('');
        };
        renderReviews(defaultReviews);

        // Firebase Realtime Listener if available
        if (window.firebaseDB && window.firebaseRef && window.firebaseOnValue) {
            try {
                const revRef = window.firebaseRef(window.firebaseDB, 'reviews');
                window.firebaseOnValue(revRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const firebaseList = Object.values(data).reverse();
                        renderReviews([...firebaseList, ...defaultReviews]);
                    }
                });
            } catch(e) {}
        }

        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('reviewName').value;
                const rating = parseInt(document.getElementById('reviewRating').value, 10) || 5;
                const message = document.getElementById('reviewMessage').value;

                const newReview = { name, rating, message, timestamp: Date.now() };

                if (window.firebaseDB && window.firebaseRef && window.firebasePush) {
                    try {
                        const revRef = window.firebaseRef(window.firebaseDB, 'reviews');
                        window.firebasePush(revRef, newReview);
                    } catch(e) {}
                }

                reviewForm.reset();
                if (reviewStatus) {
                    reviewStatus.innerHTML = `<span style="color: var(--accent-lime); font-size: 0.85rem;">✓ Review submitted and published!</span>`;
                }
            });
        }
    };
    initReviews();

    // --------------------------------------------------------------------------
    // 18 — Secret 69 Easter Egg (Keystroke Listener)
    // --------------------------------------------------------------------------
    const initEasterEgg = () => {
        let keyHistory = '';
        const modal = document.getElementById('secretEasterEggModal');
        const closeBtn = document.getElementById('closeEasterEggBtn');

        window.addEventListener('keydown', (e) => {
            keyHistory += e.key;
            if (keyHistory.length > 5) keyHistory = keyHistory.slice(-5);

            if (keyHistory.endsWith('69')) {
                if (modal) modal.classList.add('active');
            }
        });

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });
        }
    };
    initEasterEgg();

    // --------------------------------------------------------------------------
    // 19 — Mobile Navigation Drawer Toggle
    // --------------------------------------------------------------------------
    const initMobileMenu = () => {
        const toggleBtn = document.getElementById('mobileMenuToggle');
        const drawer = document.getElementById('mobileDrawer');
        const mobLinks = document.querySelectorAll('.mob-link');

        if (!toggleBtn || !drawer) return;

        const toggleDrawer = () => {
            const isOpen = drawer.classList.contains('is-open');
            if (isOpen) {
                drawer.classList.remove('is-open');
                document.body.style.overflow = '';
                toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
                drawer.classList.add('is-open');
                document.body.style.overflow = 'hidden';
                toggleBtn.setAttribute('aria-expanded', 'true');
            }
        };

        toggleBtn.addEventListener('click', toggleDrawer);
        mobLinks.forEach(link => {
            link.addEventListener('click', () => {
                drawer.classList.remove('is-open');
                document.body.style.overflow = '';
            });
        });
    };
    initMobileMenu();

    // --------------------------------------------------------------------------
    // 21 — Digital Store Dynamic Products Renderer (store.html)
    // --------------------------------------------------------------------------
    const initStorePage = () => {
        const storeGrid = document.getElementById('storeGrid');
        if (!storeGrid) return;

        const defaultProducts = [
            {
                name: "Studio Darkroom UI Kit 2026",
                category: "FIGMA & DESIGN TOKENS",
                priceLKR: "15,000 LKR",
                priceUSD: "$49",
                icon: "fa-cube",
                desc: "Complete dark-mode design system with 250+ responsive components, tokens, and Next.js starter templates.",
                badge: "BESTSELLER"
            },
            {
                name: "Liquid Shader Pack 2026",
                category: "WEBGL & THREE.JS",
                priceLKR: "25,000 LKR",
                priceUSD: "$79",
                icon: "fa-wand-magic-sparkles",
                desc: "5 customizable Three.js GLSL liquid chrome & glass distortion shaders with mouse-reactive physics.",
                badge: "POPULAR"
            },
            {
                name: "69 Ecommerce Engine",
                category: "NEXT.JS & PAYMENTS",
                priceLKR: "65,000 LKR",
                priceUSD: "$199",
                icon: "fa-bolt",
                desc: "High-speed storefront with Stripe & PayHere Sri Lanka integration, cart engine, and WhatsApp order alerts.",
                badge: "SYSTEM"
            },
            {
                name: "Cloud POS Software Engine",
                category: "POS & INVENTORY",
                priceLKR: "45,000 LKR",
                priceUSD: "$150",
                icon: "fa-cash-register",
                desc: "Realtime barcode billing, 80mm thermal receipt printing engine, live inventory sync, and multi-branch cloud ERP.",
                badge: "BUSINESS"
            },
            {
                name: "Spatial 3D Model Pack",
                category: "3D ASSETS",
                priceLKR: "20,000 LKR",
                priceUSD: "$65",
                icon: "fa-gem",
                desc: "Optimized GLTF/USDZ 3D jewelry, electronics, and architectural assets ready for interactive WebGL experiences.",
                badge: "3D ASSET"
            },
            {
                name: "Awwwards Motion Preset Pack",
                category: "GSAP & LENIS",
                priceLKR: "18,000 LKR",
                priceUSD: "$55",
                icon: "fa-film",
                desc: "Ready-to-use GSAP ScrollTrigger timelines, word-by-word reading scrub presets, and custom cursor physics.",
                badge: "ANIMATION"
            }
        ];

        storeGrid.innerHTML = defaultProducts.map(p => {
            const waLink = `https://wa.me/94789656969?text=${encodeURIComponent(`Hi Subhash! I would like to purchase the ${p.name} (${p.priceLKR} / ${p.priceUSD}).`)}`;
            return `
                <div class="store-product-card" data-cursor="CLICK" style="background: var(--bg-card); border: 1px solid var(--border-glass); border-radius: var(--radius-lg); padding: 28px; display: flex; flex-direction: column; justify-content: space-between; gap: 18px; transition: all 0.35s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-family: var(--font-mono); font-size: 0.70rem; color: var(--accent-lime); font-weight: 700; letter-spacing: 0.1em;">${p.category}</span>
                        <span style="font-family: var(--font-mono); font-size: 0.65rem; background: var(--accent-lime-dim); color: var(--accent-lime); border: 1px solid var(--accent-lime-border); padding: 3px 8px; border-radius: var(--radius-pill); font-weight: 700;">${p.badge}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 14px;">
                        <div style="width: 46px; height: 46px; border-radius: var(--radius-md); background: rgba(204,255,0,0.1); display: flex; align-items: center; justify-content: center; color: var(--accent-lime); font-size: 1.2rem; flex-shrink: 0;">
                            <i class="fas ${p.icon}"></i>
                        </div>
                        <div>
                            <h3 style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 2px;">${p.name}</h3>
                            <span style="font-family: var(--font-mono); font-size: 0.82rem; color: var(--accent-lime); font-weight: 700;">${p.priceLKR} / ${p.priceUSD}</span>
                        </div>
                    </div>
                    <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">${p.desc}</p>
                    <div style="padding-top: 12px; border-top: 1px solid var(--border-glass-subtle);">
                        <a href="${waLink}" target="_blank" class="nav-cta-btn" style="width: 100%; text-align: center; justify-content: center; padding: 10px; font-size: 0.75rem;">
                            PURCHASE & INSTANT ACCESS ↗
                        </a>
                    </div>
                </div>
            `;
        }).join('');
    };
    initStorePage();

    // --------------------------------------------------------------------------
    // 22 — Smooth Back to Top
    // --------------------------------------------------------------------------
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            if (typeof lenis !== 'undefined' && lenis) {
                lenis.scrollTo(0, { duration: 1.5 });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // --------------------------------------------------------------------------
    // 23 — Interactive Web Audio Synthesizer & Spatial Sound FX
    // --------------------------------------------------------------------------
    const initSiteAudio = () => {
        let audioActive = localStorage.getItem('69_audio_active') === 'true';
        let audioCtx = null;

        const soundBtn = document.getElementById('siteSoundToggle');
        const soundIcon = document.getElementById('siteSoundIcon');

        const updateSoundUI = () => {
            if (!soundBtn || !soundIcon) return;
            if (audioActive) {
                soundIcon.className = 'fas fa-volume-high';
                soundBtn.style.color = 'var(--accent-lime)';
                soundBtn.style.borderColor = 'var(--accent-lime-border)';
                soundBtn.style.background = 'var(--accent-lime-dim)';
            } else {
                soundIcon.className = 'fas fa-volume-xmark';
                soundBtn.style.color = 'var(--text-secondary)';
                soundBtn.style.borderColor = 'var(--border-glass)';
                soundBtn.style.background = 'rgba(255,255,255,0.04)';
            }
        };
        updateSoundUI();

        const playTone = (freq = 440, type = 'sine', duration = 0.08, vol = 0.04) => {
            if (!audioActive) return;
            try {
                if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                if (audioCtx.state === 'suspended') audioCtx.resume();

                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                gain.gain.setValueAtTime(vol, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + duration);
            } catch(e) {}
        };

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                audioActive = !audioActive;
                localStorage.setItem('69_audio_active', audioActive ? 'true' : 'false');
                updateSoundUI();
                if (audioActive) {
                    playTone(880, 'sine', 0.12, 0.06);
                }
            });
        }

        // Attach subtle hover sounds to interactive elements
        document.querySelectorAll('.nav-link, .hero-btn, .magnetic-btn, .service-nav-item, .project-card, .filter-chip').forEach(el => {
            el.addEventListener('mouseenter', () => {
                playTone(587.33, 'sine', 0.05, 0.02); // D5 high-tech blip
            }, { passive: true });
        });
    };
    initSiteAudio();

    // --------------------------------------------------------------------------
    // 24 — Realtime 3D Card Spotlight Cursor Tracking
    // --------------------------------------------------------------------------
    const initCardSpotlightHover = () => {
        if (isTouch) return;
        const spotlightCards = document.querySelectorAll('.project-card, .service-nav-item, .playground-card, .lab-card, .review-card, .proof-card, .philosophy-stat-card');

        spotlightCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }, { passive: true });
        });
    };
    initCardSpotlightHover();

    // --------------------------------------------------------------------------
    // 25 — Interactive POS Demo Terminal Simulator
    // --------------------------------------------------------------------------
    const initInteractivePosDemo = () => {
        const printBtn = document.getElementById('posPrintBtn');
        const toast = document.getElementById('posReceiptToast');
        if (!printBtn) return;

        printBtn.addEventListener('click', () => {
            printBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PRINTING RECEIPT...';
            printBtn.style.opacity = '0.7';

            setTimeout(() => {
                printBtn.innerHTML = '<i class="fas fa-check"></i> SLIP DISPATCHED!';
                printBtn.style.background = 'var(--accent-emerald)';
                printBtn.style.color = '#000';
                if (toast) toast.style.display = 'block';

                setTimeout(() => {
                    printBtn.innerHTML = '<i class="fas fa-receipt"></i> PRINT BILL & FINALIZE ↗';
                    printBtn.style.background = '';
                    printBtn.style.color = '';
                    printBtn.style.opacity = '1';
                    if (toast) toast.style.display = 'none';
                }, 3000);
            }, 600);
        });
    };
    initInteractivePosDemo();

});

