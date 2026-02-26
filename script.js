// Visitor Tracking
(function trackVisitor() {
    let visits = localStorage.getItem('dinepro_visits') || 0;
    // Simple logic: Only count once per session
    if (!sessionStorage.getItem('counted_visit')) {
        visits = parseInt(visits) + 1;
        localStorage.setItem('dinepro_visits', visits);
        sessionStorage.setItem('counted_visit', 'true');
    }
})();

// Sticky Header Effect
window.addEventListener('scroll', function () {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.padding = '8px 0';
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.borderBottom = '1px solid rgba(93, 58, 26, 0.1)';
    } else {
        header.style.padding = '15px 0';
        header.style.background = 'var(--glass)';
        header.style.borderBottom = '1px solid var(--glass-border)';
    }
});

// Chat Window Toggle
const chatToggle = document.getElementById('chatToggle');
const chatWindow = document.getElementById('chatWindow');
const closeChat = document.getElementById('closeChat');
const chatHome = document.getElementById('chatHome');
const chatMessagesView = document.getElementById('chatMessagesView');
const startChat = document.getElementById('startChat');
const goHome = document.getElementById('goHome');
const goChat = document.getElementById('goChat');
const messagesContainer = document.getElementById('messagesContainer');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');

if (chatToggle && chatWindow) {
    chatToggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isHidden = window.getComputedStyle(chatWindow).display === 'none';
        if (isHidden) {
            chatWindow.style.setProperty('display', 'flex', 'important');
            // Hide badge
            const badge = this.querySelector('.badge');
            if (badge) badge.style.display = 'none';
        } else {
            chatWindow.style.setProperty('display', 'none', 'important');
        }
    });
}

if (closeChat) {
    closeChat.addEventListener('click', (e) => {
        e.stopPropagation();
        chatWindow.style.setProperty('display', 'none', 'important');
    });
}

// Switch between Home and Chat View
function showHome() {
    chatHome.style.display = 'block';
    chatMessagesView.style.display = 'none';
    goHome.classList.add('active');
    goChat.classList.remove('active');
}

function showChat() {
    chatHome.style.display = 'none';
    chatMessagesView.style.display = 'flex';
    goHome.classList.remove('active');
    goChat.classList.add('active');

    // Initial bot message if empty
    if (messagesContainer.children.length === 0) {
        addMessage('Hello! How can I help you today?', 'bot');
    }
}

if (startChat) startChat.addEventListener('click', showChat);
if (goHome) goHome.addEventListener('click', showHome);
if (goChat) goChat.addEventListener('click', showChat);

// Message Handling
function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.innerText = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleBotResponse(userText) {
    const query = userText.toLowerCase();
    let response = "I'm not sure about that. Would you like to speak with a consultant on WhatsApp?";

    if (query.includes('hello') || query.includes('hi')) {
        response = "Hello! Welcome to DinePro Advisors. How can we help your hospitality business today?";
    } else if (query.includes('service') || query.includes('what do you do')) {
        response = "We offer Concept Development, Menu Engineering, Staff Training, and Operational Audits. Which one interest you?";
    } else if (query.includes('price') || query.includes('cost')) {
        response = "Our pricing is tailored to each project. You can get a free consultation via WhatsApp to discuss your needs!";
    } else if (query.includes('contact') || query.includes('call')) {
        response = "You can reach us at +94 76 121 0164 or email info@globehospitalitymc.com.";
    } else if (query.includes('thank')) {
        response = "You're very welcome! Let me know if you need anything else.";
    }

    setTimeout(() => {
        addMessage(response, 'bot');
    }, 1000);
}

function sendUserMessage() {
    const text = chatInput.value.trim();
    if (text) {
        addMessage(text, 'user');
        chatInput.value = '';
        handleBotResponse(text);
    }
}

if (sendMessage) sendMessage.addEventListener('click', sendUserMessage);
if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendUserMessage();
    });
}

// Make Search Work (Mock Search Logic)
const helpSearch = document.getElementById('helpSearch');
const searchResults = document.getElementById('searchResults');

const mockArticles = [
    { title: 'How to start a restaurant?', desc: 'A step-by-step guide for beginners.' },
    { title: 'Menu engineering tips', desc: 'Optimize your menu for maximum profit.' },
    { title: 'Staff training best practices', desc: 'Build a world-class hospitality team.' },
    { title: 'Improving profitability', desc: 'Reduce waste and increase your margins.' },
    { title: 'Concept development', desc: 'Creating a unique brand for your restaurant.' }
];

if (helpSearch && searchResults) {
    helpSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        searchResults.innerHTML = '';

        if (query.length > 0) {
            const filtered = mockArticles.filter(art =>
                art.title.toLowerCase().includes(query) ||
                art.desc.toLowerCase().includes(query)
            );

            searchResults.style.display = 'block';

            if (filtered.length > 0) {
                filtered.forEach(art => {
                    const div = document.createElement('div');
                    div.className = 'result-item';
                    div.innerHTML = `<h5>${art.title}</h5><p>${art.desc}</p>`;
                    div.onclick = () => {
                        showChat();
                        addMessage(`I'm interested in: ${art.title}`, 'user');
                        handleBotResponse(art.title);
                    };
                    searchResults.appendChild(div);
                });
            } else {
                searchResults.innerHTML = '<div class="no-results">No results found. Try another keyword.</div>';
            }
        } else {
            searchResults.style.display = 'none';
        }
    });
}

// Fade in elements on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card').forEach(card => {
    observer.observe(card);
});

// Hero Slider Logic
const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.arrow.next');
const prevBtn = document.querySelector('.arrow.prev');
let currentSlide = 0;
let slideInterval;

function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}

function prevSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
}

function startSlideTimer() {
    stopSlideTimer();
    slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
}

function stopSlideTimer() {
    if (slideInterval) clearInterval(slideInterval);
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        nextSlide();
        startSlideTimer();
    });
}

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        prevSlide();
        startSlideTimer();
    });
}

// Start auto-slide
startSlideTimer();

// Mobile Menu Logic
const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const dropdowns = document.querySelectorAll('.dropdown');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (!link.parentElement.classList.contains('dropdown')) {
            if (mobileToggle) mobileToggle.classList.remove('active');
            if (navLinks) navLinks.classList.remove('active');
        }
    });
});

// Dropdown toggle for mobile
dropdowns.forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            dropdown.classList.toggle('active');
        }
    });
});

// Contact Form Interception for Local Storage
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        // We don't preventDefault() because we want Formspree to still handle the email
        // But we store a copy locally before it redirects
        const formData = new FormData(this);
        const submission = {
            id: Date.now(),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            date: new Date().toLocaleString()
        };

        let submissions = JSON.parse(localStorage.getItem('dinepro_submissions') || '[]');
        submissions.unshift(submission); // Add to the beginning
        localStorage.setItem('dinepro_submissions', JSON.stringify(submissions.slice(0, 50))); // Keep last 50
    });
}
