// src/app/components/payload-returns/ReturnsLoadingSkeleton.tsx


const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4"><div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-8 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-6 w-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
    </tr>
);

export default function ReturnsLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
      <div className="h-11 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse"></div>
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}