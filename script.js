document.addEventListener('DOMContentLoaded', () => {
    // Hide Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
            }, 600);
        });
        // Fallback for preloader
        setTimeout(() => {
            preloader.classList.add('fade-out');
        }, 3000);
    }

    // ========== BACKGROUND INTERACTIVE PARALLAX DEPTH ==========
    if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', (e) => {
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            
            document.documentElement.style.setProperty('--bg-parallax-x1', `${x * 40}px`);
            document.documentElement.style.setProperty('--bg-parallax-y1', `${y * 40}px`);
            document.documentElement.style.setProperty('--bg-parallax-x2', `${x * -30}px`);
            document.documentElement.style.setProperty('--bg-parallax-y2', `${y * -30}px`);
            document.documentElement.style.setProperty('--bg-parallax-x3', `${x * 20}px`);
            document.documentElement.style.setProperty('--bg-parallax-y3', `${y * 20}px`);
        }, { passive: true });
    }

    // ========== PREMIUM 3-LAYER CURSOR SYSTEM ==========
    const cursorDot = document.getElementById('cursorDot');
    const cursorRing = document.getElementById('cursorRing');
    const cursorGlow = document.querySelector('.cursor-glow');

    if (!('ontouchstart' in window)) {
        document.body.classList.add('custom-cursor-active');

        let dotX = 0, dotY = 0;
        let ringX = 0, ringY = 0;
        let glowX = 0, glowY = 0;

        document.addEventListener('mousemove', (e) => {
            dotX = e.clientX;
            dotY = e.clientY;
        }, { passive: true });

        // Smooth lagging ring and glow
        function animateCursor() {
            ringX += (dotX - ringX) * 0.12;
            ringY += (dotY - ringY) * 0.12;
            glowX += (dotX - glowX) * 0.06;
            glowY += (dotY - glowY) * 0.06;

            if (cursorDot) cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate3d(-50%, -50%, 0)`;
            if (cursorRing) cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate3d(-50%, -50%, 0)`;
            if (cursorGlow) cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate3d(-50%, -50%, 0)`;

            requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        // Hover effect on interactive elements
        const interactiveEls = document.querySelectorAll('a, button, .service-card, .partner-card, .portfolio-item, .stat-item, .tilt-card, input, select, textarea');
        interactiveEls.forEach(el => {
            const isTextField = (el.tagName === 'INPUT' && ['text', 'email', 'password', 'tel', 'url'].includes(el.type)) || el.tagName === 'TEXTAREA';

            el.addEventListener('mouseenter', () => {
                if (isTextField) {
                    if (cursorRing) cursorRing.classList.add('text-hovering');
                    if (cursorDot) {
                        cursorDot.style.width = '2px';
                        cursorDot.style.height = '16px';
                        cursorDot.style.borderRadius = '2px';
                        cursorDot.style.boxShadow = 'none';
                    }
                } else {
                    if (cursorRing) cursorRing.classList.add('hovering');
                    if (cursorDot) {
                        cursorDot.style.width = '12px';
                        cursorDot.style.height = '12px';
                    }
                }
            });

            el.addEventListener('mouseleave', () => {
                if (isTextField) {
                    if (cursorRing) cursorRing.classList.remove('text-hovering');
                    if (cursorDot) {
                        cursorDot.style.width = '8px';
                        cursorDot.style.height = '8px';
                        cursorDot.style.borderRadius = '50%';
                        cursorDot.style.boxShadow = '0 0 10px rgba(255,77,77,0.8)';
                    }
                } else {
                    if (cursorRing) cursorRing.classList.remove('hovering');
                    if (cursorDot) {
                        cursorDot.style.width = '8px';
                        cursorDot.style.height = '8px';
                    }
                }
            });
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            if (cursorDot) cursorDot.style.opacity = '0';
            if (cursorRing) cursorRing.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            if (cursorDot) cursorDot.style.opacity = '1';
            if (cursorRing) cursorRing.style.opacity = '1';
        });

    } else {
        // Hide all cursor elements on touch devices
        [cursorDot, cursorRing, cursorGlow].forEach(el => { if (el) el.style.display = 'none'; });
    }

    // Sticky Header Logic
    const header = document.querySelector('header');
    if (header) {
        const hasMorph = header.getAttribute('data-morph') === 'true' || !header.classList.contains('scrolled');
        window.addEventListener('scroll', () => {
            if (!hasMorph) return;
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }, { passive: true });
    }

    // Active Navigation Link on Scroll (Throttled)
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    if (pageYOffset >= sectionTop - 150) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').includes(current)) {
                        link.classList.add('active');
                    }
                });
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // Stats Counter Animation (Smooth, frame-rate independent)
    const stats = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        stats.forEach(stat => {
            if (stat.classList.contains('counter-animated')) return;
            stat.classList.add('counter-animated');

            const target = +stat.getAttribute('data-target');
            const duration = 1500; // 1.5 seconds duration
            let startTime = null;

            const updateCount = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;
                const percentage = Math.min(progress / duration, 1);
                const current = Math.floor(percentage * target);

                stat.innerText = current + '+';

                if (percentage < 1) {
                    requestAnimationFrame(updateCount);
                } else {
                    stat.innerText = target + '+';
                }
            };
            requestAnimationFrame(updateCount);
        });
    };

    // Chart / Metrics Animation
    const animateChart = () => {
        // Animate horizontal metrics progress bars
        const metricFills = document.querySelectorAll('.metric-bar-fill');
        metricFills.forEach(fill => {
            const val = fill.getAttribute('data-value');
            if (val) {
                fill.style.width = `${val}%`;
            }
        });

        // Fallback for 3D chart columns if any exist
        const chartBars = document.querySelectorAll('.chart-bar-3d');
        chartBars.forEach(bar => {
            const val = parseInt(bar.getAttribute('data-value')) || 0;
            const containerHeight = 180;
            const targetHeight = (val / 100) * containerHeight;

            const faces = bar.querySelectorAll('.bar-face');
            faces.forEach(face => {
                if (face.classList.contains('top')) {
                    face.style.bottom = `${targetHeight}px`;
                } else {
                    face.style.height = `${targetHeight}px`;
                }
            });
        });
    };

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Removed dynamic theme switching for premium dark consistency
                
                if (entry.target.classList.contains('about')) {
                    animateStats();
                    animateChart();
                }
                entry.target.classList.add('reveal-active');
                // No unobserve so it can trigger the theme again if scrolled back up
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Form Submission Handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerHTML;

            btn.innerHTML = 'Sending... <i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            const newLead = {
                name: data.name,
                email: data.email,
                interest: data.interest || 'Not Specified',
                message: data.message,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'New',
                timestamp: new Date().getTime()
            };

            // Push lead to Firebase if available, else local storage
            // WhatsApp Alert (New Lead!)
            const sendWhatsAppAlert = async (lead) => {
                const apiKey = "YOUR_API_KEY_HERE"; // User will provide this
                const phone = "9477XXXXXXX"; // User's phone number
                if (apiKey === "YOUR_API_KEY_HERE") return;
                
                const text = `🔥 *NEW LEAD AT 69 STUDIO*%0A%0A*Name:* ${lead.name}%0A*Email:* ${lead.email}%0A*Message:* ${lead.message}%0A%0A✅ Check Admin: https://69studiobysubash.online/admin.html`;
                const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${text}&apikey=${apiKey}`;
                
                try { await fetch(url); } catch(e) {}
            };
            sendWhatsAppAlert(newLead);
            if (window.firebaseDB && window.firebasePush && window.firebaseRef) {
                window.firebasePush(window.firebaseRef(window.firebaseDB, 'leads'), newLead);
            } else {
                const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
                leads.unshift(newLead);
                localStorage.setItem('studio_leads', JSON.stringify(leads));
            }

            // Robust Server-Side Global Inquiry Increment
            const incrementInquiries = async () => {
                if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
                    const statsRef = window.firebaseRef(window.firebaseDB, 'stats');
                    window.firebaseOnValue(statsRef, (snapshot) => {
                        let globalStats = snapshot.val() || { inquiries: 0, visits: 0, dailyVisits: {} };
                        globalStats.inquiries = (globalStats.inquiries || 0) + 1;
                        window.firebaseUpdate(statsRef, globalStats);
                    }, { onlyOnce: true });
                }
            };
            incrementInquiries();

            // Also track total inquiries locally
            let stats;
            try { stats = JSON.parse(localStorage.getItem('studio_stats')); } catch (e) { }
            if (!stats) stats = { inquiries: 0, visits: 0, dailyVisits: {} };
            stats.inquiries++;
            localStorage.setItem('studio_stats', JSON.stringify(stats));

            if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
                window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'stats'), stats);
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    btn.innerHTML = 'Sent Successfully! <i class="fas fa-check"></i>';
                    btn.style.backgroundColor = '#27ae60';
                    contactForm.reset();

                    setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.style.backgroundColor = '';
                        btn.disabled = false;
                    }, 5000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Even if fetch fails (e.g. offline), we saved it locally
                btn.innerHTML = 'Sent Successfully! <i class="fas fa-check"></i>';
                btn.style.backgroundColor = '#27ae60';
                contactForm.reset();

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 3000);
            }
        });
    }

    // Robust Server-Side Incrementing Visit Tracker
    const trackVisit = async () => {
        const lastVisit = localStorage.getItem('last_visit');
        const now = Date.now();

        // Increment if first visit or > 1hr session
        if (!lastVisit || (now - parseInt(lastVisit)) > 3600000) {
            localStorage.setItem('last_visit', now.toString());
            
            if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
                // Increment global visits on the server directly
                const statsRef = window.firebaseRef(window.firebaseDB, 'stats');
                
                // Fetch latest global stats first to keep them merged
                window.firebaseOnValue(statsRef, (snapshot) => {
                    let globalStats = snapshot.val() || { visits: 0, inquiries: 0, dailyVisits: {} };
                    globalStats.visits = (globalStats.visits || 0) + 1;
                    
                    const today = new Date();
                    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    if (!globalStats.dailyVisits) globalStats.dailyVisits = {};
                    globalStats.dailyVisits[todayStr] = (globalStats.dailyVisits[todayStr] || 0) + 1;
                    
                    window.firebaseUpdate(statsRef, globalStats);
                }, { onlyOnce: true });
            }
        }
    };
    
    if (window.firebaseDB) trackVisit();
    else window.addEventListener('firebaseLoaded', trackVisit);
    // Announcement Setup
    const bar = document.getElementById('announcement-bar');
    const text = document.getElementById('announcement-text-display');
    const settings = JSON.parse(localStorage.getItem('studio_settings') || '{"announcement":""}');
    
    if (settings.announcement && bar && text) {
        text.innerText = settings.announcement;
        bar.style.display = 'flex';
    }

    // Firebase Sync for Announcement
    window.addEventListener('firebaseLoaded', () => {
        if (window.firebaseDB && window.firebaseOnValue && window.firebaseRef) {
            window.firebaseOnValue(window.firebaseRef(window.firebaseDB, 'settings'), (snapshot) => {
                const data = snapshot.val();
                if (data && data.announcement && bar && text) {
                    text.innerText = data.announcement;
                    bar.style.display = 'flex';
                    localStorage.setItem('studio_settings', JSON.stringify(data));
                } else if (bar) {
                    bar.style.display = 'none';
                }
            });
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinksList = document.querySelectorAll('nav ul li a');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
            // Lock/unlock body scroll when menu is open
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                const barsIcon = menuToggle.querySelector('i');
                if (barsIcon) {
                    barsIcon.classList.add('fa-bars');
                    barsIcon.classList.remove('fa-times');
                }
            });
        });
    }

    // Reviews Handling
    const reviewForm = document.getElementById('reviewForm');
    const reviewsGrid = document.getElementById('reviewsGrid');

    const loadReviews = () => {
        if (!reviewsGrid) return;

        // Seed initial reviews if none exist
        if (!localStorage.getItem('studio_reviews')) {
            const initialReviews = [
                {
                    id: '1',
                    name: 'Sarah Jenkins',
                    rating: 5,
                    message: 'Absolutely phenomenal service! 69 Studio completely transformed our brand identity and delivered a stunning website that exceeded all expectations.',
                    date: 'Feb 20, 2026'
                },
                {
                    id: '2',
                    name: 'Mohammed Al-Fayed',
                    rating: 5,
                    message: 'Working with Subhash was a breeze. Professional, responsive, and incredibly talented. Highly recommended for any digital project in Dubai.',
                    date: 'Feb 15, 2026'
                }
            ];
            localStorage.setItem('studio_reviews', JSON.stringify(initialReviews));
        }

        const reviews = JSON.parse(localStorage.getItem('studio_reviews') || '[]');

        if (reviews.length === 0) {
            reviewsGrid.innerHTML = `
                <div style="text-align: center; color: var(--text-grey); padding: 50px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 20px; background: rgba(255,255,255,0.02);">
                    <i class="fas fa-comment-slash" style="font-size: 2.5rem; margin-bottom: 15px; color: rgba(255,255,255,0.1);"></i>
                    <p style="font-size: 1.1rem;">No reviews yet. Be the first to share your experience!</p>
                </div>`;
            return;
        }

        reviewsGrid.innerHTML = reviews.map(review => {
            const stars = Array(5).fill(0).map((_, i) =>
                `<i class="fa${i < review.rating ? 's' : 'r'} fa-star"></i>`
            ).join('');

            const initials = review.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            return `
                <div class="review-card">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <div class="reviewer-avatar">${initials}</div>
                            <div class="reviewer-details">
                                <h4>${review.name}</h4>
                                <span>${review.date}</span>
                            </div>
                        </div>
                        <div class="review-rating">
                            ${stars}
                        </div>
                    </div>
                    <div class="review-body">
                        <p><i class="fas fa-quote-left" style="opacity: 0.15; margin-right: 8px; font-size: 0.8rem; vertical-align: top;"></i>${review.message}<i class="fas fa-quote-right" style="opacity: 0.15; margin-left: 8px; font-size: 0.8rem; vertical-align: bottom;"></i></p>
                    </div>
                </div>
            `;
        }).join('');
    };

    if (reviewForm) {
        // Handle form submission
        reviewForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('reviewName').value;
            const rating = parseInt(document.getElementById('reviewRating').value);
            const message = document.getElementById('reviewMessage').value;
            const btn = reviewForm.querySelector('button');
            const originalText = btn.innerHTML;
            const statusDiv = document.getElementById('reviewStatus');

            btn.innerHTML = 'Submitting... <i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            setTimeout(() => {
                const newReview = {
                    id: Date.now().toString(),
                    name,
                    rating,
                    message,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                };

                // Push to Firebase if available, else local storage
                if (window.firebaseDB && window.firebasePush && window.firebaseRef) {
                    window.firebasePush(window.firebaseRef(window.firebaseDB, 'reviews'), newReview);
                } else {
                    const reviews = JSON.parse(localStorage.getItem('studio_reviews') || '[]');
                    reviews.unshift(newReview);
                    localStorage.setItem('studio_reviews', JSON.stringify(reviews));
                    // Trigger storage event so other open tabs update
                    window.dispatchEvent(new Event('storage'));
                }

                // Re-render immediately
                loadReviews();

                btn.innerHTML = 'Review Submitted! <i class="fas fa-check"></i>';
                btn.style.backgroundColor = '#27ae60';
                statusDiv.innerText = "Thank you! Your review is now visible to everyone.";
                statusDiv.style.color = "#27ae60";

                reviewForm.reset();

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                    statusDiv.innerText = "";
                }, 4000);
            }, 600);
        });

        // Listen for updates from other tabs (local storage fallback)
        window.addEventListener('storage', (e) => {
            if (!e || e.key === 'studio_reviews' || !e.key) {
                loadReviews();
            }
        });

        // Sync with Firebase
        const syncWithFirebase = () => {
            if (window.firebaseDB && window.firebaseOnValue && window.firebaseRef) {
                // Reviews sync
                const reviewsRef = window.firebaseRef(window.firebaseDB, 'reviews');
                window.firebaseOnValue(reviewsRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        const reviewsArray = Object.values(data).sort((a, b) => parseInt(b.id) - parseInt(a.id));
                        localStorage.setItem('studio_reviews', JSON.stringify(reviewsArray));
                        loadReviews();
                    }
                });

                // Stats sync setup
                const statsRef = window.firebaseRef(window.firebaseDB, 'stats');
                window.firebaseOnValue(statsRef, (snapshot) => {
                    const data = snapshot.val();
                    if (data) {
                        localStorage.setItem('studio_stats', JSON.stringify(data));
                    }
                });
            }
        };

        // Call sync if firebase loaded, or wait for it
        if (window.firebaseDB) {
            syncWithFirebase();
        } else {
            window.addEventListener('firebaseLoaded', syncWithFirebase);
        }

        // Initial Load
        loadReviews();
    }

    // Store Handling
    const storeGrid = document.getElementById('storeGrid');

    const loadProducts = () => {
        if (!storeGrid) return;

        const products = JSON.parse(localStorage.getItem('studio_products') || '[]');

        if (products.length === 0) {
            storeGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: var(--text-grey); padding: 50px 20px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 20px; background: rgba(255,255,255,0.02);">
                    <i class="fas fa-shopping-bag" style="font-size: 2.5rem; margin-bottom: 15px; color: rgba(255,255,255,0.1);"></i>
                    <p style="font-size: 1.1rem;">Our store is currently being restocked. Check back soon!</p>
                </div>`;
            return;
        }

        storeGrid.innerHTML = products.map(product => `
            <div class="product-card spotlight-card tilt-card" data-tilt-intensity="8">
                <div class="shine-streak"></div>
                <div class="product-img-container">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-price">${product.price}</span>
                    <p class="product-description">${product.description || 'Premium digital product from 69 Studio.'}</p>
                    <button class="buy-now-btn btn" onclick="initiatePayment('${product.id}', '${product.name}', '${product.price}')">
                        Buy Now <i class="fas fa-bolt"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Re-initialize 3D tilt, spotlights and magnetic buttons for dynamically loaded elements
        if (typeof init3DTilt === 'function') init3DTilt();
        if (typeof initSpotlightCards === 'function') initSpotlightCards();
        if (typeof initMagneticButtons === 'function') initMagneticButtons();
        
        // Re-bind hover event listeners to dynamic product elements for the custom cursor
        if (!('ontouchstart' in window)) {
            const cursorDot = document.getElementById('cursorDot');
            const cursorRing = document.getElementById('cursorRing');
            const dynamicInteractive = storeGrid.querySelectorAll('.product-card, .buy-now-btn');
            
            dynamicInteractive.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    if (cursorRing) cursorRing.classList.add('hovering');
                    if (cursorDot) {
                        cursorDot.style.width = '12px';
                        cursorDot.style.height = '12px';
                    }
                });
                el.addEventListener('mouseleave', () => {
                    if (cursorRing) cursorRing.classList.remove('hovering');
                    if (cursorDot) {
                        cursorDot.style.width = '8px';
                        cursorDot.style.height = '8px';
                    }
                });
            });
        }
    };

    // Payment Gateway Simulation
    window.initiatePayment = (id, name, price) => {
        const btn = event.currentTarget;
        const originalContent = btn.innerHTML;

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securely Redirecting...';
        btn.disabled = true;

        // Simulate Gateway Redirect
        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.className = 'payment-overlay';

            overlay.innerHTML = `
                <div class="payment-card">
                    <div id="payment-gate">
                        <div class="payment-icon-shield"><i class="fas fa-shield-halved"></i></div>
                        <h2>Secure Checkout</h2>
                        <p>You are paying <strong>${price}</strong> for <strong>${name}</strong>.</p>
                        
                        <div class="payment-steps">
                            <div class="payment-step completed">
                                <i class="fas fa-check-circle"></i> <span>Initializing Gateway</span>
                            </div>
                            <div id="step-2" class="payment-step active">
                                <i class="fas fa-circle-notch fa-spin"></i> <span>Processing Payment...</span>
                            </div>
                        </div>
                    </div>
                    
                    <div id="payment-success" style="display: none;">
                        <div class="payment-icon-success"><i class="fas fa-check-circle"></i></div>
                        <h2 style="color: #27ae60;">Success!</h2>
                        <p>Your transaction was completed successfully.</p>
                        <button onclick="this.closest('.payment-overlay').remove()" class="btn primary" style="margin-top: 30px; width: 100%;">Return to Site</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            
            // Trigger animation
            setTimeout(() => {
                overlay.style.opacity = '1';
                overlay.style.transition = 'opacity 0.4s ease';
                const card = overlay.querySelector('.payment-card');
                if (card) {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1) translateY(0)';
                    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s';
                }
            }, 50);

            // Simulate steps
            setTimeout(() => {
                const step2 = document.getElementById('step-2');
                if (step2) {
                    step2.className = 'payment-step completed';
                    step2.innerHTML = '<i class="fas fa-check-circle"></i> <span>Payment Authorized</span>';
                }

                setTimeout(() => {
                    const gate = document.getElementById('payment-gate');
                    const success = document.getElementById('payment-success');
                    if (gate && success) {
                        gate.style.display = 'none';
                        success.style.display = 'block';
                        
                        // Add hover listeners to the Return button for cursor
                        const returnBtn = success.querySelector('button');
                        if (returnBtn && !('ontouchstart' in window)) {
                            const cursorDot = document.getElementById('cursorDot');
                            const cursorRing = document.getElementById('cursorRing');
                            returnBtn.addEventListener('mouseenter', () => {
                                if (cursorRing) cursorRing.classList.add('hovering');
                                if (cursorDot) {
                                    cursorDot.style.width = '12px';
                                    cursorDot.style.height = '12px';
                                }
                            });
                            returnBtn.addEventListener('mouseleave', () => {
                                if (cursorRing) cursorRing.classList.remove('hovering');
                                if (cursorDot) {
                                    cursorDot.style.width = '8px';
                                    cursorDot.style.height = '8px';
                                }
                            });
                        }
                    }
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                }, 1500);
            }, 2000);
        }, 1000);
    };


    // Firebase Sync for Products
    const syncProducts = () => {
        if (window.firebaseDB && window.firebaseOnValue && window.firebaseRef) {
            const productsRef = window.firebaseRef(window.firebaseDB, 'products');
            window.firebaseOnValue(productsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const productsArray = Object.values(data);
                    localStorage.setItem('studio_products', JSON.stringify(productsArray));
                    loadProducts();
                } else {
                    localStorage.setItem('studio_products', '[]');
                    loadProducts();
                }
            });
        }
    };

    if (window.firebaseDB) {
        syncProducts();
    } else {
        window.addEventListener('firebaseLoaded', syncProducts);
        window.addEventListener('firebaseStoreLoaded', syncProducts);
    }

    loadProducts();

    // Secret Admin Access (Triple click logo)
    const logo = document.querySelector('.logo');
    let clickCount = 0;
    let clickTimer;

    if (logo) {
        logo.addEventListener('click', () => {
            clickCount++;
            clearTimeout(clickTimer);
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 500);

            if (clickCount === 3) {
                window.location.href = 'admin.html';
            }
        });
    }

    // ==================== PREMIUM 3D & MOTION EFFECTS ====================

    // 1. 3D Tilt Card Effect
    const init3DTilt = () => {
        const tiltCards = document.querySelectorAll('.tilt-card');
        if (tiltCards.length === 0 || ('ontouchstart' in window)) return;

        tiltCards.forEach(card => {
            const intensity = parseFloat(card.getAttribute('data-tilt-intensity')) || 10;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Calculate tilt angles
                const rotateX = ((centerY - y) / centerY) * intensity;
                const rotateY = ((x - centerX) / centerX) * intensity;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

                // Dynamic shine effect properties
                card.classList.add('shiny');
                card.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
                card.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                card.classList.remove('shiny');
            });
        });
    };

    // 2. Magnetic Hover Effect for Buttons & Links
    const initMagneticButtons = () => {
        const magneticElements = document.querySelectorAll('.btn, .cta-button, .floating-chat');
        if (magneticElements.length === 0 || ('ontouchstart' in window)) return;

        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Move element toward cursor smoothly
                el.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0) scale(1.03)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = '';
            });
        });
    };

    // 3. Scroll Progress Indicator
    const initScrollProgress = () => {
        const scrollBar = document.getElementById('scrollProgress');
        if (!scrollBar) return;

        window.addEventListener('scroll', () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                scrollBar.style.width = `${progress}%`;
            }
        }, { passive: true });
    };

    // 4. Parallax Depth for Hero Section Elements
    const initHeroParallax = () => {
        const hero = document.getElementById('home');
        const floatingBoxes = document.querySelectorAll('.floating-box');
        
        if (!hero || ('ontouchstart' in window)) return;

        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

            // Pass offsets as CSS Custom Properties to floating boxes
            floatingBoxes.forEach((box, index) => {
                const speedFactor = (index + 1) * 20; // Staggered speeds
                const px = x * speedFactor;
                const py = y * speedFactor;
                box.style.setProperty('--parallax-x', `${px}px`);
                box.style.setProperty('--parallax-y', `${py}px`);
            });
        }, { passive: true });

        hero.addEventListener('mouseleave', () => {
            floatingBoxes.forEach(box => {
                box.style.setProperty('--parallax-x', '0px');
                box.style.setProperty('--parallax-y', '0px');
            });
        });
    };

    // 5. Interactive Particle Canvas Background
    const initParticleCanvas = () => {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 150 };

        // Adjust for high-res screens
        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Track mouse on desktop
        if (!('ontouchstart' in window)) {
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
            });
            window.addEventListener('mouseleave', () => {
                mouse.x = null;
                mouse.y = null;
            });
        }

        class Particle {
            constructor() {
                this.x = Math.random() * window.innerWidth;
                this.y = Math.random() * window.innerHeight;
                this.size = Math.random() * 2.5 + 0.5; // Small premium dots
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * -0.5 - 0.1; // Float upwards
                this.opacity = Math.random() * 0.4 + 0.1;
                this.baseOpacity = this.opacity;
                this.color = Math.random() > 0.5 ? '255, 0, 127' : '0, 243, 255'; // Neon Pink or Electric Cyan
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Wrap around screen boundaries
                if (this.y < 0) {
                    this.y = window.innerHeight;
                    this.x = Math.random() * window.innerWidth;
                }
                if (this.x < 0 || this.x > window.innerWidth) {
                    this.speedX = -this.speedX;
                }

                // Cursor repulsion/reaction logic
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < mouse.radius) {
                        const force = (mouse.radius - distance) / mouse.radius;
                        // Push away from cursor
                        const directionX = dx / distance;
                        const directionY = dy / distance;
                        
                        this.x += directionX * force * 2;
                        this.y += directionY * force * 2;
                        
                        // Increase glow near cursor
                        this.opacity = Math.min(this.baseOpacity + force * 0.4, 0.8);
                    } else {
                        // Return to base opacity slowly
                        if (this.opacity > this.baseOpacity) {
                            this.opacity -= 0.01;
                        }
                    }
                }
            }

            draw() {
                ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Initialize particles
        const particleCount = Math.min(Math.floor(window.innerWidth / 15), 80);
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw links between close particles for digital/constellation texture
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < 65) {
                        const alpha = (1 - (dist / 65)) * 0.05;
                        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha})`;
                        ctx.lineWidth = 0.35;
                        ctx.beginPath();
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(animate);
        };
        animate();
    };

    // 6. Interactive 3D WebGL Scene (Three.js)
    const init3DScene = () => {
        const container = document.getElementById('canvas3d');
        if (!container || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;

        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 250;

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const originalPositions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        const radius = 135; // Slightly larger for better backdrop effect

        for (let i = 0; i < particleCount; i++) {
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            velocities[i] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const createCircleTexture = () => {
            const matCanvas = document.createElement('canvas');
            matCanvas.width = 16;
            matCanvas.height = 16;
            const matCtx = matCanvas.getContext('2d');
            const grad = matCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
            grad.addColorStop(0, 'rgba(255, 0, 127, 1)');
            grad.addColorStop(0.3, 'rgba(255, 0, 127, 0.8)');
            grad.addColorStop(0.8, 'rgba(0, 243, 255, 0.25)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            matCtx.fillStyle = grad;
            matCtx.fillRect(0, 0, 16, 16);
            return new THREE.CanvasTexture(matCanvas);
        };

        const material = new THREE.PointsMaterial({
            size: 3.5,
            map: createCircleTexture(),
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const particleSystem = new THREE.Points(geometry, material);
        scene.add(particleSystem);

        const meshGeometry = new THREE.IcosahedronGeometry(radius, 2);
        const meshMaterial = new THREE.MeshBasicMaterial({
            color: 0x00f3ff,
            wireframe: true,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        const wireframeMesh = new THREE.Mesh(meshGeometry, meshMaterial);
        scene.add(wireframeMesh);

        // Add rotating rings
        const ringGeo = new THREE.RingGeometry(radius + 20, radius + 21, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xff5f00,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.08,
            blending: THREE.AdditiveBlending
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        scene.add(ringMesh);

        let mouseX = 0, mouseY = 0;
        let targetX = 0, targetY = 0;

        window.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
            mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
        }, { passive: true });

        const clock = new THREE.Clock();

        const tick = () => {
            requestAnimationFrame(tick);
            const elapsedTime = clock.getElapsedTime();

            particleSystem.rotation.y = elapsedTime * 0.04;
            particleSystem.rotation.x = elapsedTime * 0.02;
            wireframeMesh.rotation.y = elapsedTime * 0.04;
            wireframeMesh.rotation.x = elapsedTime * 0.02;

            ringMesh.rotation.z = -elapsedTime * 0.1;

            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;

            particleSystem.position.x = targetX * 0.25;
            particleSystem.position.y = -targetY * 0.25;
            wireframeMesh.position.x = targetX * 0.25;
            wireframeMesh.position.y = -targetY * 0.25;
            ringMesh.position.x = targetX * 0.25;
            ringMesh.position.y = -targetY * 0.25;

            const posAttr = geometry.attributes.position;
            const posArray = posAttr.array;

            for (let i = 0; i < particleCount; i++) {
                const ix = i * 3;
                const iy = i * 3 + 1;
                const iz = i * 3 + 2;

                const ox = originalPositions[ix];
                const oy = originalPositions[iy];
                const oz = originalPositions[iz];

                const angle = elapsedTime * velocities[i] * 0.4;
                const factor = 1 + Math.sin(angle) * 0.06;

                posArray[ix] = ox * factor;
                posArray[iy] = oy * factor;
                posArray[iz] = oz * factor;
            }

            posAttr.needsUpdate = true;
            renderer.render(scene, camera);
        };

        tick();

        window.addEventListener('resize', () => {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        });
    };

    // 7. Mouse Spotlight Hover Effect for Cards
    const initSpotlightCards = () => {
        const spotlightCards = document.querySelectorAll('.spotlight-card');
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

    // 8. Text Reveal Animation Helper
    const initTextReveal = () => {
        const revealTexts = document.querySelectorAll('.reveal-text');
        revealTexts.forEach(el => {
            const text = el.textContent.trim();
            el.innerHTML = text.split(' ').map((word, i) => {
                return `<span class="word-wrapper"><span class="word" style="transition-delay: ${i * 0.04}s">${word}</span></span>`;
            }).join(' ');
        });
    };

    // Initialize all premium effects
    init3DTilt();
    initMagneticButtons();
    initScrollProgress();
    initHeroParallax();
    initParticleCanvas();
    init3DScene();
    initSpotlightCards();
    initTextReveal();
});
