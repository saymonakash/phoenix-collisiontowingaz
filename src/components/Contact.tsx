import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Phone, MapPin, Loader2 } from "lucide-react";

const PhoenixContact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const contactInfo = [
    {
      icon: Phone,
      title: "Phoenix Emergency Line",
      info: "(623) 253-8345",
      description: "24/7 Emergency Towing in Phoenix",
    },
    {
      icon: MapPin,
      title: "Phoenix Service Area",
      info: "Phoenix Metro Area",
      description: "Covering all of Phoenix and suburbs",
    },
  ];

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, "Please enter your full name"),
        phone: z
          .string()
          .min(7, "Please enter a valid phone number")
          .regex(/^[0-9+()\-\s]+$/, "Only digits and + ( ) - are allowed"),
        message: z.string().min(10, "Please add a few details (10+ chars)"),
      }),
    [],
  );

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", message: "" },
    mode: "onTouched",
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success("Request received!", {
          description:
            "Thanks! Our dispatcher for Phoenix will reach out shortly.",
          duration: 5000,
        });
        form.reset();
      } else {
        toast.error("Unable to send request", {
          description:
            result.message ||
            "There was a problem. Please call us directly.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      toast.error("Connection error", {
        description:
          "Please check your internet connection or call us.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-muted/30 dark:bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-[image:_var(--gradient-hero)] bg-clip-text text-transparent">
            Contact Us in Phoenix
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Stuck on the road? Fill out the form for a quick callback or call us directly for immediate assistance in Phoenix.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <Card className="border-border/60 shadow-card ring-1 ring-border/40 min-w-0">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-2xl font-semibold mt-3">
                Request a callback
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Share a few details and we’ll contact you within minutes.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(623) 555-0123"
                              inputMode="tel"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How can we help?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your situation (e.g. location in Phoenix, vehicle, issue)"
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="gap-2 w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send request"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                      className="gap-2 w-full sm:w-auto"
                    >
                      <a href="tel:6232538345">
                        <Phone className="h-4 w-4" /> Call now
                      </a>
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Quick Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 min-w-0">
            {contactInfo.map((contact, index) => {
              const IconComponent = contact.icon;
              return (
                <Card
                  key={index}
                  className="bg-background/70 backdrop-blur border border-border/60 shadow-card"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start flex-col gap-4">
                      <div className="shrink-0 rounded-lg bg-primary/10 p-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold mb-1">{contact.title}</h3>
                        <p className="text-lg font-bold text-primary mb-1 break-words">
                          {contact.info}
                        </p>
                        <p className="text-sm text-muted-foreground break-words">
                          {contact.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhoenixContact;