import React from "react";
import { Truck, Fuel, Lock, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ServiceType } from "./types";

interface ServiceSelectorProps {
  service: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ service, onServiceChange }) => {
  const services = [
    { value: "towing", label: "Towing", icon: Truck },
    { value: "fuel", label: "Fuel Delivery", icon: Fuel },
    { value: "lockout", label: "Lockout Service", icon: Lock },
    { value: "jumpstart", label: "Jump Start", icon: Zap },
  ] as const;

  return (
    <div className="space-y-2">
      <Label htmlFor="service">Service Type</Label>
      <Select value={service} onValueChange={(value) => onServiceChange(value as ServiceType)}>
        <SelectTrigger>
          <SelectValue placeholder="Select service" />
        </SelectTrigger>
        <SelectContent>
          {services.map((serviceOption) => {
            const IconComponent = serviceOption.icon;
            return (
              <SelectItem key={serviceOption.value} value={serviceOption.value}>
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  {serviceOption.label}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ServiceSelector;
