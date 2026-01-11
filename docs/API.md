# TrackMyExpense API Documentation

This document provides a comprehensive guide to the TrackMyExpense REST API.

## 🚀 Base URL

- **Production:** `https://api.trackmyexpense.com/prod` (Coming Soon)
- **Local Development:** `http://localhost:4000`

## 🔒 Authentication

The API uses **AWS Cognito** for authentication. All protected endpoints require a Bearer token in the `Authorization` header.

```http
Authorization: Bearer <your_access_token>
```

---

## 🏥 System Endpoints

### Health Check
Verify if the API service is up and running.

- **URL:** `/health`
- **Method:** `GET`
- **Auth Required:** No
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** `{ "status": "ok", "timestamp": "2026-01-11T09:00:00.000Z" }`

---

## 📂 Categories

### List Categories
Get all categories for the authenticated user.

- **URL:** `/categories`
- **Method:** `GET`
- **Auth Required:** Yes
- **Success Response:**
  - **Code:** 200 OK
  - **Content:** `[ { "categoryId": "guid", "name": "Food", "type": "expense", ... }, ... ]`

### Create Category
Add a new custom category.

- **URL:** `/categories`
- **Method:** `POST`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "name": "Gym",
    "type": "expense",
    "icon": "fitness_center",
    "color": "#4CAF50"
  }
  ```
- **Success Response:**
  - **Code:** 201 Created

### Update Category
Update an existing category.

- **URL:** `/categories/{id}`
- **Method:** `PATCH`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "name": "Health & Fitness",
    "icon": "fitness_center"
  }
  ```

### Delete Category
Remove a category.

- **URL:** `/categories/{id}`
- **Method:** `DELETE`
- **Auth Required:** Yes

---

## 🏦 Accounts

### List Accounts
Get all bank accounts for the authenticated user.

- **URL:** `/accounts`
- **Method:** `GET`
- **Auth Required:** Yes

### Create Account
Add a new bank account.

- **URL:** `/accounts`
- **Method:** `POST`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "accountName": "Main Checking",
    "accountType": "checking",
    "balance": 1000.50,
    "currency": "USD"
  }
  ```

### Update Account
Update account details.

- **URL:** `/accounts/{id}`
- **Method:** `PATCH`
- **Auth Required:** Yes

### Delete Account
Remove a bank account.

- **URL:** `/accounts/{id}`
- **Method:** `DELETE`
- **Auth Required:** Yes

---

## 💸 Transactions

### List Transactions
Fetch transactions within a date range.

- **URL:** `/transactions`
- **Method:** `GET`
- **Auth Required:** Yes
- **Query Parameters:**
  - `startDate`: ISO 8601 date (Required)
  - `endDate`: ISO 8601 date (Required)
  - `accountId`: Filter by account (Optional)
  - `categoryId`: Filter by category (Optional)

### Create Transaction
Record a new expense or income.

- **URL:** `/transactions`
- **Method:** `POST`
- **Auth Required:** Yes
- **Body:**
  ```json
  {
    "accountId": "acc_123",
    "categoryId": "cat_456",
    "amount": 45.00,
    "type": "expense",
    "description": "Lunch at Subway",
    "transactionDate": "2026-01-11T12:30:00Z"
  }
  ```

### Delete Transaction
Remove a transaction. Note that this requires the Sort Key (`EntityType`) as a query parameter.

- **URL:** `/transactions`
- **Method:** `DELETE`
- **Auth Required:** Yes
- **Query Parameters:**
  - `sk`: The full Sort Key (`EntityType`) of the transaction (e.g., `TRANSACTION#2026-01-11#uuid`)

---

## 💰 Budgets

### List Budgets
- **URL:** `/budgets`
- **Method:** `GET`
- **Auth Required:** Yes

### Create Budget
- **URL:** `/budgets`
- **Method:** `POST`
- **Auth Required:** Yes

### Update Budget
- **URL:** `/budgets/{id}`
- **Method:** `PATCH`
- **Auth Required:** Yes

### Delete Budget
- **URL:** `/budgets/{id}`
- **Method:** `DELETE`
- **Auth Required:** Yes
