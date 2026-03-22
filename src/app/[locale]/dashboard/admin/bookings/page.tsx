"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bookingStatusBadgeClass } from "@/lib/booking-status";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import {
  ArrowRightLeft,
  CheckCircle2,
  ClipboardList,
  Eye,
  MoreHorizontal,
  XCircle,
} from "lucide-react";

const actionsHeadClass =
  "w-12 max-md:sticky max-md:right-0 max-md:z-20 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] md:static md:z-auto md:border-l-0 md:bg-transparent md:shadow-none text-right";

const actionsCellClass =
  "max-md:sticky max-md:right-0 max-md:z-10 max-md:border-l max-md:border-border max-md:bg-card max-md:shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.08)] max-md:group-hover:bg-muted/50 md:static md:z-auto md:border-l-0 md:shadow-none md:group-hover:bg-transparent";

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

function BookingActionsMenu({
  bookingCode,
  status,
  canProcessOperations,
}: {
  bookingCode: string;
  status: string;
  canProcessOperations: boolean;
}) {
  const showApproveReject =
    status === "Submitted" && canProcessOperations;
  const showConvert =
    status === "Approved" && canProcessOperations;
  const showOpsDivider = showApproveReject || showConvert;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon-sm" }),
          "shrink-0"
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Menu aksi</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            /* TODO: view booking */
            void bookingCode;
          }}
        >
          <Eye className="h-4 w-4" />
          Lihat detail booking
        </DropdownMenuItem>
        {showOpsDivider ? <DropdownMenuSeparator /> : null}
        {showApproveReject ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => {
                /* TODO: approve booking */
                void bookingCode;
              }}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Setujui booking
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              variant="destructive"
              onClick={() => {
                /* TODO: reject booking */
                void bookingCode;
              }}
            >
              <XCircle className="h-4 w-4" />
              Tolak booking
            </DropdownMenuItem>
          </>
        ) : null}
        {showConvert ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => {
              /* TODO: convert booking → shipment */
              void bookingCode;
            }}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Konversi ke shipment
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminBookingsPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;
  const canProcessOperations =
    role === "super_admin" || role === "operations";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-w-0 md:px-2 w-full flex-1 flex-col gap-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Booking Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola permintaan booking: lihat detail, setujui/tolak, dan konversi
              ke shipment.
            </p>
          </div>
        </div>
      </div>

      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle>Daftar Booking</CardTitle>
          <CardDescription>
            Lihat detail booking, setujui atau tolak saat menunggu persetujuan,
            lalu konversi ke shipment setelah disetujui.
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
                <TableHead className={actionsHeadClass}>
                  <span className="max-md:sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dummyBookings.map((booking) => (
                <TableRow key={booking.code} className="group">
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
                      variant="outline"
                      className={bookingStatusBadgeClass(booking.status)}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className={cn(actionsCellClass, "p-2 text-right")}>
                    <div className="flex justify-end">
                      <BookingActionsMenu
                        bookingCode={booking.code}
                        status={booking.status}
                        canProcessOperations={canProcessOperations}
                      />
                    </div>
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
