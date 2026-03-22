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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Truck } from "lucide-react";
import { shipmentStatusBadgeClass } from "@/lib/shipment-status";

export default function CustomerShipmentsPage() {
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
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              My Shipments
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Shipment perusahaan Anda.
            </p>
          </div>
        </div>
      </div>
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>My Shipments</CardTitle>
          <CardDescription>Shipment perusahaan Anda (dummy).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waybill</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyCustomerShipments.map((shipment) => (
                <TableRow key={shipment.waybill}>
                  <TableCell className="font-mono text-xs">
                    {shipment.waybill}
                  </TableCell>
                  <TableCell>{shipment.serviceType}</TableCell>
                  <TableCell>{shipment.origin}</TableCell>
                  <TableCell>{shipment.destination}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={shipmentStatusBadgeClass(shipment.status)}
                    >
                      {shipment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Data contoh (company scoped).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

const dummyCustomerShipments = [
  {
    waybill: "WB-RAIL-0101",
    serviceType: "Rail FCL 40ft",
    origin: "Tanjung Priok",
    destination: "Tanjung Perak",
    status: "In Transit",
  },
  {
    waybill: "WB-RAIL-0102",
    serviceType: "Rail LCL Rack",
    origin: "Tanjung Priok",
    destination: "Gedebage",
    status: "Created",
  },
];
