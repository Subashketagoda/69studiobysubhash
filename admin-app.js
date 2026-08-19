/* ===== ADMIN APP JAVASCRIPT - Mobile Logic ===== */

const SECRET_KEY = "69studio77";

// Selectors
const appShell = document.getElementById('admin-app');
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('loginForm');
const overlay = document.getElementById('loading-overlay');
const errorMsg = document.getElementById('errorMsg');
const tabButtons = document.querySelectorAll('.tab-btn');
const views = document.querySelectorAll('.app-view');

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Check Biometric Enrollment
    if (window.PublicKeyCredential && localStorage.getItem('auth_id')) {
        document.getElementById('bio-login-container').style.display = 'block';
    }

    // Check Login Status
    if (localStorage.getItem('adminAccess') === 'true') {
        showApp();
        syncAdminFirebase(); // Start sync if already logged in
    }

    // Update Setup Button if Enrolled
    if (localStorage.getItem('auth_id')) {
        const setupBtn = document.getElementById('setup-face-lock');
        if (setupBtn) {
            setupBtn.style.opacity = '0.7';
            setupBtn.innerHTML = '<i class="fas fa-check"></i><span>Face Lock Enabled</span><i class="fas fa-chevron-right"></i>';
        }
    }

    // Tab Navigation
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const passwordInput = document.getElementById('adminPassword');
            if (passwordInput.value.trim() === SECRET_KEY) {
                passwordInput.blur();
                overlay.style.display = 'flex';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    localStorage.setItem('adminAccess', 'true');
                    showApp();
                    syncAdminFirebase(); // Start live sync
                }, 1000);
            } else {
                errorMsg.style.display = 'block';
                passwordInput.value = '';
                setTimeout(() => { errorMsg.style.display = 'none'; }, 2500);
            }
        });
    }

    // Top Bar Actions - Make profile and notif clickable
    document.getElementById('profile-btn')?.addEventListener('click', () => switchTab('settings'));
    document.getElementById('notif-btn')?.addEventListener('click', () => switchTab('leads'));
    
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
        overlay.style.display = 'flex';
        setTimeout(() => location.reload(), 500);
    });

    // Bio Login
    document.getElementById('bio-login-btn')?.addEventListener('click', authenticateBiometric);

    // Setup Bio Login
    document.getElementById('setup-face-lock')?.addEventListener('click', setupBiometric);

    // Setup Notifications
    document.getElementById('request-notif-btn')?.addEventListener('click', requestNotifPermission);

    // Initial Notif Check for UI
    checkNotifPermissionUI();

    // Product Image Preview
    const imageFileInput = document.getElementById('productImageFile');
    imageFileInput?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const base64String = event.target.result;
                document.getElementById('imagePreview').src = base64String;
                document.getElementById('imagePreviewContainer').style.display = 'block';
                document.getElementById('productImageDataBase64').value = base64String;
            };
            reader.readAsDataURL(file);
        }
    });
});

function showApp() {
    loginSection.style.display = 'none';
    appShell.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Nuclear option to clear ANY overlays lingering
    const overlays = document.querySelectorAll('#loading-overlay, .loading-screen, .overlay');
    overlays.forEach(ov => {
        ov.style.display = 'none';
        ov.style.zIndex = '-1';
        ov.style.pointerEvents = 'none';
        ov.remove(); // Remove from DOM for total safety
    });
    
    if (window.syncAdminFirebase) window.syncAdminFirebase();
    loadDashboardData();
}



function switchTab(tabId) {
    // Update buttons
    tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update views
    views.forEach(view => {
        if (view.id === `view-${tabId}`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    // Reset notif badge on certain tabs
    if (tabId === 'leads' || tabId === 'staff') {
        document.getElementById('notif-badge').style.display = 'none';
        localStorage.setItem('notif_seen', 'true');
    }

    // Mobile Haptic Feedback (Vibration)
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminAccess');
        location.reload();
    }
}

// Global data loading function called by Firebase/Local observers
window.loadDashboardData = function() {
    const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
    const stats = JSON.parse(localStorage.getItem('studio_stats') || '{"inquiries": 0, "visits": 0, "activeProjects": 24, "successRate": 85}');
    const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
    const reviews = JSON.parse(localStorage.getItem('studio_reviews') || '[]');
    const apps = JSON.parse(localStorage.getItem('studio_apps') || '[]');
    const projectTasks = JSON.parse(localStorage.getItem('studio_tasks') || '[]');
    const settings = JSON.parse(localStorage.getItem('studio_settings') || '{"announcement": ""}');

    // Update Dashboard Mini Stats
    document.getElementById('stat-leads').innerText = leads.length;
    document.getElementById('stat-projects').innerText = stats.activeProjects || 0;
    document.getElementById('stat-success').innerText = (stats.successRate || 85) + '%';
    document.getElementById('visit-count').innerText = stats.visits || 0;

    // Traffic Chart Breakdown
    initTrafficChart(stats);

    // Update Announcement Input
    const announceInput = document.getElementById('announcement-text');
    if (announceInput && !announceInput.value) announceInput.value = settings.announcement;

    // Render Project Tasks
    renderProjectTasks(projectTasks);

    // Render Leads View
    renderLeads(leads);
    document.getElementById('leads-count-text').innerText = `${leads.length} total leads received`;

    // Render Apps
    if (typeof renderApplications === 'function') renderApplications(apps);

    // Render Products & Reviews
    if (typeof renderProducts === 'function') renderProducts(products);
    if (typeof renderReviews === 'function') renderReviews(reviews);

    // Check for new notifications
    if (localStorage.getItem('notif_seen') !== 'true' && leads.length > 0) {
        document.getElementById('notif-badge').style.display = 'block';
    }

    // Trigger Mobile Notification if new lead
    checkNewLeadsAlert(leads.length, apps.length);
};

function renderLeads(leads) {
    const leadsList = document.getElementById('leads-list');
    if (!leadsList) return;
    leadsList.innerHTML = '';

    if (leads.length === 0) {
        leadsList.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No leads found yet</p></div>';
        return;
    }

    leads.forEach((lead, index) => {
        const isAppointment = lead.message && lead.message.toUpperCase().includes('APPOINTMENT');
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.innerHTML = `
            <div class="lead-card-top" onclick="viewLead(${index})">
                <div class="lead-card-info">
                    <h4>${lead.name}</h4>
                    <span class="lead-type">${lead.interest || 'General Inquiry'}</span>
                </div>
                <span class="status-badge ${lead.status.toLowerCase()}">${lead.status}</span>
            </div>
            <div class="lead-card-meta">
                <span class="lead-date"><i class="far fa-clock"></i> ${lead.date}</span>
                <div class="lead-card-actions">
                    ${isAppointment ? '<span class="appointment-badge"><i class="fas fa-calendar-check"></i></span>' : ''}
                    <button class="action-btn view" onclick="viewLead(${index})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteLead(${index})"><i class="fas fa-trash-alt"></i></button>
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
        appsList.innerHTML = '<div class="empty-state"><i class="fas fa-user-slash"></i><p>No applications yet</p></div>';
        return;
    }

    apps.forEach((app, index) => {
        const card = document.createElement('div');
        card.className = 'lead-card'; // Reuse style
        card.innerHTML = `
            <div class="lead-card-top" onclick="viewApplication(${index})">
                <div class="lead-card-info">
                    <h4>${app.name}</h4>
                    <span class="lead-type">${app.job_title}</span>
                </div>
                <span class="status-badge ${app.status.toLowerCase()}">${app.status}</span>
            </div>
            <div class="lead-card-meta">
                <span class="lead-date"><i class="far fa-clock"></i> ${app.date}</span>
                <div class="lead-card-actions">
                    <button class="action-btn view" onclick="viewApplication(${index})"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete" onclick="deleteApplication(${index})"><i class="fas fa-trash"></i></button>
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
        container.innerHTML = '<p style="text-align:center; color:#444; font-size:0.7rem;">No current tasks.</p>';
        return;
    }

    tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'settings-item';
        item.style.padding = '10px 0';
        item.innerHTML = `
            <i class="fas ${task.done ? 'fa-check-circle' : 'fa-circle'}" style="color: ${task.done ? '#4dff8c' : '#444'};" onclick="toggleTask(${index})"></i>
            <span style="text-decoration: ${task.done ? 'line-through' : 'none'}; opacity: ${task.done ? 0.4 : 1};">${task.text}</span>
            <i class="fas fa-times" style="font-size:0.6rem; color:#ff4d4d;" onclick="deleteTask(${index})"></i>
        `;
        container.appendChild(item);
    });
}

function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviews-list');
    if (!reviewsList) return;
    reviewsList.innerHTML = '';

    reviews.forEach((review, index) => {
        const stars = Array(5).fill(0).map((_, i) =>
            `<i class="fa${i < review.rating ? 's' : 'r'} fa-star" style="color: #ffb400; font-size: 0.65rem;"></i>`
        ).join('');

        const card = document.createElement('div');
        card.className = 'review-card';
        card.innerHTML = `
            <div class="review-card-top">
                <span class="review-card-name">${review.name}</span>
                <div class="review-stars">${stars}</div>
                <button class="action-btn delete" onclick="deleteReview(${index})" style="width:28px; height:28px; font-size:0.7rem;"><i class="fas fa-trash"></i></button>
            </div>
            <div class="review-date">${review.date}</div>
        `;
        reviewsList.appendChild(card);
    });
}

// Global Action Handlers
window.viewLead = function(index) {
    const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
    const lead = leads[index];
    const modal = document.getElementById('leadModal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="lead-detail-item"><label>Name</label><p>${lead.name}</p></div>
        <div class="lead-detail-item"><label>Email</label><p>${lead.email}</p></div>
        <div class="lead-detail-item"><label>Date Received</label><p>${lead.date}</p></div>
        <div class="lead-detail-item lead-msg-box"><label>Message</label><p>${lead.message || 'No message.'}</p></div>
        <a href="mailto:${lead.email}" class="modal-save-btn" style="text-decoration:none;"><i class="fas fa-reply"></i> Reply via Email</a>
    `;
    modal.style.display = 'flex';

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

window.closeModal = () => document.getElementById('leadModal').style.display = 'none';

window.deleteLead = function(index) {
    if (confirm('Delete this lead permanently?')) {
        const leads = JSON.parse(localStorage.getItem('studio_leads') || '[]');
        const lead = leads[index];
        if (window.firebaseDB && window.firebaseRemove && window.firebaseRef && lead.firebaseKey) {
            window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'leads/' + lead.firebaseKey));
        } else {
            leads.splice(index, 1);
            localStorage.setItem('studio_leads', JSON.stringify(leads));
            loadDashboardData();
        }
    }
};

// Stat Editing
window.updateStat = function(key, label) {
    const stats = JSON.parse(localStorage.getItem('studio_stats') || '{}');
    document.getElementById('stat-edit-label').innerText = `New value for ${label}:`;
    document.getElementById('stat-edit-input').value = stats[key] || '';
    document.getElementById('stat-edit-key').value = key;
    document.getElementById('statEditModal').style.display = 'flex';
};

window.closeStatModal = () => document.getElementById('statEditModal').style.display = 'none';

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
    document.getElementById('productModalTitle').innerHTML = 'Add <span class="gradient-text">Product</span>';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreviewContainer').style.display = 'none';
    document.getElementById('productModal').style.display = 'flex';
};

window.closeProductModal = () => document.getElementById('productModal').style.display = 'none';

window.saveProduct = function(event) {
    event.preventDefault();
    const id = document.getElementById('productId').value;
    const imageData = document.getElementById('productImageDataBase64').value;

    if (!imageData) {
        alert("Please select a photo!");
        return;
    }

    const product = {
        name: document.getElementById('productName').value,
        price: document.getElementById('productPrice').value,
        image: imageData,
        description: document.getElementById('productDescription').value,
        id: id || Date.now().toString()
    };

    if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'products/' + product.id), product).then(closeProductModal);
    } else {
        const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
        if (id) {
            const idx = products.findIndex(p => p.id === id);
            products[idx] = product;
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

    document.getElementById('productModalTitle').innerHTML = 'Edit <span class="gradient-text">Product</span>';
    document.getElementById('productId').value = p.id;
    document.getElementById('productName').value = p.name;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productDescription').value = p.description || '';
    document.getElementById('imagePreview').src = p.image;
    document.getElementById('imagePreviewContainer').style.display = 'block';
    document.getElementById('productImageDataBase64').value = p.image;
    document.getElementById('productModal').style.display = 'flex';
};

window.deleteProduct = function(index) {
    if (confirm('Delete this product?')) {
        const products = JSON.parse(localStorage.getItem('studio_products') || '[]');
        const p = products[index];
        if (window.firebaseDB && window.firebaseRemove && window.firebaseRef && p.id) {
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
        if (window.firebaseDB && window.firebaseRemove && window.firebaseRef && r.firebaseKey) {
            window.firebaseRemove(window.firebaseRef(window.firebaseDB, 'reviews/' + r.firebaseKey));
        } else {
            reviews.splice(index, 1);
            localStorage.setItem('studio_reviews', JSON.stringify(reviews));
            loadDashboardData();
        }
    }
};

// Utilities
window.exportLeads = function() {
    const leads = localStorage.getItem('studio_leads') || '[]';
    const blob = new Blob([leads], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
};

window.clearLeads = function() {
    if (confirm('DANGER: Delete ALL data in Firebase and local storage?')) {
        if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
            window.firebaseUpdate(window.firebaseRef(window.firebaseDB, '/'), { leads: null, stats: {inquiries:0, visits:0} });
        }
        localStorage.removeItem('studio_leads');
        localStorage.setItem('studio_stats', JSON.stringify({inquiries:0, visits:0}));
        loadDashboardData();
    }
};

// Chart Logic
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
        dataValues.push(dailyVisits[dateStr] || 0);
    }

    if (trafficChartInstance) {
        trafficChartInstance.data.labels = labels;
        trafficChartInstance.data.datasets[0].data = dataValues;
        trafficChartInstance.update();
        return;
    }

    let gradient = ctx.createLinearGradient(0, 0, 0, 100);
    gradient.addColorStop(0, 'rgba(255, 77, 77, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 77, 77, 0)');

    trafficChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                borderColor: '#ff4d4d',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#666', font: { size: 9 } } },
                y: { display: false, min: 0 }
            }
        }
    });
}

// ===== BIOMETRIC AUTH LOGIC =====
async function setupBiometric() {
    if (!window.PublicKeyCredential) {
        alert("Biometric device not detected on this browser.");
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
                displayName: "Subhash"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }], // ES256
            timeout: 60000,
            attestation: "direct",
            authenticatorSelection: { authenticatorAttachment: "platform" }
        };

        const credential = await navigator.credentials.create({ publicKey });
        if (credential) {
            localStorage.setItem('auth_id', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
            alert("Face Lock / Biometric login enabled!");
            const setupBtn = document.getElementById('setup-face-lock');
            if (setupBtn) {
                setupBtn.style.opacity = '0.5';
                setupBtn.innerHTML = '<i class="fas fa-check"></i><span>Face Lock Enabled</span>';
            }
        }
    } catch (err) {
        console.error(err);
        alert("Setup failed or cancelled: " + err.message);
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
            const overlayObj = document.getElementById('loading-overlay');
            if (overlayObj) overlayObj.style.display = 'flex';
            setTimeout(() => {
                if (overlayObj) overlayObj.style.display = 'none';
                localStorage.setItem('adminAccess', 'true');
                showApp();
            }, 800);
        }
    } catch (err) {
        console.error(err);
        alert("Access Denied: Biometric verification failed.");
    }
}

// ===== DASHBOARD INTERACTIVE ACTIONS =====
window.saveAnnouncement = function() {
    const text = document.getElementById('announcement-text').value.trim();
    const settings = { announcement: text };
    localStorage.setItem('studio_settings', JSON.stringify(settings));

    if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
        window.firebaseUpdate(window.firebaseRef(window.firebaseDB, 'settings'), settings);
    }
    alert("Live Announcement Updated!");
};

window.addProjectTask = function() {
    const task = prompt("Enter new project task / status update:");
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
    const modal = document.getElementById('leadModal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <div class="lead-detail-item"><label>Applicant</label><p>${app.name}</p></div>
        <div class="lead-detail-item"><label>Position</label><p>${app.job_title}</p></div>
        <div class="lead-detail-item"><label>Skills</label><p>${app.skills || 'Not specified'}</p></div>
        <div class="lead-detail-item"><label>Portfolio</label><a href="${app.resume_link}" target="_blank" style="color:var(--primary-color); word-break:break-all;">${app.resume_link}</a></div>
        <a href="tel:${app.phone}" class="modal-save-btn" style="text-decoration:none;"><i class="fas fa-phone"></i> Call Candidate</a>
    `;
    modal.style.display = 'flex';
    
    if (app.status === 'New') {
        app.status = 'Pending';
        localStorage.setItem('studio_apps', JSON.stringify(apps));
        if (window.firebaseDB && window.firebaseUpdate && window.firebaseRef) {
            // Complex syncing for apps... simplest to update array on parent or use firebaseKey
            localStorage.setItem('studio_apps', JSON.stringify(apps));
        }
        loadDashboardData();
    }
};

window.deleteApplication = function(index) {
    if (confirm('Delete this application?')) {
        const apps = JSON.parse(localStorage.getItem('studio_apps') || '[]');
        apps.splice(index, 1);
        localStorage.setItem('studio_apps', JSON.stringify(apps));
        // Sync with firebase if keys available...
        loadDashboardData();
    }
};

// ===== NOTIFICATION LOGIC =====
function requestNotifPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications");
        return;
    }

    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            const notif = new Notification("Alerts Enabled!", {
                body: "69 Studio Admin is now ready to notify you.",
                icon: 'logo.png.PNG'
            });
            
            // Try to use service worker for a better mobile experience
            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification("Mobile Alerts Enabled!", {
                        body: "You'll now receive background alerts for new leads.",
                        icon: 'logo.png.PNG',
                        vibrate: [200, 100, 200]
                    });
                });
            }
            checkNotifPermissionUI();
        }
    });
}

function checkNotifPermissionUI() {
    const btn = document.getElementById('request-notif-btn');
    if (btn && Notification.permission === "granted") {
        btn.style.opacity = '0.5';
        btn.innerHTML = '<i class="fas fa-check"></i><span>Mobile Alerts Enabled</span><i class="fas fa-chevron-right"></i>';
    }
}

function checkNewLeadsAlert(leadsCount, appsCount) {
    const totalCurrent = leadsCount + appsCount;
    const lastTotalStr = localStorage.getItem('last_total_count');
    const lastTotal = lastTotalStr ? parseInt(lastTotalStr) : totalCurrent;

    if (totalCurrent > lastTotal) {
        // Play Sound Alert
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch lead alert
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            osc.start();
            osc.stop(audioCtx.currentTime + 1);
        } catch(e) { console.log('Audio alert blocked'); }

        // Trigger Mobile Notification
        if (Notification.permission === "granted") {
            const options = {
                body: "You have a new inquiry at 69 Studio.",
                icon: 'logo.png.PNG',
                badge: 'logo.png.PNG',
                vibrate: [200, 100, 200, 100, 400],
                tag: 'lead-alert',
                renotify: true
            };
            
            // Try Service Worker first (Better for PWA)
            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification("🔥 NEW LEAD RECEIVED!", options);
                });
            } else {
                new Notification("🔥 NEW LEAD RECEIVED!", options);
            }
        }
        localStorage.setItem('notif_seen', 'false'); // Show UI badge
    }
    localStorage.setItem('last_total_count', totalCurrent.toString());
}

// ===== REAL-TIME CLOUD SYNC =====
window.syncAdminFirebase = function() {
    if (!window.firebaseDB || !window.firebaseOnValue || !window.firebaseRef) return;

    // Sync Leads
    window.firebaseOnValue(window.firebaseRef(window.firebaseDB, 'leads'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const leadsArray = Object.values(data).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
            localStorage.setItem('studio_leads', JSON.stringify(leadsArray));
            if (window.loadDashboardData) window.loadDashboardData();
        }
    });

    // Sync Stats
    window.firebaseOnValue(window.firebaseRef(window.firebaseDB, 'stats'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            localStorage.setItem('studio_stats', JSON.stringify(data));
            if (window.loadDashboardData) window.loadDashboardData();
        }
    });

    // Sync Products
    window.firebaseOnValue(window.firebaseRef(window.firebaseDB, 'products'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const productsArray = Object.values(data);
            localStorage.setItem('studio_products', JSON.stringify(productsArray));
            if (window.loadDashboardData) window.loadDashboardData();
        }
    });

    // Sync Applications
    window.firebaseOnValue(window.firebaseRef(window.firebaseDB, 'applications'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const appsArray = Object.values(data).sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
            localStorage.setItem('studio_apps', JSON.stringify(appsArray));
            if (window.loadDashboardData) window.loadDashboardData();
        }
    });
};

function renderProducts(products) {
    const productsList = document.getElementById('products-list');
    if (!productsList) return;
    productsList.innerHTML = '';
    if (!products || products.length === 0) {
        productsList.innerHTML = '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No products yet</p></div>';
        return;
    }
    products.forEach((p, index) => {
        const card = document.createElement('div');
        card.className = 'lead-card'; // Reuse style
        card.innerHTML = `
            <div class="lead-card-top">
                <div class="lead-card-info">
                    <h4>${p.title || 'Unknown Product'}</h4>
                    <span class="lead-type">$${p.price || 0}</span>
                </div>
            </div>
            <div class="lead-card-meta">
                <div class="lead-card-actions">
                    <button class="action-btn view" onclick="editProduct(${index})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete" onclick="deleteProduct(${index})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        productsList.appendChild(card);
    });
}

function renderReviews(reviews) {
    // Basic placeholder if needed, or silent fail
}

window.testNotification = function() {
    alert("Test will arrive in 3 seconds. Please close the app and wait if testing background alerts.");
    setTimeout(() => {
        const options = {
            body: "This is a TEST notification from 69 Studio. If you see this, notifications are WORKING!",
            icon: 'logo.png.PNG',
            badge: 'logo.png.PNG',
            vibrate: [500, 100, 500],
            tag: 'test-alert'
        };
        
        if (Notification.permission === "granted") {
            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(reg => {
                    reg.showNotification("🔔 TEST ALERT", options);
                });
            } else {
                new Notification("🔔 TEST ALERT", options);
            }
        } else {
            alert("Permission not granted. Please click 'Enable Mobile Notifications' first.");
        }
    }, 3000);
};
