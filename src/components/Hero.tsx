import { Button } from "@/components/ui/button";
import { Phone, Clock, MapPin } from "lucide-react";
import HeroImage from "@/assets/hero-towing.jpg";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-svh h-full flex items-center overflow-hidden"
    >
      {/* Background Image */}
      <img
        src={HeroImage.src}
        alt="Hero Background"
        className="absolute inset-0 size-full object-cover scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-primary/40 to-transparent dark:from-black/40 dark:via-primary/30">
        {" "}
      </div>
      {/* <div className="absolute inset-0 [background-image:radial-gradient(circle_at_20%_20%,hsl(0_0%_100%/.08),transparent_25%),radial-gradient(circle_at_80%_30%,hsl(0_0%_100%/.06),transparent_20%)]" /> */}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pb-20 pt-28 h-full flex flex-col justify-end">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1] drop-shadow-md">
            Stranded?
            <span className="block text-secondary">We'll Get You Back</span>
            on the Road
          </h1>

          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl">
            Fast, professional towing and roadside assistance across the Phoenix
            metro area. No hidden fees, just reliable service you can trust.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-lg px-8 hover:bg-transparent border-2 border-secondary hover:text-secondary backdrop-blur-md shadow-elevated py-2"
            >
              <a href="#quote" className="flex items-center">
                <span>Get Free Quote</span>
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 bg-white/10 border-white/30 border-2 text-white hover:bg-secondary hover:border-secondary hover:text-primary backdrop-blur-md py-2"
            >
              <a href="#services">Our Services</a>
            </Button>
          </div>

          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 text-white">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 w-full justify-center flex-col text-center sm:flex-row sm:justify-start sm:w-auto">
              <Clock className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-semibold">24/7 Emergency</p>
                <p className="text-sm text-white/80">Always Available</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 w-full justify-center flex-col text-center sm:flex-row sm:justify-start sm:w-auto">
              <MapPin className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-semibold">Phoenix Metro</p>
                <p className="text-sm text-white/80">Full Coverage</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3 border border-white/20 w-full justify-center flex-col text-center sm:flex-row sm:justify-start sm:w-auto">
              <Phone className="h-6 w-6 text-secondary" />
              <div>
                <p className="font-semibold">Fast Response</p>
                <p className="text-sm text-white/80">Quick & Reliable</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <div
        className="pointer-events-none absolute top-0 left-0 w-full h-1/4 sm:h-1/3 bg-gradient-to-b from-primary via-primary/60 to-transparent z-0"
        aria-hidden="true"
      /> */}
    </section>
  );
};

export default Hero;
