// "use client";

// import { useState } from 'react';
// import Link from 'next/link';
// import { FiFacebook, FiTwitter, FiInstagram, FiPhone, FiMail, FiMapPin, FiChevronDown, FiChevronUp, FiAward, FiBookOpen, FiBriefcase } from 'react-icons/fi';
// import { GlobalSettings } from '@/sanity/lib/queries';
// import { motion, AnimatePresence } from 'framer-motion';

// // --- Reusable Contact Item Component ---
// const ContactItem = ({ icon: Icon, href, text }: { icon: React.ElementType; href?: string; text: string; }) => (
//   <li className="flex items-start gap-3">
//     <Icon className="mt-1 h-4 w-4 shrink-0 text-brand-primary" />
//     {href ? (
//       <a href={href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">{text}</a>
//     ) : (
//       <span className="text-gray-300 text-sm">{text}</span>
//     )}
//   </li>
// );

// // --- Reusable Accordion/Column Component ---
// const FooterColumn = ({ title, children, isMobile }: { title: string, children: React.ReactNode, isMobile: boolean }) => {
//     const [isOpen, setIsOpen] = useState(false);

//     // Desktop/Tablet par hamesha khula rahega
//     if (!isMobile) {
//         return (
//             <div>
//                 <h3 className="font-bold text-white mb-4 text-lg border-b-2 border-brand-primary/50 pb-1.5">{title}</h3>
//                 <ul className="space-y-3">{children}</ul>
//             </div>
//         );
//     }
    
//     // Mobile par Accordion
//     return (
//         <div className="border-b border-gray-700 dark:border-gray-800">
//             <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-4">
//                 <h3 className="font-bold text-white text-lg">{title}</h3>
//                 <FiChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
//             </button>
//             <AnimatePresence>
//                 {isOpen && (
//                     <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: 'auto', opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.3 }}
//                         className="overflow-hidden"
//                     >
//                         <ul className="space-y-3 pb-4">
//                             {children}
//                         </ul>
//                     </motion.div>
//                 )}
//             </AnimatePresence>
//         </div>
//     );
// };

// // --- Main Footer Component ---
// export default function MainFooter({ settings }: { settings: GlobalSettings }) {
  
//   const { storeContactEmail, storePhoneNumber, storeAddress, socialLinks } = settings;

//   // We check if the screen is likely mobile (under md)
//   const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;


//   const commonLinks = {
//     'Customer Service': [
//       { href: "/faq", label: "Help Center" },
//       { href: "/shipping-policy", label: "Shipping Policy" },
//       { href: "/returns-and-refunds", label: "Returns & Refunds" },
//       { href: "/contact-us", label: "Contact Us" },
//     ],
//     'About PocketValue': [
//       { href: "/about-us", label: "Our Story" },
//       // { href: "/careers", label: "Careers", icon: FiBriefcase },
//       { href: "/blog", label: "Our Blog", icon: FiBookOpen },
//       { href: "/terms-of-service", label: "Terms of Service" },
//       { href: "/privacy-policy", label: "Privacy Policy" },
//     ],
//     'Shop & More': [
//       { href: "/deals", label: "Today's Deals" },
//       { href: "/gift-cards", label: "Gift Cards" },
//       { href: "/account/orders", label: "Track My Order" },
//       { href: "/sell", label: "Sell on PocketValue" },
//     ]
//   };

//   return (
//     // Background updated for deeper contrast
//     <footer className="bg-gray-900 dark:bg-black text-gray-300 border-t border-brand-primary/30">
//       <div className="max-w-[1920px] mx-auto px-6 py-10 md:py-16">
        
//         {/* Main Grid: Mobile Accordion or Desktop Columns */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          
//           {/* --- Column 1: Brand Info & Socials (Always Open) --- */}
//           <div className="pb-6 border-b border-gray-700 dark:border-gray-800 md:pb-0 md:border-b-0">
//             <div className="flex items-center gap-2 mb-4">
//                 <FiAward size={24} className="text-brand-primary" />
//                 <h3 className="font-extrabold text-white text-xl tracking-tight">PocketValue</h3>
//             </div>
            
//             <p className="text-sm leading-relaxed mb-6">
//               Quality products, unbeatable prices, delivered to your doorstep.
//             </p>
            
//             {/* Contact Info */}
//             <ul className="space-y-3 mb-6">
//               {storeAddress && (<ContactItem icon={FiMapPin} text={storeAddress} />)}
//               {storePhoneNumber && (<ContactItem icon={FiPhone} href={`tel:${storePhoneNumber}`} text={storePhoneNumber} />)}
//               {storeContactEmail && (<ContactItem icon={FiMail} href={`mailto:${storeContactEmail}`} text={storeContactEmail} />)}
//             </ul>
            
//             {/* Social Icons */}
//             <div className="flex space-x-5 mt-4">
//               {socialLinks?.facebook && (<a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition-colors"><FiFacebook size={20} /></a>)}
//               {socialLinks?.twitter && (<a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition-colors"><FiTwitter size={20} /></a>)}
//               {socialLinks?.instagram && (<a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition-colors"><FiInstagram size={20} /></a>)}
//             </div>
//           </div>

//           {/* --- Column 2: Customer Service --- */}
//           <FooterColumn title="Customer Service" isMobile={isMobile}>
//              {commonLinks['Customer Service'].map(item => (
//                 <li key={item.label}>
//                     <Link href={item.href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">{item.label}</Link>
//                 </li>
//              ))}
//           </FooterColumn>

//           {/* --- Column 3: About Us --- */}
//           <FooterColumn title="About PocketValue" isMobile={isMobile}>
//              {commonLinks['About PocketValue'].map(item => (
//                 <li key={item.label}>
//                     <Link href={item.href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">
//                         {item.icon && <item.icon size={16} className="inline mr-2" />}
//                         {item.label}
//                     </Link>
//                 </li>
//              ))}
//           </FooterColumn>
          
//           {/* --- Column 4: Shop & More --- */}
//           <FooterColumn title="Shop & More" isMobile={isMobile}>
//              {commonLinks['Shop & More'].map(item => (
//                 <li key={item.label}>
//                     <Link href={item.href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">{item.label}</Link>
//                 </li>
//              ))}
//           </FooterColumn>

//         </div>

//         {/* Bottom Bar (Copyright & Payments) */}
//         <div className="mt-10 md:mt-16 border-t border-gray-700 pt-6 text-center text-sm">
//           <p>&copy; {new Date().getFullYear()} PocketValue. All Rights Reserved.</p>
//           {/* Placeholder for Payment Icons (Future Proofing) */}
//           <div className="flex justify-center space-x-2 mt-2">
//             <span className="text-xs text-gray-500">Secured by VISA | MASTER | COD</span>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }
// src/app/components/layout/Footer.tsx (MainFooter.tsx)

"use client";

import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiPhone, FiMail, FiMapPin, FiAward, FiBookOpen } from 'react-icons/fi';
import { GlobalSettings } from '@/sanity/lib/queries';

// 🔥 Import the new FooterColumn with Hydration Fix
import FooterColumn, { ContactItem } from './FooterColumn'; // Assuming ContactItem is exported from there now


// --- Main Footer Component ---
export default function MainFooter({ settings, isMobile }: { settings: GlobalSettings, isMobile: boolean | null }) {
  
  const { storeContactEmail, storePhoneNumber, storeAddress, socialLinks } = settings;

  // We use the prop passed from MainLayoutClient (Hydration Fixed Value)
  const isMobileView = isMobile === null ? false : isMobile; // isMobile=null on SSR means always treat as desktop/column

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
    ]
  };

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300 border-t border-brand-primary/30">
      <div className="max-w-480 mx-auto px-6 py-10 md:py-16">
        
        {/* Main Grid: Mobile Accordion or Desktop Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
          
          {/* --- Column 1: Brand Info & Socials (Always Open) --- */}
          <div className="pb-6 border-b border-gray-700 dark:border-gray-800 md:pb-0 md:border-b-0">
            <div className="flex items-center gap-2 mb-4">
                <FiAward size={24} className="text-brand-primary" />
                <h3 className="font-extrabold text-white text-xl tracking-tight">PocketValue</h3>
            </div>
            
            <p className="text-sm leading-relaxed mb-6">
              Quality products, unbeatable prices, delivered to your doorstep.
            </p>
            
            {/* Contact Info */}
            <ul className="space-y-3 mb-6">
              {storeAddress && (<ContactItem icon={FiMapPin} text={storeAddress} />)}
              {storePhoneNumber && (<ContactItem icon={FiPhone} href={`tel:${storePhoneNumber}`} text={storePhoneNumber} />)}
              {storeContactEmail && (<ContactItem icon={FiMail} href={`mailto:${storeContactEmail}`} text={storeContactEmail} />)}
            </ul>
            
            {/* Social Icons */}
            <div className="flex space-x-5 mt-4">
              {socialLinks?.facebook && (<a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition-colors"><FiFacebook size={20} /></a>)}
              {socialLinks?.twitter && (<a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition-colors"><FiTwitter size={20} /></a>)}
              {socialLinks?.instagram && (<a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand-primary transition-colors"><FiInstagram size={20} /></a>)}
            </div>
          </div>

          {/* --- Column 2: Customer Service --- */}
          <FooterColumn title="Customer Service" isMobile={isMobileView}>
             {commonLinks['Customer Service'].map(item => (
                <li key={item.label}>
                    <Link href={item.href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">{item.label}</Link>
                </li>
             ))}
          </FooterColumn>

          {/* --- Column 3: About Us --- */}
          <FooterColumn title="About PocketValue" isMobile={isMobileView}>
             {commonLinks['About PocketValue'].map(item => (
                <li key={item.label}>
                    <Link href={item.href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">
                        {item.icon && <item.icon size={16} className="inline mr-2" />}
                        {item.label}
                    </Link>
                </li>
             ))}
          </FooterColumn>
          
          {/* --- Column 4: Shop & More --- */}
          <FooterColumn title="Shop & More" isMobile={isMobileView}>
             {commonLinks['Shop & More'].map(item => (
                <li key={item.label}>
                    <Link href={item.href} className="text-gray-300 hover:text-brand-primary transition-colors text-sm">{item.label}</Link>
                </li>
             ))}
          </FooterColumn>

        </div>

        {/* Bottom Bar (Copyright & Payments) */}
        <div className="mt-10 md:mt-16 border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} PocketValue. All Rights Reserved.</p>
          {/* Placeholder for Payment Icons (Future Proofing) */}
          <div className="flex justify-center space-x-2 mt-2">
            <span className="text-xs text-gray-500">Secured by VISA | MASTER | COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}