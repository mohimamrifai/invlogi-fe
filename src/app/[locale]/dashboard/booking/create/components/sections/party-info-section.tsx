"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface PartyProps {
  type: "Shipper" | "Consignee";
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  isSameAsAccount?: boolean;
  setIsSameAsAccount?: (v: boolean) => void;
}

export function PartyInfoSection({
  type,
  name, setName,
  phone, setPhone,
  address, setAddress,
  isSameAsAccount, setIsSameAsAccount,
}: PartyProps) {
  const isShipper = type === "Shipper";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isShipper ? "Shipper (Pengirim)" : "Consignee (Penerima)"}</CardTitle>
        <CardDescription>
          {isShipper ? "Data pihak yang mengirim barang." : "Data pihak yang akan menerima barang."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isShipper && setIsSameAsAccount && (
          <div className="flex items-center gap-2 pb-2">
            <Checkbox
              id="same-account"
              checked={isSameAsAccount}
              onCheckedChange={(v) => setIsSameAsAccount(v === true)}
            />
            <Label htmlFor="same-account" className="text-xs font-normal cursor-pointer text-zinc-600">
              Gunakan data profil perusahaan Anda
            </Label>
          </div>
        )}
        <div className="space-y-2">
          <Label>Nama {isShipper ? "Pengirim" : "Penerima"}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama perusahaan atau perorangan"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Nomor Telepon</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 08123456789"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Alamat Lengkap</Label>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={isShipper ? "Alamat lengkap lokasi penjemputan" : "Alamat lengkap lokasi tujuan pengiriman"}
            rows={3}
            required
          />
        </div>
      </CardContent>
    </Card>
  );
}
