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
import { Button } from "@/components/ui/button";
import { PackageSearch, RefreshCcw, MapPin } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminShipmentsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canUpdateShipment =
    role === "super_admin" || role === "operations";
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   if (!mounted) return null;
 
   return (
     <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <PackageSearch className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Shipment Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor dan kelola shipment, status perjalanan, dan detail kontainer.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdateShipment && (
            <>
              <Button size="sm" className="gap-1.5">
                <RefreshCcw className="h-3.5 w-3.5" />
                Update Status
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Kelola Container/Rack
              </Button>
            </>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Shipment</CardTitle>
          <CardDescription>
            Data dummy shipment dengan status dan rute untuk ilustrasi monitoring
            operasional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Waybill</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rute</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyShipments.map((shipment) => (
                <TableRow key={shipment.waybill}>
                  <TableCell className="font-mono text-xs">
                    {shipment.waybill}
                  </TableCell>
                  <TableCell>{shipment.customer}</TableCell>
                  <TableCell>{shipment.serviceType}</TableCell>
                  <TableCell>{shipment.route}</TableCell>
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
              Contoh shipment dengan berbagai status perjalanan (Created, In
              Transit, Completed).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
     </div>
   );
 }

const dummyShipments = [
  {
    waybill: "WB-RAIL-0001",
    customer: "PT Nusantara Cargo",
    serviceType: "Rail FCL 40ft",
    route: "Tanjung Priok → Tanjung Perak",
    status: "In Transit",
  },
  {
    waybill: "WB-RAIL-0002",
    customer: "PT Mandiri Steel",
    serviceType: "Rail LCL Rack",
    route: "Tanjung Priok → Kalimas",
    status: "Created",
  },
  {
    waybill: "WB-RAIL-0003",
    customer: "PT Sawit Jaya",
    serviceType: "Rail FCL 20ft",
    route: "Tanjung Perak → Kijing",
    status: "Completed",
  },
];

 
