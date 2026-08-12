// 📂 src/app/shared/components/layout/MainFooter.tsx

"use client";

import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiPhone, FiMail, FiMapPin, FiAward, FiBookOpen } from 'react-icons/fi';

// ✅ Correct import from Payload types
import { GlobalSettings } from "@/sanity/lib/payload/types/GlobalSettings";

// ✅ FooterColumn with Hydration Fix
import FooterColumn, { ContactItem } from './FooterColumn';

// --- Main Footer Component ---
export default function MainFooter({
  settings,
  isMobile,
}: {
  settings: GlobalSettings;
  isMobile: boolean | null;
}) {
  const { storeContactEmail, storePhoneNumber, storeAddress, socialLinks } = settings;

  const isMobileView = isMobile === null ? false : isMobile;

  const commonLinks = {
    'Customer Service': [
      { href: "/faq", label: "Help Center" },
      { href: "/shipping-policy", label: "Shipping Policy" },
      { href: "/returns-and-refunds", label: "Returns & Refunds" },
      { href: "/contact-us", label: "Contact Us" },
    ],
    'About PocketValue': [
      { href: "/about-us", label: "Our Story" },
      { href: "/blog", label: "Our Blog", icon: FiBookOpen },
      { href: "/terms-of-service", label: "Terms of Service" },
      { href: "/privacy-policy", label: "Privacy Policy" },
    ],
    'Shop & More': [
      { href: "/deals", label: "Today's Deals" },
      { href: "/gift-cards", label: "Gift Cards" },
      { href: "/account/orders", label: "Track My Order" },
      { href: "/sell", label: "Sell on PocketValue" },
    ],
  };

  return (
    <footer
      className="bg-white dark:bg-gray-900 text-zinc-700 dark:text-gray-300 border-t border-zinc-200 dark:border-gray-800 transition-colors duration-300"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-480 mx-auto px-6 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          
          {/* --- Column 1: Brand Info & Socials (Always Open) --- */}
          <div className="pb-6 border-b border-zinc-200 dark:border-gray-800 md:pb-0 md:border-b-0 flex flex-col justify-between h-full min-w-0">
            <div>
              <div className="flex items-center gap-2.5 mb-4 select-none">
                <FiAward size={22} className="text-brand-primary" aria-hidden="true" />
                <h3 className="font-extrabold text-zinc-950 dark:text-white text-xl tracking-tight leading-none font-clash">PocketValue</h3>
              </div>

              <p className="text-sm leading-relaxed mb-6 font-sans font-semibold text-zinc-700 dark:text-gray-300">
                Quality products, unbeatable prices, delivered to your doorstep.
              </p>

              {/* Contact Info */}
              <ul className="space-y-3.5 mb-6">
                {storeAddress && <ContactItem icon={FiMapPin} text={storeAddress} />}
                {storePhoneNumber && (
                  <ContactItem icon={FiPhone} href={`tel:${storePhoneNumber}`} text={storePhoneNumber} />
                )}
                {storeContactEmail && (
                  <ContactItem icon={FiMail} href={`mailto:${storeContactEmail}`} text={storeContactEmail} />
                )}
              </ul>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3.5 mt-2">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Facebook page"
                  className="p-2.5 bg-zinc-200 dark:bg-gray-950 border border-zinc-300 dark:border-gray-800 text-zinc-700 dark:text-gray-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white rounded-xl shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <FiFacebook size={18} aria-hidden="true" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Twitter page"
                  className="p-2.5 bg-zinc-200 dark:bg-gray-950 border border-zinc-300 dark:border-gray-800 text-zinc-700 dark:text-gray-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white rounded-xl shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <FiTwitter size={18} aria-hidden="true" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Instagram page"
                  className="p-2.5 bg-zinc-200 dark:bg-gray-950 border border-zinc-300 dark:border-gray-800 text-zinc-700 dark:text-gray-300 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary dark:hover:text-white rounded-xl shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <FiInstagram size={18} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>

          {/* --- Column 2: Customer Service --- */}
          <FooterColumn title="Customer Service" isMobile={isMobileView}>
            {commonLinks['Customer Service'].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-zinc-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-sm font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* --- Column 3: About Us --- */}
          <FooterColumn title="About PocketValue" isMobile={isMobileView}>
            {commonLinks['About PocketValue'].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-zinc-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-sm font-semibold"
                >
                  {item.icon && <item.icon size={14} className="inline mr-2 text-brand-primary" aria-hidden="true" />}
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* --- Column 4: Shop & More --- */}
          {/* ✅ REACT KEY WARNING FIX: Wrapped items in <li> with unique key */}
          <FooterColumn title="Shop & More" isMobile={isMobileView}>
            {commonLinks['Shop & More'].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-zinc-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-sm font-semibold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom Bar (Copyright & Payments) */}
        <div className="mt-12 md:mt-16 border-t border-zinc-200 dark:border-gray-800 pt-6 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          <p className="select-none">&copy; {new Date().getFullYear()} PocketValue. All Rights Reserved.</p>
          <div className="flex justify-center space-x-2 mt-2 select-none" aria-label="Accepted payment methods">
            <span className="text-[9px] text-zinc-500 dark:text-zinc-500">Secured by VISA | MASTER | CASH ON DELIVERY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}