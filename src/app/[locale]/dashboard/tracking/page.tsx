"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

export default function CustomerTrackingPage() {
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
            <MapPin className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Shipment Tracking
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Lacak dengan nomor referensi / waybill.
            </p>
          </div>
        </div>
      </div>
      <div className="min-w-0 overflow-hidden rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Masukkan waybill untuk lihat status (dummy).
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <Badge variant="outline">Contoh: WB-RAIL-0101</Badge>
          <Badge variant="outline">Contoh: WB-RAIL-0102</Badge>
        </div>
        <div className="mt-2 border-t pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Timeline status (dummy):
          </p>
          <ol className="space-y-1 text-xs text-muted-foreground">
            <li>• Booking Created</li>
            <li>• Cargo Received at Origin CY</li>
            <li>• Stuffing to Rail Container</li>
            <li>• Train Departed from Origin Terminal</li>
            <li>• Unstuffing at Destination CY</li>
            <li>• Delivered to Consignee</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
