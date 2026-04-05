document.addEventListener('DOMContentLoaded', () => {
    // Hide Preloader
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('fade-out');
            }, 500);
        });
        // Fallback for preloader
        setTimeout(() => {
            preloader.classList.add('fade-out');
        }, 3000);
    }

    // Custom Cursor Glow Effect (Desktop Only, GPU-optimized)
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow && !('ontouchstart' in window)) {
        let mouseX = 0, mouseY = 0;
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        function updateCursor() {
            cursorGlow.style.left = mouseX + 'px';
            cursorGlow.style.top = mouseY + 'px';
            requestAnimationFrame(updateCursor);
        }
        requestAnimationFrame(updateCursor);
    } else if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }

    // Sticky Header Logic
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

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

    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        stats.forEach(stat => {
            const target = +stat.getAttribute('data-target');
            const speed = 200; // Lower is faster
            const updateCount = () => {
                const count = +stat.innerText.replace('+', '');
                const inc = target / speed;

                if (count < target) {
                    stat.innerText = Math.ceil(count + inc) + '+';
                    setTimeout(updateCount, 1);
                } else {
                    stat.innerText = target + '+';
                }
            };
            updateCount();
        });
    };

    // Skills Bar Animation
    const skillBars = document.querySelectorAll('.progress-line span');
    const animateSkills = () => {
        skillBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
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
                    animateSkills();
                }
                entry.target.classList.add('reveal');
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
                        <p>"${review.message}"</p>
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
            <div class="product-card">
                <div class="product-img-container">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <span class="product-price">${product.price}</span>
                    <p class="product-description">${product.description || 'Premium digital product from 69 Studio.'}</p>
                    <button class="buy-now-btn" onclick="initiatePayment('${product.id}', '${product.name}', '${product.price}')">
                        Buy Now <i class="fas fa-bolt"></i>
                    </button>
                </div>
            </div>
        `).join('');
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
            overlay.style = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.95); backdrop-filter: blur(10px);
                z-index: 10000; display: flex; flex-direction: column;
                justify-content: center; align-items: center; color: white;
                font-family: 'Outfit', sans-serif;
            `;

            overlay.innerHTML = `
                <div style="text-align: center; max-width: 400px; padding: 40px; background: #121212; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
                    <div style="font-size: 3rem; color: #ff4d4d; margin-bottom: 20px;"><i class="fas fa-shield-halved"></i></div>
                    <h2 style="margin-bottom: 10px;">Secure Checkout</h2>
                    <p style="color: #a0a0a0; margin-bottom: 30px;">You are paying <strong>${price}</strong> for <strong>${name}</strong>.</p>
                    
                    <div id="payment-steps" style="text-align: left; margin-bottom: 30px;">
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; color: #4dff8c;">
                            <i class="fas fa-check-circle"></i> <span>Initializing Gateway</span>
                        </div>
                        <div id="step-2" style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px; color: #a0a0a0;">
                            <i class="fas fa-circle-notch fa-spin"></i> <span>Processing Payment...</span>
                        </div>
                    </div>
                    
                    <div id="payment-success" style="display: none;">
                        <div style="font-size: 4rem; color: #4dff8c; margin-bottom: 20px;"><i class="fas fa-check-circle"></i></div>
                        <h2 style="color: #4dff8c;">Success!</h2>
                        <p style="margin-top: 10px;">Your transaction was completed successfully.</p>
                        <button onclick="this.closest('.payment-overlay').remove()" class="btn primary" style="margin-top: 30px; width: 100%;">Return to Site</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Simulate steps
            setTimeout(() => {
                document.getElementById('step-2').style.color = '#4dff8c';
                document.getElementById('step-2').innerHTML = '<i class="fas fa-check-circle"></i> <span>Payment Authorized</span>';

                setTimeout(() => {
                    document.getElementById('payment-steps').style.display = 'none';
                    document.getElementById('payment-success').style.display = 'block';
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
});
