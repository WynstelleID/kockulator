"use client";

import { useEffect, useState } from "react";
import { HistoryDetail } from "@/components/history-detail";

export function HistoryDetailClient({ id }: { id: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  return <HistoryDetail id={id} />;
}
