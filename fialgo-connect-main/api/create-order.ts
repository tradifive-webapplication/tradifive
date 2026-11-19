import type { VercelRequest, VercelResponse } from '@vercel/node';
import Razorpay from 'razorpay';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '.env.local' });

function sendJson(res: VercelResponse | any, status: number, data: any) {
  if (typeof res.status === 'function') {
    return res.status(status).json(data);
  }
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify(data));
}

export default async function handler(req: VercelRequest | any, res: VercelResponse | any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed. Only POST is supported.' });
  }

  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    console.error('Razorpay credentials missing from server environment');
    return sendJson(res, 500, { error: 'Razorpay credentials not configured on server' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return sendJson(res, 400, { error: 'Invalid JSON body' });
      }
    }

    const { amount, currency = 'INR', receipt, notes } = body || {};

    const numericAmount = Number(amount);
    if (!amount || isNaN(numericAmount) || numericAmount < 100) {
      return sendJson(res, 400, {
        error: 'Invalid amount. Minimum amount is 100 paise (1 INR).'
      });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const orderOptions = {
      amount: Math.round(numericAmount),
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: notes || {},
    };

    const order = await razorpay.orders.create(orderOptions);

    return sendJson(res, 200, {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);

    // Auth failures
    if (error?.statusCode === 401 || (error?.error?.code === 'BAD_REQUEST_ERROR' && error?.message?.includes('auth'))) {
      return sendJson(res, 401, {
        error: 'Razorpay authentication failed. Please verify API keys.'
      });
    }

    return sendJson(res, 500, {
      error: error?.error?.description || error?.message || 'Failed to create Razorpay order'
    });
  }
}
