"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function CreateBookingPage() {
  const [mounted, setMounted] = useState(false);
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   if (!mounted) return null;
 
   return (
     <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Create Booking
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Booking baru dari layanan & rute tersedia.
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Step 1 - Detail Pengiriman</CardTitle>
          <CardDescription>Langkah pertama wizard (placeholder).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
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
 
