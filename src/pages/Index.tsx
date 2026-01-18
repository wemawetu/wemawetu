import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCampaigns } from "@/components/home/FeaturedCampaigns";
import { ProgramsSection } from "@/components/home/ProgramsSection";
import { MissionSection } from "@/components/home/MissionSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { CTASection } from "@/components/home/CTASection";
import { CryptoSection } from "@/components/home/CryptoSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturedCampaigns />
        <MissionSection />
        <ProgramsSection />
        <ImpactSection />
        <CryptoSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
