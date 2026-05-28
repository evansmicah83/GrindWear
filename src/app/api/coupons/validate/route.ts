import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Validate coupon
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, cart_total } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await db.getOne(
      `SELECT * FROM coupons
       WHERE code = $1 AND is_active = true
       AND (expires_at IS NULL OR expires_at > NOW())`,
      [code]
    );

    if (!coupon) {
      return NextResponse.json(
        { error: 'Invalid or expired coupon' },
        { status: 404 }
      );
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return NextResponse.json(
        { error: 'Coupon usage limit exceeded' },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (coupon.min_order_amount && cart_total < coupon.min_order_amount) {
      return NextResponse.json(
        { error: `Minimum order amount ${coupon.min_order_amount} required` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cart_total * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    if (coupon.max_discount && discount > coupon.max_discount) {
      discount = coupon.max_discount;
    }

    return NextResponse.json({
      data: { coupon, discount },
      message: 'Coupon is valid',
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { error: 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
