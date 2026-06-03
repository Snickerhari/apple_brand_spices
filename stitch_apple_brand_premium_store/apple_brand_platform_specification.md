# Apple Brand eCommerce Platform - Product & Tech Spec

## Product Catalog (Based on PDF)
- **Categories**: Spices, Masalas, Soda Products, Meal Makers, Groceries.
- **Key Products**: Pepper, Jeera, Clove, Cardamom, Mustard, Fenugreek, Sesame, Fennel, Mixed Masalas.
- **Data Points**: Product Name (English + Tamil), MRP, Pack Size, Apple Brand Packaging.

## Tech Stack & Architecture
- **Frontend**: HTML5, CSS3, JavaScript (React-style UI components).
- **Backend API Structure**: 
    - `/api/products`: GET (list/filter), POST (admin), PUT/DELETE.
    - `/api/auth`: Login/Register (Customer/Admin).
    - `/api/orders`: Create, Track, Manage.
- **Database Schema (MongoDB/MySQL)**:
    - `User`: id, name, email, password, role (admin/customer).
    - `Product`: id, name_en, name_ta, price, category, stock, image_url, pack_size.
    - `Order`: id, user_id, products[], total, status, timestamp.

## User Journeys
- **Customer**: Home -> Category -> Product Detail -> Cart -> Checkout.
- **Admin**: Dashboard -> Inventory Management -> Order Tracking -> Analytics.