import FAQ from '@/components/landing-page/faq';
import Features from '@/components/landing-page/features';
import Footer from '@/components/landing-page/footer';
import Hero from '@/components/landing-page/hero';
import { Navbar } from '@/components/landing-page/navbar';
import Pricing from '@/components/landing-page/pricing';

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </>
  );
}
