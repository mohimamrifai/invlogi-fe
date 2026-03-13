"use client";

import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDown, Menu, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Hide Navbar on dashboard pages
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out py-4",
        isScrolled
          ? "bg-white/80 backdrop-blur-md border-b shadow-sm py-3"
          : "bg-transparent border-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-bold tracking-tighter flex items-center gap-2 group"
        >
          <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white group-hover:rotate-3 transition-transform duration-300">
            <span className="text-lg font-black">I</span>
          </div>
          <span className="text-zinc-900 dark:text-zinc-50">IDNVerse</span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-zinc-200/50 shadow-sm absolute left-1/2 -translate-x-1/2 transition-all duration-300 hover:shadow-md hover:border-zinc-300/80">
          <NavLink href="/">{t("home")}</NavLink>
          <NavLink href="/layanan">{t("services")}</NavLink>
          <NavLink href="/informasi">{t("information")}</NavLink>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button 
                className="rounded-full px-6 font-medium bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 transition-all duration-300 shadow-lg shadow-zinc-900/20"
              >
                {t("login")}
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "rounded-full border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 flex items-center gap-2 shadow-sm transition-all duration-300 px-4"
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">{locale.toUpperCase()}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-45 rounded-xl p-2">
                <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => handleLanguageChange("id")}>
                  <span className="font-medium mr-2">ID</span> Bahasa Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => handleLanguageChange("en")}>
                  <span className="font-medium mr-2">EN</span> English
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden rounded-full hover:bg-zinc-100"
              )}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] rounded-l-3xl p-6">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-8">
                  <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
                    <span className="text-lg font-black">I</span>
                  </div>
                  <span className="text-xl font-bold">IDNVerse</span>
                </div>
                
                <nav className="flex flex-col gap-2 flex-1">
                  <MobileNavLink href="/">{t("home")}</MobileNavLink>
                  <MobileNavLink href="/layanan">{t("services")}</MobileNavLink>
                  <MobileNavLink href="/informasi">{t("information")}</MobileNavLink>
                </nav>

                <div className="flex flex-col gap-3 pt-6 border-t mt-auto">
                  <Link href="/login" className="w-full">
                    <Button className="w-full rounded-full h-12 text-base font-medium shadow-lg shadow-zinc-900/10">
                      {t("login")}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(
                      buttonVariants({ variant: "outline" }),
                      "w-full justify-between rounded-full h-12 px-6"
                    )}>
                      {locale === 'id' ? 'Bahasa Indonesia' : 'English'} <ChevronDown className="h-4 w-4 opacity-50" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width] rounded-xl p-2">
                      <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => handleLanguageChange("id")}>
                        <span className="font-medium mr-2">ID</span> Bahasa Indonesia
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer rounded-lg" onClick={() => handleLanguageChange("en")}>
                        <span className="font-medium mr-2">EN</span> English
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="px-5 py-2 rounded-full text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-all duration-200"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-lg font-medium text-zinc-600 hover:text-zinc-900 py-3 border-b border-zinc-100 last:border-0 hover:pl-2 transition-all duration-200 flex items-center justify-between group"
    >
      {children}
      <ChevronDown className="-rotate-90 h-4 w-4 opacity-0 group-hover:opacity-50 transition-all" />
    </Link>
  );
}
