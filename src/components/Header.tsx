"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X } from "lucide-react";
// import ThemeToggle from "@/components/ThemeToggle";
import FindVehicleModal from "@/components/FindVehicleModal";
import logo from "@/assets/images/logo.png";
import { useIsMobile } from "@/hooks/use-mobile";

const NAV_ITEMS = [
  { name: "Home", href: "#home" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Testimonials", href: "#testimonials" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
] as const;
const NAV_IDS = NAV_ITEMS.map((n) => n.href.slice(1));

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const sections = NAV_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => !!el,
    );

    if (sections.length === 0) return;

    const onScroll = () => {
      const scrollPos = window.scrollY + 1;
      let current = sections[0]?.id || "home";
      for (const el of sections) {
        if (el.offsetTop <= scrollPos) current = el.id;
      }
      setActiveSection(current);
    };

    // smooth in-page scroll experience
    document.documentElement.style.scrollBehavior = "smooth";
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  // lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isMenuOpen]);

  const isMobile = useIsMobile();

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 duration-500  ${
          isSticky
            ? "py-3 shadow-md  bg-gradient-to-br from-primary to-primary"
            : "py-4 bg-transparent backdrop-blur-xl"
        }`}
        role="banner"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between *:flex-1 gap-1">
            <a
              href="/"
              className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md"
            >
              <img
                src={logo.src}
                alt="Logo"
                className={`w-auto object-contain min-w-fit ${
                  isSticky ? "h-12" : "h-16"
                } transition-all`}
              />
            </a>
            <nav className="flex items-center justify-end gap-1 sm:gap-4 md:gap-6 lg:gap-8">
              <nav className="hidden lg:flex items-center space-x-8">
                {NAV_ITEMS.map((item) => {
                  const id = item.href.replace("#", "");
                  const isActive = activeSection === id;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`transition-colors font-medium underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm ${
                        isActive
                          ? "text-secondary underline"
                          : "text-white hover:text-secondary hover:underline"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {item.name}
                    </a>
                  );
                })}
              </nav>
              <div className="flex items-center space-x-2">
                {/* <ThemeToggle /> */}
                {!isMobile && (
                  <FindVehicleModal
                    variant="outline"
                    size="sm"
                    className="border-2 border-primary-foreground/30 dark:border-white/30 bg-primary-foreground/10 dark:bg-white/10 text-primary-foreground dark:text-white hover:bg-primary-foreground dark:hover:bg-white hover:text-primary transition-all duration-300 max-w-max text-xs sm:text-sm md:text-base px-2 py-0.5 sm:px-4 sm:py-2"
                    showIcon={false}
                  />
                )}
                <Button
                  variant="default"
                  asChild
                  className="gap-2 w-full sm:w-auto border-2 border-primary-foreground/30 dark:border-white/30 hover:bg-primary-foreground/10 dark:bg-white/10 hover:text-primary-foreground dark:text-white bg-secondary dark:hover:bg-white text-primary transition-all duration-300 max-w-max text-xs sm:text-sm md:text-base px-2 py-2 sm:px-4"
                >
                  <a href="tel:6232538345">Call Now</a>
                </Button>{" "}
                {/* <Button
                  variant="default"
                  asChild
                  className="gap-2 w-full sm:w-auto border-2 border-primary-foreground/30 dark:border-white/30 bg-primary-foreground/10 dark:bg-white/10 text-primary-foreground dark:text-white hover:bg-primary-foreground dark:hover:bg-white hover:text-primary transition-all duration-300 max-w-max text-xs sm:text-sm md:text-base px-2 py-0.5 sm:px-4 sm:py-2"
                >
                  <a href="#quote">Get Free Quote</a>
                </Button> */}
              </div>
              <button
                className="lg:hidden p-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-white bg-white/10 hover:text-primary rounded-sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <X className="size-5 md:size-6" />
                ) : (
                  <Menu className="size-5 md:size-6" />
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>
      {isMenuOpen && (
        <div
          className="fixed z-[99] inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        id="mobile-menu"
        className={`fixed top-0 right-0 h-svh w-4/5 max-w-xs bg-background/95 backdrop-blur-xl border-l border-border shadow-xl z-[100] transform transition-transform duration-300 lg:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <a
            href="/"
            className="flex items-center space-x-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <img
              src={logo.src}
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
          </a>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 px-6 py-6 flex-1">
          {NAV_ITEMS.map((item) => {
            const id = item.href.replace("#", "");
            const isActive = activeSection === id;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`text-lg font-semibold rounded-md px-3 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? "text-primary underline underline-offset-4"
                    : "text-foreground hover:text-primary hover:bg-muted"
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
              >
                {item.name}
              </a>
            );
          })}
          <Button
            variant="default"
            asChild
            className="border-2 border-primary hover:bg-transparent hover:text-primary"
          >
            <a href="#quote">Get Free Quote</a>
          </Button>
          <Button
            variant="default"
            asChild
            className="border-2 border-primary hover:bg-transparent hover:text-primary"
          >
            <a href="tel:6232538345">Call Now</a>
          </Button>
          <FindVehicleModal
            variant="outline"
            className="border-2 border-primary hover:bg-transparent hover:text-primary"
          />
          {/* <div className="mt-2">
            <ThemeToggle />
          </div> */}
        </nav>
      </aside>
    </>
  );
};

export default Header;
