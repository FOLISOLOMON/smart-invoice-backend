CREATE DATABASE IF NOT EXISTS invoice_db;

USE invoice_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  business_name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  invoice_number VARCHAR(50),
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  date DATE,
  due_date DATE,
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  total_amount DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT,
  description VARCHAR(255),
  quantity INT,
  unit_price DECIMAL(10, 2),
  total DECIMAL(10, 2),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);