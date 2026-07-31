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

  // ✅ isMobile=null on SSR means treat as desktop
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
      className="bg-gray-900 dark:bg-black text-gray-300 border-t border-brand-primary/30"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-480 mx-auto px-6 py-10 md:py-16">
        {/* Main Grid: Mobile Accordion or Desktop Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          {/* --- Column 1: Brand Info & Socials (Always Open) --- */}
          <div className="pb-6 border-b border-gray-700 dark:border-gray-800 md:pb-0 md:border-b-0">
            <div className="flex items-center gap-2 mb-4">
              <FiAward size={24} className="text-brand-primary" aria-hidden="true" />
              <h3 className="font-extrabold text-white text-xl tracking-tight">PocketValue</h3>
            </div>

            <p className="text-sm leading-relaxed mb-6">
              Quality products, unbeatable prices, delivered to your doorstep.
            </p>

            {/* Contact Info */}
            <ul className="space-y-3 mb-6">
              {storeAddress && <ContactItem icon={FiMapPin} text={storeAddress} />}
              {storePhoneNumber && (
                <ContactItem icon={FiPhone} href={`tel:${storePhoneNumber}`} text={storePhoneNumber} />
              )}
              {storeContactEmail && (
                <ContactItem icon={FiMail} href={`mailto:${storeContactEmail}`} text={storeContactEmail} />
              )}
            </ul>

            {/* Social Icons with aria-label and aria-hidden */}
            <div className="flex space-x-5 mt-4">
              {socialLinks?.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Facebook page"
                  className="text-gray-400 hover:text-brand-primary transition-colors"
                >
                  <FiFacebook size={20} aria-hidden="true" />
                </a>
              )}
              {socialLinks?.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Twitter page"
                  className="text-gray-400 hover:text-brand-primary transition-colors"
                >
                  <FiTwitter size={20} aria-hidden="true" />
                </a>
              )}
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit our Instagram page"
                  className="text-gray-400 hover:text-brand-primary transition-colors"
                >
                  <FiInstagram size={20} aria-hidden="true" />
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
                  className="text-gray-300 hover:text-brand-primary transition-colors text-sm"
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
                  className="text-gray-300 hover:text-brand-primary transition-colors text-sm"
                >
                  {item.icon && <item.icon size={16} className="inline mr-2" aria-hidden="true" />}
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* --- Column 4: Shop & More --- */}
          <FooterColumn title="Shop & More" isMobile={isMobileView}>
            {commonLinks['Shop & More'].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-gray-300 hover:text-brand-primary transition-colors text-sm"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>
        </div>

        {/* Bottom Bar (Copyright & Payments) */}
        <div className="mt-10 md:mt-16 border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} PocketValue. All Rights Reserved.</p>
          <div className="flex justify-center space-x-2 mt-2" aria-label="Accepted payment methods">
            {/* ✅ contrast fix: text-gray-500 to text-gray-400 */}
            <span className="text-xs text-gray-400">Secured by VISA | MASTER | COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}