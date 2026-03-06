import { AdminOrderDetailPage } from "@/components/admin/AdminOrderDetailPage";

export default function OrderDetailRoute({
  params,
}: {
  params: { id: string };
}) {
  return <AdminOrderDetailPage id={params.id} />;
}
