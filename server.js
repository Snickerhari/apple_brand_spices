/**
 * APPLE BRAND – Premium Spices & Groceries
 * Backend API Server (Node.js + Express)
 * Portals Architecture: /customer & /admin
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// File paths for persistence database (and migration backup loading)
const PRODUCTS_FILE = path.join(__dirname, 'products.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const ADMINS_FILE = path.join(__dirname, 'admins.json');

const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Promise helpers for SQLite
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

// Helper to load files (used only for initial migration)
function loadJSONFile(filePath, defaults) {
    try {
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return defaults;
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ----------------------------------------------------
// DATABASE SEED DATA
// ----------------------------------------------------
const SEED_PRODUCTS = [
    { id: 'prod-pepper', nameEn: 'Black Pepper', nameTa: 'Milagu (மிளகு)', price: 185, category: 'Spices', stock: 35, packSize: '100g Pack', description: 'Sun-ripened, hand-picked black peppercorns from Kodaikanal hills.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHVqvUx6NKL_q2mKS-kUutnxGPJIZXitcchjNQjWB0niSIWmNDAblnNqovstzssRGad8wDfy362--nTbjgCBnSazOkMdoUGvBtW9Azj6o1E2mXo79ucKLnYgWwAPZtftneoLYl43QBS3EIvh7Vz7Tibrd-s1GnmdWlE0Bdfw1NLnIO4CHm-h-jNPWYigv_0uViC-YufF2E1lE5J9H3xeX5dsCV0xbHso_X-ejhlRoWUXKH-Irgbf2Nye0LFopOoQPeJ-K0Ylug-T8', tag: 'Organic', origin: 'Kodaikanal, Tamil Nadu', shelfLife: '12 Months', cert: 'USDA Organic' },
    { id: 'prod-jeera', nameEn: 'Cumin Seeds (Jeera)', nameTa: 'Seeragam (சீரகம்)', price: 120, category: 'Spices', stock: 42, packSize: '100g Pack', description: 'Highly aromatic, select-grade cumin seeds sourced from dry regions.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKWso_qwL7XC4Oupkevz4uL9-0sIkw7o85768zlDVCYF8IjTiVKZjcJjqQpSj2FLzKIEwEA-_qWiarCIcmdDpOgVSxU7reBWe0d0m2fnAr8tZdvjZV-p9YLs1IqAXZIOuIwHzUG2wSVrgi3UrywhT3VX9lyBqQP1JbkmFS0KTfAh2MMvGRQCQW9Zbkj38Quvmv_Wfakm39F0r7QelPBEVM3yYWm2lPw2VQ2H_2siOiFVQp-78V6Iq0wf8ZxruP_ONCMGS-NqW0ex8', tag: 'Premium', origin: 'Jodhpur, Rajasthan', shelfLife: '12 Months', cert: 'Agmark Spec' },
    { id: 'prod-clove', nameEn: 'Whole Cloves', nameTa: 'Kirambu (கிராம்பு)', price: 145, category: 'Spices', stock: 18, packSize: '50g Pack', description: 'Fully grown clove buds, dried to perfection, rich in essential oils.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlNkHC3nXEzfwn7MVFKmEfEpaJXIhS-Qiw2qtZsWQQpbHzUGec_ppB8xB8mYxKMrWXByOxQRoH6ZTOdRFR9XiIaO8BYtTVUm1VlcHgNyGU79Y_f7v3MpFcx9JLLN27W0OrVCLGhveZwmy7i1dwA5U0pFCJiERDaKlnVCo1ObROqN1g_HtJr6x60h3p0gsZZAsBKkhtSZhIXRZ0q0eLheQEst9ZEW9cHu_dDQ7XqEPMOKpOVK0IAIKeWlrUQXbpIIu33AlCcUP78Zk', tag: 'Hand-picked', origin: 'Nagercoil, Tamil Nadu', shelfLife: '18 Months', cert: '100% Purity Certified' },
    { id: 'prod-cardamom', nameEn: 'Green Cardamom', nameTa: 'Elakkai (ஏலக்காய்)', price: 210, category: 'Spices', stock: 8, packSize: '50g Pack', description: 'Gourmet green cardamom pods sorted by hand, offering sweet floral notes.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD26PK_pMMvE2aoXpxexL0iaHo36353GHd9He0cRypUr2a8RV1vhGlzzHiATyWMJ1JYjfpqAdNUuPX-9dCXPP3lcfsxoBKpFexUjxn7EcUYMiuvzE0J_TFjjZ4t6kI1N61HokzcQjF3hU3g1boJalgBKZGrFJfqpoBEJUFsL3he3PFzj6EMFkCkrA2dSvs2wKy79I8z5fah1GvwN78yVHWvLbVsUHUzJOIVWbOmP8dUvrXz7uP1bAYzOh_liYFN7GTKki_8R4eBIFU', tag: 'Limited', origin: 'Idukki Hills, Kerala', shelfLife: '12 Months', cert: 'Organic Certified' },
    { id: 'prod-mustard', nameEn: 'Mustard Seeds', nameTa: 'Kadugu (கடுகு)', price: 65, category: 'Groceries', stock: 55, packSize: '100g Pack', description: 'Cleaned and graded black mustard seeds, essential for tampering.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_hQ9pChf0i0c8hnGmTNUFuBZA5F8zV6ben-EEw55jMldzKFznKYw2sh_cm5Bv0jfOC2M_gSp_jgYdFv-XClkcELPnpt7ZIY722V9tS755CXIwEQK2gjKYsgx2nlswGZb632qIBT397B23DOaDc1UrRrBpYXCAComnBPad7ZFyCmxLbNg7qoMw8Ogmjowk_uvqQAARZ6EAiYXpVTeppmsMcCAXnSbp6HSHOsuvolrBT18yV3Q8_at0QI9U0ZHli8Ez_WK6HDwLirU', tag: 'Essential', origin: 'Salem, Tamil Nadu', shelfLife: '12 Months', cert: 'Standard Grade' },
    { id: 'prod-fenugreek', nameEn: 'Fenugreek Seeds', nameTa: 'Vendhayam (வெந்தயம்)', price: 75, category: 'Groceries', stock: 50, packSize: '100g Pack', description: 'Premium fenugreek seeds containing medicinal qualities.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCswKuIt5WpZ31Tuj0E24CDg83b2mmyAszZecsW4W5p35WYjEReDP0A5I5No11vSBjyiNXD1hlG5HVwIm8KcsqJeKMpouQNNpFDFY3TYJlaGpHcw_GEVcU9fTRWnvTVSZYhbJ3gbiXA8w3Y3EFw7zygdCB7VkzkC4HiDXPQeHnHF11jr-w_vBWcrVnO0JPZWeMIDP6E1LrO8TPR6zF2ebsLtZj0POw3zi-YqbUo6u6J1BDRnrqmF16mKe8kpza1DPm_7Jp89pIFggo', tag: 'Pure', origin: 'Coimbatore, Tamil Nadu', shelfLife: '12 Months', cert: 'ISO Certified' },
    { id: 'prod-sesame', nameEn: 'Sesame Seeds', nameTa: 'Ellu (எள்)', price: 95, category: 'Groceries', stock: 30, packSize: '100g Pack', description: 'Cleaned black sesame seeds, rich in healthy oils, calcium, and nutty taste.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4ezBCJ8n9M6dV5NcTlkq805RtmGcgmneA8b9Jb9kCT0oGdmaolL_xOoGHGrSPhxCqATezY2YQBOye1MPEF_93aIqM-y7CRzAj8W016UIJwDD4UVoz87Zt34HDf2YOgedn0VzrTjba3u7WEy6CqO-nIp_dF7-rkoRcbgX6rUjuv-Fa4ii4WrJbsLDvGMPvq5d-sABgHkSX-jjoSyYSvuDQiTwCsm7KoryylMpnG3FcnL4rzt6MZ2YPomLLve7AJgIs7tReTUaVA8', tag: 'Organic', origin: 'Erode, Tamil Nadu', shelfLife: '12 Months', cert: 'USDA Organic' },
    { id: 'prod-fennel', nameEn: 'Fennel Seeds', nameTa: 'Soambu (சோம்பு)', price: 80, category: 'Spices', stock: 3, packSize: '100g Pack', description: 'Sweet anise-flavored fennel seeds, perfect for digestives.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCalfgzIqSas5TSYWXxYeEx6q4A5N-q4t7Dxs0J2YKXJ2K_w9NIwIY7siPZiTX8QVW3XMrzpTeKQgAKEBcqpWA-kBIAd1YlmfkSFLdiefEoEbkQ7cjADg-q6JfigRoXQIbjkEHBfSof5ZZ87-U1XBCqhkloP7QH87AZP-TrdE03YM6oSYv3kI9HG7RwgWR60BDRwZp_tNUO9IxRv-_OFVVcWey9FA3QcgvdqX9cEylKGCISqHX8wpQUVjbzJv9Rb5J-xnMT-8ZODmY', tag: 'Gourmet', origin: 'Palanpur, Gujarat', shelfLife: '12 Months', cert: 'Standard Grade' },
    { id: 'prod-mixed-masala', nameEn: 'Mixed Masala Blend', nameTa: 'Kalavai Masala (கலவை மசாலா)', price: 240, category: 'Masalas', stock: 25, packSize: '200g Pack', description: 'Bespoke 12-spice recipe stone-ground slowly to retain oils.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7yiQW0odcDpJAHZim-0xR4azMQz48d-JgB3rcEcGix9Vdc4SOd1T3kRBpAfkc72n35G9ibrARM5Tnf0-2CxrwBC4egalkNbakHoeY56W_XTHbwSVpOdrRCcqRg_hAE_yiTx2zlTGRv6VmmKnm2x3ea7hTclwZTVa-lfujvuLjksyVHy9i3e0ucXUYDK50uDJVabY5jIBr4lJDFpyBCu4i6Hn7bVokeONmmYKynmxe6gq4Py9SePlz0rcjB3Q1czJz52SD2lDxSbU', tag: 'Bespoke', origin: 'Madurai Sourcing Plant', shelfLife: '6 Months', cert: 'Purity Approved' },
    { id: 'prod-rbsoda', nameEn: 'Apple RB Soda', nameTa: 'RB Soda (ஆர்பி சோடா)', price: 45, category: 'Groceries', stock: 80, packSize: '250ml Bottle', description: 'Crisp carbonated soda water infused with mineral salts.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAosUfYq7Xu84YU-6vvvWBGhUZ1HUZirSO9LSO83SHnPBe2KqPKB-dZROSye72QKtBYiZNZf381Zncxo5-ocMmWr9Fp8rPHR_eVH2NtW_5_wSYZdvNspCP99yvbvOH0rWd5BH0OzeO4psIgawbgq-La1O1mw6jkNJyIyp5UyZDaRJf2Yt-9NdhaEBSZCAF3tzUXjPQNqKj_fhyFvu9IuO79XSG8FHcKX86e1HLEjWKJCcPTIkD-LSgx7qlaV0YBast1apb-0LxwPSY', tag: 'New', origin: 'Tuticorin, Tamil Nadu', shelfLife: '6 Months', cert: 'Bottled Certified' },
    { id: 'prod-mealmaker', nameEn: 'Premium Meal Maker Chunks', nameTa: 'Meal Maker (மீல் மேக்கர்)', price: 90, category: 'Groceries', stock: 45, packSize: '200g Pack', description: 'High-protein soya chunks serving as a rich vegetarian replacement.', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvOmCvUf1731sjetAnQo8yu_z0ofhZiK-WDWA9-PWbKp8dnxrAjxGh2R9udE27OWds9f1R7WeWogigC1894cS3eopK7CoIkXG82Bp5qE1buJMimz2SLQ3s8mUEWbnI_RONyCqybd9oRDqxd1GpEog8MtyQ0bG_GqKmq-FSXACdZL6mntTQyW8QgYoe3OXeipjby1KzPwuS5ajFZCw1Ot3t_hzW2_fDoKIGW4iLI6-PZaTT4h2Tn5gwLFYm9Q-ffLUYC0xdxzcOXbA', tag: 'High Protein', origin: 'Indore, Madhya Pradesh', shelfLife: '9 Months', cert: 'FSSAI Approved' }
];

const SEED_ORDERS = [
    { id: 'EP-4902', customerName: 'Eleanor Kade', customerEmail: 'eleanor.kade@gmail.com', customerAddress: '42 Pine Crest Ave, Chennai', customerInitials: 'EK', colorClass: 'bg-secondary-container', products: [{ id: 'prod-clove', nameEn: 'Whole Cloves', price: 145, quantity: 2 }, { id: 'prod-mixed-masala', nameEn: 'Mixed Masala Blend', price: 240, quantity: 1 }], status: 'Processing', amount: 530.00, date: '2026-05-29' },
    { id: 'EP-4901', customerName: 'Marcus Reid', customerEmail: 'marcus.reid@outlook.com', customerAddress: '88 OMR IT corridor, Chennai', customerInitials: 'MR', colorClass: 'bg-surface-container', products: [{ id: 'prod-sesame', nameEn: 'Sesame Seeds', price: 95, quantity: 3 }], status: 'Delivered', amount: 285.00, date: '2026-05-28' },
    { id: 'EP-4900', customerName: 'Sarah Lind', customerEmail: 'sarah.lind@ymail.com', customerAddress: '55 MG Road, Chennai', customerInitials: 'SL', colorClass: 'bg-secondary-fixed-dim', products: [{ id: 'prod-pepper', nameEn: 'Black Pepper', price: 185, quantity: 1 }], status: 'Processing', amount: 185.00, date: '2026-05-29' }
];

const SEED_ADMINS = [
    { name: 'Julian Thorne', email: 'julian.thorne@epicurean.com', mobile: '6382181561', password: 'applebrand123' }
];

// Initialize database schema tables and migrate JSON data if tables are empty
db.serialize(() => {
    // 1. Admins Table
    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            email TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            mobile TEXT NOT NULL,
            password TEXT NOT NULL
        )
    `);

    // 2. Products Table
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            nameEn TEXT NOT NULL,
            nameTa TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT NOT NULL,
            stock INTEGER NOT NULL,
            packSize TEXT NOT NULL,
            description TEXT,
            imageUrl TEXT,
            tag TEXT,
            origin TEXT,
            shelfLife TEXT,
            cert TEXT
        )
    `);

    // 3. Orders Table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            customerName TEXT NOT NULL,
            customerEmail TEXT NOT NULL,
            customerAddress TEXT NOT NULL,
            customerInitials TEXT,
            colorClass TEXT,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Processing'
        )
    `);

    // 4. Order Items Table
    db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            orderId TEXT NOT NULL,
            productId TEXT NOT NULL,
            nameEn TEXT NOT NULL,
            price REAL NOT NULL,
            quantity INTEGER NOT NULL,
            FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
        )
    `);

    // Run Auto-Migrations from JSON backups if DB tables are empty
    db.get("SELECT COUNT(*) as count FROM admins", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log("💾 SQLite: Migrating administrators from admins.json...");
            const admins = loadJSONFile(ADMINS_FILE, SEED_ADMINS);
            const stmt = db.prepare("INSERT OR IGNORE INTO admins (email, name, mobile, password) VALUES (?, ?, ?, ?)");
            admins.forEach(a => stmt.run(a.email, a.name, a.mobile, a.password));
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log("💾 SQLite: Migrating products from products.json...");
            const products = loadJSONFile(PRODUCTS_FILE, SEED_PRODUCTS);
            const stmt = db.prepare(`
                INSERT OR IGNORE INTO products 
                (id, nameEn, nameTa, price, category, stock, packSize, description, imageUrl, tag, origin, shelfLife, cert) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            products.forEach(p => stmt.run(
                p.id, p.nameEn, p.nameTa, p.price, p.category, p.stock, p.packSize,
                p.description, p.imageUrl, p.tag, p.origin, p.shelfLife, p.cert
            ));
            stmt.finalize();
        }
    });

    db.get("SELECT COUNT(*) as count FROM orders", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log("💾 SQLite: Migrating orders from orders.json...");
            const orders = loadJSONFile(ORDERS_FILE, SEED_ORDERS);
            orders.forEach(o => {
                db.run(
                    "INSERT OR IGNORE INTO orders (id, customerName, customerEmail, customerAddress, customerInitials, colorClass, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [o.id, o.customerName, o.customerEmail, o.customerAddress, o.customerInitials, o.colorClass, o.amount, o.date, o.status],
                    (err) => {
                        if (!err) {
                            const stmt = db.prepare("INSERT INTO order_items (orderId, productId, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?)");
                            o.products.forEach(p => stmt.run(o.id, p.id, p.nameEn, p.price, p.quantity));
                            stmt.finalize();
                        }
                    }
                );
            });
        }
    });
});

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
const ADMIN_TOKEN = 'auth-token-julian-thorne-998822';

function requireAdminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader === `Bearer ${ADMIN_TOKEN}`) {
        return next();
    }
    return res.status(401).json({ status: 'error', message: 'Unauthorized access. Valid administrator credentials required.' });
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Admin Authenticator Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email and password required.' });
    }
    try {
        const admin = await dbGet("SELECT * FROM admins WHERE LOWER(email) = ? AND password = ?", [email.trim().toLowerCase(), password]);
        if (admin) {
            return res.json({
                status: 'success',
                token: ADMIN_TOKEN,
                user: { name: admin.name, email: admin.email, role: 'admin' }
            });
        }
        return res.status(401).json({ status: 'error', message: 'Invalid admin credentials.' });
    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
});

// Admin Account Registration (Sign Up)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
        return res.status(400).json({ status: 'error', message: 'Missing required registration details.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobile.trim().replace(/[^0-9+]/g, '');

    try {
        const conflict = await dbGet(
            "SELECT email FROM admins WHERE LOWER(email) = ? OR mobile = ? OR REPLACE(mobile, '+', '') = ?", 
            [cleanEmail, cleanMobile, cleanMobile.replace('+', '')]
        );
        if (conflict) {
            return res.status(400).json({ status: 'error', message: 'An administrator account with this email or mobile number already exists.' });
        }

        await dbRun(
            "INSERT INTO admins (email, name, mobile, password) VALUES (?, ?, ?, ?)",
            [cleanEmail, name.trim(), cleanMobile, password]
        );
        return res.status(201).json({ status: 'success', message: 'Administrator account registered successfully.' });
    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
});

// GET: Retrieve admin profile details (Protected Admin)
app.get('/api/admin/profile', requireAdminAuth, async (req, res) => {
    const email = req.query.email;
    const name = req.query.name;
    if (!email && !name) {
        return res.status(400).json({ status: 'error', message: 'Email or name query parameter required.' });
    }
    try {
        let admin;
        if (email && email.trim() !== '') {
            admin = await dbGet("SELECT name, email, mobile FROM admins WHERE LOWER(email) = ?", [email.trim().toLowerCase()]);
        }
        if (!admin && name && name.trim() !== '') {
            admin = await dbGet("SELECT name, email, mobile FROM admins WHERE LOWER(name) = ?", [name.trim().toLowerCase()]);
        }
        if (admin) {
            return res.json({
                status: 'success',
                admin: {
                    name: admin.name,
                    email: admin.email,
                    mobile: admin.mobile,
                    role: 'Brand Admin'
                }
            });
        }
        return res.status(404).json({ status: 'error', message: 'Admin not found.' });
    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
});

// POST: Change admin password (Protected Admin)
app.post('/api/admin/change-password', requireAdminAuth, async (req, res) => {
    const { email, name, currentPassword, newPassword } = req.body;
    if ((!email && !name) || !currentPassword || !newPassword) {
        return res.status(400).json({ status: 'error', message: 'Missing required parameters.' });
    }
    try {
        let admin;
        if (email && email.trim() !== '') {
            admin = await dbGet("SELECT * FROM admins WHERE LOWER(email) = ?", [email.trim().toLowerCase()]);
        } else if (name && name.trim() !== '') {
            admin = await dbGet("SELECT * FROM admins WHERE LOWER(name) = ?", [name.trim().toLowerCase()]);
        }
        
        if (!admin) {
            return res.status(404).json({ status: 'error', message: 'Admin account not found.' });
        }
        
        if (admin.password !== currentPassword) {
            return res.status(400).json({ status: 'error', message: 'Incorrect current password.' });
        }
        
        await dbRun("UPDATE admins SET password = ? WHERE email = ?", [newPassword, admin.email]);
        return res.json({ status: 'success', message: 'Password updated successfully.' });
    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
});

// POST: Update admin profile details (Protected Admin)
app.post('/api/admin/update-profile', requireAdminAuth, async (req, res) => {
    const { oldEmail, oldName, newName, newEmail, newMobile } = req.body;
    if ((!oldEmail && !oldName) || !newEmail || !newMobile || !newName) {
        return res.status(400).json({ status: 'error', message: 'Missing parameters.' });
    }
    try {
        let admin;
        if (oldEmail && oldEmail.trim() !== '') {
            admin = await dbGet("SELECT * FROM admins WHERE LOWER(email) = ?", [oldEmail.trim().toLowerCase()]);
        } else if (oldName && oldName.trim() !== '') {
            admin = await dbGet("SELECT * FROM admins WHERE LOWER(name) = ?", [oldName.trim().toLowerCase()]);
        }
        
        if (!admin) {
            return res.status(404).json({ status: 'error', message: 'Admin account not found.' });
        }
        
        if (newEmail.trim().toLowerCase() !== admin.email.toLowerCase()) {
            const conflict = await dbGet("SELECT email FROM admins WHERE LOWER(email) = ?", [newEmail.trim().toLowerCase()]);
            if (conflict) {
                return res.status(400).json({ status: 'error', message: 'Email address is already in use by another administrator.' });
            }
        }
        
        await dbRun(
            "UPDATE admins SET name = ?, email = ?, mobile = ? WHERE email = ?",
            [newName.trim(), newEmail.trim().toLowerCase(), newMobile.trim().replace(/[^0-9+]/g, ''), admin.email]
        );
        return res.json({ status: 'success', message: 'Profile details updated successfully.' });
    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
});

// Admin Forgot Password Identity Check & OTP Simulation
app.post('/api/auth/forgot-password', async (req, res) => {
    const { identity } = req.body;
    if (!identity) {
        return res.status(400).json({ status: 'error', message: 'Identity contact specification required.' });
    }
    
    const cleanIdentity = identity.trim().toLowerCase();
    
    try {
        const admin = await dbGet(
            "SELECT * FROM admins WHERE LOWER(email) = ? OR mobile = ? OR '+91' || mobile = ? OR '+91 ' || mobile = ? OR REPLACE(mobile, '+', '') = ?",
            [cleanIdentity, cleanIdentity, cleanIdentity, cleanIdentity, cleanIdentity.replace('+', '')]
        );
        
        if (admin) {
            return res.json({
                status: 'success',
                message: 'Identity confirmed. A simulated verification OTP has been sent.',
                otp: '8822',
                email: admin.email,
                password: admin.password
            });
        }
        return res.status(404).json({ status: 'error', message: 'No registered admin account found with that email or mobile number.' });
    } catch (e) {
        return res.status(500).json({ status: 'error', message: e.message });
    }
});

// GET: Serve local image from disk (cross-origin / file:// protocol helper)
app.get('/api/local-image', (req, res) => {
    let imgPath = req.query.path;
    if (!imgPath) {
        return res.status(400).send('Path parameter required.');
    }
    imgPath = imgPath.trim();
    if ((imgPath.startsWith('"') && imgPath.endsWith('"')) || (imgPath.startsWith("'") && imgPath.endsWith("'"))) {
        imgPath = imgPath.substring(1, imgPath.length - 1).trim();
    }
    if (!fs.existsSync(imgPath)) {
        return res.status(404).send('Image file not found.');
    }
    res.sendFile(imgPath);
});

// GET: List or Search products (Public for customer & admin)
app.get('/api/products', async (req, res) => {
    const { category, search } = req.query;
    let sql = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category && category !== 'All') {
        sql += " AND LOWER(category) = ?";
        params.push(category.toLowerCase());
    }

    if (search) {
        sql += " AND (LOWER(nameEn) LIKE ? OR LOWER(nameTa) LIKE ? OR LOWER(description) LIKE ?)";
        const kw = `%${search.toLowerCase()}%`;
        params.push(kw, kw, kw);
    }

    try {
        const rows = await dbAll(sql, params);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// POST: Add new product (Protected Admin)
app.post('/api/products', requireAdminAuth, async (req, res) => {
    const { id, nameEn, nameTa, price, category, stock, packSize, description, imageUrl, tag, origin, shelfLife, cert } = req.body;
    if (!nameEn || !nameTa || !price || !stock) {
        return res.status(400).json({ status: 'error', message: 'Missing required metadata specifications.' });
    }

    const newId = id || `prod-${nameEn.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.floor(100 + Math.random() * 900)}`;
    const finalPrice = parseFloat(price);
    const finalStock = parseInt(stock);
    const finalCategory = category || 'Spices';
    const finalPackSize = packSize || '100g Pack';
    const finalDesc = description || 'Premium organic grocery crop sorted by Apple Brand quality controls.';
    const finalImageUrl = imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaEafKnt91K5wJVsNvGevC6iY_SmibZaRkH1NJrfin_wIO6vxiimdJR4SBHGwPjCtEq_R5t1gmENUT1Ocx1RPxmFUR_tTj9qG5kaQb8iZ0OcUMWgZQJIshuvAJcv1Yx9RoQaYQMq9qGvNNRPz6_FtzmcrRxsHkmAUGbJaWTmrzWpJ1hS9LqnCYJHkdl_hyNE64WADkwGV9eYJaMYOPOqdK0TWJjruOT-WbsRkA3T7S_1-9Ie9oiVcRb48xXS3UzScFoKsVvCmH7Oc';
    const finalTag = tag || 'New';
    const finalOrigin = origin || 'Sourced Estate';
    const finalShelfLife = shelfLife || '12 Months';
    const finalCert = cert || 'Apple Grade Approved';

    try {
        await dbRun(
            `INSERT INTO products 
            (id, nameEn, nameTa, price, category, stock, packSize, description, imageUrl, tag, origin, shelfLife, cert) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [newId, nameEn, nameTa, finalPrice, finalCategory, finalStock, finalPackSize, finalDesc, finalImageUrl, finalTag, finalOrigin, finalShelfLife, finalCert]
        );
        res.status(201).json({ 
            status: 'success', 
            product: { 
                id: newId, nameEn, nameTa, price: finalPrice, category: finalCategory, stock: finalStock, 
                packSize: finalPackSize, description: finalDesc, imageUrl: finalImageUrl, tag: finalTag, 
                origin: finalOrigin, shelfLife: finalShelfLife, cert: finalCert 
            } 
        });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// PUT: Modify product (Protected Admin)
app.put('/api/products/:id', requireAdminAuth, async (req, res) => {
    try {
        const product = await dbGet("SELECT * FROM products WHERE id = ?", [req.params.id]);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found.' });
        }

        const { nameEn, nameTa, price, category, stock, packSize, description, imageUrl, tag, origin, shelfLife, cert } = req.body;
        
        const finalNameEn = nameEn || product.nameEn;
        const finalNameTa = nameTa || product.nameTa;
        const finalPrice = price !== undefined ? parseFloat(price) : product.price;
        const finalCategory = category || product.category;
        const finalStock = stock !== undefined ? parseInt(stock) : product.stock;
        const finalPackSize = packSize || product.packSize;
        const finalDesc = description !== undefined ? description : product.description;
        const finalImageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
        const finalTag = tag !== undefined ? tag : product.tag;
        const finalOrigin = origin !== undefined ? origin : product.origin;
        const finalShelfLife = shelfLife !== undefined ? shelfLife : product.shelfLife;
        const finalCert = cert !== undefined ? cert : product.cert;

        await dbRun(
            `UPDATE products SET 
                nameEn = ?, nameTa = ?, price = ?, category = ?, stock = ?, packSize = ?, 
                description = ?, imageUrl = ?, tag = ?, origin = ?, shelfLife = ?, cert = ? 
             WHERE id = ?`,
            [finalNameEn, finalNameTa, finalPrice, finalCategory, finalStock, finalPackSize, finalDesc, finalImageUrl, finalTag, finalOrigin, finalShelfLife, finalCert, req.params.id]
        );

        res.json({ 
            status: 'success', 
            product: { 
                id: req.params.id, nameEn: finalNameEn, nameTa: finalNameTa, price: finalPrice, category: finalCategory, 
                stock: finalStock, packSize: finalPackSize, description: finalDesc, imageUrl: finalImageUrl, 
                tag: finalTag, origin: finalOrigin, shelfLife: finalShelfLife, cert: finalCert 
            } 
        });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// DELETE: Delete product (Protected Admin)
app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
    try {
        const product = await dbGet("SELECT id FROM products WHERE id = ?", [req.params.id]);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Product not found.' });
        }

        await dbRun("DELETE FROM products WHERE id = ?", [req.params.id]);
        res.json({ status: 'success', message: 'Product deleted successfully.' });
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// GET: Query order list (Protected Admin)
app.get('/api/orders', requireAdminAuth, async (req, res) => {
    try {
        const orders = await dbAll("SELECT * FROM orders ORDER BY date DESC, id DESC");
        const ordersWithProducts = [];
        
        for (const o of orders) {
            const items = await dbAll("SELECT productId as id, nameEn, price, quantity FROM order_items WHERE orderId = ?", [o.id]);
            ordersWithProducts.push({
                id: o.id,
                customerName: o.customerName,
                customerEmail: o.customerEmail,
                customerAddress: o.customerAddress,
                customerInitials: o.customerInitials,
                colorClass: o.colorClass,
                amount: o.amount,
                date: o.date,
                status: o.status,
                products: items
            });
        }
        res.json(ordersWithProducts);
    } catch (e) {
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// POST: Create checkout order (Public for customer checkouts)
app.post('/api/orders', async (req, res) => {
    // 1. Direct sync support
    if (req.body.id && req.body.customerName && req.body.products) {
        try {
            const orderExists = await dbGet("SELECT id FROM orders WHERE id = ?", [req.body.id]);
            if (!orderExists) {
                // Perform direct insert within transaction to ensure data integrity
                await dbRun("BEGIN TRANSACTION");
                
                await dbRun(
                    "INSERT INTO orders (id, customerName, customerEmail, customerAddress, customerInitials, colorClass, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [req.body.id, req.body.customerName, req.body.customerEmail, req.body.customerAddress, req.body.customerInitials, req.body.colorClass, req.body.amount, req.body.date, req.body.status]
                );

                for (const item of req.body.products) {
                    await dbRun(
                        "INSERT INTO order_items (orderId, productId, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?)",
                        [req.body.id, item.id, item.nameEn, item.price, item.quantity]
                    );
                    await dbRun(
                        "UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?",
                        [item.quantity, item.id]
                    );
                }

                await dbRun("COMMIT");
            }
            return res.status(201).json({ status: 'success', order: req.body });
        } catch (e) {
            await dbRun("ROLLBACK").catch(() => {});
            return res.status(500).json({ status: 'error', message: e.message });
        }
    }

    // 2. Standard Checkout Flow
    const { name, email, address, items } = req.body;
    if (!name || !email || !address || !items || !items.length) {
        return res.status(400).json({ status: 'error', message: 'Missing transaction billing details.' });
    }

    try {
        await dbRun("BEGIN TRANSACTION");

        let subtotal = 0;
        const purchased = [];

        for (const item of items) {
            const product = await dbGet("SELECT * FROM products WHERE id = ?", [item.productId]);
            if (!product) {
                await dbRun("ROLLBACK");
                return res.status(404).json({ status: 'error', message: `Product ${item.productId} not found.` });
            }
            if (product.stock < item.quantity) {
                await dbRun("ROLLBACK");
                return res.status(400).json({ status: 'error', message: `Insufficient stock on ${product.nameEn}.` });
            }

            await dbRun("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, product.id]);
            subtotal += product.price * item.quantity;
            purchased.push({
                id: product.id,
                nameEn: product.nameEn,
                price: product.price,
                quantity: item.quantity
            });
        }

        const shipping = 15.00;
        const tax = subtotal * 0.08;
        const total = subtotal + shipping + tax;

        const newOrderId = `EP-${Math.floor(1000 + Math.random() * 9000)}`;
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const dateStr = new Date().toISOString().split('T')[0];

        await dbRun(
            "INSERT INTO orders (id, customerName, customerEmail, customerAddress, customerInitials, colorClass, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [newOrderId, name, email, address, initials, 'bg-secondary-container', parseFloat(total.toFixed(2)), dateStr, 'Processing']
        );

        for (const item of purchased) {
            await dbRun(
                "INSERT INTO order_items (orderId, productId, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?)",
                [newOrderId, item.id, item.nameEn, item.price, item.quantity]
            );
        }

        await dbRun("COMMIT");

        res.status(201).json({
            status: 'success',
            order: {
                id: newOrderId,
                customerName: name,
                customerEmail: email,
                customerAddress: address,
                customerInitials: initials,
                colorClass: 'bg-secondary-container',
                products: purchased,
                status: 'Processing',
                amount: parseFloat(total.toFixed(2)),
                date: dateStr
            }
        });
    } catch (e) {
        await dbRun("ROLLBACK").catch(() => {});
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// PUT: Modify order status (Protected Admin)
app.put('/api/orders/:id/status', requireAdminAuth, async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ status: 'error', message: 'Status code missing.' });
    }

    try {
        const order = await dbGet("SELECT * FROM orders WHERE id = ?", [orderId]);
        if (!order) {
            return res.status(404).json({ status: 'error', message: 'Order not found.' });
        }

        if (status === order.status) {
            return res.json({ status: 'success', order });
        }

        await dbRun("BEGIN TRANSACTION");

        // Handle stock restores / deductions
        const items = await dbAll("SELECT productId as id, quantity FROM order_items WHERE orderId = ?", [orderId]);

        if (status === 'Cancelled' && order.status !== 'Cancelled') {
            for (const item of items) {
                await dbRun("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.id]);
            }
        } else if (order.status === 'Cancelled' && status !== 'Cancelled') {
            for (const item of items) {
                await dbRun("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?", [item.quantity, item.id]);
            }
        }

        await dbRun("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

        await dbRun("COMMIT");

        order.status = status;
        res.json({ status: 'success', order });
    } catch (e) {
        await dbRun("ROLLBACK").catch(() => {});
        res.status(500).json({ status: 'error', message: e.message });
    }
});

// ----------------------------------------------------
// PORTALS ROUTING & FALLBACKS
// ----------------------------------------------------

// Serve shared assets (like logo.jpg)
app.get('/logo.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'logo.jpg'));
});

// Serve Customer Portal static files with no-cache headers for HTML files
app.use('/customer', express.static(path.join(__dirname, 'customer web'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Serve Admin Portal static files with no-cache headers for HTML files
app.use('/admin', express.static(path.join(__dirname, 'admin web'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }
    }
}));

// Root redirect to customer portal
app.get('/', (req, res) => {
    res.redirect('/customer/');
});

// Fallback for customer routing (support hash routing / client loads)
app.get('/customer/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'customer web', 'index.html'));
});

// Fallback for admin routing
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin web', 'index.html'));
});

// Fallback all other wildcards to customer portal
app.get('*', (req, res) => {
    res.redirect('/customer/');
});

// Startup server listener
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🍎 Apple Brand Premium eCommerce Platform Active`);
    console.log(`📡 Server Address: http://localhost:${PORT}`);
    console.log(`💻 Customer Portal: http://localhost:${PORT}/customer/`);
    console.log(`🔧 Admin Portal: http://localhost:${PORT}/admin/`);
    console.log(`💾 Persisting data to: ${PRODUCTS_FILE}`);
    console.log(`====================================================`);
});
