import React, { useState, useEffect } from "react";
import { MapPin, Copy, Phone, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

const LocationButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(true);

  // Hide pulse animation after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Request geolocation permission
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
          }

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        },
      );

      const { latitude, longitude } = position.coords;

      // Reverse geocoding to get address - fallback to coordinates if no API key
      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      // Try to get human-readable address using Google Maps Geocoding API
      const googleMapsApiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
      if (
        googleMapsApiKey &&
        googleMapsApiKey !== "your_google_maps_api_key_here"
      ) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`,
          );

          if (response.ok) {
            const data = await response.json();
            address = data.results[0]?.formatted_address || address;
          }
        } catch (geocodeError) {
          console.warn("Geocoding failed, using coordinates:", geocodeError);
        }
      }

      setLocation({
        latitude,
        longitude,
        address,
      });
    } catch (err) {
      console.error("Error getting location:", err);
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(
              "Location access denied. Please enable location services.",
            );
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location information unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An unknown error occurred while retrieving location.");
            break;
        }
      } else {
        setError("Unable to retrieve your location. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleButtonClick = () => {
    setIsOpen(true);
    if (!location) {
      getCurrentLocation();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Location copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy location");
    }
  };

  const shareViaPhone = () => {
    const message = `My current location: ${location?.address}\n\nGoogle Maps: https://maps.google.com/?q=${location?.latitude},${location?.longitude}\n\nPlease send help to this location.`;
    const encodedMessage = encodeURIComponent(message);

    // Detect if user is on mobile device
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      // On mobile, use SMS protocol with phone number
      window.open(`sms:+16232538345?body=${encodedMessage}`, "_self");
    } else {
      // On desktop, copy to clipboard and show instructions
      copyToClipboard(message);
      toast.success(
        "Location message copied! You can paste it in any messaging app.",
      );
    }
  };

  const openInGoogleMaps = () => {
    if (location) {
      window.open(
        `https://maps.google.com/?q=${location.latitude},${location.longitude}`,
        "_blank",
      );
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="location-button-fixed">
        <Button
          onClick={handleButtonClick}
          className={`h-14 w-14 rounded-full bg-secondary/80 shadow-lg hover:bg-secondary hover:shadow-xl transition-all duration-200 group ${showPulse ? "location-button-pulse" : ""}`}
          size="lg"
          aria-label="Get current location"
          title="Get your current location to share with towing service"
        >
          <MapPin className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Location Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md overflow-y-auto scrollbar-hide h-[60vh] lg:h-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Your Current Location
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">
                  Getting your location...
                </span>
              </div>
            )}

            {error && (
              <div className="text-center py-4">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={getCurrentLocation} variant="outline">
                  Try Again
                </Button>
              </div>
            )}

            {location && !loading && (
              <div className="space-y-4">
                {/* Google Maps Embed */}
                <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                  {import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY &&
                  import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY !==
                    "your_google_maps_api_key_here" ? (
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY}&q=${location.latitude},${location.longitude}&zoom=15`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Your Current Location"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Map preview unavailable
                        </p>
                        <p className="text-xs text-gray-500">
                          Configure Google Maps API key
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Display */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Address:
                  </p>
                  <p className="text-gray-900 break-all">{location.address}</p>
                </div>

                {/* Coordinates */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Coordinates:
                  </p>
                  <p className="text-gray-900">
                    {location.latitude.toFixed(6)},{" "}
                    {location.longitude.toFixed(6)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => copyToClipboard(location.address)}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </Button>

                  <Button
                    onClick={() =>
                      copyToClipboard(
                        `${location.latitude}, ${location.longitude}`,
                      )
                    }
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Coordinates
                  </Button>

                  <Button
                    onClick={shareViaPhone}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Share via SMS
                  </Button>

                  <Button
                    onClick={() => window.open("tel:+16232538345", "_self")}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Towing Service
                  </Button>

                  <Button
                    onClick={openInGoogleMaps}
                    variant="outline"
                    className="w-full"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Open in Google Maps
                  </Button>
                </div>

                {/* Emergency Info */}
                <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Tip:</strong> Share this location with our towing
                    service at{" "}
                    <a
                      href="tel:+16232538345"
                      className="font-medium underline"
                    >
                      (623) 253-8345
                    </a>{" "}
                    for faster assistance.
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LocationButton;
