"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import logo from "@/assets/images/logo.png";

const PhoenixHeader = () => {
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 duration-300 ${
        isSticky
          ? "py-3 shadow-md bg-primary/90 backdrop-blur-lg"
          : "py-4 bg-transparent"
      }`}
      role="banner"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <a
            href="/phoenix"
            className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
          >
            <img
              src={logo.src}
              alt="Collision Towing Phoenix Logo"
              className={`w-auto object-contain transition-all ${
                isSticky ? "h-10" : "h-14"
              }`}
            />
             <span className="text-xl font-bold text-white">Collision Towing Phoenix</span>
          </a>
          <Button
            variant="secondary"
            asChild
            className="gap-2"
          >
            <a href="tel:+16232538345">
              <Phone className="h-5 w-5" />
              <span>Call Now</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default PhoenixHeader;