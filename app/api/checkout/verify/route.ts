import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// We must use the service role key to bypass RLS for inserting purchases
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      userId, 
      itemId, 
      amount,
      isMock 
    } = body;

    // Handle mock payment verification for development without keys
    if (isMock) {
      console.log("Mock payment verified, inserting to DB...");
      const { error } = await supabaseAdmin.from('purchases').insert({
        user_id: userId,
        item_id: itemId,
        payment_id: `mock_payment_${Date.now()}`,
        amount: amount
      });

      if (error) throw error;
      return NextResponse.json({ success: true, mock: true });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!secret) {
      return NextResponse.json({ error: 'Razorpay secret key not configured' }, { status: 500 });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Signature is valid, insert into Supabase
    const { error } = await supabaseAdmin.from('purchases').insert({
      user_id: userId,
      item_id: itemId,
      payment_id: razorpay_payment_id,
      amount: amount
    });

    if (error) {
      console.error('Failed to insert purchase into DB:', error);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
