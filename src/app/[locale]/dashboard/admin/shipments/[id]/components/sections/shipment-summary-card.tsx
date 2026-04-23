"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ShipmentSummaryCardProps {
  companyName: string;
  bookingNumber?: string;
  bookingId?: number | string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  notes?: string;
  transportMode?: string;
  serviceType?: string;
  containerInfo?: string;
  onOpenBooking?: () => void;
}

export function ShipmentSummaryCard({
  companyName,
  bookingNumber,
  bookingId,
  origin,
  destination,
  departure,
  arrival,
  notes,
  transportMode,
  serviceType,
  containerInfo,
  onOpenBooking,
}: ShipmentSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan</CardTitle>
        <CardDescription>{companyName}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
        {bookingNumber && bookingId ? (
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium">Ref Booking: </span>
            {onOpenBooking ? (
              <button onClick={onOpenBooking} className="text-blue-600 hover:underline font-medium">
                {bookingNumber}
              </button>
            ) : (
              <span className="font-medium">{bookingNumber}</span>
            )}
          </div>
        ) : null}
        
        <div className="sm:col-span-2 mt-2 mb-1">
          <h4 className="font-semibold text-zinc-900">Logistik & Pengiriman</h4>
        </div>
        
        <div>
          <span className="text-muted-foreground font-medium">Asal: </span>
          {origin}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">Tujuan: </span>
          {destination}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">Moda: </span>
          {transportMode ?? "—"}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">Layanan: </span>
          {serviceType ?? "—"}
        </div>
        {containerInfo && (
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium">Kontainer: </span>
            {containerInfo}
          </div>
        )}
        
        <div className="sm:col-span-2 mt-2 mb-1">
          <h4 className="font-semibold text-zinc-900">Jadwal</h4>
        </div>
        
        <div>
          <span className="text-muted-foreground font-medium">Est. berangkat: </span>
          {departure}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">Est. tiba: </span>
          {arrival}
        </div>
        {notes ? (
          <div className="sm:col-span-2 mt-1">
            <span className="text-muted-foreground font-medium">Catatan: </span>
            {notes}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
