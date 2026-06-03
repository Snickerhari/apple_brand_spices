# Apple Brand – Database Schema & REST API Specifications

This document outlines the technical design specifications for the relational and non-relational database structures, together with the REST API specifications for the **Apple Brand Spices & Groceries** eCommerce platform.

---

## 💾 1. Relational Database Schema (MySQL / PostgreSQL)

Below is the DDL (Data Definition Language) SQL specification. It defines keys, relationships, constraints, and index structures.

### A. Users Table
Stores customer profiles and administrative credentials.
```sql
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
);
```

### B. Products Table
Stores catalog data points including Tamil translations, pack sizes, and organic certifications.
```sql
CREATE TABLE products (
    product_id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL,
    name_ta VARCHAR(150) CHARACTER SET utf8mb4 NOT NULL, -- UTF-8 support for Tamil characters
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(50) NOT NULL,
    stock INT NOT NULL CHECK (stock >= 0),
    pack_size VARCHAR(30) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    tag_label VARCHAR(30),
    origin VARCHAR(100),
    shelf_life VARCHAR(30),
    certification VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product_category (category)
);
```

### C. Orders Table
Stores transaction history logs.
```sql
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    shipping_address VARCHAR(255) NOT NULL,
    status ENUM('Processing', 'Delivered', 'Cancelled') DEFAULT 'Processing',
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    shipping_cost DECIMAL(10, 2) NOT NULL,
    grand_total DECIMAL(10, 2) NOT NULL,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_email (customer_email)
);
```

### D. Order Items Table
Joint table linking products to orders (Many-to-Many).
```sql
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE RESTRICT
);
```

---

## 🍃 2. Non-Relational Database Schema (MongoDB Mongoose models)

Below are the JavaScript Mongoose schemas for MongoDB databases.

### A. Product Schema
```javascript
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    nameEn: { type: String, required: true },
    nameTa: { type: String, required: true }, // Store raw Tamil unicode characters
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, min: 0 },
    packSize: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    tag: { type: String },
    origin: { type: String },
    shelfLife: { type: String },
    cert: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
```

### B. Order Schema
```javascript
const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerAddress: { type: String, required: true },
    products: [{
        id: { type: String, required: true },
        nameEn: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 }
    }],
    status: { type: String, enum: ['Processing', 'Delivered', 'Cancelled'], default: 'Processing' },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
```

---

## 📡 3. REST API Specifications

The following table summarizes all endpoints exposed by the Node.js Express server.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Public | Admin login authentication check |
| **GET** | `/api/products` | Public | List products (supports query parameters for `category` and `search`) |
| **POST** | `/api/products` | Admin | Upload a new product catalog specification |
| **PUT** | `/api/products/:id` | Admin | Update existing product details |
| **DELETE** | `/api/products/:id` | Admin | Delete a product from catalog lists |
| **GET** | `/api/orders` | Admin | Query full customer orders log |
| **POST** | `/api/orders` | Customer | Submit a cart transaction (decrements stock) |
| **PUT** | `/api/orders/:id/status` | Admin | Change the status state of an order |

### Sample Payloads

#### 1. Place Order Request (`POST /api/orders`)
**Body:**
```json
{
    "name": "Eleanor Kade",
    "email": "eleanor.kade@gmail.com",
    "address": "42 Pine Crest Ave, Chennai",
    "items": [
        { "productId": "prod-pepper", "quantity": 2 },
        { "productId": "prod-clove", "quantity": 1 }
    ]
}
```
**Response (201 Created):**
```json
{
    "status": "success",
    "order": {
        "id": "EP-7312",
        "customerName": "Eleanor Kade",
        "customerEmail": "eleanor.kade@gmail.com",
        "customerAddress": "42 Pine Crest Ave, Chennai",
        "customerInitials": "EK",
        "colorClass": "bg-secondary-container",
        "products": [
            { "id": "prod-pepper", "nameEn": "Black Pepper", "price": 185, "quantity": 2 },
            { "id": "prod-clove", "nameEn": "Whole Cloves", "price": 145, "quantity": 1 }
        ],
        "status": "Processing",
        "amount": 545.40,
        "date": "2026-05-29"
    }
}
```

#### 2. Update Order Status (`PUT /api/orders/:id/status`)
**Body:**
```json
{
    "status": "Delivered"
}
```
**Response (200 OK):**
```json
{
    "status": "success",
    "order": {
        "id": "EP-7312",
        "status": "Delivered",
        "amount": 545.40
    }
}
```
