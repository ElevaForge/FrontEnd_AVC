import { HeroSection } from "@/components/hero-section"
import { PropertiesSection } from "@/components/properties-section"
import { RemodelSection } from "@/components/remodel-section"
import { SellSection } from "@/components/sell-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <main className="min-h-screen w-full overflow-x-hidden">
        <HeroSection />
        <PropertiesSection />
        <RemodelSection />
        <SellSection />
      </main>
      <Footer />
    </>
  )
}
