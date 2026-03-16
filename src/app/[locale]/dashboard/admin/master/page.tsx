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
import { Settings2, Plus } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminMasterPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canManageMaster =
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
            <Settings2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Master Operational
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Atur master data operasional seperti lokasi, service, dan jenis kontainer.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageMaster && (
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Tambah Master Data
            </Button>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1">
            Admin • Master
          </Badge>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>
              Data dummy lokasi operasional untuk origin / destination.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Lokasi</TableHead>
                  <TableHead>Tipe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyLocations.map((loc) => (
                  <TableRow key={loc.code}>
                    <TableCell className="font-mono text-xs">
                      {loc.code}
                    </TableCell>
                    <TableCell>{loc.name}</TableCell>
                    <TableCell>{loc.type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Contoh master lokasi untuk rail terminal / pelabuhan.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Types</CardTitle>
            <CardDescription>
              Data dummy jenis layanan rail cargo yang tersedia.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Layanan</TableHead>
                  <TableHead>Kategori</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyServiceTypes.map((svc) => (
                  <TableRow key={svc.code}>
                    <TableCell className="font-mono text-xs">
                      {svc.code}
                    </TableCell>
                    <TableCell>{svc.name}</TableCell>
                    <TableCell>{svc.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Contoh master service (FCL, LCL, Rack) untuk pemilihan booking.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
     </div>
   );
 }

const dummyLocations = [
  { code: "TPP", name: "Tanjung Priok", type: "Port / Rail Terminal" },
  { code: "TPR", name: "Tanjung Perak", type: "Port / Rail Terminal" },
  { code: "KLM", name: "Kalimas", type: "Port" },
];

const dummyServiceTypes = [
  { code: "RAIL-FCL-20", name: "Rail FCL 20ft", category: "FCL" },
  { code: "RAIL-FCL-40", name: "Rail FCL 40ft", category: "FCL" },
  { code: "RAIL-LCL-RACK", name: "Rail LCL Rack", category: "LCL" },
];

 
