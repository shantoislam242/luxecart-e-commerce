# LuxeCart E-Commerce

A full-stack e-commerce platform built with React, Express, and SQLite.

## Features

- **Authentication**: JWT-based secure login and registration.
- **Product Management**: Browse, search, and filter products by category.
- **Shopping Cart**: Real-time cart updates and persistent storage.
- **Checkout**: Multi-step checkout flow with Stripe integration.
- **Admin Dashboard**: Manage products, view orders, and track revenue.
- **Responsive Design**: Mobile-first UI using Tailwind CSS and Framer Motion.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, JWT, Bcrypt.
- **Database**: SQLite (via better-sqlite3) for local development.
- **Payments**: Stripe API.

## Installation

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Set up environment variables in `.env`.
4. Start the development server: `npm run dev`.

## API Documentation

- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Authenticate user and get token.
- `GET /api/products`: Get all products (supports `keyword` and `category` filters).
- `GET /api/products/:id`: Get single product details.
- `POST /api/orders`: Create a new order (Protected).
- `GET /api/orders/myorders`: Get current user's orders (Protected).
- `GET /api/orders`: Get all orders (Admin only).
