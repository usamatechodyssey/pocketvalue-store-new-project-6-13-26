"use client";

import { useState } from "react";
import SanityProduct, { ProductVariant } from "@/types";
import { PortableText } from "@portabletext/react";
import { FileText, List, Truck, ChevronDown, Package } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface ProductDetailsTabsProps {
  product: SanityProduct;
  selectedVariant: ProductVariant | null;
}

// === ACCORDION ITEM (MOBILE) ===
const AccordionItem = ({
  title,
  icon: Icon,
  isOpen,
  onClick,
  children,
}: {
  title: string;
  icon: React.ElementType;
  isOpen: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full py-4 text-left group transition-colors duration-200
        ${isOpen ? "text-brand-primary" : "text-gray-900 dark:text-white"}
      `}
    >
      <div className="flex items-center gap-3 font-bold text-sm uppercase tracking-wide">
        <Icon 
            size={18} 
            className={`transition-colors duration-200 ${isOpen ? "text-brand-primary" : "text-gray-400 group-hover:text-gray-600"}`} 
        />
        {title}
      </div>
      <ChevronDown 
        size={18} 
        className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-brand-primary" : ""}`} 
      />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="pb-6 pt-1 text-gray-600 dark:text-gray-300 text-sm leading-relaxed prose-sm dark:prose-invert">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// === TAB BUTTON (DESKTOP) ===
const TabButton = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: (id: string) => void;
}) => (
  <button
    onClick={() => onClick(id)}
    className={`relative flex items-center gap-2 px-6 py-4 text-sm font-bold transition-colors duration-300 z-10
    ${isActive ? "text-brand-primary" : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"}`}
  >
    <Icon size={18} />
    {label}

    {isActive && (
      <motion.div
        layoutId="activeTabIndicator"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-t-full"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    )}
  </button>
);


export default function ProductDetailsTabs({
  product,
  selectedVariant,
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState("description");
  const [openAccordion, setOpenAccordion] = useState<string | null>("description");

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const sections = [
    {
      id: "description",
      label: "Description",
      icon: FileText,
      content: product.description ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
           {/* 🔥 FIX: description ko 'as any' cast kar diya taake TS error khatam ho jaye */}
           <PortableText value={product.description as any} />
        </div>
      ) : (
        <p className="text-gray-500 italic">No description available.</p>
      )
    },
    {
      id: "specifications",
      label: "Specifications",
      icon: List,
      content: (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <dl className="divide-y divide-gray-100 dark:divide-gray-800">
            {product.specifications?.map((spec, idx) => (
                <div key={spec._key} className={`flex flex-col sm:flex-row p-3 sm:px-6 sm:py-4 ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 mb-1 sm:mb-0">{spec.label}</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:w-2/3">{spec.value}</dd>
                </div>
            ))}
            {selectedVariant?.weight && (
                <div className="flex flex-col sm:flex-row p-3 sm:px-6 sm:py-4 bg-white dark:bg-gray-900">
                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 mb-1 sm:mb-0">Weight</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:w-2/3">{selectedVariant.weight} kg</dd>
                </div>
            )}
            {selectedVariant?.dimensions && (
                (selectedVariant.dimensions.height !== undefined && selectedVariant.dimensions.height !== null) ||
                (selectedVariant.dimensions.width !== undefined && selectedVariant.dimensions.width !== null) ||
                (selectedVariant.dimensions.depth !== undefined && selectedVariant.dimensions.depth !== null)
            ) && (
                <div className={`flex flex-col sm:flex-row p-3 sm:px-6 sm:py-4 ${product.specifications?.length && product.specifications?.length % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
                    <dt className="text-sm font-medium text-gray-500 sm:w-1/3 mb-1 sm:mb-0">Dimensions</dt>
                    <dd className="text-sm font-semibold text-gray-900 dark:text-gray-100 sm:w-2/3">
                        {selectedVariant.dimensions.height ? `${selectedVariant.dimensions.height}H ` : ''}
                        {selectedVariant.dimensions.width ? `${selectedVariant.dimensions.width}W ` : ''}
                        {selectedVariant.dimensions.depth ? `${selectedVariant.dimensions.depth}D ` : ''}
                        (cm)
                    </dd>
                </div>
            )}
            {!product.specifications?.length && !selectedVariant?.weight && 
             (!selectedVariant?.dimensions || ((selectedVariant.dimensions.height === undefined || selectedVariant.dimensions.height === null) && (selectedVariant.dimensions.width === undefined || selectedVariant.dimensions.width === null) && (selectedVariant.dimensions.depth === undefined || selectedVariant.dimensions.depth === null))) && (
                 <div className="p-6 text-center text-gray-500">No specifications listed.</div>
            )}
            </dl>
        </div>
      )
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      icon: Truck,
      content: product.shippingAndReturns ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
            {/* 🔥 FIX: shippingAndReturns ko bhi 'as any' cast kar diya */}
            <PortableText value={product.shippingAndReturns as any} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                <Truck className="text-blue-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Fast Delivery</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Delivery within 3-5 business days across Pakistan. Tracking ID provided.</p>
                </div>
            </div>
            <div className="flex gap-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800">
                <Package className="text-orange-500 shrink-0" size={24} />
                <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-1">Easy Returns</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">7-day hassle-free return policy if product is damaged or incorrect.</p>
                </div>
            </div>
        </div>
      )
    },
  ];

  return (
    <div className="w-full mt-10 md:mt-16 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      
      {/* === MOBILE VIEW: ACCORDIONS === */}
      <div className="md:hidden px-6 py-2">
        {sections.map((section) => (
            <AccordionItem
                key={section.id}
                title={section.label}
                icon={section.icon}
                isOpen={openAccordion === section.id}
                onClick={() => toggleAccordion(section.id)}
            >
                {section.content}
            </AccordionItem>
        ))}
      </div>

      {/* === DESKTOP VIEW: TABS === */}
      <div className="hidden md:block">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 px-6">
            {sections.map((section) => (
                <TabButton
                    key={section.id}
                    id={section.id}
                    label={section.label}
                    icon={section.icon}
                    isActive={activeTab === section.id}
                    onClick={setActiveTab}
                />
            ))}
        </div>

        <div className="p-8 h-fit">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {sections.find(s => s.id === activeTab)?.content}
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}