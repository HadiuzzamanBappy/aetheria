import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

// Retrieve DATABASE_URL from process.env or parse it from local .dev.vars
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
    if (fs.existsSync(devVarsPath)) {
      const devVarsContent = fs.readFileSync(devVarsPath, 'utf-8');
      const match = devVarsContent.match(/^DATABASE_URL\s*=\s*["']?(.*?)["']?$/m);
      if (match && match[1]) {
        databaseUrl = match[1].trim();
      }
    }
  } catch (err) {
    console.warn("Could not read .dev.vars file:", err.message);
  }
}

if (!databaseUrl) {
  console.error("Error: DATABASE_URL environment variable is missing and could not be loaded from .dev.vars");
  process.exit(1);
}

async function main() {
  console.log("Initializing database tables via Neon HTTP API...");
  const sql = neon(databaseUrl);

  try {
    // Create orders table
    console.log("Creating orders table...");
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create order_items table
    console.log("Creating order_items table...");
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL,
        thumbnail VARCHAR(500) NOT NULL
      );
    `;
    
    // Create reviews table
    console.log("Creating reviews table...");
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("Database tables verified/initialized successfully!");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  }
}

main();
