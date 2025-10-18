import React, { useState, useMemo } from "react";
import { Truck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import the smaller components
import VehicleForm from "./calculator/VehicleForm";
import ServiceSelector from "./calculator/ServiceSelector";
import LocationForm from "./calculator/LocationForm";
import DiscountForm from "./calculator/DiscountForm";
import CostSummary from "./calculator/CostSummary";
import EnhancedQuoteModal from "./calculator/EnhancedQuoteModal";

// Import types and constants
import type { 
  ServiceType, 
  VehicleInfo, 
  LocationInfo, 
  DiscountInfo, 
  QuoteData 
} from "./calculator/types";
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
} from "./calculator/constants";

function CostCalculator() {
  // Service state
  const [service, setService] = useState<ServiceType>("towing");
  
  // Vehicle information state
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    year: "",
    make: "",
    model: "",
    plate: "",
    registrationState: "",
    isLarge: false,
  });

  // Location information state
  const [locationInfo, setLocationInfo] = useState<LocationInfo>({
    fromAddress: "",
    toAddress: "",
    fromSelected: null,
    toSelected: null,
    miles: "",
    currentCoords: null,
  });

  // Discount information state
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo>({
    isVeteran: false,
    isStudent: false,
  });

  // UI state
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [distanceCalculated, setDistanceCalculated] = useState(false);

  // Calculate estimated total
  const estimatedTotal = useMemo(() => {
    const numMiles = Math.max(0, Number(locationInfo.miles) || 0);
    
    let baseCost = 0;
    let perMileCost = 0;
    
    switch (service) {
      case "towing": {
        const perMileRate = vehicleInfo.isLarge ? PER_MILE_RATE_LARGE_VEHICLE_USD : PER_MILE_RATE_USD;
        baseCost = HOOK_FEE_USD;
        perMileCost = perMileRate * numMiles;
        break;
      }
      case "fuel": {
        baseCost = FUEL_DELIVERY_BASE_USD;
        perMileCost = FUEL_DELIVERY_PER_MILE_USD * numMiles;
        break;
      }
      case "lockout": {
        baseCost = LOCKOUT_BASE_USD;
        perMileCost = LOCKOUT_PER_MILE_USD * numMiles;
        break;
      }
      case "jumpstart": {
        baseCost = JUMP_START_BASE_USD;
        perMileCost = JUMP_START_PER_MILE_USD * numMiles;
        break;
      }
    }
    
    const subtotal = baseCost + perMileCost;
    
    // Apply discounts
    let discount = 0;
    if (discountInfo.isVeteran) discount += VETERAN_DISCOUNT;
    if (discountInfo.isStudent) discount += STUDENT_DISCOUNT;
    
    return subtotal * (1 - discount);
  }, [service, locationInfo.miles, vehicleInfo.isLarge, discountInfo]);

  // Prepare quote data for modal
  const quoteData: QuoteData = useMemo(() => ({
    // Combine all state into quote data
    service,
    ...vehicleInfo,
    ...locationInfo,
    ...discountInfo,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    estimatedTotal,
  }), [service, vehicleInfo, locationInfo, discountInfo, estimatedTotal]);

  // Check if form is ready for quote submission
  const isReadyForQuote = useMemo(() => {
    return (
      locationInfo.fromAddress.trim() && 
      locationInfo.toAddress.trim() && 
      locationInfo.miles && 
      parseFloat(locationInfo.miles) > 0 &&
      distanceCalculated &&
      vehicleInfo.year &&
      vehicleInfo.make &&
      vehicleInfo.model
    );
  }, [locationInfo, vehicleInfo, distanceCalculated]);

  // Handle vehicle info changes
  const handleVehicleInfoChange = (updates: Partial<VehicleInfo>) => {
    setVehicleInfo(prev => ({ ...prev, ...updates }));
  };

  // Handle location info changes
  const handleLocationInfoChange = (updates: Partial<LocationInfo>) => {
    setLocationInfo(prev => ({ ...prev, ...updates }));
  };

  // Handle discount info changes
  const handleDiscountInfoChange = (updates: Partial<DiscountInfo>) => {
    setDiscountInfo(prev => ({ ...prev, ...updates }));
  };

  // Handle distance calculation
  const handleDistanceCalculated = (miles: string) => {
    setDistanceCalculated(true);
    setLocationInfo(prev => ({ ...prev, miles }));
  };

  // Handle confirm quote button
  const handleConfirmQuote = () => {
    if (!isReadyForQuote) {
      return;
    }
    setShowQuoteModal(true);
  };

  return (
    <section
      id="quote"
      className="py-20 bg-background relative overflow-hidden"
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold mb-3 bg-[image:_var(--gradient-hero)] bg-clip-text text-transparent tracking-tight">
            Cost Calculator
          </h2>
          <div className="h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-primary to-primary/50 mb-3" />
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quick estimate. Actual price may vary depending on situation and
            required equipment.
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto bg-gradient-card shadow-card border border-primary/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Estimate your cost
            </CardTitle>
            <CardDescription>
              Towing: {currency(HOOK_FEE_USD)} hook fee +{" "}
              {currency(PER_MILE_RATE_USD)} per mile ({currency(PER_MILE_RATE_LARGE_VEHICLE_USD)} for large vehicles). Other services: {currency(LOCKOUT_BASE_USD)} base + {currency(LOCKOUT_PER_MILE_USD)}/mile.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-6">
                <ServiceSelector 
                  service={service}
                  onServiceChange={setService}
                />
                
                <VehicleForm 
                  vehicleInfo={vehicleInfo}
                  onVehicleInfoChange={handleVehicleInfoChange}
                />
                
                <DiscountForm 
                  discountInfo={discountInfo}
                  onDiscountInfoChange={handleDiscountInfoChange}
                />
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <LocationForm 
                  locationInfo={locationInfo}
                  onLocationInfoChange={handleLocationInfoChange}
                  onDistanceCalculated={handleDistanceCalculated}
                />
              </div>
            </div>

            {/* Cost summary */}
            <CostSummary 
              service={service}
              miles={locationInfo.miles}
              vehicleInfo={vehicleInfo}
              discountInfo={discountInfo}
            />
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              <Button
                variant="link"
                className="p-0 text-xs"
                onClick={() => setShowDisclaimer(true)}
              >
                View Disclaimer
              </Button>{" "}
              - Other fees may apply for special equipment or complex
              situations.
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {!isReadyForQuote && (
                <p className="text-xs text-muted-foreground">
                  {!distanceCalculated ? "Calculate distance to continue" : "Complete all required fields"}
                </p>
              )}
              <Button
                variant="secondary"
                className="px-6"
                disabled={!isReadyForQuote}
                onClick={handleConfirmQuote}
              >
                Confirm Quote
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Enhanced Quote Modal */}
      <EnhancedQuoteModal
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
        quoteData={quoteData}
      />

      {/* Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disclaimer</DialogTitle>
            <DialogDescription className="pt-5">
              All quotes provided by Collision Towing AZ LLC are estimates only
              and not guaranteed. Prices may vary based on location, vehicle
              type, and specific circumstances. Final cost may be higher or
              lower than the quoted amount. We strive to complete every job at
              the most reasonable price possible. All emergency situations are
              subject to an additional $100 fee.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowDisclaimer(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default CostCalculator;
