"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, X } from "lucide-react";

const StickyCallButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show button after 1 second of entering the website
    if (!isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] lg:hidden animate-in slide-in-from-bottom duration-300"
      role="complementary"
      aria-label="Emergency call button"
    >
      <div className="relative">
        <Button
          asChild
          size="lg"
          className="bg-secondary text-white font-bold shadow-2xl border-2 border-white/30 px-8 py-3 text-lg rounded-full"
        >
          <a href="tel:6232538345" className="flex items-center gap-3">
            <Phone className="size-6" />
            <span className="flex flex-col items-start">
              <span>Call Now</span>
            </span>
          </a>
        </Button>
        <button
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-700 transition-colors"
          aria-label="Dismiss call button"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
};

export default StickyCallButton;
