// // app/blog/page.tsx

// import Link from "next/link";
// import Image from "next/image";
// import {
//   getPaginatedPosts,
//   getBreadcrumbs,
//   GET_TOTAL_POST_COUNT,
// } from "@/sanity/lib/queries";
// import { Post } from "@/sanity/types/product_types";
// import { urlFor } from "@/sanity/lib/image";
// import { generateBaseMetadata } from "@/utils/metadata";
// import type { Metadata } from "next";
// import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
// import BlogPagination from "./_components/BlogPagination";
// import { Calendar, UserCircle } from "lucide-react";
// import { client } from "@/sanity/lib/client";

// // 🔥 FIX: Ye line build error khatam kar degi
// // Ye Next.js ko batati hai ke ye page server par har request par render hoga
// export const dynamic = "force-dynamic";

// export async function generateMetadata(): Promise<Metadata> {
//   return generateBaseMetadata({
//     title: "The PocketValue Blog",
//     description:
//       "Insights, tips, and stories from our team to help you get the best value.",
//     path: "/blog",
//   });
// }

// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });
// };

// // --- Featured Post Card (unchanged) ---
// const FeaturedPostCard = ({ post }: { post: Post }) => (
//   <Link
//     href={`/blog/${post.slug}`}
//     className="group grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 transition-all duration-300"
//   >
//     <div className="relative w-full aspect-video rounded-xl overflow-hidden">
//       <Image
//         src={urlFor(post.mainImage).url()}
//         alt={post.title}
//         fill
//         sizes="(max-width: 768px) 100vw, 50vw"
//         className="object-cover transition-transform duration-300 group-hover:scale-105"
//       />
//     </div>
//     <div className="flex flex-col h-full">
//       <p className="text-sm font-semibold text-brand-primary uppercase tracking-wider">
//         Latest Post
//       </p>
//       <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-3">
//         {post.title}
//       </h2>
//       <p className="mt-4 text-gray-600 dark:text-gray-300 text-base line-clamp-3 grow">
//         {post.excerpt}
//       </p>
//       <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
//         {post.authorImage ? (
//           <Image
//             src={urlFor(post.authorImage).url()}
//             alt={post.authorName || "Author"}
//             width={40}
//             height={40}
//             className="rounded-full object-cover"
//           />
//         ) : (
//           <UserCircle size={40} className="text-gray-400" />
//         )}
//         <div>
//           <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
//             {post.authorName}
//           </p>
//           <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
//             <Calendar size={12} />
//             {formatDate(post.publishedAt)}
//           </p>
//         </div>
//       </div>
//     </div>
//   </Link>
// );

// // --- Standard Post Card (unchanged) ---
// const PostCard = ({ post }: { post: Post }) => (
//   <Link
//     href={`/blog/${post.slug}`}
//     className="group block bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
//   >
//     <div className="relative w-full aspect-video">
//       <Image
//         src={urlFor(post.mainImage).url()}
//         alt={post.title}
//         fill
//         sizes="(max-width: 768px) 100vw, 33vw"
//         className="object-cover transition-transform duration-300 group-hover:scale-105"
//       />
//     </div>
//     <div className="p-5 flex flex-col h-full">
//       <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2 grow">
//         {post.title}
//       </h2>
//       <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3 h-15">
//         {post.excerpt}
//       </p>
//       <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
//         {post.authorImage ? (
//           <Image
//             src={urlFor(post.authorImage).url()}
//             alt={post.authorName || "Author"}
//             width={32}
//             height={32}
//             className="rounded-full object-cover"
//           />
//         ) : (
//           <UserCircle size={32} className="text-gray-400" />
//         )}
//         <div>
//           <p className="font-semibold text-xs text-gray-800 dark:text-gray-200">
//             {post.authorName}
//           </p>
//           <p className="text-xs text-gray-500 dark:text-gray-400">
//             {formatDate(post.publishedAt)}
//           </p>
//         </div>
//       </div>
//     </div>
//   </Link>
// );

// const POSTS_PER_PAGE = 16;

// export default async function BlogPage({
//   searchParams: searchParamsPromise,
// }: {
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
// }) {
//   const searchParams = await searchParamsPromise;
//   const page = Number(searchParams?.page || "1");

//   const [posts, totalPosts, breadcrumbs] = await Promise.all([
//     getPaginatedPosts(page),
//     client.fetch(GET_TOTAL_POST_COUNT),
//     getBreadcrumbs("blog"),
//   ]);

//   const featuredPost = page === 1 ? posts?.[0] : undefined;
//   const otherPosts = page === 1 ? posts?.slice(1) : posts;

//   const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

//   return (
//     <main className="w-full bg-white dark:bg-gray-900">
//       {/* 1. NEW HEADER SECTION (Copied from FAQ/Contact-Us) */}
//       <div className="bg-gray-50 dark:bg-gray-800/50">
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
//           <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
//             The PocketValue Blog
//           </h1>
//           <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
//             Insights, tips, and stories from our team to help you get the best
//             value.
//           </p>
//         </div>
//       </div>

//       {/* 2. MAIN CONTENT SECTION */}
//       {/* Note: I've replaced the original outer div with the new common one. */}
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
//         <div className="max-w-screen-full mx-auto">
//           <div className="mb-8">
//             <Breadcrumbs crumbs={breadcrumbs} />
//           </div>

//           {posts && posts.length > 0 ? (
//             <div className="space-y-12">
//               {featuredPost && (
//                 <section>
//                   <FeaturedPostCard post={featuredPost} />
//                 </section>
//               )}

//               {otherPosts && otherPosts.length > 0 && (
//                 <section>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                     {otherPosts.map((post: Post) => (
//                       <PostCard key={post._id} post={post} />
//                     ))}
//                   </div>
//                 </section>
//               )}

//               {totalPages > 1 && (
//                 <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-800">
//                   <BlogPagination totalPages={totalPages} />
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg">
//               <p className="text-gray-500 dark:text-gray-400">
//                 No blog posts found. Check back soon!
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// }
// app/blog/page.tsx
import Link from "next/link";
import Image from "next/image";
import {
  getPaginatedPosts,
  getBreadcrumbs,
  GET_TOTAL_POST_COUNT,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { generateBaseMetadata } from "@/utils/metadata";
import Breadcrumbs from "@/app/components/ui/Breadcrumbs";
import BlogPagination from "./_components/BlogPagination";
import { client } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return generateBaseMetadata({
    title: "The PocketValue Blog - Tips & Values",
    description:
      "Insights, tips, and stories from our team to help you get the best value.",
    path: "/blog",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam || "1");
  const POSTS_PER_PAGE = 16;

  const [posts, totalPosts, breadcrumbs] = await Promise.all([
    getPaginatedPosts(page),
    client.fetch(GET_TOTAL_POST_COUNT),
    getBreadcrumbs("blog"),
  ]);

  const featuredPost = page === 1 ? posts?.[0] : undefined;
  const otherPosts = page === 1 ? posts?.slice(1) : posts;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <main className="w-full bg-gray-50 dark:bg-gray-950">
      <section className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-16 md:py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 dark:text-white">
            POCKET<span className="text-brand-primary">BLOG</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 font-medium">
            Stories, value guides, and expert tips for smart shoppers.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mb-10">
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>

        {posts?.length > 0 ? (
          <div className="space-y-16">
            {featuredPost && (
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="relative aspect-16/10 lg:aspect-auto h-full">
                  <Image
                    src={urlFor(featuredPost.mainImage).width(1200).url()}
                    alt=""
                    fill
                    className="object-cover transition-transform group-hover:scale-105 duration-700"
                  />
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest mb-4">
                    Featured Story
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white line-clamp-3 mb-6 group-hover:text-brand-primary transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-lg mb-8 line-clamp-3">
                    {featuredPost.excerpt}
                  </p>
                  <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 font-bold uppercase tracking-tighter flex items-center gap-2">
                    Read Full Story{" "}
                    <span className="text-brand-primary">→</span>
                  </div>
                </div>
              </Link>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherPosts?.map((post: any) => (
                <Link
                  key={post._id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border dark:border-gray-800 hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={urlFor(post.mainImage).width(600).url()}
                      alt=""
                      fill
                      className="object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                  </div>
                  <div className="p-6 flex flex-col grow">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-primary transition-colors mb-3">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-3 mb-6">
                      {post.excerpt}
                    </p>
                    <div className="mt-auto pt-4 border-t text-[10px] font-black uppercase tracking-widest text-gray-400 flex justify-between items-center">
                      <span>
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                      <span className="text-brand-primary">Read More +</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pt-12 border-t dark:border-gray-800">
                <BlogPagination totalPages={totalPages} />
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-20 text-gray-500">
            Writing something amazing... Check back soon!
          </p>
        )}
      </div>
    </main>
  );
}
