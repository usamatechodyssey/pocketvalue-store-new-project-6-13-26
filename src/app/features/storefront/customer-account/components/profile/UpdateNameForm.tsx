//UpdateNameForm.tsx
"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { updateProfile } from "../../actions/profileActions";
import { User as UserIcon, Save, Loader2, Phone } from "lucide-react";

export default function UpdateNameForm() {
  const { data: session, status, update: updateSession } = useSession();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  // ✅ FIX: Performance & UX Optimization
  // 1. Only update if session has a name.
  // 2. Only update if local 'name' is empty (Initial Load).
  // This prevents overwriting what the user is typing if the session refreshes in background.
  useEffect(() => {
    if (session?.user?.name && name === "") {
      setName(session.user.name);
    }
    // We intentionally ignore 'name' in dependencies to avoid an update loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prevent submission if name hasn't changed or is empty
    if (!name.trim() || name === session?.user?.name) {
      return;
    }
    startTransition(async () => {
      const result = await updateProfile({ name });
      if (result.success) {
        await updateSession({ trigger: "update" }); 
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";
  const disabledInputStyles =
    "bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed ring-gray-200 dark:ring-gray-800";

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl"
    >
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <UserIcon size={20} /> Personal Information
      </h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending || status !== "authenticated"}
            required
            className={inputStyles}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={session?.user?.email || ""}
            disabled
            readOnly
            className={`${inputStyles} ${disabledInputStyles}`}
          />
        </div>

        {session?.user?.phone && (
          <div>
            <label
              htmlFor="phone"
              className="flex text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 items-center gap-1.5"
            >
              <Phone size={14} /> Verified Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={session.user.phone}
              disabled
              readOnly
              className={`${inputStyles} ${disabledInputStyles}`}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || !name.trim() || name === session?.user?.name}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-bold hover:bg-brand-primary-hover disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          {isPending ? "Saving..." : "Save Name"}
        </button>
      </div>
    </form>
  );
}