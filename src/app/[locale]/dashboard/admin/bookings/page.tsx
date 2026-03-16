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
import { ClipboardList, CheckCircle2, XCircle, ArrowRightLeft } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canApproveOrConvert =
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
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Booking Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola booking dari customer, review detail, dan proses approval.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canApproveOrConvert && (
            <>
              <Button size="sm" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Convert to Shipment
              </Button>
            </>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1">
            Admin • Bookings
          </Badge>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Booking</CardTitle>
          <CardDescription>
            Data dummy booking untuk ilustrasi list, status, dan aksi approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Kode Booking</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyBookings.map((booking) => (
                <TableRow key={booking.code}>
                  <TableCell className="font-mono text-xs">
                    {booking.code}
                  </TableCell>
                  <TableCell className="font-medium">
                    {booking.customer}
                  </TableCell>
                  <TableCell>{booking.origin}</TableCell>
                  <TableCell>{booking.destination}</TableCell>
                  <TableCell>{booking.serviceType}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        booking.status === "Submitted"
                          ? "secondary"
                          : booking.status === "Approved"
                          ? "default"
                          : booking.status === "Rejected"
                          ? "outline"
                          : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableCaption className="text-xs">
              Contoh booking dengan berbagai status (draft, submitted, approved,
              rejected).
            </TableCaption>
          </Table>
        </CardContent>
      </Card>
     </div>
   );
 }

const dummyBookings = [
  {
    code: "BK-RAIL-0001",
    customer: "PT Nusantara Cargo",
    origin: "Tanjung Priok",
    destination: "Tanjung Perak",
    serviceType: "Rail FCL 40ft",
    status: "Submitted",
  },
  {
    code: "BK-RAIL-0002",
    customer: "PT Mandiri Steel",
    origin: "Tanjung Priok",
    destination: "Kalimas",
    serviceType: "Rail LCL Rack",
    status: "Draft",
  },
  {
    code: "BK-RAIL-0003",
    customer: "PT Sawit Jaya",
    origin: "Tanjung Perak",
    destination: "Kijing",
    serviceType: "Rail FCL 20ft",
    status: "Approved",
  },
  {
    code: "BK-RAIL-0004",
    customer: "PT Sinar Logistik",
    origin: "Tanjung Priok",
    destination: "Gedebage",
    serviceType: "Rail LCL Rack",
    status: "Rejected",
  },
];

 
