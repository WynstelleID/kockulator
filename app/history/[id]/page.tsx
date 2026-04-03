"use client";

import { useParams } from "next/navigation";
import { HistoryDetail } from "@/components/history-detail";

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();

  if (!params?.id) {
    return null;
  }

  return <HistoryDetail id={params.id} />;
}
