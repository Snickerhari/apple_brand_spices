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

// Global State Management for Apple Brand eCommerce platform
const State = {
    products: [],
    cart: [],
    wishlist: [],
    orders: [],
    currentView: 'home',
    promoApplied: false,
    discountRate: 0.0,
    shippingCost: 15.00, // INR shipping charge
    taxRate: 0.08, // 8% GST
    darkMode: false,
    
    // Admin login status
    isAdminLoggedIn: false,
    
    // Customer account profile
    customerUser: null,
    
    // Details modal tracker
    activeDetailProductId: null,
    activeDetailTab: 'overview',
    activeDetailImageIndex: 0
};

// Full Product Database based on Apple Specification & PDF Catalog
const DEFAULT_PRODUCTS = [
    {
        id: 'prod-pepper',
        nameEn: 'Black Pepper',
        nameTa: 'Milagu (மிளகு)',
        price: 185,
        category: 'Spices',
        stock: 35,
        packSize: '100g Pack',
        description: 'Sun-ripened, hand-picked black peppercorns from Kodaikanal hills, known for its strong aroma and heat value.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHVqvUx6NKL_q2mKS-kUutnxGPJIZXitcchjNQjWB0niSIWmNDAblnNqovstzssRGad8wDfy362--nTbjgCBnSazOkMdoUGvBtW9Azj6o1E2mXo79ucKLnYgWwAPZtftneoLYl43QBS3EIvh7Vz7Tibrd-s1GnmdWlE0Bdfw1NLnIO4CHm-h-jNPWYigv_0uViC-YufF2E1lE5J9H3xeX5dsCV0xbHso_X-ejhlRoWUXKH-Irgbf2Nye0LFopOoQPeJ-K0Ylug-T8',
        tag: 'Organic',
        origin: 'Kodaikanal, Tamil Nadu',
        shelfLife: '12 Months',
        cert: 'USDA Organic'
    },
    {
        id: 'prod-jeera',
        nameEn: 'Cumin Seeds (Jeera)',
        nameTa: 'Seeragam (சீரகம்)',
        price: 120,
        category: 'Spices',
        stock: 42,
        packSize: '100g Pack',
        description: 'Highly aromatic, select-grade cumin seeds sourced directly from sustainable farms in dry regions.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKWso_qwL7XC4Oupkevz4uL9-0sIkw7o85768zlDVCYF8IjTiVKZjcJjqQpSj2FLzKIEwEA-_qWiarCIcmdDpOgVSxU7reBWe0d0m2fnAr8tZdvjZV-p9YLs1IqAXZIOuIwHzUG2wSVrgi3UrywhT3VX9lyBqQP1JbkmFS0KTfAh2MMvGRQCQW9Zbkj38Quvmv_Wfakm39F0r7QelPBEVM3yYWm2lPw2VQ2H_2siOiFVQp-78V6Iq0wf8ZxruP_ONCMGS-NqW0ex8',
        tag: 'Premium',
        origin: 'Jodhpur, Rajasthan',
        shelfLife: '12 Months',
        cert: 'Agmark Quality Spec'
    },
    {
        id: 'prod-clove',
        nameEn: 'Whole Cloves',
        nameTa: 'Kirambu (கிராம்பு)',
        price: 145,
        category: 'Spices',
        stock: 18,
        packSize: '50g Pack',
        description: 'Fully grown clove buds, dried to perfection, rich in essential oils and pungent sweet flavor.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlNkHC3nXEzfwn7MVFKmEfEpaJXIhS-Qiw2qtZsWQQpbHzUGec_ppB8xB8mYxKMrWXByOxQRoH6ZTOdRFR9XiIaO8BYtTVUm1VlcHgNyGU79Y_f7v3MpFcx9JLLN27W0OrVCLGhveZwmy7i1dwA5U0pFCJiERDaKlnVCo1ObROqN1g_HtJr6x60h3p0gsZZAsBKkhtSZhIXRZ0q0eLheQEst9ZEW9cHu_dDQ7XqEPMOKpOVK0IAIKeWlrUQXbpIIu33AlCcUP78Zk',
        tag: 'Hand-picked',
        origin: 'Nagercoil, Tamil Nadu',
        shelfLife: '18 Months',
        cert: '100% Purity Certified'
    },
    {
        id: 'prod-cardamom',
        nameEn: 'Green Cardamom',
        nameTa: 'Elakkai (ஏலக்காய்)',
        price: 210,
        category: 'Spices',
        stock: 8,
        packSize: '50g Pack',
        description: 'Gourmet green cardamom pods sorted by hand, offering an sweet floral spice profile.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD26PK_pMMvE2aoXpxexL0iaHo36353GHd9He0cRypUr2a8RV1vhGlzzHiATyWMJ1JYjfpqAdNUuPX-9dCXPP3lcfsxoBKpFexUjxn7EcUYMiuvzE0J_TFjjZ4t6kI1N61HokzcQjF3hU3g1boJalgBKZGrFJfqpoBEJUFsL3he3PFzj6EMFkCkrA2dSvs2wKy79I8z5fah1GvwN78yVHWvLbVsUHUzJOIVWbOmP8dUvrXz7uP1bAYzOh_liYFN7GTKki_8R4eBIFU',
        tag: 'Limited',
        origin: 'Idukki Hills, Kerala',
        shelfLife: '12 Months',
        cert: 'Organic Certified'
    },
    {
        id: 'prod-mustard',
        nameEn: 'Mustard Seeds',
        nameTa: 'Kadugu (கடுகு)',
        price: 65,
        category: 'Groceries',
        stock: 55,
        packSize: '100g Pack',
        description: 'Cleaned and graded black mustard seeds, essential for tampering and oil infusion.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_hQ9pChf0i0c8hnGmTNUFuBZA5F8zV6ben-EEw55jMldzKFznKYw2sh_cm5Bv0jfOC2M_gSp_jgYdFv-XClkcELPnpt7ZIY722V9tS755CXIwEQK2gjKYsgx2nlswGZb632qIBT397B23DOaDc1UrRrBpYXCAComnBPad7ZFyCmxLbNg7qoMw8Ogmjowk_uvqQAARZ6EAiYXpVTeppmsMcCAXnSbp6HSHOsuvolrBT18yV3Q8_at0QI9U0ZHli8Ez_WK6HDwLirU',
        tag: 'Essential',
        origin: 'Salem, Tamil Nadu',
        shelfLife: '12 Months',
        cert: 'Standard Grading Approval'
    },
    {
        id: 'prod-fenugreek',
        nameEn: 'Fenugreek Seeds',
        nameTa: 'Vendhayam (வெந்தயம்)',
        price: 75,
        category: 'Groceries',
        stock: 50,
        packSize: '100g Pack',
        description: 'Premium fenugreek seeds containing medicinal qualities, offering a pleasant aroma when roasted.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCswKuIt5WpZ31Tuj0E24CDg83b2mmyAszZecsW4W5p35WYjEReDP0A5I5No11vSBjyiNXD1hlG5HVwIm8KcsqJeKMpouQNNpFDFY3TYJlaGpHcw_GEVcU9fTRWnvTVSZYhbJ3gbiXA8w3Y3EFw7zygdCB7VkzkC4HiDXPQeHnHF11jr-w_vBWcrVnO0JPZWeMIDP6E1LrO8TPR6zF2ebsLtZj0POw3zi-YqbUo6u6J1BDRnrqmF16mKe8kpza1DPm_7Jp89pIFggo',
        tag: 'Pure',
        origin: 'Coimbatore, Tamil Nadu',
        shelfLife: '12 Months',
        cert: 'ISO Purity Certified'
    },
    {
        id: 'prod-sesame',
        nameEn: 'Sesame Seeds',
        nameTa: 'Ellu (எள்)',
        price: 95,
        category: 'Groceries',
        stock: 30,
        packSize: '100g Pack',
        description: 'Cleaned black sesame seeds, rich in healthy oils, calcium, and distinct nutty flavor.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4ezBCJ8n9M6dV5NcTlkq805RtmGcQgmneA8b9Jb9kCT0oGdmaolL_xOoGHGrSPhxCqATezY2YQBOye1MPEF_93aIqM-y7CRzAj8W016UIJwDD4UVoz87Zt34HDf2YOgedn0VzrTjba3u7WEy6CqO-nIp_dF7-rkoRcbgX6rUjuv-Fa4ii4WrJbsLDvGMPvq5d-sABgHkSX-jjoSyYSvuDQiTwCsm7KoryylMpnG3FcnL4rzt6MZ2YPomLLve7AJgIs7tReTUaVA8',
        tag: 'Organic',
        origin: 'Erode, Tamil Nadu',
        shelfLife: '12 Months',
        cert: 'USDA Organic'
    },
    {
        id: 'prod-fennel',
        nameEn: 'Fennel Seeds',
        nameTa: 'Soambu (சோம்பு)',
        price: 80,
        category: 'Spices',
        stock: 3, // Low stock to trigger alerts
        packSize: '100g Pack',
        description: 'Sweet anise-flavored fennel seeds, perfect for digestives, spice mixes and curries.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCalfgzIqSas5TSYWXxYeEx6q4A5N-q4t7Dxs0J2YKXJ2K_w9NIwIY7siPZiTX8QVW3XMrzpTeKQgAKEBcqpWA-kBIAd1YlmfkSFLdiefEoEbkQ7cjADg-q6JfigRoXQIbjkEHBfSof5ZZ87-U1XBCqhkloP7QH87AZP-TrdE03YM6oSYv3kI9HG7RwgWR60BDRwZp_tNUO9IxRv-_OFVVcWey9FA3QcgvdqX9cEylKGCISqHX8wpQUVjbzJv9Rb5J-xnMT-8ZODmY',
        tag: 'Gourmet',
        origin: 'Palanpur, Gujarat',
        shelfLife: '12 Months',
        cert: 'Certified Aromatic Grade'
    },
    {
        id: 'prod-mixed-masala',
        nameEn: 'Mixed Masala Blend',
        nameTa: 'Kalavai Masala (கலவை மசாலா)',
        price: 240,
        category: 'Masalas',
        stock: 25,
        packSize: '200g Pack',
        description: 'Bespoke 12-spice recipe stone-ground slowly to retain essential oils and heat levels.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7yiQW0odcDpJAHZim-0xR4azMQz48d-JgB3rcEcGix9Vdc4SOd1T3kRBpAfkc72n35G9ibrARM5Tnf0-2CxrwBC4egalkNbakHoeY56W_XTHbwSVpOdrRCcqRg_hAE_yiTx2zlTGRv6VmmKnm2x3ea7hTclwZTVa-lfujvuLjksyVHy9i3e0ucXUYDK50uDJVabY5jIBr4lJDFpyBCu4i6Hn7bVokeONmmYKynmxe6gq4Py9SePlz0rcjB3Q1czJz52SD2lDxSbU',
        tag: 'Bespoke',
        origin: 'Madurai Sorting Center',
        shelfLife: '6 Months',
        cert: 'Apple Brand Premium Blend'
    },
    {
        id: 'prod-rbsoda',
        nameEn: 'Apple RB Soda',
        nameTa: 'RB Soda (ஆர்பி சோடா)',
        price: 45,
        category: 'Groceries',
        stock: 80,
        packSize: '250ml Bottle',
        description: 'Artisanal carbonated water infused with natural salts, offering a crisp thirst-quenching taste.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAosUfYq7Xu84YU-6vvvWBGhUZ1HUZirSO9LSO83SHnPBe2KqPKB-dZROSye72QKtBYiZNZf381Zncxo5-ocMmWr9Fp8rPHR_eVH2NtW_5_wSYZdvNspCP99yvbvOH0rWd5BH0OzeO4psIgawbgq-La1O1mw6jkNJyIyp5UyZDaRJf2Yt-9NdhaEBSZCAF3tzUXjPQNqKj_fhyFvu9IuO79XSG8FHcKX86e1HLEjWKJCcPTIkD-LSgx7qlaV0YBast1apb-0LxwPSY',
        tag: 'New',
        origin: 'Tuticorin, Tamil Nadu',
        shelfLife: '6 Months',
        cert: 'Standard Bottling Certified'
    },
    {
        id: 'prod-mealmaker',
        nameEn: 'Premium Meal Maker Chunks',
        nameTa: 'Meal Maker (மீல் மேக்கர்)',
        price: 90,
        category: 'Groceries',
        stock: 45,
        packSize: '200g Pack',
        description: 'High-protein soya chunks, carefully textured, serving as a rich vegetarian replacement.',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvOmCvUf1731sjetAnQo8yu_z0ofhZiK-WDWA9-PWbKp8dnxrAjxGh2R9udE27OWds9f1R7WeWogigC1894cS3eopK7CoIkXG82Bp5qE1buJMimz2SLQ3s8mUEWbnI_RONyCqybd9oRDqxd1GpEog8MtyQ0bG_GqKmq-FSXACdZL6mntTQyW8QgYoe3OXeipjby1KzPwuS5ajFZCw1Ot3t_hzW2_fDoKIGW4iLI6-PZaTT4h2Tn5gwLFYm9Q-ffLUYC0xdxzcOXbA',
        tag: 'High Protein',
        origin: 'Indore, Madhya Pradesh',
        shelfLife: '9 Months',
        cert: 'FSSAI Approved'
    }
];

const DEFAULT_ORDERS = [
    {
        id: 'EP-4902',
        customerName: 'Eleanor Kade',
        customerEmail: 'eleanor.kade@gmail.com',
        customerAddress: '42 Pine Crest Ave, Chennai',
        customerInitials: 'EK',
        colorClass: 'bg-secondary-container',
        products: [
            { id: 'prod-clove', nameEn: 'Whole Cloves', price: 145, quantity: 2 },
            { id: 'prod-mixed-masala', nameEn: 'Mixed Masala Blend', price: 240, quantity: 1 }
        ],
        status: 'Processing',
        amount: 530.00,
        date: '2026-05-29'
    },
    {
        id: 'EP-4901',
        customerName: 'Marcus Reid',
        customerEmail: 'marcus.reid@outlook.com',
        customerAddress: '88 OMR IT corridor, Chennai',
        customerInitials: 'MR',
        colorClass: 'bg-surface-container',
        products: [
            { id: 'prod-sesame', nameEn: 'Sesame Seeds', price: 95, quantity: 3 }
        ],
        status: 'Delivered',
        amount: 285.00,
        date: '2026-05-28'
    },
    {
        id: 'EP-4900',
        customerName: 'Sarah Lind',
        customerEmail: 'sarah.lind@ymail.com',
        customerAddress: '55 Mahatma Gandhi Road, Chennai',
        customerInitials: 'SL',
        colorClass: 'bg-secondary-fixed-dim',
        products: [
            { id: 'prod-pepper', nameEn: 'Black Pepper', price: 185, quantity: 1 }
        ],
        status: 'Processing',
        amount: 185.00,
        date: '2026-05-29'
    }
];

// Product Reviews Mock Database mapping
const PRODUCT_REVIEWS = {
    'prod-pepper': [
        { reviewer: 'Dr. Amanda R.', rating: 5, text: 'Outstanding fragrance and pristine quality. Meticulously clean packaging.' },
        { reviewer: 'Kishore J.', rating: 5, text: 'Perfect heat and aroma. Sourced exactly under high purity standards.' }
    ],
    'prod-jeera': [
        { reviewer: 'Venkatesh S.', rating: 5, text: 'Deep cumin scent. Uniform seeds without any dust. Essential buy.' }
    ],
    'prod-clove': [
        { reviewer: 'Lydia Bennett', rating: 4, text: 'Excellent oily texture. Beautiful aroma.' }
    ],
    'prod-cardamom': [
        { reviewer: 'Gourmet Chef Thomas', rating: 5, text: 'Green cardamom pods are incredibly plump and fresh. Incredible flavor!' }
    ]
};

// Synchronize products from server, falling back to localStorage
async function syncProductsFromServer() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        if (response.ok) {
            const serverProducts = await response.json();
            if (serverProducts && serverProducts.length > 0) {
                State.products = serverProducts;
                localStorage.setItem('epicurean_products', JSON.stringify(State.products));
                console.log('Synchronized products from server API.');
                return;
            }
        }
    } catch (e) {
        console.warn('Backend server products API offline, using local storage fallback:', e);
    }
    if (!localStorage.getItem('epicurean_products')) {
        localStorage.setItem('epicurean_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    State.products = JSON.parse(localStorage.getItem('epicurean_products'));
}

// Synchronize orders from server, falling back to localStorage
async function syncOrdersFromServer() {
    try {
        const response = await fetch(`${API_BASE}/api/orders`);
        if (response.ok) {
            const serverOrders = await response.json();
            if (serverOrders) {
                State.orders = serverOrders;
                localStorage.setItem('epicurean_orders', JSON.stringify(State.orders));
                console.log('Synchronized orders from server API.');
                return;
            }
        }
    } catch (e) {
        console.warn('Backend server orders API offline, using local storage fallback:', e);
    }
    if (!localStorage.getItem('epicurean_orders')) {
        localStorage.setItem('epicurean_orders', JSON.stringify(DEFAULT_ORDERS));
    }
    State.orders = JSON.parse(localStorage.getItem('epicurean_orders'));
}

// Initialize State
async function initLocalStorage() {
    // Cart setup
    if (!localStorage.getItem('epicurean_cart')) {
        localStorage.setItem('epicurean_cart', JSON.stringify([]));
    }
    State.cart = JSON.parse(localStorage.getItem('epicurean_cart'));

    // Wishlist setup
    if (!localStorage.getItem('epicurean_wishlist')) {
        localStorage.setItem('epicurean_wishlist', JSON.stringify([]));
    }
    State.wishlist = JSON.parse(localStorage.getItem('epicurean_wishlist'));
    
    // Admin logged in setup
    State.isAdminLoggedIn = localStorage.getItem('epicurean_admin_logged_in') === 'true';

    // Customer logged in setup
    const savedCust = localStorage.getItem('epicurean_customer_user');
    if (savedCust) {
        State.customerUser = JSON.parse(savedCust);
    }
    syncCustomerAuthUI();

    // Dark Mode Theme setup
    State.darkMode = localStorage.getItem('epicurean_dark_mode') === 'true';
    if (State.darkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    syncThemeToggleIcon();

    // Sync products and orders with server
    await syncProductsFromServer();
    await syncOrdersFromServer();
}

function saveProductsToStorage() {
    localStorage.setItem('epicurean_products', JSON.stringify(State.products));
}

function saveCartToStorage() {
    localStorage.setItem('epicurean_cart', JSON.stringify(State.cart));
}

function saveWishlistToStorage() {
    localStorage.setItem('epicurean_wishlist', JSON.stringify(State.wishlist));
}

function saveOrdersToStorage() {
    localStorage.setItem('epicurean_orders', JSON.stringify(State.orders));
}

// Dark Mode Toggle logic
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

// ----------------------------------------------------
// ROUTER LOGIC
// ----------------------------------------------------


const Router = {
    routes: {
        'home': 'view-home',
        'shop': 'view-shop',
        'wishlist': 'view-wishlist',
        'cart': 'view-cart',
        'profile': 'view-profile'
    },
    init() {
        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
    },
    handleRouting() {
        let hash = window.location.hash.substring(2); // Remove '#/'
        let scrollToId = null;
        if (hash.includes('#')) {
            const parts = hash.split('#');
            hash = parts[0];
            scrollToId = parts[1];
        }
        
        if (!hash || !this.routes[hash]) {
            hash = 'home';
            window.location.hash = '#/home';
        }
        State.currentView = hash;
        
        // Hide all views
        Object.keys(this.routes).forEach(route => {
            const el = document.getElementById(this.routes[route]);
            if (el) {
                el.classList.remove('active-view');
            }
        });
        
        // Reveal active view
        const activeEl = document.getElementById(this.routes[hash]);
        if (activeEl) {
            activeEl.classList.add('active-view');
        }

        // Adjust active nav link styles
        this.updateNavLinks(hash);

        // Render sections dynamically
        if (hash === 'home') {
            renderHomeFeatured();
        } else if (hash === 'shop') {
            renderShopCatalog();
        } else if (hash === 'wishlist') {
            renderWishlistView();
        } else if (hash === 'cart') {
            renderCartAndSummary();
        } else if (hash === 'profile') {
            renderCustomerProfileDetails();
        }
        
        if (scrollToId) {
            setTimeout(() => {
                const target = document.getElementById(scrollToId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },
    updateNavLinks(activeRoute) {
        document.querySelectorAll('.customer-nav-link').forEach(link => {
            const route = link.dataset.route;
            if (route === activeRoute) {
                link.className = "customer-nav-link font-label-sm text-label-sm tracking-widest uppercase text-primary border-b-2 border-primary pb-1 cursor-pointer dark:text-[#e9c176] dark:border-[#e9c176]";
            } else {
                link.className = "customer-nav-link font-label-sm text-label-sm tracking-widest uppercase text-on-surface-variant hover:text-primary transition-all duration-300 cursor-pointer dark:text-gray-300 dark:hover:text-white";
            }
        });
        updateHeaderCartBadge();
        updateHeaderWishlistBadge();
    }
};


// UI Notification Toast
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
// WISHLIST LOGIC
// ----------------------------------------------------
function updateHeaderWishlistBadge() {
    const totalCount = State.wishlist.length;
    const badge = document.getElementById('header-wishlist-count');
    if (badge) {
        badge.innerText = totalCount;
        if (totalCount > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function toggleWishlist(productId) {
    const idx = State.wishlist.indexOf(productId);
    const btn = document.querySelector(`[data-wishlist-btn-id="${productId}"]`);
    let added = false;
    
    if (idx > -1) {
        State.wishlist.splice(idx, 1);
        if (btn) btn.classList.remove('wish-active');
        showToast('Product removed from Wishlist.');
    } else {
        State.wishlist.push(productId);
        if (btn) btn.classList.add('wish-active');
        showToast('Product added to Wishlist.');
        added = true;
    }
    
    saveWishlistToStorage();
    updateHeaderWishlistBadge();
    
    // Sync active details modal wishlist button state
    if (State.activeDetailProductId === productId) {
        const detailsWishIcon = document.getElementById('detail-wish-icon');
        if (detailsWishIcon) {
            if (added) {
                detailsWishIcon.classList.add('wish-active');
            } else {
                detailsWishIcon.classList.remove('wish-active');
            }
        }
    }

    if (State.currentView === 'wishlist') {
        renderWishlistView();
    }
}

function renderWishlistView() {
    const grid = document.getElementById('wishlist-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    const wishlistProducts = State.products.filter(p => State.wishlist.includes(p.id));
    
    if (wishlistProducts.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center border border-dashed border-outline rounded-2xl bg-white p-8 dark:bg-black/30 dark:border-white/5">
                <span class="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-4">favorite</span>
                <h3 class="font-title-md text-title-md text-primary mb-2 dark:text-white">Your wishlist is empty</h3>
                <p class="font-body-md text-on-surface-variant mb-6 dark:text-gray-300">Tap the heart icons on items you like to save them here.</p>
                <a href="#/shop" class="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity dark:bg-[#c5a059] dark:text-[#001809]">Shop Pantry</a>
            </div>
        `;
        return;
    }

    wishlistProducts.forEach((product) => {
        const isOutOfStock = product.stock <= 0;
        const cardHtml = `
            <div class="group bg-white border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-primary/15 transition-all duration-300 dark:bg-black/40 dark:border-white/5">
                <div class="h-48 bg-[#FBFBFB] relative overflow-hidden cursor-pointer" onclick="openProductDetails('${product.id}')">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${product.nameEn}" src="${formatImageUrl(product.imageUrl)}" />
                </div>
                <div class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <h4 class="text-sm font-bold text-primary dark:text-white">${product.nameEn}</h4>
                            <p class="text-[10px] text-on-surface-variant language-tamil dark:text-gray-400">${product.nameTa}</p>
                        </div>
                        <span class="text-sm font-bold text-primary dark:text-[#e9c176]">₹${product.price}</span>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="addToCart('${product.id}')" ${isOutOfStock ? 'disabled' : ''} class="flex-1 bg-primary text-on-primary py-2 rounded font-label-sm text-[10px] uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 dark:bg-[#c5a059] dark:text-[#001809]">
                            ${isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                        </button>
                        <button onclick="toggleWishlist('${product.id}')" class="p-2 border border-outline-variant rounded hover:bg-primary/5 active:scale-95 transition-all dark:border-white/20">
                            <span class="material-symbols-outlined text-[16px] text-error fill-1">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

// ----------------------------------------------------
// DETAIL MODAL DRAWER OVERLAYS
// ----------------------------------------------------
function openProductDetails(productId) {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    State.activeDetailProductId = productId;
    State.activeDetailTab = 'overview';
    State.activeDetailImageIndex = 0;

    // Load static values
    document.getElementById('detail-name-en').innerText = product.nameEn;
    document.getElementById('detail-name-ta').innerText = product.nameTa;
    document.getElementById('detail-category').innerText = product.category;
    document.getElementById('detail-price').innerText = `₹${product.price}`;
    document.getElementById('detail-pack').innerText = product.packSize;
    document.getElementById('detail-desc').innerText = product.description;
    document.getElementById('detail-stock').innerText = `${product.stock} packs`;

    // Load Main Image and thumbnail switcher links
    document.getElementById('detail-main-img').src = formatImageUrl(product.imageUrl);
    document.getElementById('detail-thumb-0').src = formatImageUrl(product.imageUrl);

    // Generate reviews
    const reviewsPanel = document.getElementById('detail-tab-content-reviews');
    const mockReviews = PRODUCT_REVIEWS[product.id] || [
        { reviewer: 'Ramesh K. (Verified Buyer)', rating: 5, text: 'Airtight premium packing. Flavor profile is clean and fresh.' }
    ];

    reviewsPanel.innerHTML = '';
    mockReviews.forEach(rev => {
        let starsHtml = '';
        for (let i = 1; i <= 5; i++) {
            starsHtml += `<span class="material-symbols-outlined text-xs ${i <= rev.rating ? 'fill-1 star-gold' : 'text-on-surface-variant/40'}">star</span>`;
        }
        reviewsPanel.insertAdjacentHTML('beforeend', `
            <div class="border-b border-outline-variant/20 pb-2 dark:border-white/5">
                <div class="flex gap-0.5">${starsHtml}</div>
                <p class="text-[11px] italic text-on-surface-variant dark:text-gray-300 mt-1">"${rev.text}"</p>
                <span class="text-[9px] text-on-surface-variant/70 font-semibold block mt-0.5">- ${rev.reviewer}</span>
            </div>
        `);
    });

    // Check Wishlist active heart icon status
    const detailsWishIcon = document.getElementById('detail-wish-icon');
    if (detailsWishIcon) {
        if (State.wishlist.includes(productId)) {
            detailsWishIcon.classList.add('wish-active');
        } else {
            detailsWishIcon.classList.remove('wish-active');
        }
    }

    // Set buttons onclick binders
    const addBtn = document.getElementById('detail-add-btn');
    if (product.stock <= 0) {
        addBtn.innerText = 'Out of Stock';
        addBtn.disabled = true;
    } else {
        addBtn.innerText = 'Add to Shopping Bag';
        addBtn.disabled = false;
        addBtn.onclick = () => {
            addToCart(productId);
            closeProductDetails();
        };
    }

    const wishBtn = document.getElementById('detail-wish-btn');
    wishBtn.onclick = () => toggleWishlist(productId);

    // Initial Active tab toggle UI resets
    setDetailTab('overview');

    // Reveal Overlay modal
    document.getElementById('product-details-modal').classList.remove('hidden');
}

function closeProductDetails() {
    document.getElementById('product-details-modal').classList.add('hidden');
    State.activeDetailProductId = null;
}

function setDetailImage(idx) {
    const mainImg = document.getElementById('detail-main-img');
    const product = State.products.find(p => p.id === State.activeDetailProductId);
    if (!product || !mainImg) return;

    if (idx === 0) {
        mainImg.src = formatImageUrl(product.imageUrl);
    } else if (idx === 1) {
        // Fallback or secondary category images mock
        mainImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvOmCvUf1731sjetAnQo8yu_z0ofhZiK-WDWA9-PWbKp8dnxrAjxGh2R9udE27OWds9f1R7WeWogigC1894cS3eopK7CoIkXG82Bp5qE1buJMimz2SLQ3s8mUEWbnI_RONyCqybd9oRDqxd1GpEog8MtyQ0bG_GqKmq-FSXACdZL6mntTQyW8QgYoe3OXeipjby1KzPwuS5ajFZCw1Ot3t_hzW2_fDoKIGW4iLI6-PZaTT4h2Tn5gwLFYm9Q-ffLUYC0xdxzcOXbA';
    } else {
        mainImg.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuATRhXNNKJlfxBKdG57KFND63OMuY8PwdsGTgvc2zVa6So6By3WjBAH5LP1LNDTS7Gi7YAwq7jvpuEF4cTqoOo1VPPa_LBwYuSyV1FrUEObPmW56oMzvkK0qXSr5FKvygH1F1PMbvK3G12C5w6P_OYM5rzEWNbFy76rkrcF-c9UHgD8_qX6OcGYBDNwvezFVSrbj4VjOF2c63cYddbT3NQSKIk6D9zA2Lww_KRuN4Yy_XXhBFJ2EjMiU47xJ6wJv8_lvusTp_E7BgA';
    }
    State.activeDetailImageIndex = idx;
}

function setDetailTab(tabId) {
    State.activeDetailTab = tabId;
    const tabs = ['overview', 'sourcing', 'reviews'];
    
    tabs.forEach(t => {
        const btn = document.getElementById(`detail-tab-btn-${t}`);
        const panel = document.getElementById(`detail-tab-content-${t}`);
        
        if (t === tabId) {
            btn.className = "text-primary font-bold border-b-2 border-primary pb-1 dark:text-white dark:border-[#e9c176]";
            panel.classList.remove('hidden');
        } else {
            btn.className = "text-on-surface-variant hover:text-primary dark:text-gray-400 dark:hover:text-white";
            panel.classList.add('hidden');
        }
    });
}

// ----------------------------------------------------
// CART ACTIONS
// ----------------------------------------------------
function updateHeaderCartBadge() {
    const totalCount = State.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge-count');
    badges.forEach(badge => {
        badge.innerText = totalCount;
        if (totalCount > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

function addToCart(productId) {
    const product = State.products.find(p => p.id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        showToast(`Sorry, ${product.nameEn} is currently out of stock.`);
        return;
    }

    // Read selected quantity from card element, fallback to 1
    const qtyEl = document.getElementById(`qty-val-${productId}`);
    const quantityToAdd = qtyEl ? parseInt(qtyEl.innerText) || 1 : 1;

    const cartItem = State.cart.find(item => item.productId === productId);
    const currentQtyInCart = cartItem ? cartItem.quantity : 0;

    if (product.stock < currentQtyInCart + quantityToAdd) {
        showToast(`Sorry, only ${product.stock} units are available. You already have ${currentQtyInCart} in your bag.`);
        return;
    }

    if (cartItem) {
        cartItem.quantity += quantityToAdd;
    } else {
        State.cart.push({ productId: productId, quantity: quantityToAdd });
    }

    saveCartToStorage();
    updateHeaderCartBadge();
    showToast(`Added ${quantityToAdd} x "${product.nameEn}" to your Selection Bag.`);
    
    // Reset quantity counter back to 1
    if (qtyEl) qtyEl.innerText = '1';

    // Bounce product card if called from catalog grid click
    const card = document.querySelector(`[data-product-card-id="${productId}"]`);
    if (card) {
        card.classList.remove('cart-feedback');
        void card.offsetWidth; // Force layout flow recalculations
        card.classList.add('cart-feedback');
        setTimeout(() => card.classList.remove('cart-feedback'), 500);
    }
    
    if (State.currentView === 'cart') {
        renderCartAndSummary();
    }
}

function adjustCardQty(productId, amount) {
    const qtyEl = document.getElementById(`qty-val-${productId}`);
    if (!qtyEl) return;

    let current = parseInt(qtyEl.innerText) || 1;
    const product = State.products.find(p => p.id === productId);
    const stock = product ? product.stock : 99;

    current += amount;
    if (current < 1) current = 1;
    if (current > stock) {
        current = stock;
        showToast(`Maximum stock limit of ${stock} units reached.`);
    }

    qtyEl.innerText = current;
}

function updateCartQuantity(productId, newQty) {
    const product = State.products.find(p => p.id === productId);
    const cartItem = State.cart.find(item => item.productId === productId);
    if (!cartItem || !product) return;

    if (newQty <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQty > product.stock) {
        showToast(`Stock limit reached! Only ${product.stock} packs available.`);
        cartItem.quantity = product.stock;
    } else {
        cartItem.quantity = newQty;
    }

    saveCartToStorage();
    updateHeaderCartBadge();
    renderCartAndSummary();
}

function removeFromCart(productId) {
    State.cart = State.cart.filter(item => item.productId !== productId);
    saveCartToStorage();
    updateHeaderCartBadge();
    renderCartAndSummary();
    showToast('Removed from selection.');
}

// ----------------------------------------------------
// FRONTEND VIEWS RENDERING
// ----------------------------------------------------
function renderHomeFeatured() {
    const featuredGrid = document.getElementById('home-featured-grid');
    if (!featuredGrid) return;

    // Filter down to the first 4 products for best sellers row (with limited stock or premium tag)
    const featuredSpices = State.products.slice(0, 4);

    featuredGrid.innerHTML = '';
    featuredSpices.forEach((product) => {
        const isOutOfStock = product.stock <= 0;
        const isWish = State.wishlist.includes(product.id);
        const cardHtml = `
            <div data-product-card-id="${product.id}" class="reveal group bg-white border border-outline-variant/30 rounded-xl overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 reveal active dark:bg-black/30 dark:border-white/5">
                <div class="h-64 bg-[#FBFBFB] relative overflow-hidden">
                    <img onclick="openProductDetails('${product.id}')" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1000ms] cubic-bezier(0.4, 0, 0.2, 1) cursor-pointer" 
                         alt="${product.nameEn}" src="${formatImageUrl(product.imageUrl)}" />
                    ${product.tag ? `<span class="absolute top-4 left-4 bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[10px] px-2 py-1 rounded-full uppercase tracking-tighter dark:bg-[#c5a059] dark:text-[#001809]">${product.tag}</span>` : ''}
                    ${isOutOfStock ? `<span class="absolute top-4 right-4 bg-error text-on-error font-label-sm text-[10px] px-2 py-1 rounded-full uppercase tracking-tighter">Sold Out</span>` : ''}
                    
                    <!-- Quick Wishlist Heart -->
                    <button onclick="toggleWishlist('${product.id}')" data-wishlist-btn-id="${product.id}" class="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center border border-outline-variant hover:bg-white active:scale-95 transition-all dark:bg-black/45 dark:border-white/15">
                        <span class="material-symbols-outlined text-[18px] text-primary dark:text-gray-300 ${isWish ? 'wish-active' : ''}">favorite</span>
                    </button>
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2" onclick="openProductDetails('${product.id}')">
                        <div class="cursor-pointer">
                            <h4 class="font-title-md text-title-md text-primary font-bold dark:text-white">${product.nameEn}</h4>
                            <p class="font-body-md text-on-surface-variant text-sm language-tamil dark:text-gray-300">${product.nameTa}</p>
                        </div>
                        <span class="font-title-md text-primary font-bold dark:text-[#e9c176]">₹${product.price}</span>
                    </div>
                    <p class="text-xs text-on-surface-variant/70 mt-1 line-clamp-2 dark:text-gray-400">${product.description}</p>
                    <div class="flex items-center justify-between mt-3 text-xs font-label-sm text-on-surface-variant uppercase tracking-widest dark:text-gray-300">
                        <span>${product.packSize}</span>
                        
                        <!-- Quantity selector -->
                        <div class="flex items-center rounded-full px-2 py-0.5 bg-primary text-on-primary dark:bg-[#c5a059] dark:text-[#001809] shadow-sm select-none">
                            <button onclick="adjustCardQty('${product.id}', -1)" class="w-5 h-5 flex items-center justify-center text-on-primary dark:text-[#001809] hover:opacity-75 active:scale-90 transition-all">
                                <span class="material-symbols-outlined text-[12px] font-bold">remove</span>
                            </button>
                            <span id="qty-val-${product.id}" class="w-6 text-center font-label-sm text-[10px] font-bold text-on-primary dark:text-[#001809]">1</span>
                            <button onclick="adjustCardQty('${product.id}', 1)" class="w-5 h-5 flex items-center justify-center text-on-primary dark:text-[#001809] hover:opacity-75 active:scale-90 transition-all">
                                <span class="material-symbols-outlined text-[12px] font-bold">add</span>
                            </button>
                        </div>

                        <span>Stock: ${product.stock} units</span>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-2 mt-4">
                        <button onclick="addToCart('${product.id}')" ${isOutOfStock ? 'disabled' : ''} 
                                class="border border-primary text-primary py-3 rounded-full font-label-sm text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white hover:shadow-lg transition-all duration-500 active:scale-95 disabled:opacity-50 dark:border-[#c5a059] dark:text-[#c5a059] dark:hover:bg-[#c5a059] dark:hover:text-[#001809]">
                            ${isOutOfStock ? 'Sold Out' : 'Add to Bag'}
                        </button>
                        <button onclick="buyNow('${product.id}')" ${isOutOfStock ? 'disabled' : ''} 
                                class="bg-primary text-on-primary py-3 rounded-full font-label-sm text-[10px] uppercase tracking-widest hover:opacity-90 transition-all duration-500 active:scale-95 disabled:opacity-50 dark:bg-[#c5a059] dark:text-[#001809]">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
        featuredGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

let currentCategoryFilter = 'All';
let searchKeyword = '';
let currentSortOption = 'Relevance';

function applyCatalogFilters() {
    let filteredList = [...State.products];

    if (currentCategoryFilter !== 'All') {
        filteredList = filteredList.filter(p => p.category === currentCategoryFilter);
    }

    if (searchKeyword.trim() !== '') {
        const kw = searchKeyword.toLowerCase();
        filteredList = filteredList.filter(p => 
            p.nameEn.toLowerCase().includes(kw) || 
            p.nameTa.toLowerCase().includes(kw) ||
            p.description.toLowerCase().includes(kw) ||
            p.category.toLowerCase().includes(kw)
        );
    }



    if (currentSortOption === '₹5 Pocket') {
        filteredList = filteredList.filter(p => p.price === 5 || p.packSize.toLowerCase().includes('₹5') || p.nameEn.toLowerCase().includes('pocket'));
    } else if (currentSortOption === '₹6 Pocket') {
        filteredList = filteredList.filter(p => p.price === 6 || p.packSize.toLowerCase().includes('₹6') || p.nameEn.toLowerCase().includes('pocket'));
    }

    if (currentSortOption === 'Price: Low to High') {
        filteredList.sort((a, b) => a.price - b.price);
    } else if (currentSortOption === 'Price: High to Low') {
        filteredList.sort((a, b) => b.price - a.price);
    }

    renderCatalogGrid(filteredList);
}

function renderCatalogGrid(productsToRender) {
    const grid = document.getElementById('shop-product-grid');
    if (!grid) return;

    grid.innerHTML = '';
    
    const countEl = document.getElementById('shop-products-count');
    if (countEl) countEl.innerText = `${productsToRender.length} Product${productsToRender.length !== 1 ? 's' : ''} Found`;

    if (productsToRender.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center">
                <span class="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4">search_off</span>
                <p class="font-title-md text-title-md text-primary mb-2 dark:text-white">No products found</p>
                <p class="font-body-md text-on-surface-variant dark:text-gray-300">Refine search values or explore categories.</p>
            </div>
        `;
        return;
    }

    productsToRender.forEach((product, index) => {
        const isOutOfStock = product.stock <= 0;
        const isWish = State.wishlist.includes(product.id);
        const delay = (index + 1) * 0.05;
        const cardHtml = `
            <div data-product-card-id="${product.id}" class="product-card flex flex-col sm:flex-row gap-6 p-6 bg-black border border-zinc-800/40 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative group overflow-hidden" style="animation: fadeInUp 0.8s cubic-bezier(0.2, 0, 0.2, 1) ${delay}s forwards; opacity: 0;">
                
                <!-- Left: Product Image -->
                <div class="relative w-full aspect-square sm:w-44 sm:h-44 shrink-0 rounded-[2rem] overflow-hidden bg-[#161b17] border border-zinc-800/30">
                    <img onclick="openProductDetails('${product.id}')" class="product-image-container w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500" alt="${product.nameEn}" src="${formatImageUrl(product.imageUrl)}" />
                    ${product.tag ? `<span class="absolute top-3 left-3 font-label-sm text-[9px] bg-[#e9c176] text-[#001809] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">${product.tag}</span>` : ''}
                    ${isOutOfStock ? `<span class="absolute top-3 right-3 bg-[#ba1a1a] text-white font-label-sm text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">Out of Stock</span>` : ''}
                </div>

                <!-- Right: Content details -->
                <div class="flex-grow flex flex-col justify-between min-h-[176px] w-full">
                    
                    <!-- Top section: Titles & Price -->
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <span class="text-[10px] font-bold tracking-widest text-[#e9c176] uppercase block mb-1">${product.category}</span>
                            <h2 class="font-display-lg text-2xl font-bold text-white tracking-tight hover:text-[#e9c176] cursor-pointer transition-colors" onclick="openProductDetails('${product.id}')">${product.nameEn}</h2>
                            <p class="font-body-md text-sm text-gray-400 italic mt-0.5 language-tamil">${product.nameTa}</p>
                            <p class="text-xs text-gray-500 line-clamp-2 mt-2 max-w-xl hidden sm:block">${product.description}</p>
                        </div>
                        <div class="text-right flex flex-col items-end shrink-0">
                            <span class="font-display-lg text-2xl font-bold text-[#e9c176] leading-none">₹${product.price}</span>
                            <span class="text-[10px] text-gray-500 font-medium tracking-wide mt-1.5 whitespace-nowrap">${product.packSize}</span>
                        </div>
                    </div>

                    <!-- Bottom section: Actions & Quantity Pills -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                        
                        <!-- Pill-shape Quantity Selector -->
                        <div class="flex items-center rounded-full px-3 py-1.5 bg-black border border-zinc-800/80 w-32 justify-between select-none shadow-inner">
                            <button onclick="adjustCardQty('${product.id}', -1)" class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white active:scale-75 transition-all">
                                <span class="material-symbols-outlined text-[14px] font-bold">remove</span>
                            </button>
                            <span id="qty-val-${product.id}" class="text-white font-label-sm text-xs font-bold w-6 text-center">1</span>
                            <button onclick="adjustCardQty('${product.id}', 1)" class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white active:scale-75 transition-all">
                                <span class="material-symbols-outlined text-[14px] font-bold">add</span>
                            </button>
                        </div>

                        <!-- Info & Actions Row -->
                        <div class="flex items-center flex-wrap gap-3">
                            <!-- Save / Wishlist Button -->
                            <button onclick="toggleWishlist('${product.id}')" data-wishlist-btn-id="${product.id}" class="flex items-center gap-1.5 px-4 py-2 border border-zinc-800 text-gray-300 rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-zinc-900 active:scale-95 transition-all ${isWish ? 'wish-active bg-zinc-900/50' : ''}">
                                <span class="material-symbols-outlined text-[16px] ${isWish ? 'fill-1' : ''}">favorite</span>
                                <span>Save</span>
                            </button>
                            
                            <!-- Add to Bag / Buy Now Buttons -->
                            ${isOutOfStock ? `
                                <button disabled class="px-4 py-2 border border-zinc-800 text-zinc-600 rounded-full text-xs font-semibold uppercase tracking-wider cursor-not-allowed">SOLD OUT</button>
                            ` : `
                                <button onclick="addToCart('${product.id}')" class="px-4 py-2 border border-[#e9c176] text-[#e9c176] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#e9c176] hover:text-[#001809] active:scale-95 transition-all duration-300">Add to Bag</button>
                                <button onclick="buyNow('${product.id}')" class="px-5 py-2 bg-[#e9c176] text-[#001809] rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#ffdea5] active:scale-95 transition-all duration-300">Buy Now</button>
                            `}
                        </div>

                    </div>
                </div>

            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function buyNow(productId) {
    addToCart(productId);
    window.location.hash = '#/cart';
}

function renderShopCatalog() {
    const categories = ['All', 'Spices', 'Masalas', 'Groceries'];
    const sidebarList = document.getElementById('shop-categories-list');
    if (sidebarList) {
        sidebarList.innerHTML = '';
        categories.forEach(cat => {
            const count = cat === 'All' ? State.products.length : State.products.filter(p => p.category === cat).length;
            const isActive = currentCategoryFilter === cat;
            const linkHtml = `
                <li class="pl-3">
                    <a onclick="setShopCategoryFilter('${cat}')" class="category-link flex items-center justify-between group cursor-pointer ${isActive ? 'active text-primary font-bold dark:text-[#e9c176]' : 'text-on-surface-variant hover:text-primary dark:text-gray-300 dark:hover:text-white'} transition-all duration-500">
                        <span class="font-body-md">${cat}</span>
                        <span class="text-xs bg-primary/5 px-2.5 py-1 rounded-full ${isActive ? 'text-on-primary-container font-semibold dark:bg-[#e9c176]/10' : 'text-on-surface-variant/75'}">${count}</span>
                    </a>
                </li>
            `;
            sidebarList.insertAdjacentHTML('beforeend', linkHtml);
        });
    }

    applyCatalogFilters();
}

function setShopCategoryFilter(category) {
    currentCategoryFilter = category;
    renderShopCatalog();
}

function triggerSearch(kw) {
    searchKeyword = kw;
    applyCatalogFilters();
}

// ----------------------------------------------------
// CART & SUMMARY
// ----------------------------------------------------
function renderCartAndSummary() {
    const cartItemsList = document.getElementById('cart-items-list');
    const checkoutSummary = document.getElementById('checkout-summary-section');
    if (!cartItemsList) return;

    if (State.cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="py-16 text-center border border-dashed border-outline rounded-2xl bg-white p-8 dark:bg-black/30 dark:border-white/5">
                <span class="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-4">shopping_bag</span>
                <h3 class="font-title-md text-title-md text-primary mb-2 dark:text-white">Your selection bag is empty</h3>
                <p class="font-body-md text-on-surface-variant mb-6 dark:text-gray-300">Discover the finest whole spices and bespoke hand-ground masalas.</p>
                <a href="#/shop" class="inline-block bg-primary text-on-primary px-8 py-3 rounded-full font-label-sm text-label-sm uppercase tracking-widest hover:opacity-90 transition-opacity dark:bg-[#c5a059] dark:text-[#001809]">Browse Catalog</a>
            </div>
        `;
        if (checkoutSummary) checkoutSummary.classList.add('hidden');
        return;
    }

    if (checkoutSummary) checkoutSummary.classList.remove('hidden');
    cartItemsList.innerHTML = '';
    
    let subtotal = 0;

    State.cart.forEach(item => {
        const product = State.products.find(p => p.id === item.productId);
        if (!product) return;
        
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;

        const itemHtml = `
            <div class="group flex flex-col sm:flex-row gap-6 p-6 bg-black border border-zinc-800/40 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative overflow-hidden">
                
                <!-- Left: Product Image -->
                <div class="relative w-full aspect-square sm:w-44 sm:h-44 shrink-0 rounded-[2rem] overflow-hidden bg-[#161b17] border border-zinc-800/30">
                    <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${product.nameEn}" src="${formatImageUrl(product.imageUrl)}" />
                </div>

                <!-- Right: Content details -->
                <div class="flex-grow flex flex-col justify-between min-h-[176px] w-full">
                    
                    <!-- Top section: Titles & Price -->
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <span class="text-[10px] font-bold tracking-widest text-[#e9c176] uppercase block mb-1">${product.category}</span>
                            <h3 class="font-display-lg text-2xl font-bold text-white tracking-tight">${product.nameEn}</h3>
                            <p class="font-body-md text-sm text-gray-400 italic mt-0.5 language-tamil">${product.nameTa}</p>
                        </div>
                        <span class="font-display-lg text-2xl font-bold text-[#e9c176] leading-none shrink-0">₹${lineTotal}</span>
                    </div>

                    <!-- Bottom section: Actions & Quantity Pills -->
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                        
                        <!-- Pill-shape Quantity Selector -->
                        <div class="flex items-center rounded-full px-3 py-1.5 bg-black border border-zinc-800/80 w-32 justify-between select-none shadow-inner">
                            <button onclick="updateCartQuantity('${product.id}', ${item.quantity - 1})" class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white active:scale-75 transition-all">
                                <span class="material-symbols-outlined text-[14px] font-bold">remove</span>
                            </button>
                            <span class="text-white font-label-sm text-xs font-bold w-6 text-center">${item.quantity}</span>
                            <button onclick="updateCartQuantity('${product.id}', ${item.quantity + 1})" class="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-white active:scale-75 transition-all">
                                <span class="material-symbols-outlined text-[14px] font-bold">add</span>
                            </button>
                        </div>

                        <!-- Info & Actions Row -->
                        <div class="flex items-center flex-wrap gap-4 text-xs font-semibold text-gray-400">
                            <span>${product.packSize} @ ₹${product.price} each</span>
                            <span class="text-zinc-800">|</span>
                            <button onclick="removeFromCart('${product.id}')" class="font-label-sm text-[10px] tracking-widest uppercase text-red-600 hover:text-red-500 font-bold transition-colors">REMOVE</button>
                        </div>

                    </div>
                </div>

            </div>
        `;
        cartItemsList.insertAdjacentHTML('beforeend', itemHtml);
    });

    let discount = 0;
    if (State.promoApplied) {
        discount = subtotal * State.discountRate;
    }

    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * State.taxRate;
    const finalTotal = taxableAmount + State.shippingCost + tax;

    document.getElementById('summary-subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('summary-shipping').innerText = `₹${State.shippingCost.toFixed(2)}`;
    document.getElementById('summary-tax').innerText = `₹${tax.toFixed(2)}`;
    document.getElementById('summary-discount-row').className = State.promoApplied ? "flex justify-between font-body-md text-error" : "hidden";
    document.getElementById('summary-discount').innerText = `-₹${discount.toFixed(2)}`;
    document.getElementById('summary-total').innerText = `₹${finalTotal.toFixed(2)}`;

    const promoAppliedMsg = document.getElementById('promo-applied-msg');
    if (promoAppliedMsg) {
        if (State.promoApplied) {
            promoAppliedMsg.innerText = 'Promo applied: 10% discount';
            promoAppliedMsg.classList.remove('hidden');
        } else {
            promoAppliedMsg.classList.add('hidden');
        }
    }
}

function applyPromoCode() {
    const input = document.getElementById('promo-input');
    if (!input) return;
    const val = input.value.trim().toUpperCase();

    if (val === 'APPLE10' || val === 'EPICUREAN') {
        State.promoApplied = true;
        State.discountRate = 0.10;
        saveCartToStorage();
        renderCartAndSummary();
        showToast('Success! 10% promo discount applied.');
    } else {
        showToast('Invalid promo code. Try "APPLE10"');
    }
    input.value = '';
}

function showCheckoutModal() {
    // Verify stock availability
    for (const item of State.cart) {
        const product = State.products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            showToast(`Sorry, ${product ? product.nameEn : 'an item'} has insufficient stock.`);
            return;
        }
    }

    const modal = document.getElementById('payment-modal');
    if (modal) {
        if (State.customerUser) {
            const chkName = document.getElementById('chk-name');
            const chkEmail = document.getElementById('chk-email');
            const chkPhone = document.getElementById('chk-phone');
            const chkAddress = document.getElementById('chk-address');
            if (chkName) chkName.value = State.customerUser.name;
            if (chkEmail) chkEmail.value = State.customerUser.email;
            if (chkPhone) chkPhone.value = State.customerUser.phone || '';
            if (chkAddress) chkAddress.value = State.customerUser.address || '';
        }
        let subtotal = 0;
        State.cart.forEach(item => {
            const product = State.products.find(p => p.id === item.productId);
            if (product) subtotal += product.price * item.quantity;
        });
        const discount = State.promoApplied ? subtotal * State.discountRate : 0;
        const tax = (subtotal - discount) * State.taxRate;
        const finalTotal = subtotal - discount + State.shippingCost + tax;

        document.getElementById('payment-modal-total').innerText = `₹${finalTotal.toFixed(2)}`;
        modal.classList.remove('hidden');
    }
}

function closeCheckoutModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('hidden');
}

function executeCheckoutPayment(event) {
    event.preventDefault();

    const name = document.getElementById('chk-name').value.trim();
    const email = document.getElementById('chk-email').value.trim();
    const phone = document.getElementById('chk-phone').value.trim();
    const address = document.getElementById('chk-address').value.trim();

    if (!name || !email || !phone || !address) {
        showToast('Please fill out all mandatory shipping info.');
        return;
    }

    const orderItems = [];
    let subtotal = 0;
    
    for (const item of State.cart) {
        const product = State.products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
            showToast(`Insufficient stock on ${product ? product.nameEn : 'item'}. Checkout aborted.`);
            closeCheckoutModal();
            return;
        }
        product.stock -= item.quantity;
        subtotal += product.price * item.quantity;
        orderItems.push({
            id: product.id,
            nameEn: product.nameEn,
            price: product.price,
            quantity: item.quantity
        });
    }

    const discount = State.promoApplied ? subtotal * State.discountRate : 0;
    const tax = (subtotal - discount) * State.taxRate;
    const finalTotal = subtotal - discount + State.shippingCost + tax;

    const newOrderId = `EP-${Math.floor(1000 + Math.random() * 9000)}`;
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const randomColor = 'bg-secondary-container';

    const orderDateObj = new Date();
    const newOrder = {
        id: newOrderId,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerAddress: address,
        customerInitials: initials || 'CS',
        colorClass: randomColor,
        products: orderItems,
        status: 'Processing',
        amount: parseFloat(finalTotal.toFixed(2)),
        date: orderDateObj.toISOString().split('T')[0]
    };

    State.orders.unshift(newOrder);
    State.cart = [];
    State.promoApplied = false;

    saveProductsToStorage();
    saveCartToStorage();
    saveOrdersToStorage();

    // Send order to server database
    fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
    }).catch(err => console.warn('Could not sync order to server:', err));

    updateHeaderCartBadge();
    closeCheckoutModal();

    window.location.hash = '#/home';
    showToast(`Order Placed! ID: ${newOrderId}`);

    // Generate WhatsApp Pre-Filled message
    const formattedDate = orderDateObj.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    let itemsText = '';
    orderItems.forEach(item => {
        itemsText += `• ${item.nameEn} x ${item.quantity} (₹${item.price} each)\n`;
    });

    const whatsappMessage = `🍎 NEW ORDER PLACED (Apple Brand Spices)\n` +
        `----------------------------------------\n` +
        `👤 Customer Name: ${name}\n` +
        `📞 Phone Number: ${phone}\n` +
        `📍 Delivery Address: ${address}\n` +
        `📅 Order Date & Time: ${formattedDate}\n\n` +
        `🛒 PRODUCTS:\n${itemsText}\n` +
        `💰 TOTAL AMOUNT: ₹${finalTotal.toFixed(2)}\n` +
        `----------------------------------------\n` +
        `Thank you for shopping with Apple Brand Spices! 🌶️✨`;

    const whatsappUrl = `https://wa.me/916382181561?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Set manual link in the success overlay button as a reliable fallback
    const whatsappBtn = document.getElementById('success-whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.href = whatsappUrl;
    }

    const successOverlay = document.getElementById('order-success-overlay');
    if (successOverlay) {
        document.getElementById('success-order-id').innerText = newOrderId;
        successOverlay.classList.remove('hidden');
    }

    // Check if redirection is successful or blocked by the browser
    let redirectSuccessful = false;
    try {
        const newWindow = window.open(whatsappUrl, '_blank');
        if (newWindow && !newWindow.closed && typeof newWindow.closed !== 'undefined') {
            redirectSuccessful = true;
        }
    } catch (e) {
        console.error('WhatsApp redirect open failed:', e);
    }

    const statusEl = document.getElementById('whatsapp-redirect-status');
    if (statusEl) {
        if (redirectSuccessful) {
            statusEl.innerHTML = '<span class="material-symbols-outlined text-green-500 text-sm font-bold">check_circle</span> Auto-redirected to WhatsApp! Send the pre-filled message there.';
            statusEl.className = 'text-xs bg-black/25 py-2 px-4 rounded-lg inline-flex items-center gap-2 justify-center text-white/90';
            showToast('Redirecting to WhatsApp to send order...');
        } else {
            statusEl.innerHTML = '<span class="material-symbols-outlined text-yellow-400 text-sm font-bold">warning</span> Pop-up blocked! Please click "Send WhatsApp Order" manually below.';
            statusEl.className = 'text-xs bg-yellow-400/20 border border-yellow-400/30 py-2 px-4 rounded-lg inline-flex items-center gap-2 justify-center text-yellow-300 font-semibold animate-pulse';
            showToast('⚠️ Pop-up blocked! Click the green button to open WhatsApp.');
        }
    }
}

function closeSuccessOverlay() {
    const overlay = document.getElementById('order-success-overlay');
    if (overlay) overlay.classList.add('hidden');
}

// ----------------------------------------------------
// ADMIN AUTHENTICATION & LOGIN/SIGNOUT
// ----------------------------------------------------

function syncCustomerAuthUI() {
    const authBtn = document.getElementById('customer-auth-btn');
    const authIcon = document.getElementById('customer-auth-icon');
    const authText = document.getElementById('customer-auth-text');
    if (!authBtn || !authIcon || !authText) return;

    if (State.customerUser) {
        authIcon.innerText = 'account_circle';
        const firstName = State.customerUser.name.split(' ')[0] || 'User';
        authText.innerText = `Hi, ${firstName}`;
        authBtn.title = 'Account Profile & Logs';
    } else {
        authIcon.innerText = 'person';
        authText.innerText = 'Sign In';
        authBtn.title = 'Customer Account';
    }
}

function toggleCustomerAuthModal() {
    const modal = document.getElementById('customer-auth-modal');
    if (!modal) return;
    
    const isHidden = modal.classList.contains('hidden');
    if (isHidden) {
        if (State.customerUser) {
            setCustomerAuthTab('profile');
        } else {
            setCustomerAuthTab('signin');
        }
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
    }
}

function setCustomerAuthTab(tabName) {
    activeCustomerAuthTab = tabName;
    const panels = ['signin', 'signup', 'profile'];
    panels.forEach(p => {
        const panel = document.getElementById(`cust-panel-${p}`);
        if (panel) {
            if (p === tabName) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }
    });

    const tabsHeader = document.getElementById('customer-auth-tabs');
    if (tabName === 'profile') {
        if (tabsHeader) tabsHeader.classList.add('hidden');
        renderCustomerProfileDetails();
    } else {
        if (tabsHeader) tabsHeader.classList.remove('hidden');
        
        const btnSignin = document.getElementById('cust-tab-btn-signin');
        const btnSignup = document.getElementById('cust-tab-btn-signup');
        if (tabName === 'signin') {
            if (btnSignin) btnSignin.className = "text-primary font-bold border-b border-primary pb-1 dark:text-white dark:border-white";
            if (btnSignup) btnSignup.className = "text-on-surface-variant hover:text-primary dark:text-gray-400 dark:hover:text-white";
        } else {
            if (btnSignin) btnSignin.className = "text-on-surface-variant hover:text-primary dark:text-gray-400 dark:hover:text-white";
            if (btnSignup) btnSignup.className = "text-primary font-bold border-b border-primary pb-1 dark:text-white dark:border-white";
        }
    }
}

function renderCustomerProfileDetails() {
    if (!State.customerUser) return;

    const avatar = document.getElementById('cust-profile-avatar');
    const nameEl = document.getElementById('cust-profile-name');
    const emailEl = document.getElementById('cust-profile-email');
    const addrEl = document.getElementById('cust-profile-address');
    const tbody = document.getElementById('cust-profile-orders-tbody');

    if (avatar) avatar.innerText = State.customerUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'CS';
    if (nameEl) nameEl.innerText = State.customerUser.name;
    if (emailEl) emailEl.innerText = State.customerUser.email;
    if (addrEl) addrEl.innerText = State.customerUser.address || 'No Address Sourced';

    if (tbody) {
        tbody.innerHTML = '';
        const myOrders = State.orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === State.customerUser.email.toLowerCase());
        
        if (myOrders.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="px-4 py-8 text-center text-on-surface-variant/60 italic">
                        No purchase transactions logged yet.
                    </td>
                </tr>
            `;
            return;
        }

        myOrders.forEach(order => {
            let statusClass = 'text-primary dark:text-[#fed488]';
            if (order.status === 'Delivered') statusClass = 'text-[#2e7d32] font-bold';
            if (order.status === 'Cancelled') statusClass = 'text-error font-bold';
            
            const row = `
                <tr class="hover:bg-primary/5 dark:hover:bg-white/5 transition-colors">
                    <td class="px-4 py-3 font-mono font-bold">${order.id}</td>
                    <td class="px-4 py-3 text-[10px] text-on-surface-variant dark:text-gray-400">${order.date}</td>
                    <td class="px-4 py-3 text-right font-bold">₹${order.amount.toFixed(2)}</td>
                    <td class="px-4 py-3 text-center ${statusClass} uppercase text-[9px] tracking-wider font-semibold">${order.status}</td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    }
}

function executeCustomerLogin(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('cust-login-email').value.trim();
    const password = document.getElementById('cust-login-password').value;
    const errorDiv = document.getElementById('cust-login-error');

    if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.innerText = '';
    }

    const users = {
        'sarah.lind@ymail.com': { name: 'Sarah Lind', address: '55 MG Road, Chennai', phone: '+91 88776 65544' },
        'eleanor.kade@gmail.com': { name: 'Eleanor Kade', address: '42 Pine Crest Ave, Chennai', phone: '+91 77665 54433' },
        'marcus.reid@outlook.com': { name: 'Marcus Reid', address: '88 OMR IT corridor, Chennai', phone: '+91 99887 76655' }
    };

    const user = users[email.toLowerCase()];
    if (user && password === 'password123') {
        const custData = { name: user.name, email: email.toLowerCase(), address: user.address, phone: user.phone };
        State.customerUser = custData;
        localStorage.setItem('epicurean_customer_user', JSON.stringify(custData));
        showToast(`Welcome back, ${user.name}!`);
        syncCustomerAuthUI();
        toggleCustomerAuthModal();
    } else {
        if (password.length >= 4) {
            const tempName = email.split('@')[0];
            const cleanName = tempName.charAt(0).toUpperCase() + tempName.slice(1);
            const custData = { name: cleanName, email: email.toLowerCase(), address: 'Sourced Delivery address' };
            State.customerUser = custData;
            localStorage.setItem('epicurean_customer_user', JSON.stringify(custData));
            showToast(`Signed in as ${cleanName}!`);
            syncCustomerAuthUI();
            toggleCustomerAuthModal();
        } else {
            if (errorDiv) {
                errorDiv.innerText = 'Invalid credentials. Hint: Password should be at least 4 characters.';
                errorDiv.classList.remove('hidden');
            }
        }
    }
}

function executeCustomerSignup(event) {
    if (event) event.preventDefault();
    const name = document.getElementById('cust-signup-name').value.trim();
    const email = document.getElementById('cust-signup-email').value.trim().toLowerCase();
    const address = document.getElementById('cust-signup-address').value.trim();
    const errorDiv = document.getElementById('cust-signup-error');

    if (errorDiv) {
        errorDiv.classList.add('hidden');
        errorDiv.innerText = '';
    }

    if (!name || !email || !address) {
        if (errorDiv) {
            errorDiv.innerText = 'Please fill out all registration fields.';
            errorDiv.classList.remove('hidden');
        }
        return;
    }

    const custData = { name, email, address };
    State.customerUser = custData;
    localStorage.setItem('epicurean_customer_user', JSON.stringify(custData));
    showToast(`Account created! Welcome, ${name}.`);
    syncCustomerAuthUI();
    toggleCustomerAuthModal();
}

function executeCustomerSignout() {
    if (confirm('Are you sure you want to sign out from your account?')) {
        State.customerUser = null;
        localStorage.removeItem('epicurean_customer_user');
        showToast('Successfully signed out.');
        syncCustomerAuthUI();
        toggleCustomerAuthModal();
    }
}

// ----------------------------------------------------
// ADMIN CONSOLE VIEWS & TABS
// ----------------------------------------------------
let activeAdminTab = 'overview';



// Global script startup
window.addEventListener('DOMContentLoaded', async () => {
    await initLocalStorage();
    Router.init();
});

// Hero image parallax
window.addEventListener('scroll', () => {
    const parallax = document.getElementById('hero-parallax');
    if (parallax && typeof State !== 'undefined' && State.currentView === 'home') {
        let offset = window.pageYOffset;
        parallax.style.transform = `translateY(${offset * 0.3}px)`;
    }
});

// Sticky Header shrink
window.addEventListener('scroll', () => {
    const header = document.getElementById('customer-header');
    if (header) {
        if (window.scrollY > 40) {
            header.classList.add('shadow-md', 'h-16');
            header.classList.remove('h-20');
        } else {
            header.classList.remove('shadow-md', 'h-16');
            header.classList.add('h-20');
        }
    }
});
