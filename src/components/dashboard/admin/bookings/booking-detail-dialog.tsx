"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { bookingStatusBadgeClass, bookingStatusLabelFromApi } from "@/lib/booking-status";
import type { BookingDetail } from "./types";

interface BookingDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  data: BookingDetail | null;
}

export function BookingDetailDialog({
  open,
  onOpenChange,
  loading,
  data,
}: BookingDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0 overflow-hidden sm:max-w-2xl">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Detail Booking</DialogTitle>
              <DialogDescription>ID: {data?.booking_number}</DialogDescription>
            </div>
            {data && (
              <Badge className={bookingStatusBadgeClass(data.status)}>
                {bookingStatusLabelFromApi(data.status)}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground animate-pulse">
              Memuat data booking…
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Section: Company & Price */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border bg-zinc-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </p>
                  <p className="font-semibold">{data.company?.name ?? "—"}</p>
                </div>
                <div className="rounded-lg border bg-emerald-50/50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                    Estimasi Harga
                  </p>
                  <p className="font-semibold text-emerald-700">
                    {data.estimated_price
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(Number(data.estimated_price))
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Section: Logistics */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Logistik & Pengiriman
                </h3>
                <div className="grid gap-x-4 gap-y-3 rounded-lg border p-4 sm:grid-cols-2">
                  <InfoItem
                    label="Origin"
                    value={`${data.origin_location?.name} (${data.origin_location?.code})`}
                  />
                  <InfoItem
                    label="Destination"
                    value={`${data.destination_location?.name} (${data.destination_location?.code})`}
                  />
                  <InfoItem label="Transport Mode" value={data.transport_mode?.name} />
                  <InfoItem label="Service Type" value={data.service_type?.name} />
                  <InfoItem
                    label="Tgl Keberangkatan"
                    value={
                      data.departure_date
                        ? new Date(data.departure_date).toLocaleDateString("id-ID", {
                            dateStyle: "long",
                          })
                        : "—"
                    }
                  />
                  <InfoItem
                    label="Kontainer"
                    value={
                      data.container_type
                        ? `${data.container_count}x ${data.container_type.name} (${data.container_type.size})`
                        : `${data.container_count}x —`
                    }
                  />
                </div>
              </div>

              {/* Section: Cargo */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detail Kargo
                </h3>
                <div className="grid gap-x-4 gap-y-3 rounded-lg border p-4 sm:grid-cols-2">
                  <InfoItem label="Kategori" value={data.cargo_category?.name} />
                  <InfoItem
                    label="Berat Est."
                    value={data.estimated_weight ? `${data.estimated_weight} kg` : "—"}
                  />
                  <InfoItem
                    label="CBM Est."
                    value={data.estimated_cbm ? `${data.estimated_cbm} m³` : "—"}
                  />
                  <InfoItem
                    className="sm:col-span-2"
                    label="Deskripsi Barang"
                    value={data.cargo_description}
                  />
                </div>
              </div>

              {/* Section: DG */}
              {data.is_dangerous_goods ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">
                    Dangerous Goods
                  </h3>
                  <div className="grid gap-x-4 gap-y-3 rounded-lg border border-red-100 bg-red-50/30 p-4 sm:grid-cols-2">
                    <InfoItem
                      label="DG Class"
                      value={`${data.dg_class?.name} (${data.dg_class?.code})`}
                    />
                    <InfoItem label="UN Number" value={data.un_number} />
                    {data.msds_file && (
                      <div className="sm:col-span-2">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">
                          MSDS File
                        </p>
                        <a
                          href={`/storage/${data.msds_file}`}
                          target="_blank"
                          className="text-xs text-blue-600 underline"
                        >
                          Lihat PDF
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Section: Contacts */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pengirim (Shipper)
                  </p>
                  <p className="text-sm font-semibold">{data.shipper_name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.shipper_address}
                  </p>
                  <p className="text-xs font-medium">📞 {data.shipper_phone}</p>
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Penerima (Consignee)
                  </p>
                  <p className="text-sm font-semibold">{data.consignee_name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.consignee_address}
                  </p>
                  <p className="text-xs font-medium">📞 {data.consignee_phone}</p>
                </div>
              </div>

              {/* Additional Services */}
              {data.additional_services?.length ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Layanan Tambahan
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {data.additional_services.map((s, i) => (
                      <Badge key={i} variant="secondary" className="px-2 py-0.5 text-[11px]">
                        {s.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Rejection Reason */}
              {data.status === "rejected" && data.rejection_reason && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                    Alasan Penolakan
                  </p>
                  <p className="text-sm text-red-700">{data.rejection_reason}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Data tidak tersedia.</div>
          )}
        </div>
        <DialogFooter className="border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({
  label,
  value,
  className,
}: {
  label: string;
  value?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <p className="text-[10px] font-medium text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
