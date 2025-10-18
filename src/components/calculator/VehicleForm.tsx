import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { VehicleInfo } from "./types";

interface VehicleFormProps {
  vehicleInfo: VehicleInfo;
  onVehicleInfoChange: (info: Partial<VehicleInfo>) => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicleInfo, onVehicleInfoChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Vehicle Information</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleYear">Year</Label>
          <Select value={vehicleInfo.year} onValueChange={(value) => onVehicleInfoChange({ year: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicleMake">Make</Label>
          <Input
            id="vehicleMake"
            placeholder="e.g., Toyota"
            value={vehicleInfo.make}
            onChange={(e) => onVehicleInfoChange({ make: e.target.value })}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vehicleModel">Model</Label>
        <Input
          id="vehicleModel"
          placeholder="e.g., Camry"
          value={vehicleInfo.model}
          onChange={(e) => onVehicleInfoChange({ model: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehiclePlate">License Plate</Label>
          <Input
            id="vehiclePlate"
            placeholder="ABC123"
            value={vehicleInfo.plate}
            onChange={(e) => onVehicleInfoChange({ plate: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="vehicleState">Registration State</Label>
          <Select value={vehicleInfo.registrationState} onValueChange={(value) => onVehicleInfoChange({ registrationState: value })}>
            <SelectTrigger>
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              {usStates.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="isLargeVehicle"
          checked={vehicleInfo.isLarge}
          onCheckedChange={(checked) => onVehicleInfoChange({ isLarge: checked })}
        />
        <Label htmlFor="isLargeVehicle">
          Large vehicle (truck, RV, trailer, etc.)
        </Label>
      </div>
    </div>
  );
};

export default VehicleForm;
