"use client";

import { useEffect, useState } from "react";
import { PtPtCalculator } from "@/components/ptpt-calculator";

export function HomePageClient() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning />;
  }

  return <PtPtCalculator />;
}
