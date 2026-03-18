 "use client";
 
 import { useEffect, useState } from "react";
 import { useTranslations } from "next-intl";
 import { Badge } from "@/components/ui/badge";
 
 export default function CompanySettingsPage() {
   const t = useTranslations("Dashboard.customer.settings");
   const [mounted, setMounted] = useState(false);
 
   useEffect(() => {
     setMounted(true);
   }, []);
 
   if (!mounted) return null;
 
   return (
     <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {t("title", { default: "Company Settings" })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("description", {
              default:
                "Kelola profil perusahaan dan pengguna internal yang relevan.",
            })}
          </p>
        </div>
      </div>
       {/* TODO: Implement limited editable company profile & internal users */}
       <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
         <p className="text-sm text-muted-foreground">
           Placeholder halaman Company Settings. Nanti diisi form untuk
           memperbarui informasi perusahaan dan user internal tertentu
           sesuai aturan role `company_admin`.
         </p>
       </div>
     </div>
   );
 }
 
