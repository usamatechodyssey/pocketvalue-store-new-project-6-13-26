// 📂 src/app/(payload)/admin/views/UserDetail.tsx (CYBER-HUD HARDENED & NEXT.JS 15 READY)

import { DefaultTemplate } from '@payloadcms/next/templates';
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Mail, Phone, DollarSign, Power, MapPin, Calendar, 
  Award, Hash
} from "lucide-react";

import { getSingleUserPayload } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";

// ================================================================
// 🧩 REUSABLE INFO CARD (Cyber-HUD Standard)
// ================================================================
const InfoCard = ({ icon, title, children }: any) => (
  <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
    <h2 className="text-xs font-bold uppercase tracking-wider font-mono mb-5 text-zinc-800 dark:text-zinc-200 flex items-center gap-2.5 border-b border-zinc-150 dark:border-zinc-850 pb-3">
      {icon} {title}
    </h2>
    {children}
  </div>
);

// ================================================================
// 🎨 STATUS COLOR HELPER
// ================================================================
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered": return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
    case "completed": return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20";
    case "shipped": return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
    case "cancelled": return "bg-red-500/10 text-red-600 border border-red-500/20";
    case "rto": return "bg-red-500/10 text-red-600 border border-red-500/20";
    case "processing": return "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20";
    default: return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
  }
};

// ================================================================
// 🚀 MAIN PAGE COMPONENT
// ================================================================
export default async function UserDetailView(props: any) {
  // ✅ FIX 1: Next.js 15 Async Resolution for searchParams & params promises
  const { initPageResult, params: paramsPromise, searchParams: searchParamsPromise } = props;
  const params = await paramsPromise;
  const searchParams = await searchParamsPromise;
  
  const segments = params?.segments || [];
  const userId = params?.id || (segments.length > 1 ? segments[segments.length - 1] : null);

  // Safe Props for Payload Dashboard
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const payload = props.payload || initPageResult?.req?.payload;
  const currentUser = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

  if (!userId) {
    return (
      <DefaultTemplate
        i18n={i18n} locale={locale} params={params} payload={payload}
        permissions={permissions} searchParams={searchParams}
        user={currentUser} visibleEntities={visibleEntities}
      >
        <div className="p-8 text-red-500 font-bold font-mono text-center text-xs">
          Error: User ID Missing from URL segments.
        </div>
      </DefaultTemplate>
    );
  }

  const data = await getSingleUserPayload(userId);
  if (!data) return notFound();

  const { user, stats, recentOrders } = data;

  return (
    <DefaultTemplate
      i18n={i18n} locale={locale} params={params} payload={payload}
      permissions={permissions} searchParams={searchParams}
      user={currentUser} visibleEntities={visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-6 max-w-[1750px] mx-auto bg-zinc-50/40 dark:bg-zinc-950/20">
        
        {/* ================================================================
        // 🔙 HEADER WITH BACK BUTTON & USER AVATAR
        // ================================================================ */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <Link href="/admin/users-explorer" className="inline-flex items-center gap-2 text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors no-underline hover:no-underline mb-5">
            <ArrowLeft size={13} className="stroke-[2.5px]"/> Back to Customers
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <Image unoptimized src={user.image || '/default-avatar.png'} alt="" fill className="object-cover p-1 rounded-xl"/>
              </div>
              <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">{user.name}</h1>
                    <span className="text-[10px] font-mono font-bold border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 px-2.5 py-0.5 rounded shadow-2xs">
                      CRM Profile
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-2 font-mono">
                      <Calendar size={13}/> Joined {new Date(user.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
              </div>
          </div>
        </div>

        {/* ================================================================
        // 📊 CONTENT GRID (Left: Orders, Right: Sidebar Info)
        // ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* ============ LEFT COLUMN: ORDER HISTORY ============ */}
          <div className="lg:col-span-2 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-xs border border-zinc-200 dark:border-zinc-800">
                  <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-150 dark:border-zinc-850">
                      <h2 className="text-sm font-bold dark:text-zinc-100 font-mono uppercase tracking-wider">Recent Order History</h2>
                      <span className="bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                        {stats.totalOrders} Total
                      </span>
                  </div>

                  {recentOrders.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-850">
                          <table className="w-full text-xs">
                              <thead className="bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                                <tr>
                                  <th className="p-3 text-left">Order ID</th>
                                  <th className="p-3 text-left">Date</th>
                                  <th className="p-3 text-center">Status</th>
                                  <th className="p-3 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                                  {recentOrders.map((order: any) => (
                                      <tr key={order._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                                          <td className="p-3 font-mono font-semibold">
                                              <Link href={`/admin/orders/${order._id}`} className="text-brand-primary font-bold hover:text-brand-primary/80 transition-colors no-underline hover:no-underline flex items-center gap-1.5">
                                                <Hash size={12} className="opacity-50" /> {order._id.slice(-6).toUpperCase()}
                                              </Link>
                                          </td>
                                          <td className="p-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">{new Date(order.orderDate).toLocaleDateString('en-PK')}</td>
                                          <td className="p-3 text-center">
                                              <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                {order.status}
                                              </span>
                                          </td>
                                          <td className="p-3 text-right font-bold text-zinc-900 dark:text-zinc-100 font-mono text-sm">
                                            Rs. {order.totalPrice.toLocaleString('en-PK')}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="text-center py-16 text-zinc-400 dark:text-zinc-600 italic border border-dashed dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10 font-mono text-xs">
                        This customer hasn't placed any orders yet.
                      </div>
                  )}
              </div>
          </div>

          {/* ============ RIGHT COLUMN: SIDEBAR INFO ============ */}
          <div className="space-y-6 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* --- CARD 1: CUSTOMER OVERVIEW --- */}
              <InfoCard icon={<DollarSign size={16} className="text-brand-primary"/>} title="Customer Overview">
                  <div className="space-y-4 text-xs font-mono">
                      <div className="flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-850">
                          <Mail size={14} className="text-zinc-400 dark:text-zinc-500"/>
                          <a href={`mailto:${user.email}`} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline truncate no-underline">{user.email}</a>
                      </div>
                      <div className="flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-850">
                          <Phone size={14} className="text-zinc-400 dark:text-zinc-500"/>
                          <span className="dark:text-zinc-300 font-semibold">{user.phone || 'No phone provided'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-zinc-150 dark:border-zinc-850">
                          <div className="text-center">
                              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider mb-1">Lifetime Spend</p>
                              <p className="text-xl font-black text-brand-primary">Rs. {stats.totalSpend.toLocaleString('en-PK')}</p>
                          </div>
                          <div className="text-center border-l border-zinc-150 dark:border-zinc-850">
                              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider mb-1">Total Orders</p>
                              <p className="text-xl font-black text-zinc-900 dark:text-zinc-100">{stats.totalOrders}</p>
                          </div>
                      </div>
                  </div>
              </InfoCard>

              {/* --- CARD 2: LOYALTY & REFERRALS CRM PORTAL --- */}
              <InfoCard icon={<Award size={16} className="text-brand-primary"/>} title="Loyalty & Referrals">
                <div className="space-y-4 text-xs font-semibold font-mono">
                  
                  {/* Referral Code */}
                  <div className="flex justify-between items-center py-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
                    <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Referral Code:</span>
                    <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                      {user.referralCode || <span className="italic font-sans text-[10px] text-zinc-400 font-normal">None</span>}
                    </span>
                  </div>

                  {/* Lifetime Spend (VIP Progress) */}
                  <div className="flex justify-between items-center py-2 border-b border-zinc-150 dark:border-zinc-850 pb-3">
                    <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Lifetime Spend (VIP):</span>
                    <span className="font-bold text-sm text-brand-primary">
                      Rs. {stats.totalSpend.toLocaleString('en-PK')}
                    </span>
                  </div>

                  {/* Referred By */}
                  <div className="py-2 border-b border-zinc-150 dark:border-zinc-850 pb-4">
                    <span className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px] block mb-2">Referred By:</span>
                    {user.referredBy ? (
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                        <div className="truncate flex-1">
                          <p className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{user.referredBy.name}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">{user.referredBy.email}</p>
                        </div>
                        <Link
                          href={`/admin/users-explorer/${user.referredBy._id}`}
                          className="px-3 py-1.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0 no-underline hover:no-underline"
                          title="Open Referrer CRM Profile"
                        >
                          View Profile
                        </Link>
                      </div>
                    ) : (
                      <span className="italic text-zinc-400 dark:text-zinc-600 font-medium font-sans text-xs">Direct Storefront Registration (No Referrer)</span>
                    )}
                  </div>

                  {/* Enterprise Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {/* Clicks logged from Redis */}
                    <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                      <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Clicks Logged</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1">{stats.referralClicks || 0}</p>
                    </div>

                    {/* Joined Friends */}
                    <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 text-center">
                      <p className="text-[9px] uppercase font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">Friends Joined</p>
                      <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1">{stats.totalSignups || 0}</p>
                    </div>

                    {/* Verified Purchases */}
                    <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/10 text-center">
                      <p className="text-[9px] uppercase font-bold text-emerald-600/70 dark:text-emerald-500/70 tracking-wider">Conversions</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.conversions || 0}</p>
                    </div>

                    {/* Active Vouchers */}
                    <div className="p-3 bg-purple-500/5 dark:bg-purple-950/20 rounded-xl border border-purple-500/10 text-center">
                      <p className="text-[9px] uppercase font-bold text-purple-600/70 dark:text-purple-500/70 tracking-wider">Active Vouchers</p>
                      <p className="text-sm font-black text-purple-600 dark:text-purple-400 mt-1">{stats.assignedCouponsCount || 0}</p>
                    </div>
                  </div>

                </div>
              </InfoCard>

              {/* --- CARD 3: ADDRESS BOOK --- */}
              <InfoCard icon={<MapPin size={16} className="text-brand-primary"/>} title="Address Book">
                  {user.addresses.length > 0 ? (
                      <div className="space-y-4 font-mono">
                          {user.addresses.map((addr: any, index: number) => (
                              <div key={index} className="p-4 bg-zinc-50/50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 relative overflow-hidden">
                                  {addr.isDefault && <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] font-black px-2.5 py-1 rounded-bl-lg uppercase tracking-wider">Default</div>}
                                  <address className="text-xs text-zinc-600 dark:text-zinc-400 not-italic leading-relaxed font-sans mt-2">
                                      <span className="font-bold text-zinc-900 dark:text-zinc-200 block mb-1.5 font-mono">{addr.fullName}</span>
                                      {addr.address}, {addr.area}<br/>
                                      {addr.city}, {addr.province}<br/>
                                      <span className="font-bold font-mono mt-1.5 block text-zinc-700 dark:text-zinc-300">Phone: {addr.phone}</span>
                                  </address>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-xs text-zinc-400 dark:text-zinc-600 italic text-center py-6 font-mono border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10">No saved addresses.</p>
                  )}
              </InfoCard>

              {/* --- CARD 4: DANGER ZONE --- */}
              <div className="bg-red-500/5 dark:bg-red-950/20 p-6 rounded-2xl border border-red-500/20">
                  <h3 className="text-red-700 dark:text-red-400 font-bold flex items-center gap-2 mb-3 text-xs uppercase tracking-wider font-mono">
                    <Power size={14} className="stroke-[2.5px]" /> Danger Zone
                  </h3>
                  <p className="text-[11px] text-red-600/70 dark:text-red-400/70 mb-5 leading-relaxed font-medium">Once disabled, the customer will not be able to log in or place new orders.</p>
                  <button className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shadow-red-500/10 cursor-pointer">
                      Disable Customer Account
                  </button>
              </div>

          </div>
        </div>

      </div>
    </DefaultTemplate>
  );
}