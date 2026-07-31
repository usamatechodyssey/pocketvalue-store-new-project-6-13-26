

const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="h-3 w-40 rounded bg-gray-100 dark:bg-gray-800"></div>
            </div>
        </div>
      </td>
      <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="flex justify-center gap-2"><div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div><div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div></div></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-8 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700"></div></td>
    </tr>
);

export default function UsersLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-md border dark:border-gray-700 space-y-6">
      <div className="h-11 w-full rounded-lg bg-gray-100 dark:bg-gray-700/50 animate-pulse"></div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}