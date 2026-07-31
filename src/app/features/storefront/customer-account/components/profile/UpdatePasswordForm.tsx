// /src/app/account/profile/_components/UpdatePasswordForm.tsx (FINAL & CORRECTED)

"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import { updatePassword } from "@/app/features/storefront/customer-account/actions/profileActions";
import { KeyRound, Save, Loader2 } from "lucide-react";

export default function UpdatePasswordForm() {
  // === THE FIX IS HERE: Use property names that match the Zod schema ===
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the corrected property names for checks
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }
    if (passwords.newPassword === passwords.currentPassword) {
      toast.error("New password cannot be the same as the current one.");
      return;
    }
    startTransition(async () => {
      // Now the `passwords` object shape perfectly matches what `updatePassword` expects
      const result = await updatePassword(passwords);
      if (result.success) {
        toast.success(result.message);
        await signOut({ callbackUrl: "/login" });
      } else {
        toast.error(result.message);
      }
    });
  };

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition duration-200 sm:text-sm";

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl"
    >
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <KeyRound size={20} /> Change Password
      </h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Current Password
          </label>
          {/* === THE FIX IS HERE: Update id and name attributes === */}
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={passwords.currentPassword}
            onChange={handleInputChange}
            disabled={isPending}
            required
            className={inputStyles}
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            New Password
          </label>
          {/* === THE FIX IS HERE: Update id and name attributes === */}
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={handleInputChange}
            disabled={isPending}
            required
            className={inputStyles}
          />
        </div>
        <button
          type="submit"
          disabled={
            isPending || !passwords.currentPassword || !passwords.newPassword
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary-hover disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {isPending ? "Updating..." : "Update Password"}
        </button>
      </div>
    </form>
  );
}
