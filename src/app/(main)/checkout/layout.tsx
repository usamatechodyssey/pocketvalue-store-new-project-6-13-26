//// /src/app/(main))/checkout/layout.tsx
import React from "react";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";
import { CheckoutProvider } from "./CheckoutContext";
import OrderSummary from "../../features/storefront/cart-checkout/components/checkout/OrderSummary";
import StepIndicator from "../../features/storefront/cart-checkout/components/checkout/StepIndicator";
import type { Metadata } from "next";
import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import User, { IAddress } from "@/models/User";
import { ClientAddress } from "@/app/features/storefront/cart-checkout/actions/addressActions";
import CheckoutMobileSummary from "@/app/features/storefront/cart-checkout/components/checkout/CheckoutMobileSummary";
import Link from "next/link"; 
import Image from "next/image"; 
import { ChevronLeft } from "lucide-react"; 

export const metadata: Metadata = {
  title: "Checkout | PocketValue",
  robots: { index: false, follow: false },
};

async function getUserAddresses(userId: string): Promise<ClientAddress[]> {
  try {
    await connectMongoose();
    const user = await User.findById(userId).select("addresses").lean<{ addresses?: IAddress[] }>();
    if (!user || !user.addresses) return [];
    
    return user.addresses.map((addr) => ({
      _id: addr._id.toString(),
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      area: addr.area,
      address: addr.address,
      isDefault: addr.isDefault,
      lat: addr.lat || null,
      lng: addr.lng || null,
    }));
  } catch (error) {
    console.error("Failed to fetch user addresses for checkout:", error);
    return []; 
  }
}

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth(); 
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const addresses = await getUserAddresses(session.user.id);
  const userPhone = session.user.phone || null;

  // === 🔴 TEMP MODIFICATION: FIREBASE BYPASS ===
  // Humne system ko force kar diya hai ke wo samjhe user verified hai.
  // Jab Firebase wapis on karna ho, to niche wali line uncomment karein aur 'true' hata dein.

  // ORIGINAL CODE (Saved for later):
  // const isUserPhoneVerified = !!session.user.phoneVerified;

  // NEW CODE (Bypass Mode):
  const isUserPhoneVerified = true; 
  // ==============================================


  return (
    <CheckoutProvider
      savedAddresses={addresses}
      userPhone={userPhone}
      isUserPhoneVerified={isUserPhoneVerified}
    >
      <main className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* === HEADER (NAVIGATION + STEPS) === */}
        <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 sticky top-0 z-30 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            
            {/* === 📱 MOBILE LAYOUT (Stack) === */}
            <div className="md:hidden flex flex-col gap-8">
                {/* Row 1: Back Button & Logo */}
                <div className="relative flex items-center justify-center w-full">
                    {/* Absolute Back Button */}
                    <Link href="/cart" className="absolute left-0 p-2 -ml-2 text-gray-500 hover:text-gray-800 dark:hover:text-white">
                        <ChevronLeft size={22} />
                    </Link>
                    
                    {/* Centered Logo */}
                 <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative h-14 w-14">
                        <Image src="/usamabrand.svg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-sans font-bold text-gray-900 dark:text-white ">
                            PocketValue
                        </span>
                        <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase leading-none">
                            Secure Checkout
                        </span>
                    </div>
                </Link>

                </div>

                {/* Row 2: Steps (Full Width) */}
                <div className="w-full px-4">
                    <StepIndicator />
                </div>
            </div>

            {/* === 🖥️ DESKTOP LAYOUT (Row) === */}
            <div className="hidden md:flex items-center justify-between gap-8">
                
                {/* Left: Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="relative h-20 w-20">
                        <Image src="/usamabrand.svg" alt="Logo" fill className="object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white text-2xl font-sans font-bold leading-none">
                            PocketValue
                        </span>
                        <span className="text-[10px] font-bold text-brand-primary tracking-widest uppercase">
                            Secure Checkout
                        </span>
                    </div>
                </Link>

                {/* Center: Step Indicator */}
                <div className="flex-1 max-w-md mx-auto">
                    <StepIndicator />
                </div>

                {/* Right: Return to Cart */}
                <Link href="/cart" className="flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-brand-primary transition-colors shrink-0">
                    <ChevronLeft size={16} />
                    Return to Cart
                </Link>

            </div>
          </div>
        </div>
        
        {/* === MOBILE ONLY: ACCORDION SUMMARY === */}
        <div className="lg:hidden">
          <CheckoutMobileSummary />
        </div>

        {/* === MAIN CONTENT === */}
        <div className="max-w-none mx-auto lg:px-8 xl:px-16 2xl:px-24">
          <div className="bg-white dark:bg-gray-800 lg:grid lg:grid-cols-2 lg:divide-x lg:divide-gray-200 dark:lg:divide-gray-700 lg:shadow-lg lg:rounded-xl lg:my-12">
            {/* Left Column: Form */}
            <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">{children}</div>

            {/* Right Column: Order Summary (DESKTOP ONLY) */}
            <div className="hidden lg:block px-4 py-8 sm:px-6 lg:px-8 lg:py-12 bg-gray-50/50 dark:bg-gray-800/50 lg:bg-transparent dark:lg:bg-transparent border-t lg:border-t-0 border-gray-200 dark:border-gray-700">
              <div className="lg:sticky lg:top-24">
                <OrderSummary />
              </div>
            </div>
          </div>
        </div>
      </main>
    </CheckoutProvider>
  );
}