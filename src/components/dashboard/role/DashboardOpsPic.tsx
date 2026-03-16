import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Truck } from "lucide-react";

const opsPicSummary = {
  myActiveBookings: 3,
  myActiveShipments: 7,
};

const myBookings = [
  { code: "BK-CP-0101", route: "Tanjung Priok → Kalimas", service: "Rail FCL 40ft", status: "Submitted" },
  { code: "BK-CP-0102", route: "Tanjung Priok → Gedebage", service: "Rail LCL Rack", status: "Approved" },
];

const myShipments = [
  { id: "WB-CP-0201", route: "Tanjung Priok → Kalimas", status: "Train Departed" },
  { id: "WB-CP-0202", route: "Tanjung Priok → Gedebage", status: "Stuffing Container" },
];

export function DashboardOpsPic() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Booking Aktif Saya</CardDescription>
              <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                <FileText className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {opsPicSummary.myActiveBookings}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Shipment Aktif Saya</CardDescription>
              <span className="rounded-md bg-sky-100 text-sky-700 p-1.5">
                <Truck className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {opsPicSummary.myActiveShipments}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Saya</CardTitle>
            <CardDescription>Booking yang dibuat oleh PIC ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Rute</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBookings.map((booking) => (
                  <TableRow key={booking.code}>
                    <TableCell className="font-mono text-xs">{booking.code}</TableCell>
                    <TableCell>{booking.route}</TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>{booking.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipment Saya</CardTitle>
            <CardDescription>Shipment yang ditangani oleh PIC ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Shipment</TableHead>
                  <TableHead>Rute</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myShipments.map((shipment) => (
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

