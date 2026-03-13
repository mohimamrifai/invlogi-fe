"use client";

import { useAuthStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="text-2xl font-bold text-zinc-900">Hello, {user?.role ? user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Guest'}</div>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-zinc-100/50" />
        <div className="aspect-video rounded-xl bg-zinc-100/50" />
        <div className="aspect-video rounded-xl bg-zinc-100/50" />
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-zinc-100/50 md:min-h-min" />
    </div>
  )
}
