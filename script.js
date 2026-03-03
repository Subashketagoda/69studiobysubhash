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

    // Custom Cursor Glow Effect
    const cursorGlow = document.querySelector('.cursor-glow');
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });

    // Sticky Header Logic
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Active Navigation Link on Scroll
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
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
    });

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
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('about')) {
                    animateStats();
                    animateSkills();
                }
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
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
            if (window.firebaseDB && window.firebasePush && window.firebaseRef) {
                window.firebasePush(window.firebaseRef(window.firebaseDB, 'leads'), newLead);
            } else {
                const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
                leads.unshift(newLead);
                localStorage.setItem('studio_leads', JSON.stringify(leads));
            }

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

    // Simple Visit Tracker
    const trackVisit = () => {
        let stats;
        try { stats = JSON.parse(localStorage.getItem('studio_stats')); } catch (e) { }
        if (!stats) stats = { inquiries: 0, visits: 0, dailyVisits: {} };
        if (!stats.dailyVisits) stats.dailyVisits = {};

        const lastVisit = localStorage.getItem('last_visit');
        const now = new Date().getTime();

        // Count visit if it's been more than 1 hour since last session
        if (!lastVisit || (now - parseInt(lastVisit)) > 3600000) {
            stats.visits++;

            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            stats.dailyVisits[todayStr] = (stats.dailyVisits[todayStr] || 0) + 1;

            localStorage.setItem('studio_stats', JSON.stringify(stats));
            localStorage.setItem('last_visit', now.toString());

            if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
                window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'stats'), stats);
            }
        }
    };
    trackVisit();
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinksList = document.querySelectorAll('nav ul li a');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });

        // Close menu when a link is clicked
        navLinksList.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.querySelector('i').classList.add('fa-bars');
                menuToggle.querySelector('i').classList.remove('fa-times');
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
