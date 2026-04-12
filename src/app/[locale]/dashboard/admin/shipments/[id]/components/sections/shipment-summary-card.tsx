"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ShipmentSummaryCardProps {
  companyName: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  notes?: string;
}

export function ShipmentSummaryCard({
  companyName,
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
