
import { auth } from "../../auth";
import { redirect } from "next/navigation";
import AccountSidebarClient from "@/app/features/storefront/customer-account/components/AccountSidebarClient";
import Breadcrumbs from "@/app/shared/components/ui/Breadcrumbs";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Auth Check
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  // Static Breadcrumbs
  const breadcrumbs = [
    { name: "Home", href: "/" },
    { name: "My Account", href: "/account" },
  ];

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-480 mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        {/* 
            🔥 MAJOR CHANGE: 
            Humne manual Grid system hata diya hai.
            Ab 'AccountSidebarClient' khud decide karega ke Desktop par 
            Sidebar kaise dikhana hai aur Mobile par Drawer kaise kholna hai.
            Ye approach zyada consistent hai.
        */}
        <AccountSidebarClient>{children}</AccountSidebarClient>
      </div>
    </main>
  );
}
