"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContainerRackCardProps {
  containers: Array<{
    id?: number | string;
    container_type?: { name?: string; size?: string };
    container_number?: string;
    seal_number?: string;
    racks?: Array<{ id: number | string; name?: string }>;
  }>;
  onAddRack: (containerId: number) => void;
}

export function ContainerRackCard({ containers, onAddRack }: ContainerRackCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Kontainer & rack</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {containers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Belum ada kontainer.</p>
        ) : (
          containers.map((c) => {
            const cid = Number(c.id);
            const ct = c.container_type;
            const racks = c.racks;
            return (
              <div key={cid} className="rounded-lg border p-4 bg-zinc-50/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-zinc-900">
                      {ct?.name ?? "Kontainer"} {ct?.size ? `(${ct.size})` : ""}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Num: {String(c.container_number ?? "—")} / Seal: {String(c.seal_number ?? "—")}
                    </div>
                  </div>
                  <Button type="button" size="sm" variant="outline" className="h-8 bg-white" onClick={() => onAddRack(cid)}>
                    + Rack
                  </Button>
                </div>
                {Array.isArray(racks) && racks.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-zinc-100 mt-2">
                    {racks.map((r) => (
                      <span key={String(r.id)} className="bg-white border text-[10px] px-2 py-0.5 rounded text-zinc-600">
                        {String(r.name ?? r.id)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
