
import { auth } from "@/app/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Package,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { getSingleUserReturnRequest } from "@/app/features/storefront/customer-account/actions/returnActions";
import ReturnItemCard from "../../../../features/storefront/customer-account/components/returns/ReturnItemCard";

// Reusable InfoCard Component
const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
    <h2 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-200 flex items-center gap-3">
      {icon}
      {title}
    </h2>
    {children}
  </div>
);

// ✅ Next.js 16 Requirement: Props validation
export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<{ returnId: string }>;
}) {
  const session = await auth();

  // Security Check: Ensure user is logged in
  if (!session?.user?.id) {
    redirect("/login");
  }

  // ✅ Next.js 16 Fix: Await params
  const { returnId } = await params;

  // Fetch single return from MongoDB + Payload Product data
  const request = await getSingleUserReturnRequest(returnId);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <Link
          href="/account/returns"
          className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:underline mb-4"
        >
          <ArrowLeft size={16} /> Back to My Returns
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Return Request Details
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span className="font-mono font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            #{request._id.slice(-6).toUpperCase()}
          </span>
          <span className="mx-2 opacity-30">•</span>
          <span>
            Requested on{" "}
            {new Date(request.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* 1. Request Summary Card */}
      <InfoCard
        icon={<FileText size={20} className="text-brand-primary" />}
        title="Request Summary"
      >
        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b dark:border-gray-700 pb-2">
            <span className="text-gray-500">Current Status:</span>
            <span className="font-black text-brand-primary uppercase tracking-tighter">
              {request.status}
            </span>
          </div>
          <div className="flex justify-between border-b dark:border-gray-700 pb-2">
            <span className="text-gray-500">Related Order:</span>
            <Link
              href={`/account/orders/${request.orderNumber}`}
              className="font-bold text-gray-800 dark:text-gray-200 hover:text-brand-primary underline decoration-brand-primary/30"
            >
              #{request.orderNumber}
            </Link>
          </div>
          {request.resolution && (
            <div className="flex justify-between items-center bg-green-500/5 p-2 rounded-lg">
              <span className="text-gray-500">Resolution Decision:</span>
              <span className="font-bold text-green-600 flex items-center gap-1.5 uppercase text-[10px] tracking-widest">
                <CheckCircle size={14} /> {request.resolution}
              </span>
            </div>
          )}
        </div>
      </InfoCard>

      {/* 2. Items List Card */}
      <InfoCard
        icon={<Package size={20} className="text-brand-primary" />}
        title={`Return Inventory (${request.items.length} Items)`}
      >
        <div className="space-y-4 divide-y divide-gray-100 dark:divide-gray-700 -mt-4">
          {request.items.map((item) => (
            <ReturnItemCard key={item.variantKey} item={item} />
          ))}
        </div>
      </InfoCard>

      {/* 3. Comments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {request.customerComments && (
          <InfoCard
            icon={<MessageSquare size={20} className="text-blue-500" />}
            title="Your Communication"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border dark:border-gray-700">
              &quot;{request.customerComments}&quot;
            </p>
          </InfoCard>
        )}

        {request.adminComments && (
          <InfoCard
            icon={<MessageSquare size={20} className="text-brand-primary" />}
            title="PocketValue Team Notes"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300 italic leading-relaxed bg-brand-primary/5 p-4 rounded-xl border border-brand-primary/10">
              &quot;{request.adminComments}&quot;
            </p>
          </InfoCard>
        )}
      </div>

      <div className="text-center pt-10">
        <p className="text-xs text-gray-500 font-medium italic">
          * Our team usually reviews return requests within 24-48 business
          hours.
        </p>
      </div>
    </div>
  );
}
