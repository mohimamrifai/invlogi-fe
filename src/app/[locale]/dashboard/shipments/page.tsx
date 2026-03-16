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

export default function CustomerShipmentsPage() {
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
             My Shipments
           </h1>
           <p className="mt-1 text-sm text-muted-foreground">
             Lihat semua shipment milik perusahaan Anda beserta status dan detailnya.
           </p>
         </div>
         <Badge variant="outline" className="text-xs px-3 py-1">
           Customer • Shipments
         </Badge>
       </div>
      <Card>
        <CardHeader>
          <CardTitle>My Shipments</CardTitle>
          <CardDescription>
            Data dummy shipment yang hanya menampilkan shipment milik perusahaan
            user.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                      variant={
                        shipment.status === "Completed"
                          ? "default"
                          : shipment.status === "In Transit"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {shipment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Contoh shipment perusahaan yang sedang login (company scoped).
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

 
