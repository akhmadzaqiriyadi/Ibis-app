import KonsultasiDetailClient from "@/app/dashboard/konsultasi/detail-client";

export default async function KonsultasiDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <KonsultasiDetailClient id={id} />;
}
