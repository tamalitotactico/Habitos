"use client";

import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TimerWidget } from "@/components/tracking/TimerWidget";
import { ManualEntryForm } from "@/components/tracking/ManualEntryForm";
import { EntryList } from "@/components/tracking/EntryList";
import { useTodayEntries } from "@/lib/hooks/useTimeEntries";
import { CATEGORY_LABELS, CATEGORY_COLORS, TimeCategory } from "@/lib/api/timeEntries";

function formatHours(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function TrackingPage() {
  const [manualOpen, setManualOpen] = useState(false);
  const { data, isLoading } = useTodayEntries();

  const activeSummary = data?.byCategory.filter((c) => c.totalSec > 0) ?? [];
  const totalSec = data?.totalSec ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tiempo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ¿En qué estás invirtiendo tu tiempo hoy?
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setManualOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Manual
        </Button>
      </div>

      {/* Timer */}
      <TimerWidget />

      {/* Today's summary */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {/* Total + category bars */}
          {totalSec > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  Resumen de hoy
                </h2>
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {formatHours(totalSec)} total
                </span>
              </div>

              {/* Category breakdown */}
              <div className="space-y-2">
                {activeSummary.map(({ category, totalSec: catSec }) => {
                  const pct = totalSec > 0 ? Math.round((catSec / totalSec) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {CATEGORY_LABELS[category as TimeCategory]}
                        </span>
                        <span className="font-medium">{formatHours(catSec)} · {pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: CATEGORY_COLORS[category as TimeCategory],
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Entry list */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
              Sesiones de hoy
            </h2>
            <EntryList entries={data?.entries ?? []} />
          </div>
        </>
      )}

      {/* Manual entry dialog */}
      <Dialog open={manualOpen} onOpenChange={setManualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar sesión manual</DialogTitle>
          </DialogHeader>
          <ManualEntryForm onSuccess={() => setManualOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
