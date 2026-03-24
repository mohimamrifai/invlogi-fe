import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** `sm` sidebar / navbar compact; `md` auth cards; `lg` hero */
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-7 max-w-[12.5rem] sm:max-w-[15rem]",
  md: "h-9 max-w-[16rem] sm:max-w-[18rem]",
  lg: "h-11 max-w-[19rem] sm:max-w-[22rem]",
} as const;

export function BrandLogo({ size = "md", className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        className
      )}
    >
      <Image
        src="/logo.png"
        alt="INVLOGI"
        width={480}
        height={80}
        priority
        className={cn("w-auto object-contain object-left", sizeClasses[size])}
      />
    </span>
  );
}
