"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState("company");
  const t = useTranslations("Register");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/50 p-4 font-sans pt-28 pb-10">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-6 shadow-2xl shadow-zinc-200/50 sm:p-10 border border-zinc-100">
        <div className="mb-8 text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white mb-2 shadow-lg shadow-black/20">
            <span className="text-xl font-bold">I</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">IDNVerse</h1>
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

        <form className="space-y-6">
          {/* Account Type Selection */}
          <div className="space-y-3">
            <RadioGroup 
              defaultValue="company" 
              className="flex gap-6 justify-center"
              onValueChange={setAccountType}
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
                    className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyEmail" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("companyEmail")}</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="companyPhone" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("companyPhone")}</Label>
                  <Input
                    id="companyPhone"
                    type="tel"
                    className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
                  />
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
                  className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="picEmail" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("workEmail")}</Label>
                <Input
                  id="picEmail"
                  type="email"
                  className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="picPhone" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("mobileNumber")}</Label>
                <Input
                  id="picPhone"
                  type="tel"
                  className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 pr-9 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className="h-10 rounded-lg border-zinc-200 bg-zinc-50/50 px-3 pr-9 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white text-sm"
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
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 pt-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms" className="text-xs font-medium text-zinc-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {t("terms")}
              </Label>
            </div>

            <div className="w-full space-y-4">
              <Button className="h-10 w-full rounded-lg bg-black text-sm font-bold text-white hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md shadow-black/10">
                {t("createAccount")}
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
