
import { DefaultTemplate } from '@payloadcms/next/templates';
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Mail, Phone, DollarSign, Power, MapPin, Calendar, 
  Award
} from "lucide-react";

import { getSingleUserPayload } from "@/app/features/admin/inventory-cms/actions/payloadCustomerActions";

// ================================================================
// 🧩 REUSABLE INFO CARD
// ================================================================
const InfoCard = ({ icon, title, children }: any) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-3">
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
    case "delivered": return "bg-green-100 text-green-700";
    case "shipped": return "bg-blue-100 text-blue-700";
    case "cancelled": return "bg-red-100 text-red-700";
    case "processing": return "bg-indigo-100 text-indigo-700";
    default: return "bg-yellow-100 text-yellow-700";
  }
};

// ================================================================
// 🚀 MAIN PAGE COMPONENT
// ================================================================
export default async function UserDetailView(props: any) {
  const { initPageResult, params: paramsPromise } = props;
  const params = await paramsPromise;
  
  const segments = params?.segments || [];
  const userId = params?.id || (segments.length > 1 ? segments[segments.length - 1] : null);

  if (!userId) return <div className="p-8 text-red-500">User ID Missing.</div>;

  const data = await getSingleUserPayload(userId);
  if (!data) return notFound();

  const { user, stats, recentOrders } = data;

  // Safe Props for Payload Dashboard
  const i18n = props.i18n || initPageResult?.req?.i18n;
  const locale = props.locale || initPageResult?.locale;
  const payload = props.payload || initPageResult?.req?.payload;
  const currentUser = props.user || initPageResult?.req?.user;
  const permissions = props.permissions || initPageResult?.permissions;
  const visibleEntities = props.visibleEntities || initPageResult?.visibleEntities;

  return (
    <DefaultTemplate
      i18n={i18n} locale={locale} params={params} payload={payload}
      permissions={permissions} searchParams={props.searchParams}
      user={currentUser} visibleEntities={visibleEntities}
    >
      <div className="tw-admin-wrapper p-4 md:p-8 space-y-8">
        
        {/* ================================================================
        // 🔙 HEADER WITH BACK BUTTON & USER AVATAR
        // ================================================================ */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <Link href="/admin/users-explorer" className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline mb-4">
            <ArrowLeft size={16}/> Back to Customers
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="relative h-20 w-20 shrink-0 rounded-full border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden bg-gray-200">
                  <Image unoptimized src={user.image || '/default-avatar.png'} alt="" fill className="object-cover"/>
              </div>
              <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{user.name}</h1>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Calendar size={14}/> Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                  </p>
              </div>
          </div>
        </div>

        {/* ================================================================
        // 📊 CONTENT GRID (Left: Orders, Right: Sidebar Info)
        // ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ============ LEFT COLUMN: ORDER HISTORY ============ */}
          <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold dark:text-white">Recent Order History</h2>
                      <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest opacity-60">
                        {stats.totalOrders} Total
                      </span>
                  </div>

                  {recentOrders.length > 0 ? (
                      <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                              <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-[10px] font-bold">
                                <tr>
                                  <th className="p-3 text-left">Order ID</th>
                                  <th className="p-3 text-left">Date</th>
                                  <th className="p-3 text-center">Status</th>
                                  <th className="p-3 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                  {recentOrders.map((order: any) => (
                                      <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                          <td className="p-3 font-mono">
                                              <Link href={`/admin/orders/${order._id}`} className="text-brand-primary font-bold hover:underline">
                                                #{order._id.slice(-6).toUpperCase()}
                                              </Link>
                                          </td>
                                          <td className="p-3 opacity-70">{new Date(order.orderDate).toLocaleDateString()}</td>
                                          <td className="p-3 text-center">
                                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${getStatusColor(order.status)}`}>
                                                {order.status}
                                              </span>
                                          </td>
                                          <td className="p-3 text-right font-bold text-gray-900 dark:text-white">Rs. {order.totalPrice.toLocaleString()}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  ) : (
                      <div className="text-center py-12 text-gray-400 italic border-2 border-dashed dark:border-gray-700 rounded-lg">
                        This customer hasn't placed any orders yet.
                      </div>
                  )}
              </div>
          </div>

          {/* ============ RIGHT COLUMN: SIDEBAR INFO ============ */}
          <div className="space-y-8 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700">
              
              {/* --- CARD 1: CUSTOMER OVERVIEW --- */}
              <InfoCard icon={<DollarSign size={20} className="text-brand-primary"/>} title="Customer Overview">
                  <div className="space-y-4 text-sm">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border dark:border-gray-700">
                          <Mail size={16} className="text-gray-400"/>
                          <a href={`mailto:${user.email}`} className="text-blue-600 font-medium hover:underline truncate">{user.email}</a>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border dark:border-gray-700">
                          <Phone size={16} className="text-gray-400"/>
                          <span className="dark:text-gray-200">{user.phone || 'No phone provided'}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                          <div className="text-center">
                              <p className="text-[10px] uppercase font-bold text-gray-400">Lifetime Spend</p>
                              <p className="text-xl font-black text-brand-primary">Rs. {stats.totalSpend.toLocaleString()}</p>
                          </div>
                          <div className="text-center border-l dark:border-gray-700">
                              <p className="text-[10px] uppercase font-bold text-gray-400">Total Orders</p>
                              <p className="text-xl font-black dark:text-white">{stats.totalOrders}</p>
                          </div>
                      </div>
                  </div>
              </InfoCard>

              {/* --- CARD 2: LOYALTY & REFERRALS CRM PORTAL --- */}
              <InfoCard icon={<Award size={20} className="text-brand-primary"/>} title="Loyalty &amp; Referrals">
                <div className="space-y-4 text-xs font-semibold">
                  
                  {/* Referral Code */}
                  <div className="flex justify-between items-center py-1.5 border-b dark:border-gray-700/50 pb-2">
                    <span className="text-gray-450 uppercase tracking-wider text-[10px]">Referral Code:</span>
                    <span className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                      {user.referralCode || <span className="italic font-sans text-xs text-gray-400">None</span>}
                    </span>
                  </div>

                  {/* Lifetime Spend (VIP Progress) */}
                  <div className="flex justify-between items-center py-1.5 border-b dark:border-gray-700/50 pb-2">
                    <span className="text-gray-450 uppercase tracking-wider text-[10px]">Lifetime Spend (VIP):</span>
                    <span className="font-mono font-bold text-sm text-brand-primary">
                      Rs. {stats.totalSpend.toLocaleString()}
                    </span>
                  </div>

                  {/* Referred By */}
                  <div className="py-1.5 border-b dark:border-gray-700/50 pb-2.5">
                    <span className="text-gray-450 uppercase tracking-wider text-[10px] block mb-1.5">Referred By:</span>
                    {user.referredBy ? (
                      <div className="p-2.5 bg-gray-50 dark:bg-gray-900/40 rounded-lg border dark:border-gray-700/60 flex justify-between items-center">
                        <div className="truncate flex-1">
                          <p className="font-bold text-gray-900 dark:text-zinc-100">{user.referredBy.name}</p>
                          <p className="text-[10px] text-gray-450 mt-0.5 truncate">{user.referredBy.email}</p>
                        </div>
                        <Link
                          href={`/admin/users-explorer/${user.referredBy._id}`}
                          className="px-2.5 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-md text-[10px] font-bold uppercase transition-colors shrink-0"
                          title="Open Referrer CRM Profile"
                        >
                          View Profile
                        </Link>
                      </div>
                    ) : (
                      <span className="italic text-gray-400 font-medium">Direct Storefront Registration (No Referrer)</span>
                    )}
                  </div>

                  {/* Enterprise Metrics Grid (Clicks, Signups, Conversions, Vouchers) */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    
                    {/* Clicks - ✅ Now reads from Redis (same as customer dashboard) */}
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-700 text-center">
                      <p className="text-[9px] uppercase font-bold text-gray-450">Clicks Logged</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{stats.referralClicks || 0}</p>
                    </div>

                    {/* Joined Friends */}
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-700 text-center">
                      <p className="text-[9px] uppercase font-bold text-gray-450">Friends Joined</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{stats.totalSignups || 0}</p>
                    </div>

                    {/* Verified Purchases */}
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-700 text-center">
                      <p className="text-[9px] uppercase font-bold text-gray-450">Conversions</p>
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.conversions || 0}</p>
                    </div>

                    {/* Active Vouchers */}
                    <div className="p-2.5 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-700 text-center">
                      <p className="text-[9px] uppercase font-bold text-gray-450">Active Vouchers</p>
                      <p className="text-sm font-black text-purple-600 dark:text-purple-400 mt-1">{stats.assignedCouponsCount || 0}</p>
                    </div>

                  </div>

                </div>
              </InfoCard>

              {/* --- CARD 3: ADDRESS BOOK --- */}
              <InfoCard icon={<MapPin size={20} className="text-brand-primary"/>} title="Address Book">
                  {user.addresses.length > 0 ? (
                      <div className="space-y-4">
                          {user.addresses.map((addr: any, index: number) => (
                              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg border dark:border-gray-700 relative overflow-hidden">
                                  {addr.isDefault && <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-black px-2 py-0.5 rounded-bl-md uppercase">Default</div>}
                                  <address className="text-xs text-gray-600 dark:text-gray-400 not-italic leading-relaxed">
                                      <span className="font-bold text-gray-900 dark:text-gray-200 block mb-1">{addr.fullName}</span>
                                      {addr.address}, {addr.area}<br/>
                                      {addr.city}, {addr.province}<br/>
                                      <span className="font-bold">Phone: {addr.phone}</span>
                                  </address>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-sm text-gray-500 italic text-center py-4">No saved addresses.</p>
                  )}
              </InfoCard>

              {/* --- CARD 4: DANGER ZONE --- */}
              <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30">
                  <h3 className="text-red-700 dark:text-red-400 font-bold flex items-center gap-2 mb-3">
                    <Power size={18}/> Danger Zone
                  </h3>
                  <p className="text-xs text-red-600/70 mb-4 leading-tight">Once disabled, the customer will not be able to log in or place new orders.</p>
                  <button className="w-full py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md">
                      Disable Customer Account
                  </button>
              </div>

          </div>
        </div>

      </div>
    </DefaultTemplate>
  );
}