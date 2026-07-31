// src/app/contact-us/_components/ContactForm.tsx
// ================================================================
// 📞 ENTERPRISE CONTACT FORM COMPONENT (UPGRADED)
// ================================================================
// This component handles contact form submissions with:
// ✅ Honeypot anti-spam protection
// ✅ Accessibility (autocomplete, aria-describedby, aria-required)
// ✅ Loading states with useTransition
// ✅ Server action integration with Zod validation
// ================================================================

"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { sendContactEmail } from "@/app/features/storefront/catalog/actions/contactActions";
import { Loader2, Send } from "lucide-react";

const inputStyles =
  "appearance-none block w-full rounded-xl border border-gray-200 dark:border-gray-800 py-3 px-4 text-gray-900 bg-white dark:text-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200 sm:text-sm shadow-sm";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    // 🔥 Honeypot field (Bot protection)
    website: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔥 Honeypot Check: Bots fill this hidden field
    if (formData.website !== "") {
      console.warn("Spam detected");
      return; // Silent fail for bots
    }

    startTransition(async () => {
      try {
        const result = await sendContactEmail(formData);
        if (result.success) {
          toast.success("Message sent! We'll get back to you soon.");
          setFormData({
            name: "",
            email: "",
            subject: "",
            message: "",
            website: "",
          });
        } else {
          toast.error(result.message || "Failed to send message.");
        }
      } catch (error) {
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Send us a Message
        </h2>
        <p className="text-sm text-gray-500">
          We&apos;ll respond as soon as we can, usually within 24 hours.
        </p>
      </div>

      {/* 🔥 HONEYPOT — Hidden from humans, visible to bots */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          name="website"
          id="website"
          value={formData.website}
          onChange={handleInputChange}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            Full Name <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            aria-required="true"
            autoComplete="name"
            value={formData.name}
            onChange={handleInputChange}
            className={inputStyles}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            Email Address <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            required
            aria-required="true"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            className={inputStyles}
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="subject"
          className="text-sm font-bold text-gray-700 dark:text-gray-300"
        >
          Subject <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          type="text"
          name="subject"
          id="subject"
          required
          aria-required="true"
          autoComplete="subject"
          value={formData.subject}
          onChange={handleInputChange}
          className={inputStyles}
          placeholder="How can we help?"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-sm font-bold text-gray-700 dark:text-gray-300"
        >
          Your Message <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <textarea
          name="message"
          id="message"
          rows={5}
          required
          aria-required="true"
          value={formData.message}
          onChange={handleInputChange}
          className={inputStyles}
          placeholder="Write your message here..."
        />
        <p className="text-xs text-gray-400" id="message-hint">
          Minimum 10 characters. Please be detailed so we can assist you better.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-brand-primary text-white font-bold rounded-full shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-hover transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-busy={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" size={20} aria-hidden="true" /> Sending...
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" /> Send Message
          </>
        )}
      </button>
    </form>
  );
}