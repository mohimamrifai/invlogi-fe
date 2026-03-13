"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50/50 p-4 font-sans pt-28 pb-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-zinc-200/50 sm:p-10 border border-zinc-100">
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
          <h2 className="text-lg font-bold text-zinc-900">Selamat Datang Kembali</h2>
          <p className="text-sm text-zinc-500 max-w-[280px] mx-auto leading-relaxed">
            Masuk untuk mengelola pengiriman dan melacak logistik Anda
          </p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@perusahaan.com"
              className="h-12 rounded-xl border-zinc-200 bg-zinc-50/50 px-4 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Password</Label>
              <Link href="#" className="text-xs font-medium text-zinc-500 hover:text-black hover:underline transition-colors">
                Lupa password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="h-12 rounded-xl border-zinc-200 bg-zinc-50/50 px-4 pr-10 shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent focus-visible:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button className="h-12 w-full rounded-xl bg-black text-sm font-bold text-white hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/20">
              Masuk Sekarang
            </Button>
          </div>

          <div className="relative flex items-center py-2">
            <div className="grow border-t border-zinc-200"></div>
            <span className="mx-4 shrink text-xs font-medium text-zinc-400 uppercase tracking-widest">atau</span>
            <div className="grow border-t border-zinc-200"></div>
          </div>

          <div className="space-y-4 pt-1 text-center">
            <p className="text-sm text-zinc-500">Belum memiliki akun?</p>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl border-2 border-zinc-200 bg-transparent text-sm font-bold text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
            >
              Daftar Partner
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-12 text-center space-y-2">
        <h3 className="text-lg font-bold text-zinc-300">IDNVerse</h3>
        <p className="text-xs font-medium text-zinc-400">
          ©2026 PT IDNVerse Karya Nusantara
        </p>
      </div>
    </div>
  );
}
