"use client";

import { useEffect, useState } from "react";
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
import { Store, Tags } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function AdminVendorPage() {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role;

  const canManageVendor = role === "super_admin" || role === "sales";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex min-w-0 w-full flex-1 flex-col gap-6 md:px-2">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Store className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
              Vendor &amp; Pricing
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Vendor & harga per lane/layanan.
            </p>
          </div>
        </div>
        {canManageVendor && (
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
            <Button className="h-9 w-full gap-1.5 px-4 sm:w-auto">
              <Store className="h-4 w-4 shrink-0" />
              Tambah Vendor
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-full gap-1.5 sm:w-auto"
            >
              <Tags className="h-3.5 w-3.5 shrink-0" />
              Atur Pricing
            </Button>
          </div>
        )}
      </div>
      <div className="grid min-w-0 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 overflow-hidden lg:col-span-1">
          <CardHeader className="space-y-1">
            <CardTitle>Vendor</CardTitle>
            <CardDescription>Vendor rail cargo (dummy).</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Vendor</TableHead>
                  <TableHead>Kategori</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyVendors.map((v) => (
                  <TableRow key={v.name}>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.category}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Contoh vendor yang melayani jalur rail utama.
              </TableCaption>
            </Table>
          </CardContent>
        </Card>

        <Card className="min-w-0 overflow-hidden lg:col-span-2">
          <CardHeader className="space-y-1">
            <CardTitle>Pricing Matrix</CardTitle>
            <CardDescription>Buy/sell & diskon per lane (dummy).</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lane</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Buy Price</TableHead>
                  <TableHead>Sell Price</TableHead>
                  <TableHead>Discount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dummyPricing.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.lane}</TableCell>
                    <TableCell>{row.serviceType}</TableCell>
                    <TableCell>
                      Rp {row.buyPrice.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>
                      Rp {row.sellPrice.toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell>{row.discount}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption className="text-xs">
                Ilustrasi struktur harga (backend vendor &amp; pricing).
              </TableCaption>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const dummyVendors = [
  { name: "PT Rail Logistics Indonesia", category: "Rail Operator" },
  { name: "PT Terminal Kontainer Nusantara", category: "Depo / CY" },
];

const dummyPricing = [
  {
    id: 1,
    lane: "TPP → TPR",
    serviceType: "Rail FCL 40ft",
    buyPrice: 5500000,
    sellPrice: 6500000,
    discount: 5,
  },
  {
    id: 2,
    lane: "TPP → KLM",
    serviceType: "Rail LCL Rack",
    buyPrice: 950000,
    sellPrice: 1250000,
    discount: 10,
  },
];
