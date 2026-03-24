"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRegisterSchema, type RegisterSchema } from "@/lib/validations/auth";
import { registerCompanyRequest } from "@/lib/auth-api";
import { ApiError } from "@/lib/api-client";
import { BrandLogo } from "@/components/brand-logo";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const t = useTranslations("Register");
  
  // Use a state to trigger schema updates when locale changes (implicitly handled by re-render)
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(createRegisterSchema((key) => t(key))),
    defaultValues: {
      accountType: "company",
      companyName: "",
      companyEmail: "",
      companyPhone: "",
      picName: "",
      picEmail: "",
      picPhone: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
    mode: "onChange" // Validate on change for better UX on complex forms
  });

  const { register, control, handleSubmit, watch, trigger, formState: { errors, isSubmitting } } = form;
  const accountType = watch("accountType");

  // Re-validate when account type changes to clear/set errors for hidden fields
  useEffect(() => {
    if (accountType === "personal") {
      // Clear company errors if switching to personal
      trigger(); 
    }
  }, [accountType, trigger]);

  const onSubmit = async (data: RegisterSchema) => {
    setFormError(null);
    if (data.accountType === "personal") {
      setFormError(
        "Registrasi perorangan belum tersedia (sesuai MVP B2B). Silakan gunakan akun perusahaan."
      );
      return;
    }
    try {
      await registerCompanyRequest({
        company_name: data.companyName ?? "",
        company_phone: data.companyPhone,
        name: data.picName,
        email: data.picEmail,
        password: data.password,
        password_confirmation: data.confirmPassword,
        phone: data.picPhone,
      });
      router.push("/login");
    } catch (e) {
      if (e instanceof ApiError) {
        const body = e.body as { message?: string } | undefined;
        setFormError(body?.message ?? e.message);
        return;
      }
      setFormError("Gagal menghubungi server. Periksa NEXT_PUBLIC_API_URL.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/50 p-4 font-sans pt-28 pb-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl shadow-zinc-200/50 sm:p-10 border border-zinc-100">
        <div className="mb-8 flex flex-col items-center space-y-3 text-center">
          <BrandLogo size="lg" />
          <p className="text-sm font-medium text-zinc-500">
            Logistik Multimoda, Transparan & Berkelanjutan
          </p>
        </div>

        <div className="mb-8 space-y-1.5 text-center">
          <h2 className="text-lg font-bold text-zinc-900">{t("title")}</h2>
          <p className="text-sm text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}
          {/* Account Type Selection */}
          <div className="space-y-3">
            <Controller
              control={control}
              name="accountType"
              render={({ field }) => (
                <RadioGroup 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex gap-6 justify-center"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="font-medium text-sm text-zinc-700">{t("personal")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="company" />
                    <Label htmlFor="company" className="font-medium text-sm text-zinc-700">{t("company")}</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {accountType === "company" && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">{t("companyInfo")}</h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="companyName" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("companyName")}</Label>
                  <Input
                    id="companyName"
                    type="text"
                    className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.companyName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("companyName")}
                  />
                  {errors.companyName && (
                    <p className="text-[10px] font-medium text-red-500 ml-1">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyEmail" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("companyEmail")}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.companyEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("companyEmail")}
                  />
                  {errors.companyEmail && (
                    <p className="text-[10px] font-medium text-red-500 ml-1">{errors.companyEmail.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyPhone" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("companyPhone")}</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.companyPhone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("companyPhone")}
                  />
                  {errors.companyPhone && (
                    <p className="text-[10px] font-medium text-red-500 ml-1">{errors.companyPhone.message}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-2">{t("picData")}</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="picName" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("fullName")}</Label>
                <Input
                  id="picName"
                  type="text"
                  className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.picName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  {...register("picName")}
                />
                {errors.picName && (
                  <p className="text-[10px] font-medium text-red-500 ml-1">{errors.picName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="picEmail" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("workEmail")}</Label>
                <Input
                  id="picEmail"
                  type="email"
                  className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.picEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  {...register("picEmail")}
                />
                {errors.picEmail && (
                  <p className="text-[10px] font-medium text-red-500 ml-1">{errors.picEmail.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="picPhone" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("mobileNumber")}</Label>
                <Input
                  id="picPhone"
                  type="tel"
                  className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.picPhone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  {...register("picPhone")}
                />
                {errors.picPhone && (
                  <p className="text-[10px] font-medium text-red-500 ml-1">{errors.picPhone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 pr-9 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[10px] font-medium text-red-500 ml-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 pr-9 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[10px] font-medium text-red-500 ml-1">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4 max-w-md mx-auto">
            <div className="flex items-start space-x-2">
              <Controller
                control={control}
                name="terms"
                render={({ field }) => (
                  <Checkbox 
                    id="terms" 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="terms" className="text-xs font-medium text-zinc-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mt-0.5">
                {t("terms")}
              </Label>
            </div>
            {errors.terms && (
              <p className="text-[10px] font-medium text-red-500">{errors.terms.message}</p>
            )}

            <div className="w-full space-y-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-10 w-full rounded-lg bg-black text-sm font-bold text-white hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/10 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Loading..." : (accountType === "company" ? t("createAccount") : t("createAccountPersonal"))}
              </Button>

              <div className="relative flex items-center py-2">
                <div className="grow border-t border-zinc-200"></div>
                <span className="mx-4 shrink text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{t("or")}</span>
                <div className="grow border-t border-zinc-200"></div>
              </div>

              <div className="space-y-3 pt-0 text-center">
                <p className="text-xs text-zinc-500">{t("haveAccount")}</p>
                <Link href="/login" className="block w-full">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full rounded-lg border border-zinc-200 bg-transparent text-sm font-bold text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
                  >
                    {t("login")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
