// 📂 src/app/(payload)/admin/reports-index/[slug]/page.tsx

import ReportDetailView from "../../views/ReportDetailView";
export const dynamic = "force-dynamic"; // 🛡️ NextJS Page-level cache bypass shield

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReportDetailPage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  return <ReportDetailView params={Promise.resolve(params)} searchParams={Promise.resolve(searchParams)} />;
}