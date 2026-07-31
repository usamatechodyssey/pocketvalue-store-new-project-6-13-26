// app/components/ui/ComingSoon.tsx (Polished)
import { HardHat, PartyPopper, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ComingSoonProps {
  featureName: string;
  description?: string;
}

export default function ComingSoon({
  featureName,
  description
}: ComingSoonProps) {
  const defaultDescription = `We're putting the finishing touches on this feature and it's going to be amazing! Stay tuned for the launch.`;
  
  return (
    <main className="w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[70vh] px-4">
        <div className="w-full max-w-xl mx-auto text-center p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <div className="flex justify-center items-center gap-4 text-brand-primary">
                <HardHat size={40} strokeWidth={1.5} />
                <PartyPopper size={40} strokeWidth={1.5} />
            </div>
            <h1 className="mt-6 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                {featureName} - Coming Soon!
            </h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
                {description || defaultDescription}
            </p>
            <Link
                href="/"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-brand-primary text-text-on-accent font-bold rounded-lg shadow-md hover:bg-brand-primary-hover transition-transform transform hover:scale-105"
            >
                <ArrowLeft size={18}/>
                <span>Back to Homepage</span>
            </Link>
        </div>
    </main>
  );
}