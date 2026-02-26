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

            // Save lead to localStorage for Admin Panel
            const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
            leads.unshift({
                name: data.name,
                email: data.email,
                interest: data.interest || 'Not Specified',
                message: data.message,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'New',
                timestamp: new Date().getTime()
            });
            localStorage.setItem('studio_leads', JSON.stringify(leads));

            // Also track total inquiries
            const stats = JSON.parse(localStorage.getItem('studio_stats') || '{"inquiries": 0, "visits": 0}');
            stats.inquiries++;
            localStorage.setItem('studio_stats', JSON.stringify(stats));

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
        const stats = JSON.parse(localStorage.getItem('studio_stats') || '{"inquiries": 0, "visits": 0}');
        const lastVisit = localStorage.getItem('last_visit');
        const now = new Date().getTime();

        // Count visit if it's been more than 1 hour since last session
        if (!lastVisit || (now - parseInt(lastVisit)) > 3600000) {
            stats.visits++;
            localStorage.setItem('studio_stats', JSON.stringify(stats));
            localStorage.setItem('last_visit', now.toString());
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
