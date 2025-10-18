import React from "react";
import type { ServiceType, VehicleInfo, DiscountInfo } from "./types";
import { 
  currency,
  HOOK_FEE_USD, 
  PER_MILE_RATE_USD, 
  PER_MILE_RATE_LARGE_VEHICLE_USD,
  LOCKOUT_BASE_USD,
  LOCKOUT_PER_MILE_USD,
  FUEL_DELIVERY_BASE_USD,
  FUEL_DELIVERY_PER_MILE_USD,
  JUMP_START_BASE_USD,
  JUMP_START_PER_MILE_USD,
  VETERAN_DISCOUNT,
  STUDENT_DISCOUNT
} from "./constants";

interface CostSummaryProps {
  service: ServiceType;
  miles: string;
  vehicleInfo: VehicleInfo;
  discountInfo: DiscountInfo;
}

const CostSummary: React.FC<CostSummaryProps> = ({ 
  service, 
  miles, 
  vehicleInfo, 
  discountInfo 
}) => {
  const numMiles = Math.max(0, Number(miles) || 0);
  
  const calculateCosts = () => {
    switch (service) {
      case "towing": {
        const perMileRate = vehicleInfo.isLarge ? PER_MILE_RATE_LARGE_VEHICLE_USD : PER_MILE_RATE_USD;
        const baseCost = HOOK_FEE_USD;
        const perMileCost = perMileRate * numMiles;
        const subtotal = baseCost + perMileCost;
        return { baseCost, perMileCost, subtotal };
      }
      case "fuel": {
        const baseCost = FUEL_DELIVERY_BASE_USD;
        const perMileCost = FUEL_DELIVERY_PER_MILE_USD * numMiles;
        const subtotal = baseCost + perMileCost;
        return { baseCost, perMileCost, subtotal };
      }
      case "lockout": {
        const baseCost = LOCKOUT_BASE_USD;
        const perMileCost = LOCKOUT_PER_MILE_USD * numMiles;
        const subtotal = baseCost + perMileCost;
        return { baseCost, perMileCost, subtotal };
      }
      case "jumpstart": {
        const baseCost = JUMP_START_BASE_USD;
        const perMileCost = JUMP_START_PER_MILE_USD * numMiles;
        const subtotal = baseCost + perMileCost;
        return { baseCost, perMileCost, subtotal };
      }
      default:
        return { baseCost: 0, perMileCost: 0, subtotal: 0 };
    }
  };

  const { baseCost, perMileCost, subtotal } = calculateCosts();
  
  // Apply discounts
  let discount = 0;
  if (discountInfo.isVeteran) discount += VETERAN_DISCOUNT;
  if (discountInfo.isStudent) discount += STUDENT_DISCOUNT;
  
  const total = subtotal * (1 - discount);

  const getServiceLabel = () => {
    switch (service) {
      case "towing": return "Towing service";
      case "fuel": return "Fuel delivery";
      case "lockout": return "Lock-out service";
      case "jumpstart": return "Jump start";
      default: return "Service";
    }
  };

  const getBaseLabel = () => {
    switch (service) {
      case "towing": return "Hook fee";
      case "fuel": return "Fuel delivery";
      case "lockout": return "Lock-out service";
      case "jumpstart": return "Jump start";
      default: return "Base fee";
    }
  };

  const getPerMileRate = () => {
    switch (service) {
      case "towing": 
        return vehicleInfo.isLarge ? PER_MILE_RATE_LARGE_VEHICLE_USD : PER_MILE_RATE_USD;
      case "fuel": 
        return FUEL_DELIVERY_PER_MILE_USD;
      case "lockout": 
        return LOCKOUT_PER_MILE_USD;
      case "jumpstart": 
        return JUMP_START_PER_MILE_USD;
      default: 
        return 0;
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-background/50">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span>{getBaseLabel()}</span>
          <span>{currency(baseCost)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Per mile × {numMiles}</span>
          <span>
            {currency(getPerMileRate())} × {numMiles}
          </span>
        </div>
        {service === "towing" && vehicleInfo.isLarge && (
          <div className="text-xs text-muted-foreground">
            Large vehicle rate applied: {currency(PER_MILE_RATE_LARGE_VEHICLE_USD)}/mile
          </div>
        )}
        {service !== "towing" && vehicleInfo.isLarge && (
          <div className="text-xs text-muted-foreground">
            Large vehicle surcharge may apply
          </div>
        )}
        <div className="h-px bg-border my-2" />
        <div className="flex items-center justify-between font-semibold">
          <span>Estimated total</span>
          <span>{currency(total)}</span>
        </div>
        {(discountInfo.isVeteran || discountInfo.isStudent) && (
          <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-400">
            <span>Discount applied</span>
            <span>
              -{discountInfo.isVeteran ? "10% " : ""}
              {discountInfo.isStudent ? "8%" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSummary;
