import { Hero } from "@/components/hero";
import { LandingFeatures } from "@/components/landing-features";
import { LandingFooter } from "@/components/landing-footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-zinc-100">
      <Hero />
      <LandingFeatures />
      <LandingFooter />
    </main>
  );
}
