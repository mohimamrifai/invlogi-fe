"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TrackingEntry {
  id: number | string;
  status: string;
  tracked_at?: string;
  notes?: string;
}

interface TrackingTimelineCardProps {
  trackings: TrackingEntry[];
}

export function TrackingTimelineCard({ trackings }: TrackingTimelineCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trackings.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Belum ada entri tracking.</p>
        ) : (
          <div className="relative border-l-2 border-zinc-100 ml-2 pl-4 space-y-4">
            {trackings.map((t) => (
              <div key={String(t.id)} className="relative">
                <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 ring-4 ring-white" />
                <div className="font-semibold text-sm">{String(t.status ?? "")}</div>
                <div className="text-muted-foreground text-[11px] mt-0.5">
                  {t.tracked_at ? String(t.tracked_at) : ""}
                  {t.notes ? ` — ${String(t.notes)}` : ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
