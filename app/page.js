'use client';

import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import ScrollProgress from '@/components/ui/ScrollProgress';
import MouseGlow from '@/components/ui/MouseGlow';
import Navbar from '@/components/Navbar/Navbar';
import Hero from '@/components/Hero/Hero';
import Specialties from '@/components/Specialties/Specialties';
import BeforeAfter from '@/components/BeforeAfter/BeforeAfter';
import AboutDoctor from '@/components/AboutDoctor/AboutDoctor';
import Benefits from '@/components/Benefits/Benefits';
import VideoSection from '@/components/VideoSection/VideoSection';
import Testimonials from '@/components/Testimonials/Testimonials';
import CTASection from '@/components/CTASection/CTASection';
import Footer from '@/components/Footer/Footer';
import FloatingWhatsApp from '@/components/FloatingWhatsApp/FloatingWhatsApp';
import FloatingInstagram from '@/components/FloatingInstagram/FloatingInstagram';

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <Specialties />
        <BeforeAfter />
        <AboutDoctor />
        <Benefits />
        <VideoSection />
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <FloatingInstagram />
    </>
  );
}
