import { NextRequest, NextResponse } from 'next/server';
import { verifyAndApplyCoupon } from '@/app/features/storefront/cart-checkout/actions/couponActions';

/**
 * API Route: /api/verify-coupon
 * Method: POST
 * Body: { code: string, cart: object }
 * Description: Acts as a secure bridge to call the verifyAndApplyCoupon server action,
 * passing the necessary request object for rate limiting.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Request body se code aur cart haasil karein
    const body = await req.json();
    const { code, cart } = body;

    // 2. Bunyadi validation
    if (!code || !cart) {
      return NextResponse.json(
        { success: false, message: 'Missing coupon code or cart data.' },
        { status: 400 }
      );
    }

    // 3. Server action ko call karein aur poora 'req' object pass karein
    const result = await verifyAndApplyCoupon(code, cart, req);

    // 4. Server action ka result client ko wapas bhej dein
    return NextResponse.json(result);

  } catch (error) {
    // 5. Agar koi unexpected error aaye to usay handle karein
    console.error("API Error in /api/cart/verify-coupon:", error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}