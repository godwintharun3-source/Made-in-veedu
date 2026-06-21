# Made In Veedu - REST API & AI Microservice Documentation

This document describes all API endpoints provided by the Spring Boot Backend (port `8080`) and the FastAPI AI service (port `8000`).

---

## 1. Authentication Endpoints (Spring Boot)

All authentication endpoints have the prefix `/api/auth`.

### Register User
* **URL**: `/api/auth/signup`
* **Method**: `POST`
* **Content-Type**: `application/json`
* **Payload**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phoneNumber": "9876543210",
  "password": "securepassword",
  "confirmPassword": "securepassword",
  "state": "Tamil Nadu",
  "district": "Madurai",
  "city": "Madurai",
  "village": "Veedu",
  "addressLine": "123 Organic Lane",
  "pincode": "625001"
}
```
* **Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "user": {
    "id": 2,
    "name": "Jane Doe",
    "email": "jane@example.com",
    "phoneNumber": "9876543210",
    "role": "CUSTOMER",
    "state": "Tamil Nadu",
    "district": "Madurai",
    "city": "Madurai",
    "village": "Veedu",
    "addressLine": "123 Organic Lane",
    "pincode": "625001"
  }
}
```

### User Login
* **URL**: `/api/auth/signin`
* **Method**: `POST`
* **Payload**:
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```
* **Response (200 OK)**: Returns tokens and user details (same format as registration).

### Token Refresh
* **URL**: `/api/auth/refresh`
* **Method**: `POST`
* **Payload**:
```json
{
  "refreshToken": "eyJhbGciOi..."
}
```
* **Response (200 OK)**: Returns new access token and refresh token.

### Forgot Password (OTP Request)
* **URL**: `/api/auth/forgot-password`
* **Method**: `POST`
* **Payload**:
```json
{
  "email": "jane@example.com"
}
```
* **Response (200 OK)**: `{"message": "OTP sent successfully to your email."}`

### Reset Password with OTP
* **URL**: `/api/auth/reset-password`
* **Method**: `POST`
* **Payload**:
```json
{
  "email": "jane@example.com",
  "otp": "123456",
  "password": "newsecurepassword",
  "confirmPassword": "newsecurepassword"
}
```

---

## 2. Customer Product Catalog (Spring Boot)

Prefix: `/api/products`

### List Products
* **URL**: `/api/products`
* **Method**: `GET`
* **Query Params**: `category` (optional) - e.g. `?category=Organic%20Masalas`

### Get Product details
* **URL**: `/api/products/{id}`
* **Method**: `GET`

### Search Products (Textual matching)
* **URL**: `/api/products/search`
* **Method**: `GET`
* **Query Params**: `query` (required) - e.g. `?query=chips`

---

## 3. Shopping Cart Endpoints (Spring Boot)

Prefix: `/api/cart` (Requires `Authorization: Bearer <token>`)

### Fetch Cart
* **URL**: `/api/cart`
* **Method**: `GET`

### Add Item to Cart
* **URL**: `/api/cart`
* **Method**: `POST`
* **Payload**:
```json
{
  "productId": 1,
  "quantity": 2
}
```

### Update Item Quantity
* **URL**: `/api/cart/{id}`
* **Method**: `PUT`
* **Payload**:
```json
{
  "quantity": 5
}
```

---

## 4. Orders & Invoices (Spring Boot)

Prefix: `/api/orders` (Requires `Authorization: Bearer <token>`)

### Place Order
* **URL**: `/api/orders`
* **Method**: `POST`
* **Payload**:
```json
{
  "paymentMethod": "UPI QR",
  "shippingAddress": "123 Organic Lane, Madurai",
  "couponCode": "WELCOME20"
}
```

### Get Order Details
* **URL**: `/api/orders/{id}`
* **Method**: `GET`

### Cancel Order
* **URL**: `/api/orders/{id}/cancel`
* **Method**: `PUT`

---

## 5. AI Services (FastAPI Port 8000)

### AI Recommendations Slider
* **URL**: `/recommend`
* **Method**: `POST`
* **Payload**:
```json
{
  "user_id": 2
}
```

### Smart Natural Language Search
* **URL**: `/search`
* **Method**: `POST`
* **Payload**:
```json
{
  "query": "Show healthy products under 250"
}
```

### Smart Chat Assistant
* **URL**: `/chat`
* **Method**: `POST`
* **Payload**:
```json
{
  "message": "Where is my order?",
  "user_id": 2
}
```
