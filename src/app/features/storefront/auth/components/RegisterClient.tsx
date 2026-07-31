

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { RegisterSchema } from "@/app/shared/lib/zodSchemas"; 
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"; 
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; // 🚀 Telemetry import

// Social Logins component
const SocialLogins = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/register";

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    if (provider === "google") setIsGoogleLoading(true);
    if (provider === "facebook") setIsFacebookLoading(true);
    
    // 🚀 TELEMETRY EVENT: Track Social Registration Attempt
    logUserEvent('auth_attempt', pathname, {
      method: `register_${provider}`,
      status: 'attempt'
    });

    await signIn(provider, { callbackUrl });
  };

  return (
    <>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin("google")}
          disabled={isGoogleLoading || isFacebookLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <FaGoogle className="text-[#DB4437]" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Google
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          disabled={isGoogleLoading || isFacebookLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          <FaFacebook className="text-[#1877F2]" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Facebook
          </span>
        </button>
      </div>
    </>
  );
};

type FormData = z.infer<typeof RegisterSchema>;

export default function RegisterClient() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/register";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(RegisterSchema), 
  });
  
  const router = useRouter();

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  // Credentials Submission Handler with Telemetry mapping
  const onSubmit = async (data: FormData) => {
    // 🚀 TELEMETRY EVENT: Track Credentials Registration Attempt (Gap #7)
    logUserEvent('auth_attempt', pathname, {
      method: 'register_credentials',
      status: 'attempt',
      email: data.email
    });

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        
        // 🚀 TELEMETRY EVENT: Track Registration Success
        logUserEvent('auth_attempt', pathname, {
          method: 'register_credentials',
          status: 'success',
          email: data.email
        });

        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(result.message);

        // 🚀 TELEMETRY EVENT: Track Registration Failure (API rejected)
        logUserEvent('auth_attempt', pathname, {
          method: 'register_credentials',
          status: 'failed',
          error_message: result.message || 'API Registration rejection.'
        });
      }
    } catch (error: any) {
      console.error("Registration Error:", error);
      toast.error("An unexpected error occurred. Please try again.");

      // 🚀 TELEMETRY EVENT: Track Registration Failure (Network/Server crash)
      logUserEvent('auth_attempt', pathname, {
        method: 'register_credentials',
        status: 'failed',
        error_message: error.message || 'Unexpected network/server registration failure.'
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
          Create Your Account
        </h1>
        <SocialLogins />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              // 🚀 TRACK FOCUS/BLUR FRICTION INTEGRATED SEAMLESSLY WITH RHF (React Hook Form)
              {...register("name", {
                onBlur: () => logUserEvent('form_field_interaction', pathname, { field_id: 'register-name', interaction_type: 'blur', has_error: !!errors.name })
              })} 
              onFocus={() => logUserEvent('form_field_interaction', pathname, { field_id: 'register-name', interaction_type: 'focus' })}
              className={inputStyles} 
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              // 🚀 TRACK FOCUS/BLUR FRICTION INTEGRATED SEAMLESSLY WITH RHF
              {...register("email", {
                onBlur: () => logUserEvent('form_field_interaction', pathname, { field_id: 'register-email', interaction_type: 'blur', has_error: !!errors.email })
              })}
              onFocus={() => logUserEvent('form_field_interaction', pathname, { field_id: 'register-email', interaction_type: 'focus' })}
              className={inputStyles}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              // 🚀 TRACK FOCUS/BLUR FRICTION INTEGRATED SEAMLESSLY WITH RHF
              {...register("password", {
                onBlur: () => logUserEvent('form_field_interaction', pathname, { field_id: 'register-password', interaction_type: 'blur', has_error: !!errors.password })
              })}
              onFocus={() => logUserEvent('form_field_interaction', pathname, { field_id: 'register-password', interaction_type: 'focus' })}
              className={inputStyles}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-primary-hover disabled:bg-opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-primary hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}