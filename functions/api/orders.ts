import { createClerkClient } from '@clerk/backend';
import { Client } from '@neondatabase/serverless';

export interface Env {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
}

async function getUserIdFromRequest(request: Request, env: Env): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  
  const clerkClient = createClerkClient({
    publishableKey: env.CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  });

  try {
    const verifiedToken = await clerkClient.verifyToken(token);
    return verifiedToken.sub; // sub is the Clerk userId
  } catch (err) {
    console.error('Clerk token verification failed:', err);
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const userId = await getUserIdFromRequest(context.request, context.env);
  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new Client(context.env.DATABASE_URL);
  try {
    await client.connect();
    
    // Fetch orders for this user
    const ordersRes = await client.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    const orders = ordersRes.rows;
    
    // Fetch items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const itemsRes = await client.query(
        `SELECT product_id as id, title, price, quantity, thumbnail FROM order_items WHERE order_id = $1`,
        [order.id]
      );
      ordersWithItems.push({
        orderId: order.id,
        status: order.status,
        timestamp: order.created_at,
        details: {
          items: itemsRes.rows.map(row => ({
            ...row,
            id: Number(row.id),
            price: Number(row.price),
            quantity: Number(row.quantity),
          })),
          shippingAddress: order.shipping_address,
          paymentMethod: order.payment_method,
          totalAmount: Number(order.total_amount),
        }
      });
    }

    return new Response(JSON.stringify(ordersWithItems), {
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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const userId = await getUserIdFromRequest(context.request, context.env);
  if (!userId) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new Client(context.env.DATABASE_URL);
  try {
    const body: any = await context.request.json();
    const { items, shippingAddress, paymentMethod, totalAmount } = body;

    if (!items || !shippingAddress || !paymentMethod || totalAmount === undefined) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required checkout fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await client.connect();
    
    // Start transaction
    await client.query('BEGIN');

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const status = 'success';
    
    // Insert order
    await client.query(
      `INSERT INTO orders (id, user_id, total_amount, shipping_address, payment_method, status) VALUES ($1, $2, $3, $4, $5, $6)`,
      [orderId, userId, totalAmount, JSON.stringify(shippingAddress), paymentMethod, status]
    );

    // Insert order items
    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, title, price, quantity, thumbnail) VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.id, item.title, item.price, item.quantity, item.thumbnail]
      );
    }

    await client.query('COMMIT');

    const responseRecord = {
      orderId,
      status,
      message: 'Your order has been placed successfully.',
      timestamp: new Date().toISOString(),
      details: {
        items,
        shippingAddress,
        paymentMethod,
        totalAmount,
      },
    };

    return new Response(JSON.stringify(responseRecord), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    try {
      await client.query('ROLLBACK');
    } catch {}
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    context.waitUntil(client.end());
  }
};
