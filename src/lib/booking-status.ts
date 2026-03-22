export function bookingStatusBadgeClass(status: string): string {
  switch (status) {
    case "Draft":
      return "border-slate-200/90 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800/55 dark:text-slate-300";
    case "Submitted":
      return "border-amber-200/90 bg-amber-50 text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/45 dark:text-amber-200";
    case "Approved":
      return "border-emerald-200/90 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/45 dark:text-emerald-300";
    case "Rejected":
      return "border-red-200/90 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/45 dark:text-red-300";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}
