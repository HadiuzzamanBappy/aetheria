import { Client } from '@neondatabase/serverless';

export interface Env {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const client = new Client(context.env.DATABASE_URL);
  try {
    await client.connect();
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_amount NUMERIC(10, 2) NOT NULL,
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL,
        thumbnail VARCHAR(500) NOT NULL
      );
    `);
    
    // Create reviews table
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return new Response(JSON.stringify({ success: true, message: 'Database tables initialized successfully.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    context.waitUntil(client.end());
  }
};
