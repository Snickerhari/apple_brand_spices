/**
 * APPLE BRAND – Premium Spices & Groceries
 * Admin Console Client Engine
 */

const API_BASE = window.location.protocol.startsWith('http') ? '..' : 'http://localhost:3000';

function formatImageUrl(url) {
    if (!url) return '';
    let cleanUrl = url.trim();
    if ((cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) || (cleanUrl.startsWith("'") && cleanUrl.endsWith("'"))) {
        cleanUrl = cleanUrl.substring(1, cleanUrl.length - 1).trim();
    }
    if (cleanUrl.match(/^[a-zA-Z]:\\/) || cleanUrl.startsWith('/') || cleanUrl.startsWith('file:///')) {
        const apiBase = window.location.protocol.startsWith('http') ? '' : 'http://localhost:3000';
        return `${apiBase}/api/local-image?path=${encodeURIComponent(cleanUrl)}`;
    }
    return url;
}

const State = {
    isAdminLoggedIn: false,
    adminToken: null,
    products: [],
    orders: [],
    darkMode: false
};

let activeAdminTab = 'dashboard';

// ----------------------------------------------------
// THEME & TOAST UTILITIES
// ----------------------------------------------------
function toggleDarkMode() {
    State.darkMode = !State.darkMode;
    localStorage.setItem('epicurean_dark_mode', State.darkMode);
    
    if (State.darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    syncThemeToggleIcon();
    showToast(State.darkMode ? 'Dark Theme enabled' : 'Light Theme enabled');
}

function syncThemeToggleIcon() {
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
        icon.innerText = State.darkMode ? 'dark_mode' : 'light_mode';
    }
}

let toastTimeout;
function showToast(message) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    
    if (toastTimeout) {
        clearTimeout(toastTimeout);
    }
    
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ----------------------------------------------------
// ADMIN AUTHENTICATION
// ----------------------------------------------------
function updateAdminViewState() {
    const loginScreen = document.getElementById('admin-login-screen');
    const adminSidebar = document.getElementById('admin-sidebar');
    const adminMain = document.getElementById('admin-main-content');
    const adminWrapper = document.getElementById('admin-wrapper');

    if (adminWrapper) adminWrapper.classList.remove('hidden');

    if (State.isAdminLoggedIn && State.adminToken) {
        if (loginScreen) loginScreen.classList.add('hidden');
        if (adminSidebar) adminSidebar.classList.remove('hidden');
        if (adminMain) adminMain.classList.remove('hidden');
        setAdminTab(activeAdminTab);
    } else {
        if (loginScreen) loginScreen.classList.remove('hidden');
        if (adminSidebar) adminSidebar.classList.add('hidden');
        if (adminMain) adminMain.classList.add('hidden');
    }
}

function updateSidebarAdminProfile(name) {
    const nameEl = document.getElementById('admin-sidebar-name');
    const avatarImg = document.getElementById('admin-sidebar-avatar-img');
    const initialsSpan = document.getElementById('admin-sidebar-avatar-initials');

    if (!nameEl) return;
    
    nameEl.innerText = name;
    
    if (name.toLowerCase() === 'julian thorne') {
        if (avatarImg) avatarImg.classList.remove('hidden');
        if (initialsSpan) initialsSpan.classList.add('hidden');
    } else {
        // Show initials
        if (avatarImg) avatarImg.classList.add('hidden');
        
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        if (initialsSpan) {
            initialsSpan.innerText = initials || 'AD';
            initialsSpan.classList.remove('hidden');
        }
    }
}

async function executeAdminLogin(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('admin-login-email').value.trim();
    const password = document.getElementById('admin-login-password').value;
    const errorDiv = document.getElementById('admin-login-error');

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            State.isAdminLoggedIn = true;
            State.adminToken = data.token;
            localStorage.setItem('epicurean_admin_logged_in', 'true');
            localStorage.setItem('epicurean_admin_token', data.token);
            localStorage.setItem('epicurean_admin_name', data.user.name);
            localStorage.setItem('epicurean_admin_email', data.user.email);
            
            updateSidebarAdminProfile(data.user.name);
            
            if (errorDiv) errorDiv.classList.add('hidden');
            showToast(`Welcome back, Admin ${data.user.name}!`);
            await syncAdminData();
        } else {
            throw new Error(data.message || 'Invalid credentials.');
        }
    } catch (e) {
        console.error('Admin Login failed:', e);
        if (errorDiv) {
            errorDiv.innerText = e.message || 'Server error. Admin login failed.';
            errorDiv.classList.remove('hidden');
        }
    }
}

function executeAdminSignout(event) {
    if (event) event.preventDefault();
    State.isAdminLoggedIn = false;
    State.adminToken = null;
    localStorage.removeItem('epicurean_admin_logged_in');
    localStorage.removeItem('epicurean_admin_token');
    localStorage.removeItem('epicurean_admin_name');
    localStorage.removeItem('epicurean_admin_email');
    showToast('Logged out successfully.');
    updateAdminViewState();
}

// ----------------------------------------------------
// ADMIN SIGN UP / AUTH MODE SWITCH
// ----------------------------------------------------
let activeAuthMode = 'signin';

function toggleAuthMode(mode) {
    activeAuthMode = mode;
    const signinWrapper = document.getElementById('signin-form-wrapper');
    const signupWrapper = document.getElementById('signup-form-wrapper');
    const authTitle = document.getElementById('admin-auth-title');
    const authDesc = document.getElementById('admin-auth-desc');
    const loginError = document.getElementById('admin-login-error');
    const signupError = document.getElementById('admin-signup-error');

    if (loginError) loginError.classList.add('hidden');
    if (signupError) signupError.classList.add('hidden');

    if (mode === 'signup') {
        if (signinWrapper) signinWrapper.classList.add('hidden');
        if (signupWrapper) signupWrapper.classList.remove('hidden');
        if (authTitle) authTitle.innerText = 'Admin Sign Up';
        if (authDesc) authDesc.innerText = 'Create an administrator profile to manage Apple Brand.';
        
        // Reset signup inputs
        const fields = ['name', 'email', 'mobile', 'password', 'confirm'];
        fields.forEach(f => {
            const el = document.getElementById(`admin-signup-${f}`);
            if (el) el.value = '';
        });
    } else {
        if (signinWrapper) signinWrapper.classList.remove('hidden');
        if (signupWrapper) signupWrapper.classList.add('hidden');
        if (authTitle) authTitle.innerText = 'Admin Sign In';
        if (authDesc) authDesc.innerText = 'Authenticate to access catalog and sales records.';
        
        // Clear login password only
        const pass = document.getElementById('admin-login-password');
        if (pass) pass.value = '';
    }
}

async function executeAdminSignup(event) {
    if (event) event.preventDefault();
    
    const name = document.getElementById('admin-signup-name').value.trim();
    const email = document.getElementById('admin-signup-email').value.trim();
    const mobile = document.getElementById('admin-signup-mobile').value.trim();
    const password = document.getElementById('admin-signup-password').value;
    const confirm = document.getElementById('admin-signup-confirm').value;
    const errorDiv = document.getElementById('admin-signup-error');

    if (errorDiv) errorDiv.classList.add('hidden');

    if (password !== confirm) {
        if (errorDiv) {
            errorDiv.innerText = 'Passwords do not match.';
            errorDiv.classList.remove('hidden');
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, mobile, password })
        });
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            showToast('Admin profile created! Please sign in.');
            toggleAuthMode('signin');
            
            // Pre-fill email
            const loginEmail = document.getElementById('admin-login-email');
            if (loginEmail) loginEmail.value = email;
        } else {
            throw new Error(data.message || 'Registration failed.');
        }
    } catch (e) {
        console.error('Admin Registration failed:', e);
        if (errorDiv) {
            errorDiv.innerText = e.message || 'Server error. Registration failed.';
            errorDiv.classList.remove('hidden');
        }
    }
}

// ----------------------------------------------------
// ADMIN PASSWORD RECOVERY FLOW
// ----------------------------------------------------
let forgotRecoveryTab = 'email'; // 'email' or 'mobile'
let forgotRecoveryStep = 1; // 1, 2, or 3
let recoveredEmail = '';
let recoveredPassword = '';

function openForgotPasswordModal() {
    forgotRecoveryTab = 'email';
    forgotRecoveryStep = 1;
    
    // Reset inputs & errors
    const inputEmail = document.getElementById('forgot-input-email');
    const inputMobile = document.getElementById('forgot-input-mobile');
    const inputOtp = document.getElementById('forgot-input-otp');
    const errStep1 = document.getElementById('forgot-step-1-error');
    const errStep2 = document.getElementById('forgot-step-2-error');
    
    if (inputEmail) inputEmail.value = '';
    if (inputMobile) inputMobile.value = '';
    if (inputOtp) inputOtp.value = '';
    if (errStep1) errStep1.classList.add('hidden');
    if (errStep2) errStep2.classList.add('hidden');
    
    // Update tabs visual state
    setForgotTab('email');
    
    // Hide/show correct steps
    const step1 = document.getElementById('forgot-step-1');
    const step2 = document.getElementById('forgot-step-2');
    const step3 = document.getElementById('forgot-step-3');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');
    if (step3) step3.classList.add('hidden');
    
    // Show modal
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeForgotPasswordModal() {
    const modal = document.getElementById('forgot-password-modal');
    if (modal) modal.classList.add('hidden');
}

async function openAdminProfileModal() {
    toggleChangePasswordFields(false); // Reset form visibility on open
    toggleEditProfileDetails(false); // Reset edit details form visibility on open
    const email = localStorage.getItem('epicurean_admin_email') || '';
    const name = localStorage.getItem('epicurean_admin_name') || 'Julian Thorne';
    const token = localStorage.getItem('epicurean_admin_token');
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/profile?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.status === 'success') {
            document.getElementById('profile-detail-name').innerText = data.admin.name;
            document.getElementById('profile-detail-name-label').innerText = data.admin.name;
            document.getElementById('profile-detail-email').innerText = data.admin.email;
            document.getElementById('profile-detail-mobile').innerText = data.admin.mobile;
            document.getElementById('profile-detail-role').innerText = data.admin.role || 'Brand Admin';
            
            const initials = data.admin.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            document.getElementById('profile-detail-avatar-initials').innerText = initials || 'AD';
            
            const detailAvatarImg = document.getElementById('profile-detail-avatar-img');
            if (data.admin.name.toLowerCase() === 'julian thorne') {
                detailAvatarImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXhDpbac5fAU0ml7QBORqnEid56BarZTlqtukLzriWh5xBj0f7gWh2jhdsMF3VTfcJv-nG-yYqGjmA7tnRmiKnuQTiJhqI8Y7N_kAoCsDQvdSBo2LB9D16T1Uu_Z8fQk1PRizJbnUvHlUsgJmaxFuebsyfrBLaUKGQoQn8W7Ioo6hzSeJcGq6hbpctyu94pelTQDRGxu4BRb7oLSb98FNbR5LvwUTM-70zmaqKBM9h4CDd5bHPkUwDPScpqwFomKGJECXEeNhYF1o';
                detailAvatarImg.classList.remove('hidden');
                document.getElementById('profile-detail-avatar-initials').classList.add('hidden');
            } else {
                detailAvatarImg.classList.add('hidden');
                document.getElementById('profile-detail-avatar-initials').classList.remove('hidden');
            }
        } else {
            throw new Error(data.message || 'Failed to load profile.');
        }
    } catch (e) {
        console.error('Failed to fetch admin profile:', e);
        const savedName = localStorage.getItem('epicurean_admin_name') || 'Julian Thorne';
        document.getElementById('profile-detail-name').innerText = savedName;
        document.getElementById('profile-detail-name-label').innerText = savedName;
        document.getElementById('profile-detail-email').innerText = email || (savedName.toLowerCase() === 'julian thorne' ? 'julian.thorne@epicurean.com' : 'N/A');
        document.getElementById('profile-detail-mobile').innerText = savedName.toLowerCase() === 'julian thorne' ? '6382181561' : 'N/A';
        document.getElementById('profile-detail-role').innerText = 'Brand Admin';
        
        const initials = savedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('profile-detail-avatar-initials').innerText = initials || 'AD';
        const detailAvatarImg = document.getElementById('profile-detail-avatar-img');
        if (savedName.toLowerCase() === 'julian thorne') {
            detailAvatarImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXhDpbac5fAU0ml7QBORqnEid56BarZTlqtukLzriWh5xBj0f7gWh2jhdsMF3VTfcJv-nG-yYqGjmA7tnRmiKnuQTiJhqI8Y7N_kAoCsDQvdSBo2LB9D16T1Uu_Z8fQk1PRizJbnUvHlUsgJmaxFuebsyfrBLaUKGQoQn8W7Ioo6hzSeJcGq6hbpctyu94pelTQDRGxu4BRb7oLSb98FNbR5LvwUTM-70zmaqKBM9h4CDd5bHPkUwDPScpqwFomKGJECXEeNhYF1o';
            detailAvatarImg.classList.remove('hidden');
            document.getElementById('profile-detail-avatar-initials').classList.add('hidden');
        } else {
            detailAvatarImg.classList.add('hidden');
            document.getElementById('profile-detail-avatar-initials').classList.remove('hidden');
        }
    }
    
    document.getElementById('admin-profile-modal').classList.remove('hidden');
}

function closeAdminProfileModal() {
    document.getElementById('admin-profile-modal').classList.add('hidden');
}

function toggleChangePasswordFields(show) {
    const fieldsContainer = document.getElementById('profile-change-password-container');
    const actionsContainer = document.getElementById('profile-action-buttons');
    const errorBlock = document.getElementById('profile-password-error');
    
    if (errorBlock) errorBlock.classList.add('hidden');
    
    if (show) {
        if (fieldsContainer) fieldsContainer.classList.remove('hidden');
        if (actionsContainer) actionsContainer.classList.add('hidden');
        
        // Reset inputs
        const currentPass = document.getElementById('profile-current-password');
        const newPass = document.getElementById('profile-new-password');
        const confirmPass = document.getElementById('profile-confirm-password');
        if (currentPass) currentPass.value = '';
        if (newPass) newPass.value = '';
        if (confirmPass) confirmPass.value = '';
    } else {
        if (fieldsContainer) fieldsContainer.classList.add('hidden');
        if (actionsContainer) actionsContainer.classList.remove('hidden');
    }
}

async function executeUpdatePassword(event) {
    if (event) event.preventDefault();
    
    const currentPassword = document.getElementById('profile-current-password').value;
    const newPassword = document.getElementById('profile-new-password').value;
    const confirmPassword = document.getElementById('profile-confirm-password').value;
    const errorBlock = document.getElementById('profile-password-error');
    
    if (errorBlock) errorBlock.classList.add('hidden');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        if (errorBlock) {
            errorBlock.innerText = 'Please fill out all password fields.';
            errorBlock.classList.remove('hidden');
        }
        return;
    }
    
    if (newPassword !== confirmPassword) {
        if (errorBlock) {
            errorBlock.innerText = 'New passwords do not match.';
            errorBlock.classList.remove('hidden');
        }
        return;
    }
    
    const email = localStorage.getItem('epicurean_admin_email') || '';
    const name = localStorage.getItem('epicurean_admin_name') || 'Julian Thorne';
    const token = localStorage.getItem('epicurean_admin_token');
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/change-password`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, name, currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            showToast('Password updated successfully.');
            toggleChangePasswordFields(false);
            closeAdminProfileModal();
        } else {
            throw new Error(data.message || 'Failed to update password.');
        }
    } catch (e) {
        console.error('Password change failed:', e);
        if (errorBlock) {
            errorBlock.innerText = e.message || 'Server error. Failed to update password.';
            errorBlock.classList.remove('hidden');
        }
    }
}

function toggleEditProfileDetails(show) {
    const detailNameSpan = document.getElementById('profile-detail-name-label');
    const editNameInput = document.getElementById('profile-edit-name');
    const detailEmailSpan = document.getElementById('profile-detail-email');
    const detailMobileSpan = document.getElementById('profile-detail-mobile');
    const editEmailInput = document.getElementById('profile-edit-email');
    const editMobileInput = document.getElementById('profile-edit-mobile');
    
    const editActions = document.getElementById('profile-edit-actions');
    const primaryActions = document.getElementById('profile-action-buttons');
    const errorBlock = document.getElementById('profile-edit-error');
    
    if (errorBlock) errorBlock.classList.add('hidden');
    
    if (show) {
        if (detailNameSpan && editNameInput) {
            editNameInput.value = detailNameSpan.innerText.trim();
            detailNameSpan.classList.add('hidden');
            editNameInput.classList.remove('hidden');
        }
        if (detailEmailSpan && editEmailInput) {
            editEmailInput.value = detailEmailSpan.innerText.trim();
            detailEmailSpan.classList.add('hidden');
            editEmailInput.classList.remove('hidden');
        }
        if (detailMobileSpan && editMobileInput) {
            editMobileInput.value = detailMobileSpan.innerText.trim();
            detailMobileSpan.classList.add('hidden');
            editMobileInput.classList.remove('hidden');
        }
        if (editActions) editActions.classList.remove('hidden');
        if (primaryActions) primaryActions.classList.add('hidden');
    } else {
        if (detailNameSpan && editNameInput) {
            detailNameSpan.classList.remove('hidden');
            editNameInput.classList.add('hidden');
        }
        if (detailEmailSpan && editEmailInput) {
            detailEmailSpan.classList.remove('hidden');
            editEmailInput.classList.add('hidden');
        }
        if (detailMobileSpan && editMobileInput) {
            detailMobileSpan.classList.remove('hidden');
            editMobileInput.classList.add('hidden');
        }
        if (editActions) editActions.classList.add('hidden');
        if (primaryActions) primaryActions.classList.remove('hidden');
    }
}

async function executeUpdateProfileDetails(event) {
    if (event) event.preventDefault();
    
    const newName = document.getElementById('profile-edit-name').value.trim();
    const newEmail = document.getElementById('profile-edit-email').value.trim();
    const newMobile = document.getElementById('profile-edit-mobile').value.trim();
    const errorBlock = document.getElementById('profile-edit-error');
    
    if (errorBlock) errorBlock.classList.add('hidden');
    
    if (!newName || !newEmail || !newMobile) {
        if (errorBlock) {
            errorBlock.innerText = 'Please fill out all fields.';
            errorBlock.classList.remove('hidden');
        }
        return;
    }
    
    const oldEmail = localStorage.getItem('epicurean_admin_email') || '';
    const oldName = localStorage.getItem('epicurean_admin_name') || 'Julian Thorne';
    const token = localStorage.getItem('epicurean_admin_token');
    
    try {
        const response = await fetch(`${API_BASE}/api/admin/update-profile`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldEmail, oldName, newName, newEmail, newMobile })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            showToast('Profile details updated successfully.');
            
            // Update display spans
            document.getElementById('profile-detail-name').innerText = newName;
            document.getElementById('profile-detail-name-label').innerText = newName;
            document.getElementById('profile-detail-email').innerText = newEmail;
            document.getElementById('profile-detail-mobile').innerText = newMobile;
            
            // Update modal avatar and initials
            const initials = newName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            document.getElementById('profile-detail-avatar-initials').innerText = initials || 'AD';
            
            const detailAvatarImg = document.getElementById('profile-detail-avatar-img');
            if (newName.toLowerCase() === 'julian thorne') {
                detailAvatarImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXhDpbac5fAU0ml7QBORqnEid56BarZTlqtukLzriWh5xBj0f7gWh2jhdsMF3VTfcJv-nG-yYqGjmA7tnRmiKnuQTiJhqI8Y7N_kAoCsDQvdSBo2LB9D16T1Uu_Z8fQk1PRizJbnUvHlUsgJmaxFuebsyfrBLaUKGQoQn8W7Ioo6hzSeJcGq6hbpctyu94pelTQDRGxu4BRb7oLSb98FNbR5LvwUTM-70zmaqKBM9h4CDd5bHPkUwDPScpqwFomKGJECXEeNhYF1o';
                detailAvatarImg.classList.remove('hidden');
                document.getElementById('profile-detail-avatar-initials').classList.add('hidden');
            } else {
                detailAvatarImg.classList.add('hidden');
                document.getElementById('profile-detail-avatar-initials').classList.remove('hidden');
            }
            
            // Save updated details to local storage
            localStorage.setItem('epicurean_admin_name', newName);
            localStorage.setItem('epicurean_admin_email', newEmail);
            
            // Update sidebar profile card
            updateSidebarAdminProfile(newName);
            
            toggleEditProfileDetails(false);
            closeAdminProfileModal();
        } else {
            throw new Error(data.message || 'Failed to update details.');
        }
    } catch (e) {
        console.error('Profile details change failed:', e);
        if (errorBlock) {
            errorBlock.innerText = e.message || 'Server error. Failed to update profile.';
            errorBlock.classList.remove('hidden');
        }
    }
}

function setForgotTab(tabName) {
    forgotRecoveryTab = tabName;
    const btnEmail = document.getElementById('tab-btn-email');
    const btnMobile = document.getElementById('tab-btn-mobile');
    const fieldEmail = document.getElementById('forgot-email-field');
    const fieldMobile = document.getElementById('forgot-mobile-field');
    const errStep1 = document.getElementById('forgot-step-1-error');
    
    if (errStep1) errStep1.classList.add('hidden');
    
    if (tabName === 'email') {
        if (btnEmail) {
            btnEmail.className = "flex-1 pb-3 text-xs font-label-sm uppercase tracking-widest border-b-2 border-primary font-bold text-primary dark:border-[#e9c176] dark:text-[#e9c176] transition-all";
        }
        if (btnMobile) {
            btnMobile.className = "flex-1 pb-3 text-xs font-label-sm uppercase tracking-widest border-b-2 border-transparent font-medium text-on-surface-variant hover:text-primary dark:hover:text-white transition-all";
        }
        if (fieldEmail) fieldEmail.classList.remove('hidden');
        if (fieldMobile) fieldMobile.classList.add('hidden');
    } else {
        if (btnEmail) {
            btnEmail.className = "flex-1 pb-3 text-xs font-label-sm uppercase tracking-widest border-b-2 border-transparent font-medium text-on-surface-variant hover:text-primary dark:hover:text-white transition-all";
        }
        if (btnMobile) {
            btnMobile.className = "flex-1 pb-3 text-xs font-label-sm uppercase tracking-widest border-b-2 border-primary font-bold text-primary dark:border-[#e9c176] dark:text-[#e9c176] transition-all";
        }
        if (fieldEmail) fieldEmail.classList.add('hidden');
        if (fieldMobile) fieldMobile.classList.remove('hidden');
    }
}

async function handleSendOTP(event) {
    if (event) event.preventDefault();
    
    const errStep1 = document.getElementById('forgot-step-1-error');
    if (errStep1) errStep1.classList.add('hidden');
    
    let identity = '';
    if (forgotRecoveryTab === 'email') {
        const emailInput = document.getElementById('forgot-input-email');
        identity = emailInput ? emailInput.value.trim() : '';
    } else {
        const mobileInput = document.getElementById('forgot-input-mobile');
        identity = mobileInput ? mobileInput.value.trim() : '';
    }
    
    if (!identity) {
        if (errStep1) {
            errStep1.innerText = 'Please enter your registered details.';
            errStep1.classList.remove('hidden');
        }
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identity })
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 'success') {
            recoveredEmail = data.email || '';
            recoveredPassword = data.password || '';
            
            forgotRecoveryStep = 2;
            const step1 = document.getElementById('forgot-step-1');
            const step2 = document.getElementById('forgot-step-2');
            if (step1) step1.classList.add('hidden');
            if (step2) step2.classList.remove('hidden');
            showToast('Simulated OTP code sent.');
            
            // Focus OTP input
            const otpInput = document.getElementById('forgot-input-otp');
            if (otpInput) {
                otpInput.value = '';
                otpInput.focus();
            }
        } else {
            throw new Error(data.message || 'Verification failed.');
        }
    } catch (e) {
        console.error('Password recovery error:', e);
        if (errStep1) {
            errStep1.innerText = e.message || 'Server error. Verification failed.';
            errStep1.classList.remove('hidden');
        }
    }
}

function handleVerifyOTP(event) {
    if (event) event.preventDefault();
    
    const errStep2 = document.getElementById('forgot-step-2-error');
    if (errStep2) errStep2.classList.add('hidden');
    
    const otpInput = document.getElementById('forgot-input-otp');
    const otpVal = otpInput ? otpInput.value.trim() : '';
    
    if (otpVal === '8822') {
        forgotRecoveryStep = 3;
        const step2 = document.getElementById('forgot-step-2');
        const step3 = document.getElementById('forgot-step-3');
        if (step2) step2.classList.add('hidden');
        if (step3) step3.classList.remove('hidden');
        
        // Populate dynamic recovered credential spans
        const recEmailSpan = document.getElementById('recovered-email');
        const recPassSpan = document.getElementById('recovered-password');
        if (recEmailSpan) recEmailSpan.innerText = recoveredEmail;
        if (recPassSpan) recPassSpan.innerText = recoveredPassword;
        
        showToast('Identity verified successfully.');
    } else {
        if (errStep2) {
            errStep2.innerText = 'Invalid OTP code. Please try again.';
            errStep2.classList.remove('hidden');
        }
    }
}

function resetRecoveryStep1() {
    forgotRecoveryStep = 1;
    const step1 = document.getElementById('forgot-step-1');
    const step2 = document.getElementById('forgot-step-2');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');
    
    const errStep2 = document.getElementById('forgot-step-2-error');
    if (errStep2) errStep2.classList.add('hidden');
}

function handleDirectSignIn() {
    const loginEmail = document.getElementById('admin-login-email');
    const loginPassword = document.getElementById('admin-login-password');
    
    if (loginEmail) loginEmail.value = recoveredEmail;
    if (loginPassword) loginPassword.value = recoveredPassword;
    
    closeForgotPasswordModal();
    executeAdminLogin(null);
}

// ----------------------------------------------------
// DATABASE SYNC LOGIC (TOKEN AUTHENTICATED)
// ----------------------------------------------------
async function syncAdminData() {
    const token = localStorage.getItem('epicurean_admin_token');
    if (!token) return;
    
    try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch products
        const productsResponse = await fetch(`${API_BASE}/api/products`);
        if (productsResponse.ok) {
            State.products = await productsResponse.json();
            localStorage.setItem('epicurean_products', JSON.stringify(State.products));
        }

        // Fetch orders
        const ordersResponse = await fetch(`${API_BASE}/api/orders`, { headers });
        if (ordersResponse.ok) {
            State.orders = await ordersResponse.json();
            localStorage.setItem('epicurean_orders', JSON.stringify(State.orders));
        }

        updateAdminViewState();
    } catch (e) {
        console.error('Error synchronizing admin data:', e);
        // Fallback to local storage
        State.products = JSON.parse(localStorage.getItem('epicurean_products')) || [];
        State.orders = JSON.parse(localStorage.getItem('epicurean_orders')) || [];
        updateAdminViewState();
    }
}

async function initAdminLocalStorage() {
    State.isAdminLoggedIn = localStorage.getItem('epicurean_admin_logged_in') === 'true';
    State.adminToken = localStorage.getItem('epicurean_admin_token');

    // Retrieve name and update profile UI
    const savedName = localStorage.getItem('epicurean_admin_name') || 'Julian Thorne';
    updateSidebarAdminProfile(savedName);

    // Dark Mode Theme setup
    State.darkMode = localStorage.getItem('epicurean_dark_mode') === 'true';
    if (State.darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    syncThemeToggleIcon();

    if (State.isAdminLoggedIn && State.adminToken) {
        if (!localStorage.getItem('epicurean_admin_email')) {
            const name = localStorage.getItem('epicurean_admin_name') || 'Julian Thorne';
            fetch(`${API_BASE}/api/admin/profile?name=${encodeURIComponent(name)}`, {
                headers: { 'Authorization': `Bearer ${State.adminToken}` }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    localStorage.setItem('epicurean_admin_email', data.admin.email);
                }
            })
            .catch(err => console.warn('Could not retrieve admin email on startup:', err));
        }
        await syncAdminData();
    } else {
        updateAdminViewState();
    }
}

// ----------------------------------------------------
// TABBING & ANALYTICS RENDERING
// ----------------------------------------------------
function setAdminTab(tabName) {
    activeAdminTab = tabName;
    const tabs = ['overview', 'inventory', 'orders', 'customers'];
    
    tabs.forEach(t => {
        const btn = document.getElementById(`admin-btn-tab-${t}`);
        const panel = document.getElementById(`admin-panel-${t}`);
        
        if (t === tabName) {
            if (btn) btn.className = "w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-container text-on-primary-container font-semibold transition-all dark:bg-[#c5a059] dark:text-[#001809]";
            if (panel) panel.classList.remove('hidden');
        } else {
            if (btn) btn.className = "w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-all dark:text-gray-300 dark:hover:bg-white/5";
            if (panel) panel.classList.add('hidden');
        }
    });

    if (tabName === 'overview') {
        renderAdminDashboard();
    } else if (tabName === 'inventory') {
        renderAdminInventoryTable();
    } else if (tabName === 'orders') {
        renderAdminOrdersTable();
    } else if (tabName === 'customers') {
        renderAdminCustomersTable();
    }
}

function renderAdminDashboard() {
    const totalSalesSum = State.orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, order) => sum + order.amount, 0);

    const activeOrdersCount = State.orders.filter(o => o.status === 'Processing').length;
    const lowStockCount = State.products.filter(p => p.stock <= 5).length;
    
    const customerEmails = new Set(State.orders.map(o => o.customerEmail || `${o.customerName.toLowerCase()}@epicurean.com`));
    const customersCount = customerEmails.size;

    const salesVal = document.getElementById('admin-stat-sales');
    if (salesVal) salesVal.innerText = `₹${totalSalesSum.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

    const ordersVal = document.getElementById('admin-stat-orders');
    if (ordersVal) ordersVal.innerText = activeOrdersCount;

    const stockVal = document.getElementById('admin-stat-stock-alerts');
    if (stockVal) {
        stockVal.innerText = lowStockCount;
        if (lowStockCount > 0) {
            stockVal.classList.add('text-error');
        } else {
            stockVal.classList.remove('text-error');
        }
    }

    const customersVal = document.getElementById('admin-stat-customers');
    if (customersVal) customersVal.innerText = customersCount;

    renderAdminAnalyticsMix();
}

function renderAdminInventoryTable() {
    const tableBody = document.getElementById('admin-inventory-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    State.products.forEach(product => {
        const isLow = product.stock <= 5;
        const row = `
            <tr class="hover:bg-primary/5 transition-colors dark:hover:bg-white/5">
                <td class="px-6 py-4 text-sm font-label-sm text-primary font-bold dark:text-[#e9c176]">#${product.id.split('-')[1] || product.id}</td>
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <img class="w-8 h-8 rounded object-cover border border-outline-variant/30 dark:border-white/10" src="${formatImageUrl(product.imageUrl)}" alt="${product.nameEn}" />
                        <div>
                            <p class="text-sm font-medium text-primary font-bold dark:text-white">${product.nameEn}</p>
                            <p class="text-xs text-on-surface-variant language-tamil dark:text-gray-400">${product.nameTa}</p>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-on-surface-variant dark:text-gray-300">${product.category}</td>
                <td class="px-6 py-4 text-sm font-bold text-primary dark:text-white">₹${product.price}</td>
                <td class="px-6 py-4 text-sm text-on-surface-variant dark:text-gray-300">${product.packSize}</td>
                <td class="px-6 py-4 text-sm">
                    <span class="font-bold ${isLow ? 'text-error animate-pulse' : 'text-primary dark:text-gray-300'}">${product.stock} units</span>
                    ${isLow ? '<span class="block text-[9px] text-error font-bold uppercase tracking-tighter">Low stock warning</span>' : ''}
                </td>
                <td class="px-6 py-4 text-right text-sm">
                    <button onclick="openEditProductModal('${product.id}')" class="text-primary hover:underline font-label-sm text-xs mr-3 uppercase tracking-wider dark:text-[#e9c176]">Edit</button>
                    <button onclick="deleteProduct('${product.id}')" class="text-error hover:underline font-label-sm text-xs uppercase tracking-wider">Delete</button>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function renderAdminOrdersTable() {
    const tableBody = document.getElementById('admin-orders-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    State.orders.forEach(order => {
        let badgeColor = '';
        if (order.status === 'Processing') {
            badgeColor = 'bg-primary-fixed text-on-primary-fixed-variant';
        } else if (order.status === 'Delivered') {
            badgeColor = 'bg-surface-container-highest text-on-surface dark:bg-white/10 dark:text-white';
        } else if (order.status === 'Cancelled') {
            badgeColor = 'bg-error-container text-on-error-container';
        }

        const itemsString = order.products.map(p => `${p.nameEn} (x${p.quantity})`).join(', ');

        const row = `
            <tr class="hover:bg-primary/5 transition-colors dark:hover:bg-white/5">
                <td class="px-6 py-4 text-sm font-label-sm text-primary font-bold dark:text-white">#${order.id}</td>
                <td onclick="openCustomerDetailsModal('${(order.customerEmail || order.customerName).replace(/'/g, "\\'")}')" class="px-6 py-4 cursor-pointer hover:bg-primary/10 dark:hover:bg-white/10 transition-all duration-150 rounded-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full ${order.colorClass || 'bg-[#fed488]/20'} flex items-center justify-center text-[10px] font-bold text-primary">
                            ${order.customerInitials || 'CS'}
                        </div>
                        <div>
                            <span class="text-sm font-medium block dark:text-white hover:underline">${order.customerName}</span>
                            <span class="text-[10px] text-on-surface-variant dark:text-gray-400 block">${order.customerEmail || 'no-email'}</span>
                            ${order.customerPhone ? `<span class="text-[10px] text-secondary font-bold block dark:text-[#e9c176]">${order.customerPhone}</span>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-on-surface-variant line-clamp-1 max-w-xs dark:text-gray-300" title="${itemsString}">${itemsString}</td>
                <td class="px-6 py-4">
                    <span class="px-3 py-1 ${badgeColor} text-[10px] font-bold uppercase rounded-full tracking-wider">
                        ${order.status}
                    </span>
                </td>
                <td class="px-6 py-4 text-sm font-medium dark:text-white">₹${order.amount.toFixed(2)}</td>
                <td class="px-6 py-4 text-right">
                    <select onchange="updateOrderStatus('${order.id}', this.value)" class="text-xs border border-outline-variant bg-white rounded px-2 py-1 cursor-pointer dark:bg-black dark:text-white dark:border-white/15">
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function renderAdminCustomersTable() {
    const tableBody = document.getElementById('admin-customers-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const customerMap = {};
    State.orders.forEach(order => {
        const key = order.customerEmail || order.customerName.toLowerCase().replace(/\s/g, '');
        if (!customerMap[key]) {
            customerMap[key] = {
                name: order.customerName,
                email: order.customerEmail || 'no-email@epicurean.com',
                address: order.customerAddress || 'No Address Listed',
                ordersCount: 0,
                spentTotal: 0
            };
        }
        customerMap[key].ordersCount++;
        if (order.status !== 'Cancelled') {
            customerMap[key].spentTotal += order.amount;
        }
    });

    Object.values(customerMap).forEach(cust => {
        const row = `
            <tr onclick="openCustomerDetailsModal('${(cust.email && cust.email !== 'no-email@epicurean.com' ? cust.email : cust.name).replace(/'/g, "\\'")}')" class="hover:bg-primary/5 cursor-pointer transition-colors dark:hover:bg-white/5">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-[10px] font-bold text-primary dark:bg-[#c5a059]/20 dark:text-[#e9c176]">
                            ${cust.name.substring(0,2).toUpperCase()}
                        </div>
                        <span class="text-sm font-medium dark:text-white hover:underline">${cust.name}</span>
                    </div>
                </td>
                <td class="px-6 py-4 text-sm text-on-surface-variant dark:text-gray-300">${cust.email}</td>
                <td class="px-6 py-4 text-xs text-on-surface-variant max-w-xs line-clamp-1 dark:text-gray-400" title="${cust.address}">${cust.address}</td>
                <td class="px-6 py-4 text-sm text-center font-bold dark:text-white">${cust.ordersCount}</td>
                <td class="px-6 py-4 text-sm text-right font-bold text-primary dark:text-[#e9c176]">₹${cust.spentTotal.toFixed(2)}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
}

function openCustomerDetailsModal(emailOrName) {
    if (!emailOrName) return;
    
    const targetKey = emailOrName.toLowerCase().trim();
    const customerOrders = State.orders.filter(order => {
        const orderEmail = (order.customerEmail || '').toLowerCase().trim();
        const orderName = (order.customerName || '').toLowerCase().trim();
        const orderNameClean = orderName.replace(/\s/g, '');
        const targetClean = targetKey.replace(/\s/g, '');
        
        return (orderEmail === targetKey) || 
               (orderName === targetKey) || 
               (orderNameClean === targetClean) || 
               (orderEmail === 'no-email@epicurean.com' && (orderName === targetKey || orderNameClean === targetClean));
    });
    
    if (customerOrders.length === 0) return;
    
    const firstOrder = customerOrders[0];
    const name = firstOrder.customerName;
    const email = firstOrder.customerEmail || 'no-email@epicurean.com';
    const address = firstOrder.customerAddress || 'No Address Listed';
    const initials = name.substring(0, 2).toUpperCase();
    
    const spentTotal = customerOrders
        .filter(o => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.amount, 0);
        
    const avatarInitials = document.getElementById('cust-modal-avatar-initials');
    if (avatarInitials) avatarInitials.innerText = initials;
    
    const avatarContainer = document.getElementById('cust-modal-avatar-container');
    if (avatarContainer) {
        avatarContainer.className = `w-16 h-16 rounded-full flex items-center justify-center text-primary font-bold text-lg uppercase shadow-inner ${firstOrder.colorClass || 'bg-[#fed488]/20'}`;
    }
    
    const modalName = document.getElementById('cust-modal-name');
    if (modalName) modalName.innerText = name;
    
    const modalEmail = document.getElementById('cust-modal-email');
    if (modalEmail) modalEmail.innerText = email;
    
    const modalAddress = document.getElementById('cust-modal-address');
    if (modalAddress) modalAddress.innerText = address;
    
    const modalOrdersCount = document.getElementById('cust-modal-orders-count');
    if (modalOrdersCount) modalOrdersCount.innerText = customerOrders.length;
    
    const modalTotalSpent = document.getElementById('cust-modal-total-spent');
    if (modalTotalSpent) modalTotalSpent.innerText = `₹${spentTotal.toFixed(2)}`;
    
    const ordersListContainer = document.getElementById('cust-modal-orders-list');
    if (ordersListContainer) {
        ordersListContainer.innerHTML = '';
        customerOrders.forEach(o => {
            let badgeColor = '';
            if (o.status === 'Processing') {
                badgeColor = 'bg-primary-fixed text-on-primary-fixed-variant';
            } else if (o.status === 'Delivered') {
                badgeColor = 'bg-surface-container-highest text-on-surface dark:bg-white/10 dark:text-white';
            } else if (o.status === 'Cancelled') {
                badgeColor = 'bg-error-container text-on-error-container';
            }
            
            const itemsString = o.products.map(p => `${p.nameEn} (x${p.quantity})`).join(', ');
            
            const orderCard = `
                <div class="bg-surface-container-low dark:bg-white/5 border border-outline-variant/20 dark:border-white/5 rounded-lg p-3 space-y-1.5 mb-2">
                    <div class="flex justify-between items-center text-xs">
                        <span class="font-bold text-primary dark:text-white">#${o.id}</span>
                        <span class="px-2 py-0.5 ${badgeColor} text-[9px] font-bold uppercase rounded-full tracking-wider">${o.status}</span>
                    </div>
                    <p class="text-[11px] text-on-surface-variant dark:text-gray-300 line-clamp-1" title="${itemsString}">${itemsString}</p>
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="text-on-surface-variant dark:text-gray-400">Total: ₹${o.amount.toFixed(2)}</span>
                        <span class="text-on-surface-variant dark:text-gray-500">${o.date || 'Today'}</span>
                    </div>
                </div>
            `;
            ordersListContainer.insertAdjacentHTML('beforeend', orderCard);
        });
    }
    
    const modal = document.getElementById('customer-details-modal');
    if (modal) modal.classList.remove('hidden');
}

function closeCustomerDetailsModal() {
    const modal = document.getElementById('customer-details-modal');
    if (modal) modal.classList.add('hidden');
}

function renderAdminAnalyticsMix() {
    const spicesCount = State.products.filter(p => p.category === 'Spices').length;
    const masalasCount = State.products.filter(p => p.category === 'Masalas').length;
    const groceriesCount = State.products.filter(p => p.category === 'Groceries').length;
    const totalCount = State.products.length || 1;

    const spicesPct = Math.round((spicesCount / totalCount) * 100);
    const masalasPct = Math.round((masalasCount / totalCount) * 100);
    const groceriesPct = Math.round((groceriesCount / totalCount) * 100);

    const spicesBar = document.getElementById('bar-mix-spices');
    if (spicesBar) {
        spicesBar.style.width = `${spicesPct}%`;
        document.getElementById('txt-mix-spices-pct').innerText = `${spicesPct}%`;
    }

    const masalasBar = document.getElementById('bar-mix-masalas');
    if (masalasBar) {
        masalasBar.style.width = `${masalasPct}%`;
        document.getElementById('txt-mix-masalas-pct').innerText = `${masalasPct}%`;
    }

    const groceriesBar = document.getElementById('bar-mix-groceries');
    if (groceriesBar) {
        groceriesBar.style.width = `${groceriesPct}%`;
        document.getElementById('txt-mix-groceries-pct').innerText = `${groceriesPct}%`;
    }
}

// ----------------------------------------------------
// ADMIN ACTIONS & SPECIFICATIONS UPLOAD (CRUD)
// ----------------------------------------------------
function updateOrderStatus(orderId, newStatus) {
    const order = State.orders.find(o => o.id === orderId);
    if (!order) return;
    
    if (newStatus === 'Cancelled' && order.status !== 'Cancelled') {
        order.products.forEach(oItem => {
            const product = State.products.find(p => p.id === oItem.id);
            if (product) product.stock += oItem.quantity;
        });
    } 
    else if (order.status === 'Cancelled' && newStatus !== 'Cancelled') {
        order.products.forEach(oItem => {
            const product = State.products.find(p => p.id === oItem.id);
            if (product) {
                product.stock = Math.max(0, product.stock - oItem.quantity);
            }
        });
    }

    order.status = newStatus;
    localStorage.setItem('epicurean_products', JSON.stringify(State.products));
    localStorage.setItem('epicurean_orders', JSON.stringify(State.orders));

    const token = localStorage.getItem('epicurean_admin_token');
    fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    }).catch(err => console.warn('Could not sync order status change to server:', err));

    showToast(`Order #${orderId} changed to ${newStatus}`);
    
    renderAdminOrdersTable();
    renderAdminDashboard();
}

const TAMIL_TRANSLATION_MAP = {
    'pepper': 'Milagu (மிளகு)',
    'cumin': 'Seeragam (சீரகம்)',
    'jeera': 'Seeragam (சீரகம்)',
    'clove': 'Kirambu (கிராம்பு)',
    'cardamom': 'Elakkai (ஏலக்காய்)',
    'mustard': 'Kadugu (கடுகு)',
    'fenugreek': 'Vendhayam (வெந்தயம்)',
    'sesame': 'Ellu (எள்)',
    'fennel': 'Soambu (சோம்பு)',
    'masala': 'Kalavai Masala (கலவை மசாலா)',
    'soda': 'RB Soda (ஆர்பி சோடா)',
    'meal maker': 'Meal Maker (மீல் மேக்கர்)',
    'mealmaker': 'Meal Maker (மீல் மேக்கர்)',
    'salt': 'Uppu (உப்பு)',
    'turmeric': 'Manjal (மஞ்சள்)',
    'chilli': 'Milagai (மிளகாய்)',
    'chili': 'Milagai (மிளகாய்)',
    'coriander': 'Kothamalli (கொத்தமல்லி)',
    'ginger': 'Inji (இஞ்சி)',
    'garlic': 'Poondu (பூண்டு)',
    'asafoetida': 'Perungayam (பெருங்காயம்)',
    'hing': 'Perungayam (பெருங்காயம்)',
    'cinnamon': 'Karuvapattai (கறுவாப்பட்டை)',
    'sugar': 'Sarkkarai (சர்க்கரை)',
    'rice': 'Arisi (அரிசி)',
    'dal': 'Paruppu (பருப்பு)',
    'tamarind': 'Puli (புளி)'
};

let userEditedTa = false;

function autoSuggestTamilName(englishName) {
    const clean = englishName.toLowerCase().trim();
    if (!clean) return '';

    const keys = Object.keys(TAMIL_TRANSLATION_MAP).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (clean.includes(key)) {
            return TAMIL_TRANSLATION_MAP[key];
        }
    }
    return '';
}

function initTamilAutoComplete() {
    const nameEnInput = document.getElementById('prod-form-name-en');
    const nameTaInput = document.getElementById('prod-form-name-ta');
    if (!nameEnInput || !nameTaInput) return;

    nameTaInput.addEventListener('input', () => {
        userEditedTa = true;
    });

    nameEnInput.addEventListener('input', () => {
        const val = nameEnInput.value;
        if (!val.trim()) {
            nameTaInput.value = '';
            userEditedTa = false;
            return;
        }

        if (userEditedTa) return;

        const suggested = autoSuggestTamilName(val);
        if (suggested) {
            nameTaInput.value = suggested;
        }
    });
}

function openAddProductModal() {
    document.getElementById('prod-form-id').value = '';
    document.getElementById('product-modal-title').innerText = 'Upload Specifications';
    document.getElementById('prod-form-name-en').value = '';
    document.getElementById('prod-form-name-ta').value = '';
    document.getElementById('prod-form-price').value = '';
    document.getElementById('prod-form-category').value = 'Spices';
    document.getElementById('prod-form-stock').value = '';
    document.getElementById('prod-form-pack').value = '100g Pack';
    document.getElementById('prod-form-image').value = '';
    document.getElementById('prod-form-desc').value = '';
    
    document.getElementById('product-crud-modal').classList.remove('hidden');
}

function openEditProductModal(productId) {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('prod-form-id').value = product.id;
    document.getElementById('product-modal-title').innerText = 'Edit Specifications';
    document.getElementById('prod-form-name-en').value = product.nameEn;
    document.getElementById('prod-form-name-ta').value = product.nameTa;
    document.getElementById('prod-form-price').value = product.price;
    document.getElementById('prod-form-category').value = product.category;
    document.getElementById('prod-form-stock').value = product.stock;
    document.getElementById('prod-form-pack').value = product.packSize;
    document.getElementById('prod-form-image').value = product.imageUrl || '';
    document.getElementById('prod-form-desc').value = product.description || '';

    document.getElementById('product-crud-modal').classList.remove('hidden');
}

function closeProductCrudModal() {
    document.getElementById('product-crud-modal').classList.add('hidden');
}

function saveProductSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('prod-form-id').value.trim();
    const nameEn = document.getElementById('prod-form-name-en').value.trim();
    const nameTa = document.getElementById('prod-form-name-ta').value.trim();
    const price = parseFloat(document.getElementById('prod-form-price').value);
    const category = document.getElementById('prod-form-category').value;
    const stock = parseInt(document.getElementById('prod-form-stock').value);
    const packSize = document.getElementById('prod-form-pack').value;
    let imageUrlInput = document.getElementById('prod-form-image').value.trim();
    if ((imageUrlInput.startsWith('"') && imageUrlInput.endsWith('"')) || (imageUrlInput.startsWith("'") && imageUrlInput.endsWith("'"))) {
        imageUrlInput = imageUrlInput.substring(1, imageUrlInput.length - 1).trim();
    }
    const description = document.getElementById('prod-form-desc').value.trim();

    if (!nameEn || !nameTa || isNaN(price) || isNaN(stock)) {
        showToast('Fill in all fields correctly.');
        return;
    }

    const defaultImages = {
        'Spices': 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaEafKnt91K5wJVsNvGevC6iY_SmibZaRkH1NJrfin_wIO6vxiimdJR4SBHGwPjCtEq_R5t1gmENUT1Ocx1RPxmFUR_tTj9qG5kaQb8iZ0OcUMWgZQJIshuvAJcv1Yx9RoQaYQMq9qGvNNRPz6_FtzmcrRxsHkmAUGbJaWTmrzWpJ1hS9LqnCYJHkdl_hyNE64WADkwGV9eYJaMYOPOqdK0TWJjruOT-WbsRkA3T7S_1-9Ie9oiVcRb48xXS3UzScFoKsVvCmH7Oc',
        'Masalas': 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7yiQW0odcDpJAHZim-0xR4azMQz48d-JgB3rcEcGix9Vdc4SOd1T3kRBpAfkc72n35G9ibrARM5Tnf0-2CxrwBC4egalkNbakHoeY56W_XTHbwSVpOdrRCcqRg_hAE_yiTx2zlTGRv6VmmKnm2x3ea7hTclwZTVa-lfujvuLjksyVHy9i3e0ucXUYDK50uDJVabY5jIBr4lJDFpyBCu4i6Hn7bVokeONmmYKynmxe6gq4Py9SePlz0rcjB3Q1czJz52SD2lDxSbU',
        'Groceries': 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4ezBCJ8n9M6dV5NcTlkq805RtmGcgmneA8b9Jb9kCT0oGdmaolL_xOoGHGrSPhxCqATezY2YQBOye1MPEF_93aIqM-y7CRzAj8W016UIJwDD4UVoz87Zt34HDf2YOgedn0VzrTjba3u7WEy6CqO-nIp_dF7-rkoRcbgX6rUjuv-Fa4ii4WrJbsLDvGMPvq5d-sABgHkSX-jjoSyYSvuDQiTwCsm7KoryylMpnG3FcnL4rzt6MZ2YPomLLve7AJgIs7tReTUaVA8'
    };
    const imageUrl = imageUrlInput || defaultImages[category] || defaultImages['Spices'];

    const token = localStorage.getItem('epicurean_admin_token');

    if (id) {
        const product = State.products.find(p => p.id === id);
        if (product) {
            product.nameEn = nameEn;
            product.nameTa = nameTa;
            product.price = price;
            product.category = category;
            product.stock = stock;
            product.packSize = packSize;
            product.imageUrl = imageUrl;
            product.description = description;
            showToast(`Product "${nameEn}" specs updated.`);

            fetch(`${API_BASE}/api/products/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nameEn, nameTa, price, category, stock, packSize, description, imageUrl
                })
            }).catch(err => console.warn('Could not sync product update to server:', err));
        }
    } else {
        const newId = `prod-${nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;
        const newProduct = {
            id: newId,
            nameEn: nameEn,
            nameTa: nameTa,
            price: price,
            category: category,
            stock: stock,
            packSize: packSize,
            description: description || 'Premium grade crop packaged under Apple Brand high-purity specifications.',
            imageUrl: imageUrl,
            tag: stock <= 5 ? 'Limited' : 'New'
        };
        State.products.push(newProduct);
        showToast(`Product "${nameEn}" uploaded successfully.`);

        fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newProduct)
        }).catch(err => console.warn('Could not sync new product to server:', err));
    }

    localStorage.setItem('epicurean_products', JSON.stringify(State.products));
    closeProductCrudModal();
    setAdminTab(activeAdminTab);
}

function deleteProduct(productId) {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`Remove "${product.nameEn}" from the catalog?`)) {
        State.products = State.products.filter(p => p.id !== productId);
        localStorage.setItem('epicurean_products', JSON.stringify(State.products));

        const token = localStorage.getItem('epicurean_admin_token');
        fetch(`${API_BASE}/api/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch(err => console.warn('Could not delete product from server:', err));

        showToast(`Product deleted.`);
        setAdminTab(activeAdminTab);
    }
}

// Global script startup
window.addEventListener('DOMContentLoaded', async () => {
    await initAdminLocalStorage();
    initTamilAutoComplete();
});
