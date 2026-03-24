"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function MasterRowActions({
  entityLabel,
  rowCode,
  canManage,
}: {
  entityLabel: string;
  rowCode: string;
  canManage: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "shrink-0")}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Menu aksi {entityLabel}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem className="cursor-pointer" onClick={() => window.alert(`${entityLabel}: ${rowCode}`)}>
          <Eye className="h-4 w-4" />
          Lihat detail
        </DropdownMenuItem>
        {canManage ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" disabled>
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" variant="destructive" disabled>
              <Trash2 className="h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
