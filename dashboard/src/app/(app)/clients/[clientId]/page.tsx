import { ClientDetail } from "@/components/clients/client-detail";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <ClientDetail clientId={clientId} />;
}
