import PublicNavbar from '@/components/public/PublicNavbar';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import PhilosophySection from '@/components/public/PhilosophySection';
import ScheduleSection from '@/components/public/ScheduleSection';
import GallerySection from '@/components/public/GallerySection';
import ContactSection from '@/components/public/ContactSection';
import PublicFooter from '@/components/public/PublicFooter';

const Index = () => (
  <div className="overflow-x-hidden bg-[#060b18]">
    <PublicNavbar />
    <main>
      <HeroSection />
      <AboutSection />
      <PhilosophySection />
      <ScheduleSection />
      <GallerySection />
      <ContactSection />
    </main>
    <PublicFooter />
  </div>
);

export default Index;
