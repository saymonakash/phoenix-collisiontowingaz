import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, CheckCircle2, Phone } from "lucide-react";
import professionalDriver from "@/assets/images/img3.jpg";
import Map from "@/components/Map";
import { useState } from "react";

const About = () => {
  const stats = [
    { icon: Clock, number: "20+", label: "Years of Experience" },
    { icon: Star, number: "1000+", label: "Happy Customers" },
    { icon: MapPin, number: "24/7", label: "Emergency Service" },
  ];
  const [userLoc, setUserLoc] = useState<{
    address?: string;
    distanceToShopKm?: number;
    nearestCity?: { name: string; distanceKm: number };
  } | null>(null);
  const [requestLocation, setRequestLocation] = useState(false);
  const [locationRequested, setLocationRequested] = useState(false);

  return (
    <section id="about" className="py-20 bg-muted/20 dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="order-2 lg:order-1 relative h-full">
            <div className="relative rounded-2xl overflow-hidden ring-1 ring-primary/10 shadow-premium h-full">
              <img
                src={professionalDriver.src}
                alt="Professional tow truck driver"
                className="size-full min-h-[420px] object-cover"
              />
              {/* gradient edge */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </div>
            {/* floating badge */}
            <div className="absolute -top-3 -right-3 md:-right-6 md:-top-6">
              <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-background/80 backdrop-blur px-3 py-2 shadow-md">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Trusted by 1k+ drivers
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-6">
              A Little Care for Your{" "}
              <span className="bg-[image:_var(--gradient-hero)] bg-clip-text text-transparent">
                Great Problems
              </span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              For over 20 years, we have been providing expert automotive
              services to drivers in Phoenix, AZ, and surrounding areas. Our
              experienced team is committed to offering fast, professional, and
              affordable assistance whenever you need it.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className="group rounded-xl border border-border/60 bg-background/60 dark:bg-muted/20 p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-3xl font-bold tracking-tight text-foreground">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Why Choose Us */}
            <div className="space-y-5">
              <h3 className="text-xl font-semibold">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-3 mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    Fast response times across the Phoenix metro area
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-3 mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    Professional, licensed, and insured drivers
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-3 mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    Transparent pricing with no hidden fees
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-3 mt-0.5 h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">
                    State-of-the-art equipment and vehicles
                  </span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
                <Button
                  size="lg"
                  className="gap-2 border-2 border-primary hover:bg-transparent hover:text-primary dark:text-white py-2 rounded-full"
                  asChild
                >
                  <a href="tel:+16232538345" aria-label="Call Clean Tow now">
                    <Phone className="h-5 w-5" /> Call Now
                  </a>
                </Button>
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary ">
                  <Clock className="h-4 w-4" /> 24/7 Available
                </div>
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <div className="order-3 lg:col-span-2">
            <Card className="bg-gradient-card shadow-premium border dark:border-border/60">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  Service Areas
                </h3>

                {/* Interactive Map */}
                <div className="mb-6 overflow-hidden rounded-xl border border-border/60 bg-background/40 p-2">
                  {!locationRequested && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8 px-4 text-center bg-muted/30 rounded-lg mb-2">
                      <MapPin className="h-12 w-12 text-primary" />
                      <div>
                        <h4 className="text-lg font-semibold mb-2">
                          See Your Distance to Our Shop
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Allow location access to see how far you are from our
                          service area
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setRequestLocation(true);
                          setLocationRequested(true);
                        }}
                        className="gap-2 py-2"
                        size="lg"
                      >
                        <MapPin className="h-4 w-4" />
                        Show My Location on Map
                      </Button>
                    </div>
                  )}
                  <div
                    className={`h-[420px] rounded-lg ${!locationRequested ? "opacity-50" : ""}`}
                  >
                    <Map
                      shopLocation={{
                        name: "Clean Tow",
                        coordinates: [-112.074, 33.4484],
                        address: "Phoenix, AZ 85004",
                        phone: "+1 (623) 253-8345",
                      }}
                      onUserLocation={(d) => {
                        setUserLoc({
                          address: d.address,
                          distanceToShopKm: d.distanceToShopKm,
                          nearestCity: d.nearestCity,
                        });
                      }}
                      autoRequestLocation={requestLocation}
                    />
                  </div>
                </div>

                {/* Shop details */}
                <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Headquarters
                        </p>
                        <p className="text-sm font-medium">Phoenix, AZ 85004</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Availability
                        </p>
                        <p className="text-sm font-medium">
                          24/7 Emergency Service
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Call us</p>
                        <a
                          href="tel:+16232538345"
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          (623) 253-8345
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {userLoc && (
                  <div className="mb-8 rounded-xl border border-border/60 bg-background p-4 shadow-sm">
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your Location
                        </p>
                        <p className="text-sm font-medium">
                          {userLoc.address || "Detected via GPS"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Nearest City
                        </p>
                        <p className="text-sm font-medium">
                          {userLoc.nearestCity?.name} (
                          {userLoc.nearestCity?.distanceKm != null
                            ? (
                                userLoc.nearestCity.distanceKm * 0.621371
                              ).toFixed(1)
                            : "-"}{" "}
                          miles)
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Distance to Shop
                        </p>
                        <p className="text-sm font-medium">
                          {userLoc.distanceToShopKm != null
                            ? (userLoc.distanceToShopKm * 0.621371).toFixed(1)
                            : "-"}{" "}
                          miles
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
