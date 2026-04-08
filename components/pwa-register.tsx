"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((registration) => {
          registration.update().catch(() => {
            // Ignore update failures. The next navigation will retry.
          });
        })
        .catch(() => {
          // Failing to register the worker should not block app usage.
        });
    }
  }, []);

  return null;
}
