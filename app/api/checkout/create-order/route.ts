import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, itemId, userId } = body;

    if (!amount || !itemId || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // Razorpay works in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: `receipt_${userId.substring(0,8)}_${Date.now()}`,
      notes: {
        userId,
        itemId
      }
    };

    // If keys are missing (dev environment without keys), return a mock order for testing UI
    if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID === 'dummy_key' || !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.warn("⚠️ RAZORPAY KEYS MISSING: Returning mock order for development");
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
        mock: true
      });
    }

    // Attempt to load razorpay only if we have real keys to prevent app crash if npm install fails
    let Razorpay;
    try {
      Razorpay = require('razorpay');
    } catch (e) {
      console.error("Razorpay module not installed. Please run `npm install razorpay`");
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
