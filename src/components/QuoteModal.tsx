import React, { useState } from "react";
import { MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromAddress: string;
  toAddress: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  vehicleRegistrationState: string;
}

const QuoteModal: React.FC<QuoteModalProps> = ({
  open,
  onOpenChange,
  fromAddress,
  toAddress,
  vehicleYear,
  vehicleMake,
  vehicleModel,
  vehiclePlate,
  vehicleRegistrationState,
}) => {
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Location sharing states
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);

  // Location sharing function
  async function handleShareLocation() {
    setLocationError("");
    setGettingLocation(true);
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      setCurrentLocation(coords);
      
      // Update the message field with location info
      const locationText = `📍 My exact location: https://maps.google.com/?q=${coords.lat},${coords.lng}`;
      setFormMessage(prev => prev ? `${prev}\n\n${locationText}` : locationText);
      
    } catch (error) {
      let message = "Could not get your location. Please ensure location access is enabled.";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case 1:
            message = "Location access denied. Please enable location permissions and try again.";
            break;
          case 2:
            message = "Location unavailable. Please try again.";
            break;
          case 3:
            message = "Location request timed out. Please try again.";
            break;
        }
      }
      setLocationError(message);
    } finally {
      setGettingLocation(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!fromAddress.trim() || !toAddress.trim()) {
      setFormError("Please enter both from and to addresses.");
      return;
    }
    if (!formName.trim() || !formPhone.trim()) {
      setFormError("Please enter your name and phone number.");
      return;
    }

    // Prepare quote data including location if shared
    const quoteData = {
      name: formName,
      phone: formPhone,
      message: formMessage,
      fromAddress,
      toAddress,
      vehicle: {
        year: vehicleYear,
        make: vehicleMake,
        model: vehicleModel,
        plate: vehiclePlate,
        state: vehicleRegistrationState
      },
      location: currentLocation ? {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        googleMapsLink: `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`,
        accuracy: "GPS coordinates shared by customer"
      } : null,
      timestamp: new Date().toISOString()
    };

    // Log the data that would be sent to your email
    console.log("Quote submission with location data:", quoteData);
    
    // TODO: Here you would send this data to your email service
    // The location data includes GPS coordinates and a Google Maps link
    
    setShowSuccess(true);
    setFormName("");
    setFormPhone("");
    setFormMessage("");
    setCurrentLocation(null);
    setLocationError("");
  }

  function handleClose() {
    setShowSuccess(false);
    onOpenChange(false);
  }

  return (
    <>
      <Dialog open={open && !showSuccess} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Quote</DialogTitle>
            <DialogDescription>
              Please fill out your details and confirm your addresses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 *:space-y-1">
            <div>
              <Label htmlFor="quoteName">Name</Label>
              <Input
                id="quoteName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="quotePhone">Phone</Label>
              <Input
                id="quotePhone"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>From Address</Label>
              <Input value={fromAddress} readOnly />
            </div>
            <div>
              <Label>To Address</Label>
              <Input value={toAddress} readOnly />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Vehicle Year</Label>
                <Input value={vehicleYear} readOnly />
              </div>
              <div>
                <Label>Vehicle Make</Label>
                <Input value={vehicleMake} readOnly />
              </div>
              <div>
                <Label>Vehicle Model</Label>
                <Input value={vehicleModel} readOnly />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Plate #</Label>
                <Input value={vehiclePlate} readOnly />
              </div>
              <div>
                <Label>Registration State</Label>
                <Input value={vehicleRegistrationState} readOnly />
              </div>
            </div>
            <div>
              <Label htmlFor="quoteMessage">Message (optional)</Label>
              <Textarea
                id="quoteMessage"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Describe your vehicle, location, or special instructions"
              />
            </div>
            
            {/* Share My Location Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Share My Exact Location
              </Label>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                  Help our driver find you faster! Share your exact GPS location to receive the quickest service.
                </p>
                <Button
                  type="button"
                  onClick={handleShareLocation}
                  disabled={gettingLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {gettingLocation ? "Getting your location..." : "Share My Location"}
                </Button>
                
                {currentLocation && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded text-xs">
                    <MapPin className="h-3 w-3 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      ✓ Location shared! GPS coordinates added to your message.
                    </span>
                  </div>
                )}
                
                {locationError && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                    <div className="text-xs text-red-700 dark:text-red-300">
                      {locationError}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {formError && (
              <div className="text-destructive text-sm">{formError}</div>
            )}
            <DialogFooter>
              <Button type="submit" variant="default">
                Submit
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={showSuccess} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quote Request Sent</DialogTitle>
            <DialogDescription>
              Thank you! Your quote request has been submitted. We will contact
              you soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuoteModal;
