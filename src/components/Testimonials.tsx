import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Phoenix, AZ",
      rating: 5,
      text: "Outstanding service! My car broke down on I-10 during rush hour, and they had me towed within 20 minutes. The driver was professional, courteous, and took great care of my vehicle. Highly recommend!",
      service: "Emergency Towing",
    },
    {
      name: "Mike Rodriguez",
      location: "Scottsdale, AZ",
      rating: 5,
      text: "Called them for a jump start at 2 AM and they were there in 15 minutes. Fair pricing, excellent service, and they even checked my battery to make sure it wouldn't happen again. These guys are the real deal!",
      service: "Roadside Assistance",
    },
    {
      name: "Jennifer Chen",
      location: "Tempe, AZ",
      rating: 5,
      text: "Professional, fast, and reasonably priced. My car was stuck in a parking lot after an accident, and they handled everything perfectly. The driver was knowledgeable and made a stressful situation much easier.",
      service: "Accident Recovery",
    },
    {
      name: "David Thompson",
      location: "Mesa, AZ",
      rating: 5,
      text: "Exceptional service from start to finish. They arrived exactly when promised, loaded my classic car with extreme care, and delivered it safely. You can tell they take pride in their work.",
      service: "Specialty Towing",
    },
    {
      name: "Lisa Martinez",
      location: "Chandler, AZ",
      rating: 5,
      text: "Stranded with a flat tire and no spare, they came out quickly and had me back on the road in no time. The technician was friendly, professional, and went above and beyond to help.",
      service: "Tire Service",
    },
    {
      name: "Robert Wilson",
      location: "Glendale, AZ",
      rating: 5,
      text: "Best towing company in Phoenix! Fair prices, quick response, and they treat you like family. I've used them twice now and both times exceeded my expectations. Definitely my go-to for any roadside needs.",
      service: "Multiple Services",
    },
  ];

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const pausedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    const onPointerDown = () => (pausedRef.current = true);
    const onPointerUp = () => (pausedRef.current = false);
    api.on("select", onSelect);
    api.on("pointerDown", onPointerDown);
    api.on("pointerUp", onPointerUp);
    onSelect();
    return () => {
      api.off("select", onSelect);
      api.off("pointerDown", onPointerDown);
      api.off("pointerUp", onPointerUp);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) api.scrollNext();
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [api]);

  const onMouseEnter = () => {
    pausedRef.current = true;
  };
  const onMouseLeave = () => {
    pausedRef.current = false;
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <section id="testimonials" className="py-20 bg-muted/20 dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-4 bg-[image:_var(--gradient-hero)] bg-clip-text text-transparent tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from the thousands of
            satisfied customers we've helped
          </p>
        </div>

        <div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            setApi={setApi}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2">
                  <Card className="border dark:border-border/60 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 h-full rounded-2xl bg-gradient-card ring-1 ring-border/40">
                    <CardContent className="p-6 md:p-7 h-full flex flex-col relative">
                      <Quote className="absolute right-2 top-2 h-10 w-10 text-primary/15" />

                      <div className="flex items-center justify-between mb-5 pr-8">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {initials(testimonial.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground leading-[1]">
                              {testimonial.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {testimonial.location}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border border-primary/20">
                          {testimonial.service}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground/90 mb-5 leading-relaxed md:text-[17px] italic">
                        “{testimonial.text}”
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/60">
                        <div className="flex items-center space-x-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Verified Customer
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {count > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                aria-pressed={current === i}
                onClick={() => api?.scrollTo(i)}
                className={`h-2.5 w-2.5 rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  current === i
                    ? "bg-primary w-6 shadow-sm"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-6 py-3 rounded-full">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">4.9/5 Rating</span>
            <span className="text-muted-foreground">from 500+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
