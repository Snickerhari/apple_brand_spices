<?php
/**
 * APPLE BRAND – Premium Spices & Groceries
 * Backend API Server in PHP
 * Specifically configured for the Admin Website
 */

// Enable CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------
// DATABASE FILES SETUP & PERSISTENCE HELPERS
// ----------------------------------------------------
define('PRODUCTS_FILE', __DIR__ . '/products.json');
define('ORDERS_FILE', __DIR__ . '/orders.json');
define('ADMINS_FILE', __DIR__ . '/admins.json');

// Get all request headers (robust fallback for CGI/FPM)
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

// Data loaders and savers
function loadData($filePath, $defaults = []) {
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        $decoded = json_decode($content, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }
    }
    return $defaults;
}

function saveData($filePath, $data) {
    file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// ----------------------------------------------------
// DATABASE SEED DATA
// ----------------------------------------------------
$SEED_PRODUCTS = [
    [
        'id' => 'prod-pepper',
        'nameEn' => 'Black Pepper',
        'nameTa' => 'Milagu (மிளகு)',
        'price' => 185,
        'category' => 'Spices',
        'stock' => 35,
        'packSize' => '100g Pack',
        'description' => 'Sun-ripened, hand-picked black peppercorns from Kodaikanal hills.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHVqvUx6NKL_q2mKS-kUutnxGPJIZXitcchjNQjWB0niSIWmNDAblnNqovstzssRGad8wDfy362--nTbjgCBnSazOkMdoUGvBtW9Azj6o1E2mXo79ucKLnYgWwAPZtftneoLYl43QBS3EIvh7Vz7Tibrd-s1GnmdWlE0Bdfw1NLnIO4CHm-h-jNPWYigv_0uViC-YufF2E1lE5J9H3xeX5dsCV0xbHso_X-ejhlRoWUXKH-Irgbf2Nye0LFopOoQPeJ-K0Ylug-T8',
        'tag' => 'Organic',
        'origin' => 'Kodaikanal, Tamil Nadu',
        'shelfLife' => '12 Months',
        'cert' => 'USDA Organic'
    ],
    [
        'id' => 'prod-jeera',
        'nameEn' => 'Cumin Seeds (Jeera)',
        'nameTa' => 'Seeragam (சீரகம்)',
        'price' => 120,
        'category' => 'Spices',
        'stock' => 42,
        'packSize' => '100g Pack',
        'description' => 'Highly aromatic, select-grade cumin seeds sourced from dry regions.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKWso_qwL7XC4Oupkevz4uL9-0sIkw7o85768zlDVCYF8IjTiVKZjcJjqQpSj2FLzKIEwEA-_qWiarCIcmdDpOgVSxU7reBWe0d0m2fnAr8tZdvjZV-p9YLs1IqAXZIOuIwHzUG2wSVrgi3UrywhT3VX9lyBqQP1JbkmFS0KTfAh2MMvGRQCQW9Zbkj38Quvmv_Wfakm39F0r7QelPBEVM3yYWm2lPw2VQ2H_2siOiFVQp-78V6Iq0wf8ZxruP_ONCMGS-NqW0ex8',
        'tag' => 'Premium',
        'origin' => 'Jodhpur, Rajasthan',
        'shelfLife' => '12 Months',
        'cert' => 'Agmark Spec'
    ],
    [
        'id' => 'prod-clove',
        'nameEn' => 'Whole Cloves',
        'nameTa' => 'Kirambu (கிராம்பு)',
        'price' => 145,
        'category' => 'Spices',
        'stock' => 18,
        'packSize' => '50g Pack',
        'description' => 'Fully grown clove buds, dried to perfection, rich in essential oils.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAlNkHC3nXEzfwn7MVFKmEfEpaJXIhS-Qiw2qtZsWQQpbHzUGec_ppB8xB8mYxKMrWXByOxQRoH6ZTOdRFR9XiIaO8BYtTVUm1VlcHgNyGU79Y_f7v3MpFcx9JLLN27W0OrVCLGhveZwmy7i1dwA5U0pFCJiERDaKlnVCo1ObROqN1g_HtJr6x60h3p0gsZZAsBKkhtSZhIXRZ0q0eLheQEst9ZEW9cHu_dDQ7XqEPMOKpOVK0IAIKeWlrUQXbpIIu33AlCcUP78Zk',
        'tag' => 'Hand-picked',
        'origin' => 'Nagercoil, Tamil Nadu',
        'shelfLife' => '18 Months',
        'cert' => '100% Purity Certified'
    ],
    [
        'id' => 'prod-cardamom',
        'nameEn' => 'Green Cardamom',
        'nameTa' => 'Elakkai (ஏலக்காய்)',
        'price' => 210,
        'category' => 'Spices',
        'stock' => 8,
        'packSize' => '50g Pack',
        'description' => 'Gourmet green cardamom pods sorted by hand, offering sweet floral notes.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuD26PK_pMMvE2aoXpxexL0iaHo36353GHd9He0cRypUr2a8RV1vhGlzzHiATyWMJ1JYjfpqAdNUuPX-9dCXPP3lcfsxoBKpFexUjxn7EcUYMiuvzE0J_TFjjZ4t6kI1N61HokzcQjF3hU3g1boJalgBKZGrFJfqpoBEJUFsL3he3PFzj6EMFkCkrA2dSvs2wKy79I8z5fah1GvwN78yVHWvLbVsUHUzJOIVWbOmP8dUvrXz7uP1bAYzOh_liYFN7GTKki_8R4eBIFU',
        'tag' => 'Limited',
        'origin' => 'Idukki Hills, Kerala',
        'shelfLife' => '12 Months',
        'cert' => 'Organic Certified'
    ],
    [
        'id' => 'prod-mustard',
        'nameEn' => 'Mustard Seeds',
        'nameTa' => 'Kadugu (கடுகு)',
        'price' => 65,
        'category' => 'Groceries',
        'stock' => 55,
        'packSize' => '100g Pack',
        'description' => 'Cleaned and graded black mustard seeds, essential for tampering.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_hQ9pChf0i0c8hnGmTNUFuBZA5F8zV6ben-EEw55jMldzKFznKYw2sh_cm5Bv0jfOC2M_gSp_jgYdFv-XClkcELPnpt7ZIY722V9tS755CXIwEQK2gjKYsgx2nlswGZb632qIBT397B23DOaDc1UrRrBpYXCAComnBPad7ZFyCmxLbNg7qoMw8Ogmjowk_uvqQAARZ6EAiYXpVTeppmsMcCAXnSbp6HSHOsuvolrBT18yV3Q8_at0QI9U0ZHli8Ez_WK6HDwLirU',
        'tag' => 'Essential',
        'origin' => 'Salem, Tamil Nadu',
        'shelfLife' => '12 Months',
        'cert' => 'Standard Grade'
    ],
    [
        'id' => 'prod-fenugreek',
        'nameEn' => 'Fenugreek Seeds',
        'nameTa' => 'Vendhayam (வெந்தயம்)',
        'price' => 75,
        'category' => 'Groceries',
        'stock' => 50,
        'packSize' => '100g Pack',
        'description' => 'Premium fenugreek seeds containing medicinal qualities.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCswKuIt5WpZ31Tuj0E24CDg83b2mmyAszZecsW4W5p35WYjEReDP0A5I5No11vSBjyiNXD1hlG5HVwIm8KcsqJeKMpouQNNpFDFY3TYJlaGpHcw_GEVcU9fTRWnvTVSZYhbJ3gbiXA8w3Y3EFw7zygdCB7VkzkC4HiDXPQeHnHF11jr-w_vBWcrVnO0JPZWeMIDP6E1LrO8TPR6zF2ebsLtZj0POw3zi-YqbUo6u6J1BDRnrqmF16mKe8kpza1DPm_7Jp89pIFggo',
        'tag' => 'Pure',
        'origin' => 'Coimbatore, Tamil Nadu',
        'shelfLife' => '12 Months',
        'cert' => 'ISO Certified'
    ],
    [
        'id' => 'prod-sesame',
        'nameEn' => 'Sesame Seeds',
        'nameTa' => 'Ellu (எள்)',
        'price' => 95,
        'category' => 'Groceries',
        'stock' => 30,
        'packSize' => '100g Pack',
        'description' => 'Cleaned black sesame seeds, rich in healthy oils, calcium, and nutty taste.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4ezBCJ8n9M6dV5NcTlkq805RtmGcgmneA8b9Jb9kCT0oGdmaolL_xOoGHGrSPhxCqATezY2YQBOye1MPEF_93aIqM-y7CRzAj8W016UIJwDD4UVoz87Zt34HDf2YOgedn0VzrTjba3u7WEy6CqO-nIp_dF7-rkoRcbgX6rUjuv-Fa4ii4WrJbsLDvGMPvq5d-sABgHkSX-jjoSyYSvuDQiTwCsm7KoryylMpnG3FcnL4rzt6MZ2YPomLLve7AJgIs7tReTUaVA8',
        'tag' => 'Organic',
        'origin' => 'Erode, Tamil Nadu',
        'shelfLife' => '12 Months',
        'cert' => 'USDA Organic'
    ],
    [
        'id' => 'prod-fennel',
        'nameEn' => 'Fennel Seeds',
        'nameTa' => 'Soambu (சோம்பு)',
        'price' => 80,
        'category' => 'Spices',
        'stock' => 3,
        'packSize' => '100g Pack',
        'description' => 'Sweet anise-flavored fennel seeds, perfect for digestives.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuCalfgzIqSas5TSYWXxYeEx6q4A5N-q4t7Dxs0J2YKXJ2K_w9NIwIY7siPZiTX8QVW3XMrzpTeKQgAKEBcqpWA-kBIAd1YlmfkSFLdiefEoEbkQ7cjADg-q6JfigRoXQIbjkEHBfSof5ZZ87-U1XBCqhkloP7QH87AZP-TrdE03YM6oSYv3kI9HG7RwgWR60BDRwZp_tNUO9IxRv-_OFVVcWey9FA3QcgvdqX9cEylKGCISqHX8wpQUVjbzJv9Rb5J-xnMT-8ZODmY',
        'tag' => 'Gourmet',
        'origin' => 'Palanpur, Gujarat',
        'shelfLife' => '12 Months',
        'cert' => 'Standard Grade'
    ],
    [
        'id' => 'prod-mixed-masala',
        'nameEn' => 'Mixed Masala Blend',
        'nameTa' => 'Kalavai Masala (கலவை மசாலா)',
        'price' => 240,
        'category' => 'Masalas',
        'stock' => 25,
        'packSize' => '200g Pack',
        'description' => 'Bespoke 12-spice recipe stone-ground slowly to retain oils.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7yiQW0odcDpJAHZim-0xR4azMQz48d-JgB3rcEcGix9Vdc4SOd1T3kRBpAfkc72n35G9ibrARM5Tnf0-2CxrwBC4egalkNbakHoeY56W_XTHbwSVpOdrRCcqRg_hAE_yiTx2zlTGRv6VmmKnm2x3ea7hTclwZTVa-lfujvuLjksyVHy9i3e0ucXUYDK50uDJVabY5jIBr4lJDFpyBCu4i6Hn7bVokeONmmYKynmxe6gq4Py9SePlz0rcjB3Q1czJz52SD2lDxSbU',
        'tag' => 'Bespoke',
        'origin' => 'Madurai Sourcing Plant',
        'shelfLife' => '6 Months',
        'cert' => 'Purity Approved'
    ],
    [
        'id' => 'prod-rbsoda',
        'nameEn' => 'Apple RB Soda',
        'nameTa' => 'RB Soda (ஆர்பி சோடா)',
        'price' => 45,
        'category' => 'Groceries',
        'stock' => 80,
        'packSize' => '250ml Bottle',
        'description' => 'Crisp carbonated soda water infused with mineral salts.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuAosUfYq7Xu84YU-6vvvWBGhUZ1HUZirSO9LSO83SHnPBe2KqPKB-dZROSye72QKtBYiZNZf381Zncxo5-ocMmWr9Fp8rPHR_eVH2NtW_5_wSYZdvNspCP99yvbvOH0rWd5BH0OzeO4psIgawbgq-La1O1mw6jkNJyIyp5UyZDaRJf2Yt-9NdhaEBSZCAF3tzUXjPQNqKj_fhyFvu9IuO79XSG8FHcKX86e1HLEjWKJCcPTIkD-LSgx7qlaV0YBast1apb-0LxwPSY',
        'tag' => 'New',
        'origin' => 'Tuticorin, Tamil Nadu',
        'shelfLife' => '6 Months',
        'cert' => 'Bottled Certified'
    ],
    [
        'id' => 'prod-mealmaker',
        'nameEn' => 'Premium Meal Maker Chunks',
        'nameTa' => 'Meal Maker (மீல் மேக்கர்)',
        'price' => 90,
        'category' => 'Groceries',
        'stock' => 45,
        'packSize' => '200g Pack',
        'description' => 'High-protein soya chunks serving as a rich vegetarian replacement.',
        'imageUrl' => 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvOmCvUf1731sjetAnQo8yu_z0ofhZiK-WDWA9-PWbKp8dnxrAjxGh2R9udE27OWds9f1R7WeWogigC1894cS3eopK7CoIkXG82Bp5qE1buJMimz2SLQ3s8mUEWbnI_RONyCqybd9oRDqxd1GpEog8MtyQ0bG_GqKmq-FSXACdZL6mntTQyW8QgYoe3OXeipjby1KzPwuS5ajFZCw1Ot3t_hzW2_fDoKIGW4iLI6-PZaTT4h2Tn5gwLFYm9Q-ffLUYC0xdxzcOXbA',
        'tag' => 'High Protein',
        'origin' => 'Indore, Madhya Pradesh',
        'shelfLife' => '9 Months',
        'cert' => 'FSSAI Approved'
    ]
];

$SEED_ORDERS = [
    [
        'id' => 'EP-4902',
        'customerName' => 'Eleanor Kade',
        'customerEmail' => 'eleanor.kade@gmail.com',
        'customerAddress' => '42 Pine Crest Ave, Chennai',
        'customerInitials' => 'EK',
        'colorClass' => 'bg-secondary-container',
        'products' => [
            ['id' => 'prod-clove', 'nameEn' => 'Whole Cloves', 'price' => 145, 'quantity' => 2],
            ['id' => 'prod-mixed-masala', 'nameEn' => 'Mixed Masala Blend', 'price' => 240, 'quantity' => 1]
        ],
        'status' => 'Processing',
        'amount' => 530.00,
        'date' => '2026-05-29'
    ],
    [
        'id' => 'EP-4901',
        'customerName' => 'Marcus Reid',
        'customerEmail' => 'marcus.reid@outlook.com',
        'customerAddress' => '88 OMR IT corridor, Chennai',
        'customerInitials' => 'MR',
        'colorClass' => 'bg-surface-container',
        'products' => [
            ['id' => 'prod-sesame', 'nameEn' => 'Sesame Seeds', 'price' => 95, 'quantity' => 3]
        ],
        'status' => 'Delivered',
        'amount' => 285.00,
        'date' => '2026-05-28'
    ],
    [
        'id' => 'EP-4900',
        'customerName' => 'Sarah Lind',
        'customerEmail' => 'sarah.lind@ymail.com',
        'customerAddress' => '55 MG Road, Chennai',
        'customerInitials' => 'SL',
        'colorClass' => 'bg-secondary-fixed-dim',
        'products' => [
            ['id' => 'prod-pepper', 'nameEn' => 'Black Pepper', 'price' => 185, 'quantity' => 1]
        ],
        'status' => 'Processing',
        'amount' => 185.00,
        'date' => '2026-05-29'
    ]
];

$SEED_ADMINS = [
    [
        'name' => 'Julian Thorne',
        'email' => 'julian.thorne@epicurean.com',
        'mobile' => '6382181561',
        'password' => 'applebrand123'
    ]
];

// Initialize SQLite database
$dbPath = __DIR__ . '/database.db';
try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // Create Tables
    $db->exec("CREATE TABLE IF NOT EXISTS admins (
        email TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        mobile TEXT NOT NULL,
        password TEXT NOT NULL
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS products (
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
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customerName TEXT NOT NULL,
        customerEmail TEXT NOT NULL,
        customerAddress TEXT NOT NULL,
        customerInitials TEXT,
        colorClass TEXT,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Processing'
    )");

    $db->exec("CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId TEXT NOT NULL,
        productId TEXT NOT NULL,
        nameEn TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
    )");

    // Run Auto-Migrations from JSON backups if DB tables are empty
    $stmt = $db->query("SELECT COUNT(*) as count FROM admins");
    if ($stmt->fetchColumn() == 0) {
        $admins = loadData(ADMINS_FILE, $SEED_ADMINS);
        $insertStmt = $db->prepare("INSERT OR IGNORE INTO admins (email, name, mobile, password) VALUES (?, ?, ?, ?)");
        foreach ($admins as $a) {
            $insertStmt->execute([$a['email'], $a['name'], $a['mobile'], $a['password']]);
        }
    }

    $stmt = $db->query("SELECT COUNT(*) as count FROM products");
    if ($stmt->fetchColumn() == 0) {
        $products = loadData(PRODUCTS_FILE, $SEED_PRODUCTS);
        $insertStmt = $db->prepare("INSERT OR IGNORE INTO products 
            (id, nameEn, nameTa, price, category, stock, packSize, description, imageUrl, tag, origin, shelfLife, cert) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        foreach ($products as $p) {
            $insertStmt->execute([
                $p['id'], $p['nameEn'], $p['nameTa'], $p['price'], $p['category'], $p['stock'], $p['packSize'],
                $p['description'], $p['imageUrl'], $p['tag'], $p['origin'], $p['shelfLife'], $p['cert']
            ]);
        }
    }

    $stmt = $db->query("SELECT COUNT(*) as count FROM orders");
    if ($stmt->fetchColumn() == 0) {
        $orders = loadData(ORDERS_FILE, $SEED_ORDERS);
        foreach ($orders as $o) {
            $insertOrderStmt = $db->prepare("INSERT OR IGNORE INTO orders (id, customerName, customerEmail, customerAddress, customerInitials, colorClass, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $insertOrderStmt->execute([
                $o['id'], $o['customerName'], $o['customerEmail'], $o['customerAddress'], $o['customerInitials'], $o['colorClass'], $o['amount'], $o['date'], $o['status']
            ]);
            $insertItemStmt = $db->prepare("INSERT INTO order_items (orderId, productId, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?)");
            foreach ($o['products'] as $item) {
                $insertItemStmt->execute([$o['id'], $item['id'], $item['nameEn'], $item['price'], $item['quantity']]);
            }
        }
    }
} catch (Throwable $e) {
    header("Content-Type: application/json");
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection or initialization failed: ' . $e->getMessage()]);
    exit;
}

// ----------------------------------------------------
// API HELPER FUNCTIONS
// ----------------------------------------------------
const ADMIN_TOKEN = 'auth-token-julian-thorne-998822';

function jsonResponse($data, $statusCode = 200) {
    header("Content-Type: application/json");
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function requireAdminAuth() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    if ($authHeader === 'Bearer ' . ADMIN_TOKEN) {
        return true;
    }
    
    jsonResponse([
        'status' => 'error',
        'message' => 'Unauthorized access. Valid administrator credentials required.'
    ], 401);
}

// ----------------------------------------------------
// REQUEST ROUTING
// ----------------------------------------------------
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper to serve files from folder
function serveFile($filePath) {
    if (!file_exists($filePath) || is_dir($filePath)) {
        header("HTTP/1.1 404 Not Found");
        echo "404 Not Found";
        exit;
    }

    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
    ];

    $contentType = isset($mimeTypes[$ext]) ? $mimeTypes[$ext] : 'application/octet-stream';
    header("Content-Type: $contentType");
    readfile($filePath);
    exit;
}

// ROOT REDIRECT TO CUSTOMER PORTAL
if ($uri === '/' || $uri === '') {
    header("Location: /customer/");
    exit;
}

// SERVE LOGO.JPG
if ($uri === '/logo.jpg') {
    serveFile(__DIR__ . '/logo.jpg');
}

// SERVE ADMIN PORTAL STATIC FILES
if (strpos($uri, '/admin') === 0) {
    $adminWebDir = __DIR__ . '/admin web';
    $relPath = substr($uri, 6); // remove "/admin"
    if (empty($relPath) || $relPath === '/') {
        serveFile($adminWebDir . '/index.html');
    }
    
    $targetFile = $adminWebDir . $relPath;
    if (file_exists($targetFile) && !is_dir($targetFile)) {
        serveFile($targetFile);
    }
    
    // Wildcard fallback inside /admin
    serveFile($adminWebDir . '/index.html');
}

// SERVE CUSTOMER PORTAL STATIC FILES
if (strpos($uri, '/customer') === 0) {
    $customerWebDir = __DIR__ . '/customer web';
    $relPath = substr($uri, 9); // remove "/customer"
    if (empty($relPath) || $relPath === '/') {
        serveFile($customerWebDir . '/index.html');
    }
    
    $targetFile = $customerWebDir . $relPath;
    if (file_exists($targetFile) && !is_dir($targetFile)) {
        serveFile($targetFile);
    }
    
    // Wildcard fallback inside /customer
    serveFile($customerWebDir . '/index.html');
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Admin Authenticator Login
if ($uri === '/api/auth/login' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $email = isset($body['email']) ? trim($body['email']) : '';
    $password = isset($body['password']) ? $body['password'] : '';
    
    if (empty($email) || empty($password)) {
        jsonResponse(['status' => 'error', 'message' => 'Email and password required.'], 400);
    }
    
    try {
        $stmt = $db->prepare("SELECT * FROM admins WHERE LOWER(email) = ? AND password = ?");
        $stmt->execute([strtolower($email), $password]);
        $admin = $stmt->fetch();
        if ($admin) {
            jsonResponse([
                'status' => 'success',
                'token' => ADMIN_TOKEN,
                'user' => [
                    'name' => $admin['name'],
                    'email' => $admin['email'],
                    'role' => 'admin'
                ]
            ]);
        }
        jsonResponse(['status' => 'error', 'message' => 'Invalid admin credentials.'], 401);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// Admin Account Registration (Sign Up)
if ($uri === '/api/auth/register' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $name = isset($body['name']) ? trim($body['name']) : '';
    $email = isset($body['email']) ? trim($body['email']) : '';
    $mobile = isset($body['mobile']) ? trim($body['mobile']) : '';
    $password = isset($body['password']) ? $body['password'] : '';
    
    if (empty($name) || empty($email) || empty($mobile) || empty($password)) {
        jsonResponse(['status' => 'error', 'message' => 'Missing required registration details.'], 400);
    }
    
    $cleanEmail = strtolower($email);
    $cleanMobile = preg_replace('/[^0-9+]/', '', $mobile);
    $strippedMobile = preg_replace('/[^0-9]/', '', $cleanMobile);
    
    try {
        $stmt = $db->prepare("SELECT email, mobile FROM admins WHERE LOWER(email) = ? OR mobile = ? OR REPLACE(mobile, '+', '') = ?");
        $stmt->execute([$cleanEmail, $cleanMobile, $strippedMobile]);
        $conflict = $stmt->fetch();
        if ($conflict) {
            jsonResponse(['status' => 'error', 'message' => 'An administrator account with this email or mobile number already exists.'], 400);
        }
        
        $stmt = $db->prepare("INSERT INTO admins (email, name, mobile, password) VALUES (?, ?, ?, ?)");
        $stmt->execute([$cleanEmail, trim($name), $cleanMobile, $password]);
        
        jsonResponse(['status' => 'success', 'message' => 'Administrator account registered successfully.'], 201);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// Admin Forgot Password Identity Check & OTP Simulation
if ($uri === '/api/auth/forgot-password' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $identity = isset($body['identity']) ? trim($body['identity']) : '';
    
    if (empty($identity)) {
        jsonResponse(['status' => 'error', 'message' => 'Identity contact specification required.'], 400);
    }
    
    $cleanIdentity = strtolower($identity);
    $strippedIdentity = preg_replace('/[^0-9]/', '', $cleanIdentity);
    
    try {
        $stmt = $db->prepare("SELECT * FROM admins WHERE LOWER(email) = ? OR mobile = ? OR '+91' || mobile = ? OR '+91 ' || mobile = ? OR REPLACE(mobile, '+', '') = ?");
        $stmt->execute([$cleanIdentity, $cleanIdentity, $cleanIdentity, $cleanIdentity, $strippedIdentity]);
        $admin = $stmt->fetch();
        
        if ($admin) {
            jsonResponse([
                'status' => 'success',
                'message' => 'Identity confirmed. A simulated verification OTP has been sent.',
                'otp' => '8822',
                'email' => $admin['email'],
                'password' => $admin['password']
            ]);
        }
        jsonResponse(['status' => 'error', 'message' => 'No registered admin account found with that email or mobile number.'], 404);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// GET: Serve local image from disk (cross-origin / file:// protocol helper)
if ($uri === '/api/local-image' && $method === 'GET') {
    $imgPath = isset($_GET['path']) ? trim($_GET['path']) : '';
    if (!empty($imgPath)) {
        if ((strpos($imgPath, '"') === 0 && substr($imgPath, -1) === '"') || 
            (strpos($imgPath, "'") === 0 && substr($imgPath, -1) === "'")) {
            $imgPath = trim(substr($imgPath, 1, -1));
        }
    }
    if (empty($imgPath)) {
        header("HTTP/1.1 400 Bad Request");
        echo "Path parameter required.";
        exit;
    }
    serveFile($imgPath);
}

// GET: List or Search products (Public for customer & admin)
if ($uri === '/api/products' && $method === 'GET') {
    $category = isset($_GET['category']) ? $_GET['category'] : '';
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    try {
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        if (!empty($category) && $category !== 'All') {
            $sql .= " AND LOWER(category) = ?";
            $params[] = strtolower($category);
        }
        if (!empty($search)) {
            $sql .= " AND (LOWER(nameEn) LIKE ? OR LOWER(nameTa) LIKE ? OR LOWER(description) LIKE ?)";
            $kw = "%" . strtolower($search) . "%";
            $params[] = $kw;
            $params[] = $kw;
            $params[] = $kw;
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();
        
        foreach ($products as &$p) {
            $p['price'] = floatval($p['price']);
            $p['stock'] = intval($p['stock']);
        }
        jsonResponse($products);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// POST: Add new product (Protected Admin)
if ($uri === '/api/products' && $method === 'POST') {
    requireAdminAuth();
    
    $body = json_decode(file_get_contents('php://input'), true);
    $nameEn = isset($body['nameEn']) ? trim($body['nameEn']) : '';
    $nameTa = isset($body['nameTa']) ? trim($body['nameTa']) : '';
    $price = isset($body['price']) ? floatval($body['price']) : 0;
    $stock = isset($body['stock']) ? intval($body['stock']) : 0;
    
    if (empty($nameEn) || empty($nameTa) || $price <= 0 || $stock < 0) {
        jsonResponse(['status' => 'error', 'message' => 'Missing required metadata specifications.'], 400);
    }
    
    $id = isset($body['id']) ? trim($body['id']) : '';
    if (empty($id)) {
        $cleanName = preg_replace('/[^a-z0-9]/', '-', strtolower($nameEn));
        $id = 'prod-' . $cleanName . '-' . rand(100, 999);
    }
    
    $category = isset($body['category']) ? $body['category'] : 'Spices';
    $packSize = isset($body['packSize']) ? $body['packSize'] : '100g Pack';
    $description = isset($body['description']) ? $body['description'] : 'Premium organic grocery crop sorted by Apple Brand quality controls.';
    $imageUrl = isset($body['imageUrl']) ? $body['imageUrl'] : 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaEafKnt91K5wJVsNvGevC6iY_SmibZaRkH1NJrfin_wIO6vxiimdJR4SBHGwPjCtEq_R5t1gmENUT1Ocx1RPxmFUR_tTj9qG5kaQb8iZ0OcUMWgZQJIshuvAJcv1Yx9RoQaYQMq9qGvNNRPz6_FtzmcrRxsHkmAUGbJaWTmrzWpJ1hS9LqnCYJHkdl_hyNE64WADkwGV9eYJaMYOPOqdK0TWJjruOT-WbsRkA3T7S_1-9Ie9oiVcRb48xXS3UzScFoKsVvCmH7Oc';
    $tag = isset($body['tag']) ? $body['tag'] : 'New';
    $origin = isset($body['origin']) ? $body['origin'] : 'Sourced Estate';
    $shelfLife = isset($body['shelfLife']) ? $body['shelfLife'] : '12 Months';
    $cert = isset($body['cert']) ? $body['cert'] : 'Apple Grade Approved';
    
    try {
        $stmt = $db->prepare("INSERT INTO products 
            (id, nameEn, nameTa, price, category, stock, packSize, description, imageUrl, tag, origin, shelfLife, cert) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $id, $nameEn, $nameTa, $price, $category, $stock, $packSize, $description, $imageUrl, $tag, $origin, $shelfLife, $cert
        ]);
        
        jsonResponse([
            'status' => 'success', 
            'product' => [
                'id' => $id, 'nameEn' => $nameEn, 'nameTa' => $nameTa, 'price' => $price, 'category' => $category, 
                'stock' => $stock, 'packSize' => $packSize, 'description' => $description, 'imageUrl' => $imageUrl, 
                'tag' => $tag, 'origin' => $origin, 'shelfLife' => $shelfLife, 'cert' => $cert
            ]
        ], 201);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// PUT: Modify product (Protected Admin)
if (preg_match('#^/api/products/([^/]+)$#', $uri, $matches) && $method === 'PUT') {
    requireAdminAuth();
    $productId = $matches[1];
    $body = json_decode(file_get_contents('php://input'), true);
    
    try {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([productId]);
        $p = $stmt->fetch();
        
        if (!$p) {
            jsonResponse(['status' => 'error', 'message' => 'Product not found.'], 404);
        }
        
        $nameEn = isset($body['nameEn']) ? $body['nameEn'] : $p['nameEn'];
        $nameTa = isset($body['nameTa']) ? $body['nameTa'] : $p['nameTa'];
        $price = isset($body['price']) ? floatval($body['price']) : floatval($p['price']);
        $category = isset($body['category']) ? $body['category'] : $p['category'];
        $stock = isset($body['stock']) ? intval($body['stock']) : intval($p['stock']);
        $packSize = isset($body['packSize']) ? $body['packSize'] : $p['packSize'];
        $description = isset($body['description']) ? $body['description'] : $p['description'];
        $imageUrl = isset($body['imageUrl']) ? $body['imageUrl'] : $p['imageUrl'];
        $tag = isset($body['tag']) ? $body['tag'] : $p['tag'];
        $origin = isset($body['origin']) ? $body['origin'] : $p['origin'];
        $shelfLife = isset($body['shelfLife']) ? $body['shelfLife'] : $p['shelfLife'];
        $cert = isset($body['cert']) ? $body['cert'] : $p['cert'];
        
        $stmt = $db->prepare("UPDATE products SET 
            nameEn = ?, nameTa = ?, price = ?, category = ?, stock = ?, packSize = ?, 
            description = ?, imageUrl = ?, tag = ?, origin = ?, shelfLife = ?, cert = ? 
            WHERE id = ?");
        $stmt->execute([
            $nameEn, $nameTa, $price, $category, $stock, $packSize, $description, $imageUrl, $tag, $origin, $shelfLife, $cert, $productId
        ]);
        
        jsonResponse([
            'status' => 'success', 
            'product' => [
                'id' => $productId, 'nameEn' => $nameEn, 'nameTa' => $nameTa, 'price' => $price, 'category' => $category, 
                'stock' => $stock, 'packSize' => $packSize, 'description' => $description, 'imageUrl' => $imageUrl, 
                'tag' => $tag, 'origin' => $origin, 'shelfLife' => $shelfLife, 'cert' => $cert
            ]
        ]);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// DELETE: Delete product (Protected Admin)
if (preg_match('#^/api/products/([^/]+)$#', $uri, $matches) && $method === 'DELETE') {
    requireAdminAuth();
    $productId = $matches[1];
    
    try {
        $stmt = $db->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->execute([productId]);
        if (!$stmt->fetch()) {
            jsonResponse(['status' => 'error', 'message' => 'Product not found.'], 404);
        }
        
        $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([productId]);
        
        jsonResponse(['status' => 'success', 'message' => 'Product deleted successfully.']);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// GET: Query order list (Protected Admin)
if ($uri === '/api/orders' && $method === 'GET') {
    requireAdminAuth();
    try {
        $stmt = $db->query("SELECT * FROM orders ORDER BY date DESC, id DESC");
        $orders = $stmt->fetchAll();
        $ordersWithProducts = [];
        
        foreach ($orders as $o) {
            $itemStmt = $db->prepare("SELECT productId as id, nameEn, price, quantity FROM order_items WHERE orderId = ?");
            $itemStmt->execute([$o['id']]);
            $items = $itemStmt->fetchAll();
            
            foreach ($items as &$item) {
                $item['price'] = floatval($item['price']);
                $item['quantity'] = intval($item['quantity']);
            }
            
            $ordersWithProducts[] = [
                'id' => $o['id'],
                'customerName' => $o['customerName'],
                'customerEmail' => $o['customerEmail'],
                'customerAddress' => $o['customerAddress'],
                'customerInitials' => $o['customerInitials'],
                'colorClass' => $o['colorClass'],
                'amount' => floatval($o['amount']),
                'date' => $o['date'],
                'status' => $o['status'],
                'products' => $items
            ];
        }
        jsonResponse($ordersWithProducts);
    } catch (Throwable $e) {
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// POST: Create checkout order (Public for customer checkouts)
if ($uri === '/api/orders' && $method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    
    // Direct sync support (when body has id, customerName, products)
    if (isset($body['id']) && isset($body['customerName']) && isset($body['products'])) {
        try {
            $stmt = $db->prepare("SELECT id FROM orders WHERE id = ?");
            $stmt->execute([$body['id']]);
            $exists = $stmt->fetch();
            if (!$exists) {
                $db->beginTransaction();
                $stmt = $db->prepare("INSERT INTO orders (id, customerName, customerEmail, customerAddress, customerInitials, colorClass, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $body['id'], $body['customerName'], $body['customerEmail'], $body['customerAddress'],
                    $body['customerInitials'], $body['colorClass'], floatval($body['amount']), $body['date'], $body['status']
                ]);
                
                $itemStmt = $db->prepare("INSERT INTO order_items (orderId, productId, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?)");
                $prodStmt = $db->prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?");
                foreach ($body['products'] as $item) {
                    $itemStmt->execute([$body['id'], $item['id'], $item['nameEn'], floatval($item['price']), intval($item['quantity'])]);
                    $prodStmt->execute([intval($item['quantity']), $item['id']]);
                }
                $db->commit();
            }
            jsonResponse(['status' => 'success', 'order' => $body], 201);
        } catch (Exception $e) {
            if ($db->inTransaction()) $db->rollBack();
            jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
    
    // Standard Checkout Flow
    $name = isset($body['name']) ? trim($body['name']) : '';
    $email = isset($body['email']) ? trim($body['email']) : '';
    $address = isset($body['address']) ? trim($body['address']) : '';
    $items = isset($body['items']) ? $body['items'] : [];
    
    if (empty($name) || empty($email) || empty($address) || empty($items)) {
        jsonResponse(['status' => 'error', 'message' => 'Missing transaction billing details.'], 400);
    }
    
    try {
        $db->beginTransaction();
        $subtotal = 0;
        $purchased = [];
        
        $prodCheckStmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $prodStockStmt = $db->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        
        foreach ($items as $item) {
            $productId = $item['productId'];
            $qty = intval($item['quantity']);
            
            $prodCheckStmt->execute([$productId]);
            $product = $prodCheckStmt->fetch();
            
            if (!$product) {
                if ($db->inTransaction()) $db->rollBack();
                jsonResponse(['status' => 'error', 'message' => "Product $productId not found."], 404);
            }
            
            if ($product['stock'] < $qty) {
                if ($db->inTransaction()) $db->rollBack();
                jsonResponse(['status' => 'error', 'message' => "Insufficient stock on " . $product['nameEn']], 400);
            }
            
            $prodStockStmt->execute([$qty, $productId]);
            $subtotal += $product['price'] * $qty;
            $purchased[] = [
                'id' => $product['id'],
                'nameEn' => $product['nameEn'],
                'price' => floatval($product['price']),
                'quantity' => $qty
            ];
        }
        
        $shipping = 15.00;
        $tax = $subtotal * 0.08;
        $total = $subtotal + $shipping + $tax;
        
        $newOrderId = 'EP-' . rand(1000, 9990);
        
        $nameParts = explode(' ', $name);
        $initials = '';
        foreach ($nameParts as $part) {
            if (!empty($part)) {
                $initials .= strtoupper($part[0]);
            }
        }
        $initials = substr($initials, 0, 2);
        $dateStr = date('Y-m-d');
        
        $orderStmt = $db->prepare("INSERT INTO orders (id, customerName, customerEmail, customerAddress, customerInitials, colorClass, amount, date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $orderStmt->execute([
            $newOrderId, $name, $email, $address, $initials, 'bg-secondary-container', round($total, 2), $dateStr, 'Processing'
        ]);
        
        $itemStmt = $db->prepare("INSERT INTO order_items (orderId, productId, nameEn, price, quantity) VALUES (?, ?, ?, ?, ?)");
        foreach ($purchased as $item) {
            $itemStmt->execute([$newOrderId, $item['id'], $item['nameEn'], $item['price'], $item['quantity']]);
        }
        
        $db->commit();
        
        jsonResponse([
            'status' => 'success',
            'order' => [
                'id' => $newOrderId,
                'customerName' => $name,
                'customerEmail' => $email,
                'customerAddress' => $address,
                'customerInitials' => $initials,
                'colorClass' => 'bg-secondary-container',
                'products' => $purchased,
                'status' => 'Processing',
                'amount' => round($total, 2),
                'date' => $dateStr
            ]
        ], 201);
        
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// PUT: Modify order status (Protected Admin)
if (preg_match('#^/api/orders/([^/]+)/status$#', $uri, $matches) && $method === 'PUT') {
    requireAdminAuth();
    $orderId = $matches[1];
    $body = json_decode(file_get_contents('php://input'), true);
    $status = isset($body['status']) ? trim($body['status']) : '';
    
    if (empty($status)) {
        jsonResponse(['status' => 'error', 'message' => 'Status code missing.'], 400);
    }
    
    try {
        $stmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        if (!$order) {
            jsonResponse(['status' => 'error', 'message' => 'Order not found.'], 404);
        }
        
        if ($status === $order['status']) {
            jsonResponse(['status' => 'success', 'order' => $order]);
        }
        
        $db->beginTransaction();
        
        // Get items
        $itemStmt = $db->prepare("SELECT productId as id, quantity FROM order_items WHERE orderId = ?");
        $itemStmt->execute([$orderId]);
        $items = $itemStmt->fetchAll();
        
        if ($status === 'Cancelled' && $order['status'] !== 'Cancelled') {
            $prodStockStmt = $db->prepare("UPDATE products SET stock = stock + ? WHERE id = ?");
            foreach ($items as $item) {
                $prodStockStmt->execute([$item['quantity'], $item['id']]);
            }
        } elseif ($order['status'] === 'Cancelled' && $status !== 'Cancelled') {
            $prodStockStmt = $db->prepare("UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?");
            foreach ($items as $item) {
                $prodStockStmt->execute([$item['quantity'], $item['id']]);
            }
        }
        
        $updateOrderStmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $updateOrderStmt->execute([$status, $orderId]);
        
        $db->commit();
        
        $order['status'] = $status;
        jsonResponse(['status' => 'success', 'order' => $order]);
    } catch (Exception $e) {
        if ($db->inTransaction()) $db->rollBack();
        jsonResponse(['status' => 'error', 'message' => $e->getMessage()], 500);
    }
}

// 404 Default Response for API
header("HTTP/1.1 404 Not Found");
jsonResponse(['status' => 'error', 'message' => 'Endpoint or resource not found.']);
