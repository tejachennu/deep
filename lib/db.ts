import mysql from "mysql2/promise"
import { env } from "./env"

// Create a connection pool
const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: Number.parseInt(env.MYSQL_PORT),
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await pool.execute(query, params)
    return rows as T
  } catch (error) {
    console.error("Database query error:", error)
    throw new Error("Database query failed")
  }
}

// Initialize database tables
export async function initializeDatabase() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS donors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT,
      razorpay_payment_id VARCHAR(255),
      razorpay_order_id VARCHAR(255),
      amount INT NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      status VARCHAR(50) DEFAULT 'created',
      payment_method VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    )`,

    `CREATE TABLE IF NOT EXISTS subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      donor_id INT,
      razorpay_subscription_id VARCHAR(255) UNIQUE,
      plan_id VARCHAR(255),
      status VARCHAR(50) DEFAULT 'created',
      amount INT NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      frequency VARCHAR(20),
      start_date TIMESTAMP,
      end_date TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id)
    )`,
  ]

  for (const table of tables) {
    await executeQuery(table)
  }

  console.log("Database tables initialized")
}

