"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function CreateBookingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Create Booking
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Booking baru dari layanan & rute tersedia.
            </p>
          </div>
        </div>
      </div>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Step 1 - Detail Pengiriman</CardTitle>
          <CardDescription>Langkah pertama wizard (placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-zinc-900">Origin</p>
            <p className="rounded-md border bg-muted px-3 py-2">
              Contoh: Tanjung Priok
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-zinc-900">Destination</p>
            <p className="rounded-md border bg-muted px-3 py-2">
              Contoh: Tanjung Perak
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-zinc-900">Service Type</p>
            <p className="rounded-md border bg-muted px-3 py-2">
              Contoh: Rail FCL 40ft
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-zinc-900">Est. Departure Date</p>
            <p className="rounded-md border bg-muted px-3 py-2">
              Contoh: 2026-03-20
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
