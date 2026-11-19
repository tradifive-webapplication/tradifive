import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
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
    return sendJson(res, 405, { success: false, error: 'Method not allowed. Only POST is supported.' });
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_secret) {
    console.error('Razorpay key secret missing from server environment');
    return sendJson(res, 500, { success: false, error: 'Razorpay secret not configured on server' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return sendJson(res, 400, { success: false, error: 'Invalid JSON body' });
      }
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendJson(res, 400, {
        success: false,
        error: 'Missing required payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)'
      });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuffer = Buffer.from(razorpay_signature, 'utf-8');

    const isMatch =
      expectedBuffer.length === signatureBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, signatureBuffer);

    if (!isMatch) {
      console.warn('Razorpay signature mismatch for order:', razorpay_order_id);
      return sendJson(res, 400, {
        success: false,
        error: 'Payment verification failed: Signature mismatch. Do not fulfill order.'
      });
    }

    return sendJson(res, 200, {
      success: true,
      message: 'Payment signature verified successfully',
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return sendJson(res, 500, {
      success: false,
      error: error?.message || 'Internal server error during verification'
    });
  }
}
