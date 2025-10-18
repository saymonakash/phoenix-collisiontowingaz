import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ShieldCheck,
  Clock,
  HelpCircle,
  Phone,
  Search,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    question: "How quickly can you respond to a towing request?",
    answer:
      "Our average response time is 1 hour or less for emergency calls within the Phoenix metro area. We have strategically positioned tow trucks throughout the region to ensure the fastest possible service.",
  },
  {
    question: "What areas do you service?",
    answer:
      "We provide comprehensive towing and roadside assistance throughout the entire Phoenix metropolitan area, including Phoenix, Scottsdale, Tempe, Mesa, Chandler, Glendale, Peoria, and surrounding communities.",
  },
  {
    question: "Do you offer 24/7 emergency service?",
    answer:
      "Yes! We operate 24 hours a day, 7 days a week, 365 days a year. Whether it's 3 AM on a Sunday or during a holiday, our emergency towing service is always available when you need it most.",
  },
  {
    question: "What types of vehicles can you tow?",
    answer:
      "We can tow virtually any vehicle, from compact cars and SUVs to motorcycles and light-duty trucks. Our fleet includes flatbed tow trucks, wheel-lift trucks, and heavy-duty equipment for larger vehicles.",
  },
  {
    question: "How much does towing cost?",
    answer:
      "Our pricing is competitive and transparent with no hidden fees. The cost depends on factors like distance, time of day, and vehicle type. We provide upfront pricing before any work begins, so you know exactly what to expect.",
  },
  {
    question: "Do you work with insurance companies?",
    answer:
      "Absolutely! We work with all major insurance companies and can often bill them directly. We'll help you navigate the insurance process and ensure you get the coverage you're entitled to.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept cash, credit cards (Visa, MasterCard, American Express), debit cards, and can work with most insurance providers for direct billing.",
  },
  {
    question: "Can you help with roadside assistance beyond towing?",
    answer:
      "Yes! We offer comprehensive roadside assistance including jump-starts, tire changes, lockout service, fuel delivery, winching, and minor mechanical assistance to get you back on the road.",
  },
];

const FAQ = () => {
  const [query, setQuery] = useState("");
  const [openAll, setOpenAll] = useState(false);
  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [query]);

  const allValues = filteredFaqs.map((_, i) => `item-${i}`);

  return (
    <section id="faq" className="py-20 bg-muted/20 dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-[image:_var(--gradient-hero)] bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get answers to the most common questions about our towing and
            roadside assistance services
          </p>
          <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> 24/7 Support
            </div>
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Licensed &
              Insured
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search FAQs..."
                className="pl-9"
                aria-label="Search FAQs"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setOpenAll((v) => !v)}
              className="gap-2 hover:!bg-primary"
            >
              <ChevronDown
                className={`h-4 w-4 transition-transform ${
                  openAll ? "rotate-180" : "rotate-0"
                }`}
              />
              {openAll ? "Collapse all" : "Expand all"}
            </Button>
          </div>

          {openAll ? (
            <Accordion
              type="multiple"
              className="w-full space-y-4"
              value={allValues}
            >
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-border/60 bg-background/70 backdrop-blur px-4 sm:px-6 shadow-card ring-1 ring-border/40 hover:shadow-elevated transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary/90 group">
                    <span className="inline-flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 min-w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {index + 1}
                      </span>
                      <HelpCircle className="h-5 w-5 text-primary/80 group-data-[state=open]:rotate-45 transition-transform" />
                      <span className="leading-snug">{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Accordion type="single" collapsible className="w-full space-y-4">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="rounded-xl border border-border/60 bg-background/70 backdrop-blur px-4 sm:px-6 shadow-card ring-1 ring-border/40 hover:shadow-elevated transition-all"
                >
                  <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary/90 group">
                    <span className="inline-flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {index + 1}
                      </span>
                      <HelpCircle className="h-5 w-5 text-primary/80 group-data-[state=open]:rotate-45 transition-transform" />
                      <span className="leading-snug">{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <div className="mt-10 rounded-xl border border-primary/20 bg-white p-6 text-center dark:bg-background">
            <p className="font-semibold text-primary">Still have questions?</p>
            <p className="text-sm text-muted-foreground mt-1">
              Call us anytime—we're here to help.
            </p>
            <div className="mt-4">
              <Button
                asChild
                className="gap-2 border-2 border-primary hover:bg-transparent hover:text-primary dark:text-white"
              >
                <a href="tel:+16232538345">
                  <Phone className="h-4 w-4" /> Call Now
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
