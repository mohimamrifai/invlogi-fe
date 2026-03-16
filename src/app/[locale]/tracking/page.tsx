 "use client";
 
 import { useEffect, useState } from "react";
 
 export default function PublicTrackingPage() {
   const [mounted, setMounted] = useState(false);
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   if (!mounted) return null;
 
   return (
     <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 py-10">
       <div className="space-y-2 text-center">
         <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Public Shipment Tracking
         </h1>
         <p className="text-sm text-muted-foreground">
          Masukkan nomor waybill untuk melihat status shipment Anda tanpa perlu
          login.
         </p>
       </div>
       {/* TODO: Implement public tracking form and read-only status timeline */}
       <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
         <p className="text-sm text-muted-foreground text-center">
           Placeholder halaman Public Tracking. Nanti diisi form pencarian
           berdasarkan nomor waybill dan tampilan ringkas status shipment.
         </p>
       </div>
     </div>
   );
 }
 
