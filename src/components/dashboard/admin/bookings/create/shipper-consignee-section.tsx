"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ContactFields {
  name: string;
  address: string;
  phone: string;
}

interface ShipperConsigneeSectionProps {
  shipper: ContactFields;
  onShipperChange: (fields: Partial<ContactFields>) => void;
  consignee: ContactFields;
  onConsigneeChange: (fields: Partial<ContactFields>) => void;
  renderError: (field: string) => React.ReactNode;
  validationErrors?: Record<string, string[]>;
}

export function ShipperConsigneeSection({
  shipper,
  onShipperChange,
  consignee,
  onConsigneeChange,
  renderError,
  validationErrors,
}: ShipperConsigneeSectionProps) {
  return (
    <>
      <div className="sm:col-span-1 space-y-4 rounded-lg border p-4 bg-zinc-50/50">
        <h3 className="text-sm font-semibold">Data Pengirim (Shipper)</h3>
        <div className="space-y-2">
          <Label>Nama Pengirim</Label>
          <Input
            value={shipper.name}
            onChange={(e) => onShipperChange({ name: e.target.value })}
            required
            className={validationErrors?.shipper_name ? "border-red-500" : ""}
          />
          {renderError("shipper_name")}
        </div>
        <div className="space-y-2">
          <Label>Alamat Pengirim</Label>
          <Textarea
            value={shipper.address}
            onChange={(e) => onShipperChange({ address: e.target.value })}
            rows={2}
            required
            className={validationErrors?.shipper_address ? "border-red-500" : ""}
          />
          {renderError("shipper_address")}
        </div>
        <div className="space-y-2">
          <Label>Telepon Pengirim</Label>
          <Input
            value={shipper.phone}
            onChange={(e) => onShipperChange({ phone: e.target.value })}
            required
            className={validationErrors?.shipper_phone ? "border-red-500" : ""}
          />
          {renderError("shipper_phone")}
        </div>
      </div>

      <div className="sm:col-span-1 space-y-4 rounded-lg border p-4 bg-zinc-50/50">
        <h3 className="text-sm font-semibold">Data Penerima (Consignee)</h3>
        <div className="space-y-2">
          <Label>Nama Penerima</Label>
          <Input
            value={consignee.name}
            onChange={(e) => onConsigneeChange({ name: e.target.value })}
            required
            className={validationErrors?.consignee_name ? "border-red-500" : ""}
          />
          {renderError("consignee_name")}
        </div>
        <div className="space-y-2">
          <Label>Alamat Penerima</Label>
          <Textarea
            value={consignee.address}
            onChange={(e) => onConsigneeChange({ address: e.target.value })}
            rows={2}
            required
            className={validationErrors?.consignee_address ? "border-red-500" : ""}
          />
          {renderError("consignee_address")}
        </div>
        <div className="space-y-2">
          <Label>Telepon Penerima</Label>
          <Input
            value={consignee.phone}
            onChange={(e) => onConsigneeChange({ phone: e.target.value })}
            required
            className={validationErrors?.consignee_phone ? "border-red-500" : ""}
          />
          {renderError("consignee_phone")}
        </div>
      </div>
    </>
  );
}
