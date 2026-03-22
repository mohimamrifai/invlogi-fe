"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function CustomerTrackingPage() {
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
            Shipment Tracking
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Lacak dengan nomor referensi / waybill.
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
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
 
