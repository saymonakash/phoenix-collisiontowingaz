import { Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/images/logo.png";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="py-14 bg-primary text-primary-foreground dark:text-white relative overflow-hidden">
      {/* Background overlay for texture and depth */}
      <div className="absolute inset-0 bg-[radial-gradient(600px_200px_at_100%_0%,hsl(var(--secondary)_/_15%),transparent_60%),radial-gradient(800px_300px_at_0%_100%,hsl(var(--accent)_/_15%),transparent_60%)] dark:bg-[radial-gradient(600px_200px_at_100%_0%,hsl(var(--secondary)_/_8%),transparent_60%),radial-gradient(800px_300px_at_0%_100%,hsl(var(--accent)_/_8%),transparent_60%)]"></div>
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-6 xl:gap-10">
            {/* Company Info */}
            <div className="min-w-0 sm:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <a
                  href="/"
                  className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
                >
                  <img
                    src={logo.src}
                    alt="Collision Towing AZ logo"
                    className="h-10 w-auto object-contain"
                  />
                </a>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold truncate">
                    Collision Towing AZ
                  </h3>
                  <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                    Professional Towing Services
                  </p>
                </div>
              </div>
              <p className="text-primary-foreground/90 dark:text-white/90 mb-5 max-w-[400px]">
                Reliable towing and roadside assistance across the Phoenix
                metro—fast, professional, and affordable.
              </p>
              <div className="flex flex-row gap-3">
                <Button
                  asChild
                  className="gap-2 w-full sm:w-auto border-2 border-primary-foreground/30 dark:border-white/30 bg-primary-foreground/10 dark:bg-white/10 text-primary-foreground dark:text-white hover:bg-primary-foreground dark:hover:bg-white hover:text-primary transition-all duration-300 max-w-max"
                >
                  <a href="tel:6232538345" aria-label="Call (623) 253-8345">
                    <Phone className="h-4 w-4" /> Call Now
                  </a>
                </Button>
                <span className="inline-flex items-center justify-center rounded-full border border-secondary/40 bg-secondary/20 px-3 py-1 text-xs font-medium text-secondary max-w-max">
                  24/7 Emergency
                </span>
              </div>
            </div>

            {/* Services */}
            <div className="min-w-0 max-w-max lg:mx-auto">
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                {[
                  "Emergency Towing",
                  "Roadside Assistance",
                  "Flatbed Towing",
                  "Jump Starts",
                  "Lockout Service",
                  "Tire Change",
                ].map((s) => (
                  <li key={s}>
                    <a
                      href="#services"
                      className="text-primary-foreground/70 dark:text-white/70 hover:text-primary-foreground dark:hover:text-white underline underline-offset-4 decoration-primary-foreground/30 dark:decoration-white/30 hover:decoration-primary-foreground/60 dark:hover:decoration-white/60 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50 dark:focus-visible:ring-white/50 rounded-sm"
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <address className="not-italic min-w-0 max-w-max lg:mx-auto">
              <h4 className="font-semibold mb-4">Emergency Contact</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-secondary" />
                  <div>
                    <a
                      href="tel:6232538345"
                      className="font-semibold text-primary-foreground dark:text-white hover:text-secondary hover:underline transition-colors duration-200"
                    >
                      (623) 253-8345
                    </a>
                    <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                      24/7 Emergency Line
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 break-words">
                  <Mail className="h-5 w-5 text-secondary" />
                  <div>
                    <a
                      href="mailto:info@collisiontowingaz.com"
                      className="text-primary-foreground dark:text-white hover:text-secondary hover:underline break-all transition-colors duration-200"
                    >
                      info@collisiontowingaz.com
                    </a>
                    <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                      General Inquiries
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-secondary" />
                  <div>
                    <p className="text-primary-foreground dark:text-white">
                      Phoenix Metro Area
                    </p>
                    <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                      Full Coverage
                    </p>
                  </div>
                </div>
              </div>
            </address>
          </div>

          <div className="border-t border-primary-foreground/20 dark:border-white/20 mt-10 pt-8 text-center">
            <p className="text-primary-foreground/70 dark:text-white/70">
              © {year} Collision Towing AZ. All rights reserved. | Licensed &
              Insured
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
