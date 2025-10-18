import { Card, CardContent } from "@/components/ui/card";
import { Truck, Wrench, Battery, Zap } from "lucide-react";

const PhoenixServices = () => {
  const services = [
    {
      icon: Truck,
      title: "24/7 Emergency Towing",
      description: "Whether it's a breakdown or an accident, we provide fast and reliable towing services anytime, anywhere in Phoenix."
    },
    {
      icon: Wrench,
      title: "Roadside Assistance",
      description: "Locked out of your car? Need a tire change? Our roadside assistance team is ready to help you out."
    },
    {
      icon: Battery,
      title: "Jump Starts",
      description: "Dead battery? We'll get you back on the road in no time with our quick jump start service."
    },
    {
      icon: Zap,
      title: "Accident Recovery",
      description: "We specialize in accident recovery, providing safe and secure towing for your vehicle after a collision."
    }
  ];

  return (
    <section id="phoenix-services" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Our Services in Phoenix</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-4">We offer a wide range of services to meet your needs.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold ml-4">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PhoenixServices;
