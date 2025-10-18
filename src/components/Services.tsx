import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Fuel, LifeBuoy, Phone } from "lucide-react";
import GarageInterior from "@/assets/images/img1.jpg";

const Services = () => {
  const services = [
    {
      icon: Truck,
      title: "Premium Towing Services",
      description:
        "Reliable and professional towing when you need it most. Whether you're dealing with a breakdown, accident, or roadside emergency, we ensure fast, secure, and efficient service.",
      features: [
        "Local & Long Distance",
        "Flatbed & Wheel Lift",
        "Motorcycle Towing",
        "Medium Duty Available",
      ],
    },
    {
      icon: LifeBuoy,
      title: "Roadside Assistance",
      description:
        "Fast and reliable help when you're stranded. From jump-starts to tire changes, we get you moving again in no time.",
      features: [
        "Jump Starts",
        "Tire Changes",
        "Lock-out Service",
        "Battery Replacement",
      ],
    },
    {
      icon: Fuel,
      title: "Accident Recovery",
      description:
        "In the unfortunate event of a collision, we provide immediate assistance to safely recover your vehicle. Our experts ensure damage-free removal and transport it securely to a repair facility or a location of your choice.",
      features: [
        "Accident Recovery",
        "Equipment Recovery",
        "Off-road Recovery",
        "Ditch Extraction",
      ],
    },
    {
      icon: Fuel,
      title: "Fuel Delivery",
      description:
        "Run out of gas? No worries—we deliver fuel directly to your location so you can continue your journey without delay.",
      features: [
        "Emergency Fuel",
        "Multiple Fuel Types",
        "Fast Delivery",
        "24/7 Service",
      ],
    },
  ];

  return (
    <section
      id="services"
      className="py-20 bg-muted/30 dark:bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold mb-3 bg-[image:_var(--gradient-hero)] bg-clip-text text-transparent tracking-tight">
            Our Services
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-primary to-primary/50 mb-4" />
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive towing and roadside assistance services across the
            Phoenix metro area
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card
                key={index}
                className="group bg-gradient-card shadow-card hover:shadow-elevated transition-all duration-300 border border-primary/10 hover:border-primary/30 transform hover:-translate-y-2 rounded-2xl dark:border-border/60"
              >
                <CardContent className="p-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-primary to-primary/70 p-3 rounded-lg shadow-card ring-1 ring-white/10 dark:ring-white/5">
                      <IconComponent className="h-8 w-8 text-white drop-shadow" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-3 tracking-tight transition-colors group-hover:text-primary">
                        {service.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {service.description}
                      </p>
                      <ul className="space-y-2">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3 ring-2 ring-primary/20"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-16">
          <div className="bg-gradient-to-br from-primary to-primary/70 p-8 lg:px-20 rounded-2xl shadow-premium dark:from-primary dark:to-primary/60 h-full flex flex-col justify-center">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Emergency?<br></br> We're Here 24/7
            </h3>
            <p className="text-white/90 mb-6 text-lg">
              Don't wait when you need help. Our emergency response team is
              ready to assist you anytime, anywhere in the Phoenix metro area.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-transparent hover:text-white border-2 border-white font-semibold px-8 py-3 dark:bg-background dark:text-primary dark:border-black dark:hover:bg-transparent dark:hover:text-black max-w-max"
              asChild
            >
              <a href="tel:6232538345">
                <Phone className="h-5 w-5" />
                Call Now
              </a>
            </Button>
          </div>
          <div>
            <img
              src={GarageInterior.src}
              alt="Professional auto repair garage"
              className="rounded-2xl shadow-premium w-full h-[400px] object-cover ring-1 ring-primary/10"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
