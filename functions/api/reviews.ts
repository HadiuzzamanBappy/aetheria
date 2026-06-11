import { createClerkClient } from '@clerk/backend';
import { Client } from '@neondatabase/serverless';

export interface Env {
  DATABASE_URL: string;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
}

async function getAuthDetailsFromRequest(request: Request, env: Env): Promise<{ userId: string; fullName: string } | null> {
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
    const userId = verifiedToken.sub;
    
    // Fetch user details from Clerk to get the user's name
    const userDetails = await clerkClient.users.getUser(userId);
    const fullName = `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || 'Anonymous User';
    
    return { userId, fullName };
  } catch (err) {
    console.error('Clerk auth verification failed:', err);
    return null;
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const productId = url.searchParams.get('productId');

  if (!productId) {
    return new Response(JSON.stringify({ success: false, error: 'Missing productId query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new Client(context.env.DATABASE_URL);
  try {
    await client.connect();
    
    const reviewsRes = await client.query(
      `SELECT id, product_id as "productId", user_id as "userId", user_name as "reviewerName", rating, comment, created_at as "date" FROM reviews WHERE product_id = $1 ORDER BY created_at DESC`,
      [Number(productId)]
    );

    // Format fields for frontend compatibility
    const reviews = reviewsRes.rows.map(row => ({
      ...row,
      id: Number(row.id),
      rating: Number(row.rating),
      date: new Date(row.date).toISOString(),
    }));

    return new Response(JSON.stringify(reviews), {
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
  const auth = await getAuthDetailsFromRequest(context.request, context.env);
  if (!auth) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = new Client(context.env.DATABASE_URL);
  try {
    const body: any = await context.request.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required review fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await client.connect();
    
    const insertRes = await client.query(
      `INSERT INTO reviews (product_id, user_id, user_name, rating, comment) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [Number(productId), auth.userId, auth.fullName, Number(rating), comment]
    );

    const newReview = {
      id: Number(insertRes.rows[0].id),
      productId: Number(productId),
      userId: auth.userId,
      reviewerName: auth.fullName,
      rating: Number(rating),
      comment,
      date: new Date(insertRes.rows[0].created_at).toISOString(),
    };

    return new Response(JSON.stringify(newReview), {
      status: 201,
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
