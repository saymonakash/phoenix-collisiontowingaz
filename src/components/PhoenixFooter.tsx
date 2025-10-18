import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/images/logo.png";

const PhoenixFooter = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="py-14 bg-primary text-primary-foreground dark:text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <a href="/phoenix" className="flex items-center gap-2">
                <img
                  src={logo.src}
                  alt="Collision Towing Phoenix logo"
                  className="h-10 w-auto object-contain"
                />
              </a>
              <div>
                <h3 className="text-lg font-bold">
                  Collision Towing Phoenix
                </h3>
                <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                  Your Local Towing Experts
                </p>
              </div>
            </div>
            <p className="text-primary-foreground/90 dark:text-white/90 mb-5 max-w-md">
              Providing fast, reliable, and affordable towing and roadside assistance services exclusively for the Phoenix community. We are available 24/7 to help you.
            </p>
          </div>
          <address className="not-italic md:justify-self-end">
            <h4 className="font-semibold mb-4">Contact Us in Phoenix</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-secondary" />
                <div>
                  <a
                    href="tel:6232538345"
                    className="font-semibold hover:text-secondary"
                  >
                    (623) 253-8345
                  </a>
                  <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                    24/7 Emergency Line
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-secondary" />
                <div>
                  <p>Phoenix, AZ</p>
                  <p className="text-sm text-primary-foreground/70 dark:text-white/70">
                    Serving the entire metro area
                  </p>
                </div>
              </div>
            </div>
          </address>
        </div>
        <div className="border-t border-primary-foreground/20 dark:border-white/20 mt-10 pt-8 text-center">
          <p className="text-primary-foreground/70 dark:text-white/70">
            © {year} Collision Towing Phoenix. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PhoenixFooter;