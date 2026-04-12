"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";

/**
 * true setelah zustand persist selesai baca localStorage.
 * Tanpa ini, render pertama setelah mount sering masih user === null
 * sehingga pengecekan role (mis. super_admin) salah.
 */
export function useAuthPersistHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // If it's already hydrated by the time this runs, just set it.
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    if (hydrated) return;
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    return unsub;
  }, [hydrated]);

  return hydrated;
}
