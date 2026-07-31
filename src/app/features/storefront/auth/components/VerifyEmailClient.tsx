


"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MailCheck, Loader2 } from "lucide-react";
import {
  verifyUserEmail,
  resendVerificationEmail,
} from "@/app/features/storefront/auth/actions/authActions";
import { logUserEvent } from "@/app/features/admin/analytics-telemetry/action/trackingActions"; // 🚀 Telemetry import

const VerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailToVerify = searchParams.get("email");
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/verify-email";

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // 🚀 Gap #55: Stopwatch to calculate verification latency
  const mountTime = useRef<number>(Date.now());

  const otpInputStyles =
    "w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-semibold rounded-lg bg-gray-50 dark:bg-gray-900 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-all";

  // Focus the first input on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Redirect if email is missing from URL params
  useEffect(() => {
    if (!emailToVerify) {
      toast.error("Invalid session. Redirecting...");
      router.replace("/register");
    }
  }, [emailToVerify, router]);

  // Cooldown timer for the "resend" button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Loading state while waiting for email param
  if (!emailToVerify) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value } = e.target;
    if (isNaN(Number(value))) return; // Only allow numbers
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    // Move to next input if a value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]!.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Move to previous input on backspace if current input is empty
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0 &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]!.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP.");
      return;
    }
    setIsLoading(true);

    // 🚀 TELEMETRY EVENT: Track OTP Email Verification Attempt
    logUserEvent('auth_attempt', pathname, {
      method: 'email_verification',
      status: 'attempt',
      email: emailToVerify
    });

    const result = await verifyUserEmail(emailToVerify, fullOtp);
    if (result.success) {
      toast.success(result.message);
      
      const verificationDuration = Date.now() - mountTime.current;

      // 🚀 TELEMETRY EVENT: Log successful verification with dynamic OTP Latency Metrics
      logUserEvent('auth_attempt', pathname, {
        method: 'email_verification',
        status: 'success',
        email: emailToVerify,
        latency_duration_ms: verificationDuration
      });

      router.push(`/login?email=${encodeURIComponent(emailToVerify)}`);
    } else {
      toast.error(result.message);
      setIsLoading(false);

      // 🚀 TELEMETRY EVENT: Log Failed OTP Verification
      logUserEvent('auth_attempt', pathname, {
        method: 'email_verification',
        status: 'failed',
        email: emailToVerify,
        error_message: result.message || 'Incorrect OTP code.'
      });
    }
  };

  const handleResendCode = async () => {
    if (!emailToVerify || cooldown > 0) return;
    setIsResending(true);

    const result = await resendVerificationEmail(emailToVerify);
    if (result.success) {
      toast.success(result.message);
      setCooldown(60); // Start 60-second cooldown

      // 🚀 TELEMETRY EVENT: Log successful OTP resend trigger
      logUserEvent('auth_attempt', pathname, {
        method: 'resend_verification_otp',
        status: 'success',
        email: emailToVerify
      });

    } else {
      toast.error(result.message);

      // 🚀 TELEMETRY EVENT: Log Failed OTP resend trigger
      logUserEvent('auth_attempt', pathname, {
        method: 'resend_verification_otp',
        status: 'failed',
        error_message: result.message || 'Failed to resend verification email.'
      });
    }
    setIsResending(false);
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-900 flex justify-center items-center min-h-screen py-12 px-4">
      <div className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <MailCheck size={48} className="mx-auto text-brand-primary mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Verify Your Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            We&apos;ve sent a 6-digit code to <br />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {emailToVerify}
            </span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center gap-2 md:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={otpInputStyles}
                disabled={isLoading}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-primary text-on-primary font-bold rounded-lg shadow-md hover:bg-brand-primary-hover disabled:bg-opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Verifying...
              </>
            ) : (
              "Verify Account"
            )}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Didn&apos;t receive the email?{" "}
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isResending || cooldown > 0}
            className="font-medium text-brand-primary hover:underline disabled:text-gray-400 dark:disabled:text-gray-500"
          >
            {isResending
              ? "Sending..."
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend Code"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default function VerifyEmailClient() {
  return <VerifyEmailForm />;
}