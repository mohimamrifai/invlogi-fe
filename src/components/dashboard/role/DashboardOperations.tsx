import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Truck, ArrowUpRight, Clock3 } from "lucide-react";

const opsSummary = {
  pendingBookings: 9,
  activeShipments: 34,
  departuresToday: 6,
  arrivalsToday: 4,
};

const pendingBookings = [
  { code: "BK-00021", customer: "PT Nusantara Cargo", route: "TPK Koja → Kalimas", service: "Rail FCL 40ft" },
  { code: "BK-00022", customer: "PT Mandiri Steel", route: "Tanjung Priok → Gedebage", service: "Rail LCL Rack" },
  { code: "BK-00023", customer: "PT Sawit Jaya", route: "Tanjung Perak → Kijing", service: "Rail FCL 20ft" },
];

const activeShipments = [
  { id: "WB-RAIL-0007", status: "Stuffing Container", route: "Tanjung Priok → Kalimas" },
  { id: "WB-RAIL-0008", status: "Train Departed", route: "Tanjung Priok → Gedebage" },
  { id: "WB-RAIL-0009", status: "Cargo Received", route: "Tanjung Perak → Kijing" },
];

export function DashboardOperations() {
  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Booking Menunggu Approval</CardDescription>
              <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {opsSummary.pendingBookings}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Shipment Aktif</CardDescription>
              <span className="rounded-md bg-sky-100 text-sky-700 p-1.5">
                <Truck className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {opsSummary.activeShipments}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Keberangkatan Hari Ini</CardDescription>
              <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {opsSummary.departuresToday}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Kedatangan Hari Ini</CardDescription>
              <span className="rounded-md bg-indigo-100 text-indigo-700 p-1.5">
                <Clock3 className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {opsSummary.arrivalsToday}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-2">
        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Booking Pending</CardTitle>
            <CardDescription>Booking yang menunggu approval tim Operations.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rute</TableHead>
                  <TableHead>Service</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingBookings.map((booking) => (
                  <TableRow key={booking.code}>
                    <TableCell className="font-mono text-xs">{booking.code}</TableCell>
                    <TableCell>{booking.customer}</TableCell>
                    <TableCell>{booking.route}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader>
            <CardTitle>Shipment Aktif</CardTitle>
            <CardDescription>Shipment dalam proses yang perlu dipantau statusnya.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Shipment</TableHead>
                  <TableHead>Rute</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-mono text-xs">{shipment.id}</TableCell>
                    <TableCell>{shipment.route}</TableCell>
                    <TableCell>{shipment.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

