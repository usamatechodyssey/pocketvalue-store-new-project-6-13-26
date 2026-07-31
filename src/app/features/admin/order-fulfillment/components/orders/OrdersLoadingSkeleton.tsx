// src/app/components/payload-orders/OrdersLoadingSkeleton.tsx


const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-8 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 w-20 ml-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-6 w-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
    </tr>
);

export default function OrdersLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md border dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4 mb-6 animate-pulse">
        <div className="grow h-11 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex items-center gap-2">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 w-20 rounded-md bg-gray-200 dark:bg-gray-700"></div>
            ))}
        </div>
      </div>

      {/* Mobile Skeleton */}
      <div className="lg:hidden space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-gray-100 dark:bg-gray-700/50 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-600"></div>
                <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-600"></div>
              </div>
              <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-600"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Skeleton */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}