# GRIND BYTE Backend API Documentation

A complete e-commerce backend for GRIND BYTE, a premium Kenyan streetwear platform built with Next.js, TypeScript, and PostgreSQL.

## 🏗️ Architecture

### Database (PostgreSQL)
- **Schema**: 13 tables with proper relationships, indexes, and constraints
- **Location**: `migrations/001_initial_schema.sql`
- Tables: users, categories, products, product_variants, product_images, addresses, carts, cart_items, orders, order_items, coupons, reviews, wishlists, newsletters

### Backend Structure

```
src/
├── lib/
│   ├── db.ts           # PostgreSQL connection pool & query helpers
│   ├── auth.ts         # NextAuth.js v5 configuration
│   ├── validations.ts  # Zod validation schemas
│   └── utils.ts        # Utility functions (formatting, pagination, calculations)
├── app/api/
│   ├── auth/
│   │   ├── register/   # POST - User registration
│   │   └── [...nextauth]/
│   ├── products/       # GET/POST/PUT/DELETE products
│   ├── cart/           # Cart management
│   ├── orders/         # Order CRUD
│   ├── users/          # User profile, addresses, wishlist
│   ├── admin/          # Dashboard, products, orders, customers, coupons
│   ├── reviews/        # Product reviews
│   ├── coupons/        # Coupon validation
│   └── newsletter/     # Newsletter subscriptions
└── middleware.ts       # Auth & route protection

migrations/
└── 001_initial_schema.sql  # Database schema
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install next-auth pg bcryptjs zod uuid
npm install -D @types/pg @types/node
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb grind_byte

# Run migrations
psql -U postgres -d grind_byte -f migrations/001_initial_schema.sql
```

### 3. Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/signin` - Login with credentials or OAuth
- `GET /api/auth/session` - Get current session

### Products
- `GET /api/products` - List products (with filtering & pagination)
  - Query params: `page`, `limit`, `category`, `size`, `color`, `price_min`, `price_max`, `search`, `sort`
- `GET /api/products/[slug]` - Get product details with variants, images, reviews
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/[id]` - Update product (admin only)
- `DELETE /api/products/[id]` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get current cart (guest or user)
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/[id]` - Update item quantity
- `DELETE /api/cart/items/[id]` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - List user's orders (paginated)
- `POST /api/orders` - Create order from cart
- `GET /api/orders/[orderNumber]` - Get order details
- `PUT /api/orders/[id]/status` - Update order status (admin only)

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - List user addresses
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/[id]` - Update address
- `DELETE /api/users/addresses/[id]` - Delete address
- `GET /api/users/wishlist` - Get wishlist items
- `POST /api/users/wishlist/[productId]` - Add to wishlist
- `DELETE /api/users/wishlist/[productId]` - Remove from wishlist

### Admin
- `GET /api/admin/dashboard` - Dashboard stats & charts
- `GET /api/admin/products` - List all products with stock
- `GET /api/admin/orders` - List all orders with filters
- `PUT /api/admin/orders/[id]` - Update order status
- `GET /api/admin/customers` - List customers with stats
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/coupons` - List coupons

### Other
- `POST /api/reviews` - Create product review
- `GET /api/reviews/[productId]` - Get approved reviews
- `POST /api/coupons/validate` - Validate coupon code
- `POST /api/newsletter` - Subscribe to newsletter

## 🔐 Authentication

Uses **NextAuth.js v5** with:
- **Credentials Provider**: Email + Password (bcrypt hashing)
- **Google OAuth**: Social login integration
- **JWT Strategy**: Stateless session management
- **Session**: 30-day expiration

## 📋 Request/Response Format

All endpoints follow this format:

```json
{
  "data": {},           // Response data
  "error": null,        // Error message if any
  "message": "...",     // Success/info message
  "pagination": {       // Optional for paginated endpoints
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

## 🛡️ Middleware & Protection

- Protected routes redirect to `/login`: `/account/*`, `/checkout/confirm`, `/admin/*`
- Admin routes check `user.role === 'admin'`
- Guest carts tracked via `session_id` cookie (httpOnly, 30-day expiry)
- Logged-in users redirected away from `/login`, `/register`

## 📊 Key Features

### Shopping
- Product filtering (category, price, size, color)
- Search functionality
- Guest & user carts with persistence
- Stock validation

### Orders
- Order creation from cart
- Multi-status workflow (pending → delivered)
- Order history tracking
- Admin order management

### Users
- Registration & OAuth login
- Profile management
- Multiple addresses with default handling
- Wishlist functionality
- Order history

### Admin
- Dashboard with KPIs (revenue, orders, customers)
- Low stock alerts
- Order management
- Customer analytics
- Coupon management

### Coupons & Discounts
- Percentage or fixed discounts
- Usage limits
- Expiration dates
- Minimum order amounts
- Maximum discount caps

## 🔌 Database Connection

Uses PostgreSQL connection pooling via `pg`:
- Max 20 connections
- 30s idle timeout
- 2s connection timeout
- Auto-logs queries > 1000ms

## ✅ Validation

All inputs validated with **Zod** schemas:
- `registerSchema`, `loginSchema`
- `productSchema`, `orderSchema`
- `addressSchema`, `couponSchema`, `reviewSchema`

## 🚨 Error Handling

Consistent error responses with:
- HTTP status codes (400, 401, 403, 404, 500)
- Error messages
- Validation error details

## 📝 Notes

1. **Images**: Product images stored in PostgreSQL, with Cloudinary support configured in env
2. **Payments**: M-Pesa integration ready (configure in .env.local)
3. **Email**: SMTP configured for notifications (configure in .env.local)
4. **Taxes**: 16% VAT rate (configurable in calculateCartTotals)
5. **Shipping**: Free shipping on orders ≥ 2500 KES

## 🤝 Contributing

Ensure:
- All routes have proper auth checks
- Zod validation on all inputs
- Proper error handling & logging
- Database indexes for performance

## 📄 License

All rights reserved © 2025 GRIND BYTE
