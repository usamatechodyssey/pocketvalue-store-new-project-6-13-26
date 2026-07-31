import LogoSpinner from "@/app/shared/components/ui/LogoSpinner";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm cursor-wait">
      <LogoSpinner size="lg" />
    </div>
  );
}