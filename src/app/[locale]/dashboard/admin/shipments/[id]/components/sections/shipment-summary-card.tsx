"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/routing";

interface ShipmentSummaryCardProps {
  companyName: string;
  bookingNumber?: string;
  bookingId?: number | string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  notes?: string;
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
            <Link href={`/dashboard/admin/bookings/${bookingId}`} className="text-blue-600 hover:underline font-medium">
              {bookingNumber}
            </Link>
          </div>
        ) : null}
        <div>
          <span className="text-muted-foreground font-medium">Asal: </span>
          {origin}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">Tujuan: </span>
          {destination}
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
