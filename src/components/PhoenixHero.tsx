import React from 'react';
import { Button } from '@/components/ui/button';
import heroTowing from '@/assets/hero-towing.jpg';

const PhoenixHero = () => {
  return (
    <section id="phoenix-hero" className="relative py-20 md:py-32 bg-cover bg-center" style={{backgroundImage: `url(${heroTowing.src})`}}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="container mx-auto px-4 relative text-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Towing & Roadside Assistance in Phoenix, AZ</h1>
        <p className="text-lg md:text-2xl mb-8 max-w-3xl mx-auto">
          Your reliable partner on the road. Available 24/7.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-elevated transition-transform duration-300 hover:scale-105" asChild>
            <a href="#cost-calculator">Get a Free Estimate</a>
          </Button>
          <Button size="lg" variant="outline" className="border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-colors duration-300" asChild>
            <a href="tel:+16232538345">Call Now</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PhoenixHero;
