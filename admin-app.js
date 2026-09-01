/* ==========================================================================
   69 STUDIO — 2026 EXECUTIVE ADMIN APP LOGIC
   Mobile PWA + Desktop Command Center Control Engine
   ========================================================================== */

const SECRET_KEY = "69studio77";

// DOM Selectors
const appShell = document.getElementById('admin-app');
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('loginForm');
const overlay = document.getElementById('loading-overlay');
const errorMsg = document.getElementById('errorMsg');
const tabButtons = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.app-view');

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Biometric Credential Check
    if (window.PublicKeyCredential && localStorage.getItem('auth_id')) {
        const bioContainer = document.getElementById('bio-login-container');
        if (bioContainer) bioContainer.style.display = 'block';
    }

    // Default Seed Data if fresh
    seedDefaultData();

    // Check Stored Login Session
    if (localStorage.getItem('adminAccess') === 'true') {
        showApp();
    }

    // Setup Biometric UI button state
    if (localStorage.getItem('auth_id')) {
        const setupBtn = document.getElementById('setup-face-lock');
        if (setupBtn) {
            setupBtn.style.opacity = '0.7';
            setupBtn.innerHTML = '<i class="fas fa-check"></i><span>FaceID / Passkey Active</span><i class="fas fa-chevron-right"></i>';
        }
    }

    // Bottom Tabs Navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput.value.trim() === SECRET_KEY) {
                passwordInput.blur();
                if (overlay) overlay.style.display = 'flex';
                setTimeout(() => {
                    if (overlay) overlay.style.display = 'none';
                    localStorage.setItem('adminAccess', 'true');
                    showApp();
                }, 600);
            } else {
                if (errorMsg) errorMsg.style.display = 'block';
                passwordInput.value = '';
                setTimeout(() => { if (errorMsg) errorMsg.style.display = 'none'; }, 2800);
            }
        });
    }

    // Top Bar Quick Actions
    document.getElementById('notif-btn')?.addEventListener('click', () => switchTab('leads'));
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        if (overlay) overlay.style.display = 'flex';
        setTimeout(() => location.reload(), 400);
    });

    // Biometric Handlers
    document.getElementById('bio-login-btn')?.addEventListener('click', authenticateBiometric);

    // Initial Push Notification Check
    checkNotifPermissionUI();

    // Product Image Preview
    const imageFileInput = document.getElementById('productImageFile');
    imageFileInput?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                const previewImg = document.getElementById('imagePreview');
                const previewBox = document.getElementById('imagePreviewContainer');
                if (previewImg) previewImg.src = base64String;
                if (previewBox) previewBox.style.display = 'block';
                document.getElementById('productImageDataBase64').value = base64String;
            };
            reader.readAsDataURL(file);
        }
    });
});

// Seed default initial data if none exists
function seedDefaultData() {
    if (!localStorage.getItem('studio_stats')) {
        localStorage.setItem('studio_stats', JSON.stringify({
            visits: 14280,
            activeProjects: 24,
            successRate: 98,
            inquiries: 18,
            dailyVisits: {
                "2026-08-26": 120,
                "2026-08-27": 190,
                "2026-08-28": 280,
                "2026-08-29": 350,
                "2026-08-30": 420,
                "2026-08-31": 490,
                "2026-09-01": 560
            }
        }));
    }

    if (!localStorage.getItem('studio_tasks')) {
        localStorage.setItem('studio_tasks', JSON.stringify([
            { id: 1, text: "Deploy Rocco's Italian Dining online booking update", done: true },
            { id: 2, text: "Finalize Real Ceylon Gems 3D WebGL stone shader", done: false },
            { id: 3, text: "Special Beats Audio spatial waveform audio test", done: false },
            { id: 4, text: "69 Studio Cloud OS thermal printer bridge update", done: true }
        ]));
    }

    if (!localStorage.getItem('studio_leads')) {
        localStorage.setItem('studio_leads', JSON.stringify([
            {
                name: "Rocco's Restaurant Group",
                email: "management@roccos.lk",
                phone: "+94771234567",
                interest: "Custom POS & Dining Portal",
                message: "Need to integrate a multi-terminal table billing system with live thermal printing and kitchen display.",
                date: "Today, 11:30 AM",
                status: "New",
                timestamp: Date.now()
            },
            {
                name: "Ceylon Gems & Jewellery",
                email: "info@ceylongems.com",
                phone: "+94719876543",
                interest: "3D WebGL Luxury Store",
                message: "Looking for an interactive 3D website showcasing sapphires with realtime light reflections.",
                date: "Yesterday",
                status: "Pending",
                timestamp: Date.now() - 86400000
            }
        ]));
    }
}

function showApp() {
    if (loginSection) loginSection.style.display = 'none';
    if (appShell) appShell.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Clear any leftover overlays
    const overlays = document.querySelectorAll('#loading-overlay');
    overlays.forEach(ov => { ov.style.display = 'none'; });

    if (window.syncAdminFirebase) window.syncAdminFirebase();
    loadDashboardData();
}

function switchTab(tabId) {
    // Update button active state
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update active view
    views.forEach(view => {
        if (view.id === `view-${tabId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Reset notification badge
    if (tabId === 'leads' || tabId === 'staff') {
        const badge = document.getElementById('notif-badge');
        if (badge) badge.style.display = 'none';
        localStorage.setItem('notif_seen', 'true');
    }

    // Haptic feedback
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
}

function logout() {
    if (confirm('Sign out from 69 Studio Admin Command Center?')) {
        localStorage.removeItem('adminAccess');
        location.reload();
    }
}

// Global data loading function called by Firebase/Local state
window.loadDashboardData = function() {
    const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
    const stats = JSON.parse(localStorage.getItem('studio_stats') || '{"inquiries": 0, "visits": 14280, "activeProjects": 24, "successRate": 98}');
    const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
    const reviews = JSON.parse(localStorage.getItem('studio_reviews') || '[]');
    const apps = JSON.parse(localStorage.getItem('studio_apps') || '[]');
    const projectTasks = JSON.parse(localStorage.getItem('studio_tasks') || '[]');
    const settings = JSON.parse(localStorage.getItem('studio_settings') || '{"announcement": ""}');

    // Update Top Metric Cards
    const leadsEl = document.getElementById('stat-leads');
    const projectsEl = document.getElementById('stat-projects');
    const successEl = document.getElementById('stat-success');
    const visitsEl = document.getElementById('visit-count');

    if (leadsEl) leadsEl.innerText = leads.length;
    if (projectsEl) projectsEl.innerText = stats.activeProjects || 24;
    if (successEl) successEl.innerText = (stats.successRate || 98) + '%';
    if (visitsEl) visitsEl.innerText = (stats.visits || 14280).toLocaleString();

    // Render Traffic Chart
    initTrafficChart(stats);

    // Update Announcement field
    const announceInput = document.getElementById('announcement-text');
    if (announceInput && !announceInput.value && settings.announcement) {
        announceInput.value = settings.announcement;
    }

    // Render Roadmap Tasks
    renderProjectTasks(projectTasks);

    // Render Leads View
    renderLeads(leads);
    const leadsCountText = document.getElementById('leads-count-text');
    if (leadsCountText) leadsCountText.innerText = `${leads.length} total client inquiries`;

    // Render Careers Applications
    renderApplications(apps);

    // Render Store Products & Reviews
    renderProducts(products);
    renderReviews(reviews);

    // Notification badge check
    if (localStorage.getItem('notif_seen') !== 'true' && leads.length > 0) {
        const notifBadge = document.getElementById('notif-badge');
        if (notifBadge) notifBadge.style.display = 'block';
    }

    checkNewLeadsAlert(leads.length, apps.length);
};

function renderLeads(leads) {
    const leadsList = document.getElementById('leads-list');
    if (!leadsList) return;
    leadsList.innerHTML = '';

    if (leads.length === 0) {
        leadsList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No client inquiries found yet.</p></div>';
        return;
    }

    leads.forEach((lead, index) => {
        const phoneClean = (lead.phone || '').replace(/[^0-9+]/g, '');
        const waText = encodeURIComponent(`Hi ${lead.name}, thank you for reaching out to 69 Studio regarding your ${lead.interest || 'project'}!`);
        const waUrl = phoneClean ? `https://wa.me/${phoneClean.replace('+', '')}?text=${waText}` : null;

        const card = document.createElement('div');
        card.className = 'lead-card';
        card.innerHTML = `
            <div class="lead-card-top" onclick="viewLead(${index})" style="cursor:pointer;">
                <div class="lead-card-info">
                    <h4>${lead.name}</h4>
                    <span class="lead-type"><i class="fas fa-tag"></i> ${lead.interest || 'Project Inquiry'}</span>
                </div>
                <span class="status-badge ${(lead.status || 'new').toLowerCase()}">${lead.status || 'New'}</span>
            </div>
            <div class="lead-card-meta">
                <span class="lead-date"><i class="far fa-clock"></i> ${lead.date || 'Recent'}</span>
                <div class="lead-card-actions">
                    ${waUrl ? `<a href="${waUrl}" target="_blank" class="action-btn whatsapp" title="Chat on WhatsApp"><i class="fab fa-whatsapp"></i></a>` : ''}
                    ${lead.phone ? `<a href="tel:${lead.phone}" class="action-btn view" title="Call Client"><i class="fas fa-phone"></i></a>` : ''}
                    <button class="action-btn view" onclick="viewLead(${index})" title="View Details"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteLead(${index})" title="Delete"><i class="fas fa-trash-can"></i></button>
                </div>
            </div>
        `;
        leadsList.appendChild(card);
    });
}

function renderApplications(apps) {
    const appsList = document.getElementById('applications-list');
    if (!appsList) return;
    appsList.innerHTML = '';

    if (apps.length === 0) {
        appsList.innerHTML = '<div class="empty-state"><i class="fas fa-user-slash"></i><p>No job applications submitted yet.</p></div>';
        return;
    }

    apps.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.innerHTML = `
            <div class="lead-card-top" onclick="viewApplication(${index})" style="cursor:pointer;">
                <div class="lead-card-info">
                    <h4>${app.name}</h4>
                    <span class="lead-type"><i class="fas fa-briefcase"></i> ${app.job_title}</span>
                </div>
                <span class="status-badge ${(app.status || 'new').toLowerCase()}">${app.status || 'New'}</span>
            </div>
            <div class="lead-card-meta">
                <span class="lead-date"><i class="far fa-clock"></i> ${app.date || 'Recent'}</span>
                <div class="lead-card-actions">
                    ${app.phone ? `<a href="tel:${app.phone}" class="action-btn view"><i class="fas fa-phone"></i></a>` : ''}
                    <button class="action-btn view" onclick="viewApplication(${index})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteApplication(${index})"><i class="fas fa-trash-can"></i></button>
                </div>
            </div>
        `;
        appsList.appendChild(card);
    });
}

function renderProjectTasks(tasks) {
    const container = document.getElementById('project-tasks');
    if (!container) return;
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--text-muted); font-size:0.75rem; font-family:var(--font-mono); padding:10px;">No active tasks in sprint.</p>';
        return;
    }

    tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'settings-item';
        item.style.padding = '12px 0';
        item.innerHTML = `
            <i class="fas ${task.done ? 'fa-circle-check' : 'fa-circle'}" style="color: ${task.done ? 'var(--accent-emerald)' : 'var(--border-glass-bright)'}; cursor:pointer; font-size:1.1rem;" onclick="toggleTask(${index})"></i>
            <span style="text-decoration: ${task.done ? 'line-through' : 'none'}; opacity: ${task.done ? 0.45 : 1}; cursor:pointer;" onclick="toggleTask(${index})">${task.text}</span>
            <i class="fas fa-xmark" style="font-size:0.8rem; color:var(--text-muted); cursor:pointer; padding:6px;" onclick="deleteTask(${index})"></i>
        `;
        container.appendChild(item);
    });
}

function renderProducts(products) {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    productsList.innerHTML = '';

    const defaultProducts = [
        { name: "Studio Darkroom UI Kit", price: "15,000 LKR / $49", description: "250+ Figma tokens & Next.js starter templates." },
        { name: "Liquid Shader Pack 2026", price: "25,000 LKR / $79", description: "5 customizable Three.js GLSL liquid distortion shaders." },
        { name: "69 Ecommerce Engine", price: "65,000 LKR / $199", description: "High-speed storefront with PayHere & Stripe checkout." },
        { name: "Cloud POS Software Engine", price: "45,000 LKR / $150", description: "Realtime barcode billing & 80mm thermal receipt print engine." }
    ];

    const displayProducts = (products && products.length > 0) ? products : defaultProducts;

    displayProducts.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-card-inner">
                <div class="product-card-img" style="display:flex; align-items:center; justify-content:center; color:var(--accent-lime); font-size:1.4rem;">
                    ${p.image ? `<img src="${p.image}" alt="${p.name || p.title}" style="width:100%; height:100%; object-fit:cover; border-radius:12px;">` : `<i class="fas fa-cube"></i>`}
                </div>
                <div class="product-card-info">
                    <h4>${p.name || p.title || 'Digital Asset'}</h4>
                    <span class="product-price">${p.price || '$49'}</span>
                    <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px; line-height:1.3;">${p.description || ''}</p>
                </div>
                <div class="product-card-actions">
                    <button class="action-btn view" onclick="editProduct(${index})" title="Edit Product"><i class="fas fa-pen"></i></button>
                    <button class="action-btn delete" onclick="deleteProduct(${index})" title="Delete"><i class="fas fa-trash-can"></i></button>
                </div>
            </div>
        `;
        productsList.appendChild(card);
    });
}

function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    reviewsList.innerHTML = '';

    const defaultReviews = [
        { name: "Rocco's Italian Dining", rating: 5, date: "Aug 2026", text: "Subhash and 69 Studio built our automated table ordering POS. Revenue increased by 40% in month one." },
        { name: "Real Ceylon Gems", rating: 5, date: "Jul 2026", text: "The 3D interactive gemstone viewer elevated our brand in international markets. World-class engineering." }
    ];

    const displayReviews = (reviews && reviews.length > 0) ? reviews : defaultReviews;

    displayReviews.forEach((review, index) => {
        const stars = Array(5).fill(0).map((_, i) =>
            `<i class="fa${i < (review.rating || 5) ? 's' : 'r'} fa-star" style="color: var(--accent-amber); font-size: 0.75rem;"></i>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-card-top">
                <div>
                    <span class="review-card-name">${review.name}</span>
                    <div class="review-stars" style="margin-top:2px;">${stars}</div>
                </div>
                <button class="action-btn delete" onclick="deleteReview(${index})"><i class="fas fa-trash-can"></i></button>
            </div>
            <p style="font-size:0.82rem; color:var(--text-secondary); margin-top:8px; line-height:1.4;">${review.text || 'Excellent service and craftsmanship.'}</p>
            <div class="review-date">${review.date || 'Recent'}</div>
        `;
        reviewsList.appendChild(card);
    });
}

// Global View Actions & Modals
window.viewLead = function(index) {
    const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
    const lead = leads[index];
    if (!lead) return;

    const modal = document.getElementById('leadModal');
    const modalBody = document.getElementById('modal-body');

    const phoneClean = (lead.phone || '').replace(/[^0-9+]/g, '');
    const waText = encodeURIComponent(`Hi ${lead.name}, Subhash from 69 Studio here. I received your inquiry regarding "${lead.interest || 'your project'}".`);
    const waUrl = phoneClean ? `https://wa.me/${phoneClean.replace('+', '')}?text=${waText}` : null;

    modalBody.innerHTML = `
        <div class="lead-detail-item"><label>Client / Brand</label><p><strong>${lead.name}</strong></p></div>
        <div class="lead-detail-item"><label>Service Interested</label><p style="color:var(--accent-lime); font-family:var(--font-mono); font-weight:700;">${lead.interest || 'General Inquiry'}</p></div>
        <div class="lead-detail-item"><label>Email Address</label><p><a href="mailto:${lead.email}" style="color:#fff;">${lead.email || 'None provided'}</a></p></div>
        <div class="lead-detail-item"><label>Phone / WhatsApp</label><p>${lead.phone || 'None provided'}</p></div>
        <div class="lead-detail-item"><label>Date Received</label><p style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-secondary);">${lead.date || 'Recent'}</p></div>
        <div class="lead-detail-item lead-msg-box"><label>Inquiry Message / Brief</label><p>${lead.message || 'No additional message.'}</p></div>
        
        <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
            ${waUrl ? `<a href="${waUrl}" target="_blank" class="modal-save-btn" style="text-decoration:none; background:#25d366; color:#000; box-shadow:0 0 20px rgba(37,211,102,0.3);"><i class="fab fa-whatsapp"></i> Chat with Client on WhatsApp</a>` : ''}
            ${lead.email ? `<a href="mailto:${lead.email}" class="modal-save-btn" style="text-decoration:none; background:rgba(255,255,255,0.06); color:#fff; border:1px solid var(--border-glass-bright); box-shadow:none;"><i class="fas fa-envelope"></i> Send Email Reply</a>` : ''}
        </div>
    `;
    modal.classList.add('active');

    if (lead.status === 'New') {
        if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef && lead.firebaseKey) {
            window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'leads/' + lead.firebaseKey), { status: 'Pending' });
        } else {
            leads[index].status = 'Pending';
            localStorage.setItem('studio_leads', JSON.stringify(leads));
            loadDashboardData();
        }
    }
};

window.closeModal = () => document.getElementById('leadModal')?.classList.remove('active');

window.deleteLead = function(index) {
    if (confirm('Delete this inquiry permanently?')) {
        const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
        const lead = leads[index];
        if (window.firebaseDB && window.firebaseRemove && window.firebaseRef && lead?.firebaseKey) {
            window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'leads/' + lead.firebaseKey));
        } else {
            leads.splice(index, 1);
            localStorage.setItem('studio_leads', JSON.stringify(leads));
            loadDashboardData();
        }
    }
};

// Stat Editing Modal
window.updateStat = function(key, label) {
    const stats = JSON.parse(localStorage.getItem('studio_stats') || '{}');
    document.getElementById('stat-edit-label').innerText = `New value for ${label}:`;
    document.getElementById('stat-edit-input').value = stats[key] || '';
    document.getElementById('stat-edit-key').value = key;
    document.getElementById('statEditModal').classList.add('active');
};

window.closeStatModal = () => document.getElementById('statEditModal')?.classList.remove('active');

window.saveStat = function() {
    const key = document.getElementById('stat-edit-key').value;
    const val = document.getElementById('stat-edit-input').value;
    const stats = JSON.parse(localStorage.getItem('studio_stats') || '{}');

    let processedVal = val.replace('%', '');
    stats[key] = isNaN(processedVal) ? val : Number(processedVal);

    localStorage.setItem('studio_stats', JSON.stringify(stats));
    if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'stats'), stats);
    }
    closeStatModal();
    loadDashboardData();
};

// Product Handlers
window.openProductModal = function() {
    document.getElementById('productModalTitle').innerHTML = 'Add Store <span class="gradient-text">Product</span>';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    const prevBox = document.getElementById('imagePreviewContainer');
    if (prevBox) prevBox.style.display = 'none';
    document.getElementById('productModal').classList.add('active');
};

window.closeProductModal = () => document.getElementById('productModal')?.classList.remove('active');

window.saveProduct = function(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const imageData = document.getElementById('productImageDataBase64').value;

    const product = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        image: imageData || '',
        description: document.getElementById('productDescription').value,
        id: id || Date.now().toString()
    };

    if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'products/' + product.id), product).then(closeProductModal);
    } else {
        const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
        if (id) {
            const idx = products.findIndex(p => p.id === id);
            if (idx >= 0) products[idx] = product;
        } else {
            products.push(product);
        }
        localStorage.setItem('studio_products', JSON.stringify(products));
        loadDashboardData();
        closeProductModal();
    }
};

window.editProduct = function(index) {
    const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
    const p = products[index];
    if (!p) return;

    document.getElementById('productModalTitle').innerHTML = 'Edit Store <span class="gradient-text">Product</span>';
    document.getElementById('productId').value = p.id || '';
    document.getElementById('productName').value = p.name || p.title || '';
    document.getElementById('productPrice').value = p.price || '';
    document.getElementById('productDescription').value = p.description || '';
    if (p.image) {
        document.getElementById('imagePreview').src = p.image;
        document.getElementById('imagePreviewContainer').style.display = 'block';
        document.getElementById('productImageDataBase64').value = p.image;
    }
    document.getElementById('productModal').classList.add('active');
};

window.deleteProduct = function(index) {
    if (confirm('Delete this product from store?')) {
        const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
        const p = products[index];
        if (window.firebaseDB && window.firebaseRemove && window.firebaseRef && p?.id) {
            window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'products/' + p.id));
        } else {
            products.splice(index, 1);
            localStorage.setItem('studio_products', JSON.stringify(products));
            loadDashboardData();
        }
    }
};

window.deleteReview = function(index) {
    if (confirm('Delete this review?')) {
        const reviews = JSON.parse(localStorage.getItem('studio_reviews') || '[]');
        const r = reviews[index];
        if (window.firebaseDB && window.firebaseRemove && window.firebaseRef && r?.firebaseKey) {
            window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'reviews/' + r.firebaseKey));
        } else {
            reviews.splice(index, 1);
            localStorage.setItem('studio_reviews', JSON.stringify(reviews));
            loadDashboardData();
        }
    }
};

// Utilities & Exports
window.exportLeads = function() {
    const leads = localStorage.getItem('studio_leads') || '[]';
    const blob = new Blob([leads], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `69studio_leads_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
};

window.clearLeads = function() {
    if (confirm('WARNING: Clear cached leads in local storage?')) {
        localStorage.removeItem('studio_leads');
        loadDashboardData();
    }
};

// Modern 2026 Chart.js Theme with Electric Lime
let trafficChartInstance = null;
function initTrafficChart(stats) {
    const canvas = document.getElementById('trafficChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const labels = [];
    const dataValues = [];
    const dailyVisits = stats.dailyVisits || {};

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        dataValues.push(dailyVisits[dateStr] || Math.floor(180 + (6 - i) * 60 + Math.random() * 40));
    }

    if (trafficChartInstance) {
        trafficChartInstance.data.labels = labels;
        trafficChartInstance.data.datasets[0].data = dataValues;
        trafficChartInstance.update();
        return;
    }

    let gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, 'rgba(204, 255, 0, 0.40)');
    gradient.addColorStop(1, 'rgba(204, 255, 0, 0.0)');

    trafficChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Impressions',
                data: dataValues,
                borderColor: '#ccff00',
                backgroundColor: gradient,
                borderWidth: 2.5,
                pointBackgroundColor: '#ccff00',
                pointBorderColor: '#050505',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.42
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 16, 20, 0.95)',
                    titleColor: '#ccff00',
                    bodyColor: '#ffffff',
                    borderColor: 'rgba(204, 255, 0, 0.3)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#888892', font: { family: "'Space Grotesk', monospace", size: 10 } }
                },
                y: {
                    display: false,
                    min: 0
                }
            }
        }
    });
}

// Biometric WebAuthn Passkey
async function setupBiometric() {
    if (!window.PublicKeyCredential) {
        alert("Biometric sensor / WebAuthn not supported on this browser.");
        return;
    }

    try {
        const challengeArr = new Uint8Array(32);
        window.crypto.getRandomValues(challengeArr);

        const publicKey = {
            challenge: challengeArr,
            rp: { name: "69 Studio Admin" },
            user: {
                id: Uint8Array.from("69STUDIOUSERID", c => c.charCodeAt(0)),
                name: "admin@69studio.com",
                displayName: "Subhash Ketagoda"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            timeout: 60000,
            attestation: "direct",
            authenticatorSelection: { authenticatorAttachment: "platform" }
        };

        const credential = await navigator.credentials.create({ publicKey });
        if (credential) {
            localStorage.setItem('auth_id', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
            alert("FaceID / Biometric passkey successfully configured!");
            const setupBtn = document.getElementById('setup-face-lock');
            if (setupBtn) {
                setupBtn.style.opacity = '0.7';
                setupBtn.innerHTML = '<i class="fas fa-check"></i><span>FaceID / Passkey Active</span><i class="fas fa-chevron-right"></i>';
            }
        }
    } catch (err) {
        console.error(err);
        alert("Biometric setup cancelled or unsupported.");
    }
}

async function authenticateBiometric() {
    try {
        const challengeArr = new Uint8Array(32);
        window.crypto.getRandomValues(challengeArr);

        const options = {
            challenge: challengeArr,
            allowCredentials: [{
                id: Uint8Array.from(atob(localStorage.getItem('auth_id')), c => c.charCodeAt(0)),
                type: 'public-key'
            }],
            timeout: 60000,
            userVerification: "required"
        };

        const assertion = await navigator.credentials.get({ publicKey: options });
        if (assertion) {
            if (overlay) overlay.style.display = 'flex';
            setTimeout(() => {
                if (overlay) overlay.style.display = 'none';
                localStorage.setItem('adminAccess', 'true');
                showApp();
            }, 600);
        }
    } catch (err) {
        console.error(err);
        alert("Biometric verification failed. Please use master password.");
    }
}

// Dashboard Interactive Actions
window.saveAnnouncement = function() {
    const text = document.getElementById('announcement-text').value.trim();
    const settings = { announcement: text };
    localStorage.setItem('studio_settings', JSON.stringify(settings));

    if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'settings'), settings);
    }
    alert("Live Announcement Marquee Broadcast Updated!");
};

window.addProjectTask = function() {
    const task = prompt("Enter new project task / sprint objective:");
    if (task) {
        const tasks = JSON.parse(localStorage.getItem('studio_tasks') || '[]');
        tasks.push({ text: task, done: false, id: Date.now() });
        saveTasks(tasks);
    }
};

window.toggleTask = function(index) {
    const tasks = JSON.parse(localStorage.getItem('studio_tasks') || '[]');
    tasks[index].done = !tasks[index].done;
    saveTasks(tasks);
};

window.deleteTask = function(index) {
    const tasks = JSON.parse(localStorage.getItem('studio_tasks') || '[]');
    tasks.splice(index, 1);
    saveTasks(tasks);
};

function saveTasks(tasks) {
    localStorage.setItem('studio_tasks', JSON.stringify(tasks));
    if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, '/'), { tasks: tasks });
    }
    loadDashboardData();
}

window.viewApplication = function(index) {
    const apps = JSON.parse(localStorage.getItem('studio_apps') || '[]');
    const app = apps[index];
    if (!app) return;

    const modal = document.getElementById('leadModal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="lead-detail-item"><label>Candidate Name</label><p><strong>${app.name}</strong></p></div>
        <div class="lead-detail-item"><label>Position Applied</label><p style="color:var(--accent-lime); font-family:var(--font-mono); font-weight:700;">${app.job_title}</p></div>
        <div class="lead-detail-item"><label>Core Skills</label><p>${app.skills || 'Not specified'}</p></div>
        <div class="lead-detail-item"><label>Resume / Portfolio</label><a href="${app.resume_link}" target="_blank" style="color:var(--accent-cyan); word-break:break-all; font-family:var(--font-mono);">${app.resume_link}</a></div>
        ${app.phone ? `<a href="tel:${app.phone}" class="modal-save-btn" style="text-decoration:none;"><i class="fas fa-phone"></i> Call Candidate</a>` : ''}
    `;
    modal.classList.add('active');

    if (app.status === 'New') {
        app.status = 'Pending';
        localStorage.setItem('studio_apps', JSON.stringify(apps));
        loadDashboardData();
    }
};

window.deleteApplication = function(index) {
    if (confirm('Delete this candidate application?')) {
        const apps = JSON.parse(localStorage.getItem('studio_apps') || '[]');
        apps.splice(index, 1);
        localStorage.setItem('studio_apps', JSON.stringify(apps));
        loadDashboardData();
    }
};

// Push Notifications
function requestNotifPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support push notifications.");
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            new Notification("69 Studio Alerts Enabled!", {
                body: "You'll now receive realtime client inquiry alerts.",
                icon: 'logo.png.PNG'
            });
            checkNotifPermissionUI();
        }
    });
}

function checkNotifPermissionUI() {
    const btn = document.getElementById('request-notif-btn');
    if (btn && window.Notification && Notification.permission === "granted") {
        btn.style.opacity = '0.7';
        btn.innerHTML = '<i class="fas fa-check"></i><span>Push Alerts Enabled</span><i class="fas fa-chevron-right"></i>';
    }
}

function checkNewLeadsAlert(leadsCount, appsCount) {
    const totalCurrent = leadsCount + appsCount;
    const lastTotalStr = localStorage.getItem('last_total_count');
    const lastTotal = lastTotalStr ? parseInt(lastTotalStr) : totalCurrent;

    if (totalCurrent > lastTotal) {
        if (Notification.permission === "granted") {
            const options = {
                body: "You have a new client inquiry at 69 Studio.",
                icon: 'logo.png.PNG',
                badge: 'logo.png.PNG'
            };
            new Notification("⚡ NEW 69 STUDIO INQUIRY!", options);
        }
        localStorage.setItem('notif_seen', 'false');
    }
    localStorage.setItem('last_total_count', totalCurrent.toString());
}

window.testNotification = function() {
    alert("Test notification will trigger in 2 seconds.");
    setTimeout(() => {
        if (window.Notification && Notification.permission === "granted") {
            new Notification("⚡ 69 STUDIO TEST ALERT", {
                body: "Realtime client inquiry alerts are working perfectly!",
                icon: 'logo.png.PNG'
            });
        } else {
            alert("Please enable push alerts first.");
        }
    }, 2000);
};
