# Inventory Management System

Full-stack Inventory Management System using MongoDB, Express, React, and Node.js.

## Features

- JWT authentication with role-based access (`admin`, `manager`, `staff`)
- Product CRUD with SKU/barcode support
- Inventory tracking with stock history
- Supplier management
- Purchase recording with automatic stock increment
- Sales recording with negative-stock prevention and concurrent update checks
- Dashboard metrics (products, categories, low-stock, revenue, inventory value)
- Notifications for low-stock/out-of-stock alerts
- Report endpoints with JSON, CSV, Excel, and PDF export
- Responsive frontend for desktop and mobile

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (Atlas or local)
- Auth: JWT + bcryptjs
- Reports: ExcelJS + PDFKit

## Project Structure

```text
.
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   ├── tests
│   ├── .env.example
│   └── package.json
├── frontend
│   ├── src
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docker-compose.yml
└── render.yaml
```

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/barcode/:barcode`

### Suppliers

- `GET /api/suppliers`
- `POST /api/suppliers`
- `GET /api/suppliers/:id`
- `PUT /api/suppliers/:id`
- `DELETE /api/suppliers/:id`

### Purchases and Sales

- `GET /api/purchases`
- `POST /api/purchases`
- `GET /api/purchases/:id`
- `GET /api/sales`
- `POST /api/sales`
- `GET /api/sales/:id`

### Dashboard, Reports, Notifications

- `GET /api/dashboard`
- `GET /api/reports/sales?format=json|csv|excel|pdf`
- `GET /api/reports/purchases?format=json|csv|excel|pdf`
- `GET /api/reports/inventory?format=json|csv|excel|pdf`
- `GET /api/reports/profit`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

## Docker

```bash
docker compose up --build
```

- API: `http://localhost:5000`
- Frontend: `http://localhost:8080`
- MongoDB: `mongodb://localhost:27017/inventory_system`

## Testing

```bash
cd backend
npm test
```

## Deployment Notes

- `render.yaml` includes baseline Render service definitions.
- Set `MONGO_URI` to MongoDB Atlas connection string.
- Set a strong production `JWT_SECRET`.
- Set frontend `VITE_API_BASE` to deployed backend URL.
