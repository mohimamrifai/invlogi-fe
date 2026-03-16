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
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900/5 text-zinc-900">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Vendor &amp; Pricing
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Kelola data vendor dan matriks harga untuk setiap lane &amp; layanan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManageVendor && (
            <>
              <Button size="sm" className="gap-1.5">
                <Store className="h-3.5 w-3.5" />
                Tambah Vendor
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Tags className="h-3.5 w-3.5" />
                Atur Pricing
              </Button>
            </>
          )}
          <Badge variant="outline" className="text-xs px-3 py-1">
            Admin • Vendor
          </Badge>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
       <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Vendor</CardTitle>
            <CardDescription>
              Data dummy vendor utama untuk layanan rail cargo.
            </CardDescription>
          </CardHeader>
          <CardContent>
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

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pricing Matrix</CardTitle>
            <CardDescription>
              Data dummy buy/sell price per lane dan service type.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                Ilustrasi struktur harga yang nanti akan terhubung ke backend
                vendor &amp; pricing.
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

 
