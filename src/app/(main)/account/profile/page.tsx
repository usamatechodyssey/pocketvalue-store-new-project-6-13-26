// /src/app/account/profile/page.tsx


import { User } from "lucide-react";

// Import the new, smaller components we just created
import UpdateProfileImage from "../../../features/storefront/customer-account/components/profile/UpdateProfileImage";
import UpdateNameForm from "../../../features/storefront/customer-account/components/profile/UpdateNameForm";
import UpdatePasswordForm from "../../../features/storefront/customer-account/components/profile/UpdatePasswordForm";

// This is now a simple, clean Server Component
export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* --- Page Header --- */}
      <div className="flex items-center gap-3">
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
           <User size={24} className="text-gray-700 dark:text-gray-200" />
        </div>
        <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            My Profile
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your personal information and account security.
            </p>
        </div>
      </div>
      
      {/* 
        The main content is now just an assembly of our self-contained components.
        This makes the page structure incredibly easy to read and manage.
      */}
      <div className="space-y-8">
        <UpdateProfileImage />
        <UpdateNameForm />
        <UpdatePasswordForm />
      </div>
    </div>
  );
}