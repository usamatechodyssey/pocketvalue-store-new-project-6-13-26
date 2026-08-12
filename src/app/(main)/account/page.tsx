
// // 📂 src/app/(main)/account/page.tsx

// import Link from "next/link";
// import { auth } from "../../auth";
// import {
//   Package,
//   MapPin,
//   ArrowRight,
//   CreditCard,
//   Sparkles,
//   ChevronRight,
//   Clock,
//   CheckCircle2,
// } from "lucide-react";

// import connectMongoose from "@/app/shared/lib/checkout/mongoose";
// import Order, { IOrder } from "@/models/Order";
// import { ClientOrder } from "@/models/Order";

// // ✅ Decoupled, lightweight Teaser Portal (Modular Paths)
// import ReferralTeaserCard from "@/app/features/storefront/customer-account/components/referrals/ReferralTeaserCard";
// import { getCustomerReferralStats } from "@/app/features/storefront/customer-account/actions/referralActions";

// // --- SERVER DATA FETCHING (EXPLICIT DTO MAPPING) ---
// async function getRecentOrder(userId: string): Promise<ClientOrder | null> {
//   try {
//     await connectMongoose();
    
//     const recentOrder = await Order.findOne({ userId: userId })
//       .sort({ createdAt: -1 })
//       .lean<IOrder>();

//     if (!recentOrder) return null;

//     const clientOrder: ClientOrder = {
//       _id: recentOrder._id.toString(),
//       orderId: recentOrder.orderId,
//       userId: recentOrder.userId,
//       totalPrice: recentOrder.totalPrice,
//       status: recentOrder.status,
//       createdAt: new Date(recentOrder.createdAt).toISOString(),
//       products: recentOrder.products.map((p: any) => ({
//         _id: p._id,
//         productId: p.productId,
//         cartItemId: p.cartItemId,
//         name: p.name,
//         price: p.price,
//         quantity: p.quantity,
//         slug: p.slug,
//         image: p.image,
//         variant: p.variant
//       })),
//       shippingAddress: recentOrder.shippingAddress,
//       paymentMethod: recentOrder.paymentMethod,
//       paymentStatus: recentOrder.paymentStatus,
//       subtotal: recentOrder.subtotal,
//       shippingCost: recentOrder.shippingCost,
//       trafficSource: {
//         utmSource: recentOrder.trafficSource?.utmSource ?? 'Direct',
//         utmMedium: recentOrder.trafficSource?.utmMedium ?? 'None',
//         utmCampaign: recentOrder.trafficSource?.utmCampaign ?? 'None'
//       }
//     };

//     return clientOrder;

//   } catch (error) {
//     console.error("Failed to fetch recent order:", error);
//     return null;
//   }
// }

// // --- UTILS: Updated to match our Mongoose Order Schema ---
// const getStatusGradient = (status: string) => {
//   switch (status?.toLowerCase()) {
//     case "delivered":
//     case "completed": // ✅ FIX 1: Added completed case to trigger green gradient and drop-shadows!
//       return "from-green-500 to-emerald-600 shadow-green-500/30";
//     case "cancelled":
//       return "from-red-500 to-rose-600 shadow-red-500/30";
//     case "shipped":
//       return "from-blue-500 to-indigo-600 shadow-blue-500/30";
//     case "on hold":
//       return "from-yellow-500 to-amber-600 shadow-yellow-500/30";
//     default:
//       return "from-orange-500 to-amber-600 shadow-orange-500/30";
//   }
// };

// const getProgressWidth = (status: string) => {
//   switch (status?.toLowerCase()) {
//     case "pending": return "15%";
//     case "processing": return "50%";
//     case "shipped": return "75%";
//     case "delivered": 
//     case "completed": return "100%"; // ✅ FIX 2: Added completed case so full stepper line is 100% filled!
//     default: return "10%";
//   }
// };

// const AccountDashboardPage = async () => {
//   const session = await auth();
//   const firstName = session?.user?.name?.split(" ")[0] || "User";

//   // 1. Fetch recent order metrics from Database
//   const recentOrder = session?.user?.id
//     ? await getRecentOrder(session.user.id)
//     : null;

//   // =================================================================
//   // 🚀 SERVER-SIDE REFERRAL METRICS HYDRATION (LIGHTWEIGHT STATE)
//   // =================================================================
//   let referralCode: string | null = null;
//   let conversions = 0;

//   if (session?.user?.id) {
//     const statsResult = await getCustomerReferralStats();
//     if (statsResult.success && statsResult.stats) {
//       referralCode = statsResult.stats.referralCode;
//       conversions = statsResult.stats.conversions;
//     }
//   }
//   // =================================================================

//   return (
//     <div className="relative min-h-150 w-full p-1 font-sans">
//       {/* Background Mesh */}
//       <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl opacity-60 pointer-events-none">
//         <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-400/10 rounded-full blur-[120px]" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-orange-400/10 rounded-full blur-[100px]" />
//       </div>

//       <div className="space-y-8 relative z-10">
//         {/* === HERO SECTION === */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6">
//           <div>
//             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/5 border border-brand-primary/20 mb-3 backdrop-blur-sm">
//               <Sparkles size={14} className="text-brand-primary fill-brand-primary/20" />
//               <span className="text-[11px] font-bold uppercase tracking-widest text-brand-secondary">Premium Member</span>
//             </div>
//             <h1 className="text-4xl md:text-6xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight">
//               Hello,{" "}
//               <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-secondary font-black">
//                 {firstName}.
//               </span>
//             </h1>
//             <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-lg font-medium max-w-md">
//               Your personal dashboard is ready. Explore new collections & exclusive deals.
//             </p>
//           </div>
//           <Link
//             href="/"
//             className="group relative flex items-center gap-3 px-8 py-4 bg-linear-to-r from-brand-primary to-brand-primary-hover text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:scale-[1.02] transition-all duration-300 active:scale-95 no-underline hover:no-underline"
//           >
//             Start Shopping
//             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
//           </Link>
//         </div>

//         {/* === BENTO GRID === */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* CARD A: ACTIVE ORDER */}
//           <div className="md:col-span-2 relative overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-4xl shadow-2xs hover:shadow-xl transition-all duration-300 group">
//             <div className="p-8 h-full flex flex-col justify-between">
//               <div className="flex justify-between items-start">
//                 <div className="flex items-center gap-4">
//                   <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
//                     <Package size={28} />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
//                       {recentOrder ? "Active Order" : "No Active Orders"}
//                     </h2>
//                     <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
//                       {recentOrder ? `ID: #${recentOrder.orderId}` : "Your recent purchases will show here."}
//                     </p>
//                   </div>
//                 </div>
//                 {recentOrder && (
//                   <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg bg-linear-to-r ${getStatusGradient(recentOrder.status)}`}>
//                     {recentOrder.status}
//                   </span>
//                 )}
//               </div>

//               <div className="mt-8 mb-6">
//                 {recentOrder ? (
//                   <div className="relative pt-2">
//                     <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full">
//                       <div className={`h-full bg-linear-to-r ${getStatusGradient(recentOrder.status)} rounded-full relative transition-all duration-1000 ease-out`} style={{ width: getProgressWidth(recentOrder.status) }}>
//                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-orange-500 rounded-full shadow-md" />
//                       </div>
//                     </div>
//                     <div className="flex justify-between mt-4 font-mono">
//                       <div className="flex flex-col items-start"><span className="text-xs font-bold dark:text-white">Pending</span></div>
//                       <div className="flex flex-col items-center"><span className="text-xs font-bold text-brand-primary">Processing</span></div>
//                       <div className="flex flex-col items-end"><span className="text-xs font-bold text-zinc-400">Delivered</span></div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50">
//                     <Clock className="text-zinc-300 dark:text-zinc-700 mb-2" size={24} />
//                     <span className="text-sm text-zinc-400 font-medium">No recent activity</span>
//                   </div>
//                 )}
//               </div>

//               <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
//                 <Link href="/account/orders" className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 hover:gap-3 transition-all group-hover:text-brand-primary no-underline hover:no-underline">
//                   {recentOrder ? "Track Package" : "View Order History"} <ArrowRight size={16} />
//                 </Link>
//               </div>
//             </div>
//           </div>

//           {/* CARD B: ADDRESSES */}
//           <Link href="/account/addresses" className="relative overflow-hidden rounded-4xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group no-underline hover:no-underline">
//             <div className="absolute inset-0 bg-linear-to-br from-[#10589E] to-[#0a3a6b] z-0" />
//             <div className="absolute inset-0 opacity-40 z-0 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
//             <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
//               <div>
//                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/10 shadow-inner">
//                   <MapPin size={24} className="text-blue-50" />
//                 </div>
//                 <h3 className="text-2xl font-bold tracking-tight">Addresses</h3>
//                 <p className="text-blue-100/80 text-sm mt-1 font-medium">Manage delivery locations</p>
//               </div>
//               <div className="w-10 h-10 rounded-full bg-white text-[#10589E] flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300">
//                 <ArrowRight size={18} strokeWidth={2.5} />
//               </div>
//             </div>
//           </Link>

//           {/* CARD C: PROFILE */}
//           <Link href="/account/profile" className="md:col-span-1 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/50 dark:border-zinc-800 rounded-4xl p-8 shadow-2xs hover:shadow-lg transition-all group no-underline hover:no-underline">
//             <div>
//               <div className="flex justify-between items-start mb-6">
//                 <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20">
//                   <CreditCard size={24} />
//                 </div>
//                 <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wide">
//                   <CheckCircle2 size={12} className="inline mr-1" /> Verified
//                 </span>
//               </div>
//               <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Profile Info</h3>
//               <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Security & Personal Details</p>
//             </div>
//             <div className="mt-6 flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors">
//               Edit Details <ChevronRight size={16} />
//             </div>
//           </Link>

//           {/* CARD D: MODULAR REFERRAL TEASER PORTAL */}
//           <ReferralTeaserCard referralCode={referralCode} conversions={conversions} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AccountDashboardPage;
// 📂 src/app/(main)/account/page.tsx

import Link from "next/link";
import { auth } from "../../auth";
import {
  Package,
  MapPin,
  ArrowRight,
  CreditCard,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

import connectMongoose from "@/app/shared/lib/checkout/mongoose";
import Order, { IOrder, ClientOrder } from "@/models/Order";

// ✅ Decoupled, lightweight Teaser Portal (Modular Paths)
import ReferralTeaserCard from "@/app/features/storefront/customer-account/components/referrals/ReferralTeaserCard";
import { getCustomerReferralStats } from "@/app/features/storefront/customer-account/actions/referralActions";

// --- SERVER DATA FETCHING (EXPLICIT DTO MAPPING) ---
async function getRecentOrder(userId: string): Promise<ClientOrder | null> {
  try {
    await connectMongoose();
    
    const recentOrder = await Order.findOne({ userId: userId })
      .sort({ createdAt: -1 })
      .lean<IOrder>();

    if (!recentOrder) return null;

    const clientOrder: ClientOrder = {
      _id: recentOrder._id.toString(),
      orderId: recentOrder.orderId,
      userId: recentOrder.userId,
      totalPrice: recentOrder.totalPrice,
      status: recentOrder.status,
      createdAt: new Date(recentOrder.createdAt).toISOString(),
      products: recentOrder.products.map((p: any) => ({
        _id: p._id,
        productId: p.productId,
        cartItemId: p.cartItemId,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        slug: p.slug,
        image: p.image,
        variant: p.variant
      })),
      shippingAddress: recentOrder.shippingAddress,
      paymentMethod: recentOrder.paymentMethod,
      paymentStatus: recentOrder.paymentStatus,
      subtotal: recentOrder.subtotal,
      shippingCost: recentOrder.shippingCost,
      trafficSource: {
        utmSource: recentOrder.trafficSource?.utmSource ?? 'Direct',
        utmMedium: recentOrder.trafficSource?.utmMedium ?? 'None',
        utmCampaign: recentOrder.trafficSource?.utmCampaign ?? 'None'
      }
    };

    return clientOrder;

  } catch (error) {
    console.error("Failed to fetch recent order:", error);
    return null;
  }
}

// --- UTILS: Updated to match our Mongoose Order Schema ---
const getStatusGradient = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
    case "completed": 
      return "from-emerald-500 to-teal-600 shadow-emerald-500/30";
    case "cancelled":
      return "from-rose-500 to-red-600 shadow-rose-500/30";
    case "shipped":
      return "from-blue-500 to-indigo-600 shadow-blue-500/30";
    case "on hold":
      return "from-amber-500 to-yellow-600 shadow-amber-500/30";
    default:
      return "from-brand-primary to-orange-600 shadow-brand-primary/30";
  }
};

const getProgressWidth = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending": return "15%";
    case "processing": return "50%";
    case "shipped": return "75%";
    case "delivered": 
    case "completed": return "100%"; 
    default: return "10%";
  }
};

const AccountDashboardPage = async () => {
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] || "User";

  // 1. Fetch recent order metrics from Database
  const recentOrder = session?.user?.id
    ? await getRecentOrder(session.user.id)
    : null;

  // =================================================================
  // 🚀 SERVER-SIDE REFERRAL METRICS HYDRATION (LIGHTWEIGHT STATE)
  // =================================================================
  let referralCode: string | null = null;
  let conversions = 0;

  if (session?.user?.id) {
    const statsResult = await getCustomerReferralStats();
    if (statsResult.success && statsResult.stats) {
      referralCode = statsResult.stats.referralCode;
      conversions = statsResult.stats.conversions;
    }
  }
  // =================================================================

  return (
    <div className="relative min-h-150 w-full p-4 md:p-8 font-sans transition-colors duration-300">
      {/* Background Mesh (Dynamic Breathing Blurs) */}
      <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl opacity-40 pointer-events-none select-none">
        <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-brand-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="space-y-8 relative z-10">
        
        {/* === HERO SECTION === */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 select-none">
          <div>
            {/* ✅ COPYWRITING ALIGNMENT: Dynamic "Your Pocket. Our Value." Brand Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 mb-3.5 backdrop-blur-sm shadow-2xs">
              <Sparkles size={14} className="text-brand-primary fill-brand-primary/20" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-primary">Your Pocket. Our Value.</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-clash font-extrabold text-zinc-950 dark:text-white leading-tight tracking-tight uppercase">
              Hello,{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-brand-primary-hover font-black">
                {firstName}.
              </span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 text-sm md:text-base font-semibold max-w-md">
              Your personal dashboard is ready. Explore new collections &amp; exclusive deals.
            </p>
          </div>
          <Link
            href="/"
            className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-brand-primary to-brand-primary-hover text-white rounded-2xl font-bold text-xs uppercase tracking-wider font-mono transition-all duration-300 transform active:scale-95 shadow-[0_4px_15px_rgba(255,143,50,0.25)] no-underline hover:no-underline cursor-pointer"
          >
            Start Shopping
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
          </Link>
        </div>

        {/* === BENTO GRID (Unified rounded-[2.5rem] structures) === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* CARD A: ACTIVE ORDER */}
          <div className="md:col-span-2 relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800 rounded-[2.5rem] shadow-2xs hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-brand-primary/40 dark:hover:border-brand-primary/40 transition-all duration-300 group">
            <div className="p-8 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-2xl shadow-2xs select-none">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-clash font-extrabold text-zinc-950 dark:text-white uppercase leading-none">
                      {recentOrder ? "Active Order" : "No Active Orders"}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono font-bold mt-1.5 leading-none uppercase">
                      {recentOrder ? `ID: #${recentOrder.orderId}` : "Your recent purchases will show here."}
                    </p>
                  </div>
                </div>
                {recentOrder && (
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-mono font-bold text-white uppercase tracking-wider shadow-lg bg-linear-to-r select-none ${getStatusGradient(recentOrder.status)}`}>
                    {recentOrder.status}
                  </span>
                )}
              </div>

              <div className="mt-8 mb-6">
                {recentOrder ? (
                  <div className="relative pt-2 select-none">
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-850 rounded-full">
                      <div className={`h-full bg-linear-to-r ${getStatusGradient(recentOrder.status)} rounded-full relative transition-all duration-1000 ease-out`} style={{ width: getProgressWidth(recentOrder.status) }}>
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-white border-4 border-brand-primary rounded-full shadow-md" />
                      </div>
                    </div>
                    <div className="flex justify-between mt-4 font-mono">
                      <div className="flex flex-col items-start"><span className="text-[10px] font-bold dark:text-white uppercase tracking-wider">Pending</span></div>
                      <div className="flex flex-col items-center"><span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">Processing</span></div>
                      <div className="flex flex-col items-end"><span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Delivered</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-950/20 select-none">
                    <Clock className="text-zinc-300 dark:text-zinc-700 mb-2" size={24} />
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider font-mono">No recent activity</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-zinc-150 dark:border-zinc-800/80">
                <Link href="/account/orders" className="text-xs font-mono font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 hover:gap-3 transition-all group-hover:text-brand-primary no-underline hover:no-underline cursor-pointer">
                  {recentOrder ? "Track Package" : "View Order History"} <ArrowRight size={14} className="stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>

          {/* CARD B: ADDRESSES (The High-Contrast Blue Card) */}
          <Link href="/account/addresses" className="relative overflow-hidden rounded-[2.5rem] shadow-sm hover:shadow-[0_20px_50px_rgba(16,88,158,0.15)] hover:-translate-y-1 transition-all duration-300 group no-underline hover:no-underline cursor-pointer">
            <div className="absolute inset-0 bg-linear-to-br from-brand-secondary to-[#0a3a6b] z-0" />
            <div className="absolute inset-0 opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10 p-8 h-full flex flex-col justify-between text-white">
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/10 shadow-inner select-none">
                  <MapPin size={22} className="text-blue-50" />
                </div>
                <h3 className="text-2xl font-clash font-extrabold tracking-tight uppercase leading-none">Addresses</h3>
                <p className="text-blue-100/80 text-xs mt-2.5 font-bold uppercase tracking-wider font-mono leading-none">Manage delivery locations</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-[#10589E] flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-300 select-none">
                <ArrowRight size={16} strokeWidth={2.5} />
              </div>
            </div>
          </Link>

          {/* CARD C: PROFILE */}
          <Link href="/account/profile" className="md:col-span-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-2xs hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-brand-primary/40 dark:hover:border-brand-primary/40 transition-all group no-underline hover:no-underline cursor-pointer flex flex-col justify-between min-h-55">
            <div>
              <div className="flex justify-between items-start mb-6 select-none">
                <div className="w-12 h-12 bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center">
                  <CreditCard size={22} />
                </div>
                <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <CheckCircle2 size={11} className="inline mr-1" /> Verified
                </span>
              </div>
              <h3 className="text-lg font-clash font-extrabold text-zinc-900 dark:text-white uppercase leading-none">Profile Info</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 font-mono font-bold uppercase tracking-wider leading-none">Security &amp; Personal Details</p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-brand-primary transition-colors select-none">
              Edit Details <ChevronRight size={14} />
            </div>
          </Link>

          {/* CARD D: MODULAR REFERRAL TEASER PORTAL */}
          <ReferralTeaserCard referralCode={referralCode} conversions={conversions} />
        </div>
      </div>
    </div>
  );
};

export default AccountDashboardPage;