


"use client";

import { useState, Suspense, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions";

// --- Social Logins Component ---
const SocialLogins = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/login";

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    if (provider === "google") setIsGoogleLoading(true);
    if (provider === "facebook") setIsFacebookLoading(true);

    // 🚀 TELEMETRY EVENT: Track Social Auth Attempt
    logUserEvent('auth_attempt', pathname, {
      method: provider,
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
          {isGoogleLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <FaGoogle className="text-[#DB4437]" />
          )}
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
          {isFacebookLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <FaFacebook className="text-[#1877F2]" />
          )}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Facebook
          </span>
        </button>
      </div>
    </>
  );
};

// --- Credentials Login Form Component ---
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/account";
  const errorParam = searchParams.get("error");
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/login";

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 Gap #13: Track Forced Login prompt trigger if user redirected from cart/wishlist
  useEffect(() => {
    if (callbackUrl && (callbackUrl.startsWith('/checkout') || callbackUrl.startsWith('/wishlist') || callbackUrl.startsWith('/cart'))) {
      const source = callbackUrl.startsWith('/checkout') ? 'checkout' : callbackUrl.startsWith('/wishlist') ? 'wishlist' : 'cart';
      
      logUserEvent('login_prompt_triggered', pathname, {
        trigger_source: source,
        user_action: 'viewed_login_page'
      });
    }
  }, [callbackUrl, pathname]);

  // Handle Credentials Signing Failures (Error tracking)
  useEffect(() => {
    if (errorParam) {
      let errorCode = "unknown_error";
      if (errorParam === "CredentialsSignin") {
        toast.error("Invalid email or password.");
        errorCode = "invalid_credentials";
      } else if (errorParam === "EmailNotVerified") {
        toast.error("Please verify your email address first.");
        errorCode = "email_not_verified";
      } else {
        toast.error("An authentication error occurred. Please try again.");
      }
      
      // 🚀 TELEMETRY EVENT: Track Failed Authentication Attempts (Gap #7)
      logUserEvent('auth_attempt', pathname, {
        method: 'credentials',
        status: 'failed',
        error_code: errorCode,
        error_message: errorParam
      });

      router.replace("/login", { scroll: false });
    }
  }, [errorParam, router, pathname]);

  const inputStyles =
    "appearance-none block w-full rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 🚀 TELEMETRY EVENT: Track Credentials Authentication Attempt
    logUserEvent('auth_attempt', pathname, {
      method: 'credentials',
      status: 'attempt',
      email: email // Secure identifier logged
    });

    await signIn("credentials", {
      email,
      password,
      callbackUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset disabled={isLoading} className="space-y-6">
        <div>
          <label
            htmlFor="email-login"
            className="block text-sm font-medium mb-1"
          >
            Email Address
          </label>
          <input
            id="email-login"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputStyles}
            // 🚀 TRACK FOCUS/BLUR FRICTION (Gap #37)
            onFocus={() => logUserEvent('form_field_interaction', pathname, { field_id: 'email-login', interaction_type: 'focus' })}
            onBlur={() => logUserEvent('form_field_interaction', pathname, { field_id: 'email-login', interaction_type: 'blur' })}
          />
        </div>
        <div>
          <div className="flex justify-between items-center">
            <label
              htmlFor="password-login"
              className="block text-sm font-medium mb-1"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <input
            id="password-login"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputStyles}
            // 🚀 TRACK FOCUS/BLUR FRICTION (Gap #37)
            onFocus={() => logUserEvent('form_field_interaction', pathname, { field_id: 'password-login', interaction_type: 'focus' })}
            onBlur={() => logUserEvent('form_field_interaction', pathname, { field_id: 'password-login', interaction_type: 'blur' })}
          />
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader2 className="animate-spin" size={20} />}
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

// --- Main Parent Component ---
export default function LoginClient() {
  return (
    <main className="flex justify-center items-center min-h-[80vh] py-12 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Login to Your Account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center pt-10">
              <Loader2 className="animate-spin text-brand-primary" />
            </div>
          }
        >
          <LoginForm />
          <SocialLogins />
        </Suspense>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-brand-primary hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </main>
  );
}