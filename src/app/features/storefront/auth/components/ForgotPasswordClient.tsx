


"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { Mail, Loader2, KeyRound } from "lucide-react";
import { requestPasswordReset } from "@/app/features/storefront/auth/actions/authActions";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; // 🚀 Telemetry import

export default function ForgotPasswordClient() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/forgot-password";

  const inputStyles =
    "appearance-none block w-full flex-grow rounded-md border-0 py-2.5 px-3.5 text-gray-900 bg-white dark:text-white dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary sm:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 🚀 TELEMETRY EVENT: Track Forgot Password Loop Initiation
    logUserEvent('auth_attempt', pathname, {
      method: 'forgot_password_initiated',
      status: 'attempt',
      email: email
    });

    const result = await requestPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);

      // 🚀 TELEMETRY EVENT: Log successful recovery link dispatch
      logUserEvent('auth_attempt', pathname, {
        method: 'forgot_password_initiated',
        status: 'success',
        email: email
      });

    } else {
      toast.error(result.message);

      // 🚀 TELEMETRY EVENT: Log failed recovery dispatch (API or SMTP error)
      logUserEvent('auth_attempt', pathname, {
        method: 'forgot_password_initiated',
        status: 'failed',
        email: email,
        error_message: result.message || 'SMTP or database reset link dispatch failed.'
      });
    }
  };

  if (isSubmitted) {
    return (
      <main className="w-full bg-gray-50 dark:bg-gray-900 flex justify-center items-center min-h-screen py-12 px-4">
        <div className="w-full max-w-md p-8 sm:p-10 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <Mail size={48} className="mx-auto text-brand-primary mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Check Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            If an account with that email exists, we&apos;ve sent a link to
            reset your password.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-brand-primary hover:underline"
          >
            ← Back to Login
          </Link>
        </div>
      </main>
    );
  }
  return (
    <main className="w-full bg-gray-50 dark:bg-gray-900 flex min-h-[80vh] justify-center items-center  py-12 px-4">
      <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <KeyRound size={40} className="mx-auto text-brand-primary mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Forgot Your Password?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            No problem. Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email-forgot"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email-forgot"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={`mt-1 ${inputStyles}`}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-white font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-primary hover:underline"
          >
            Log in here
          </Link>
        </p>
      </div>
    </main>
  );
}