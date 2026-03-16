import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, UserPlus, AlertCircle } from "lucide-react";

const salesSummary = {
  activeCustomers: 32,
  newCustomersThisWeek: 4,
  pendingProspects: 7,
};

const newCustomers = [
  { name: "PT Logistik Sejahtera", segment: "Enterprise", createdAt: "13 Mar 2026" },
  { name: "PT Cipta Cargo Nusantara", segment: "SME", createdAt: "12 Mar 2026" },
];

const pendingApprovals = [
  { name: "PT Bumi Ekspres", reason: "Dokumen NPWP belum lengkap" },
  { name: "PT Samudra Cargo", reason: "Review kelayakan kredit" },
];

export function DashboardSales() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Customer Aktif</CardDescription>
              <span className="rounded-md bg-sky-100 text-sky-700 p-1.5">
                <Users className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {salesSummary.activeCustomers}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Customer Baru Minggu Ini</CardDescription>
              <span className="rounded-md bg-emerald-100 text-emerald-700 p-1.5">
                <UserPlus className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {salesSummary.newCustomersThisWeek}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardDescription>Prospek Pending</CardDescription>
              <span className="rounded-md bg-amber-100 text-amber-700 p-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
              </span>
            </div>
            <CardTitle className="text-2xl font-semibold">
              {salesSummary.pendingProspects}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Baru</CardTitle>
            <CardDescription>Perusahaan yang baru bergabung pekan ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Perusahaan</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Tanggal Bergabung</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newCustomers.map((customer) => (
                  <TableRow key={customer.name}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.segment}</TableCell>
                    <TableCell>{customer.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permintaan Customer Pending</CardTitle>
            <CardDescription>Perusahaan yang membutuhkan follow-up sebelum aktif.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Perusahaan</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.reason}</TableCell>
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

