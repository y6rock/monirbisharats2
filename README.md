# TechStock - E-commerce Application

A full-stack e-commerce application built with React frontend and Node.js backend.

## 🚀 Quick Setup Guide

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server
- npm or yarn

### 1. Database Setup

First, you need to set up the MySQL database:

```sql
-- Create the database
CREATE DATABASE techstock;

-- Create the user (if not exists)
CREATE USER 'techstock'@'localhost' IDENTIFIED BY 'Mb123456!@#';

-- Grant privileges
GRANT ALL PRIVILEGES ON techstock.* TO 'techstock'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/y6rock/monirbisharats2.git
cd monirbisharats2

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Schema

The application uses the following tables. You can create them manually or import from phpMyAdmin:

```sql
-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers table
CREATE TABLE suppliers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    image VARCHAR(255),
    supplier_id INT,
    category_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(50),
    promotion_id INT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Promotions table
CREATE TABLE promotions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    type ENUM('percentage', 'fixed') NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    start_date DATE,
    end_date DATE,
    min_purchase DECIMAL(10,2),
    applicable_products TEXT,
    applicable_categories TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
The backend will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **phpMyAdmin**: http://localhost/phpmyadmin (if installed)

### 6. Default Login Credentials

You can create an admin user by registering through the application, or insert directly into the database:

```sql
INSERT INTO users (email, password, name, phone, city) 
VALUES ('admin@techstock.com', '$2b$10$your_hashed_password', 'Admin User', '123456789', 'City');
```

## 🔧 Troubleshooting

### Common Issues:

1. **500 Internal Server Error**: 
   - Make sure MySQL is running
   - Check database connection in `backend/dbSingleton.js`
   - Verify database and user exist

2. **"Cannot find module" errors**:
   - Run `npm install` in both frontend and backend directories

3. **Port already in use**:
   - Kill existing processes: `killall node`
   - Or change ports in the configuration files

4. **Database connection failed**:
   - Verify MySQL is running: `sudo systemctl status mysql`
   - Check credentials in `backend/dbSingleton.js`
   - Ensure database exists: `mysql -u techstock -p techstock`

### Database Connection Details:
- **Host**: localhost
- **Port**: 3306
- **Database**: techstock
- **User**: techstock
- **Password**: Mb123456!@#

## 📁 Project Structure

```
monirbisharats2/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Middleware functions
│   ├── dbSingleton.js      # Database connection
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   └── context/        # React context
│   └── public/             # Static files
└── techstock_schema.sql    # Database schema
```

## 🛠️ Development

- **Backend**: Node.js with Express
- **Frontend**: React with React Router
- **Database**: MySQL
- **Authentication**: JWT tokens
- **File Upload**: Multer middleware

## 📝 API Endpoints

- `GET /api/products` - Get all products
- `GET /api/categories` - Get all categories
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/orders` - Get orders (admin)
- `POST /api/orders` - Create new order

For more detailed API documentation, check the route files in `backend/src/routes/`. 