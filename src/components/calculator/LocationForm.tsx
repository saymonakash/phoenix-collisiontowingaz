import React, { useState, useCallback, useMemo } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { LocationInfo, AddressSuggestion, LngLat } from "./types";
import {
  debounce,
  getCoordsWithFallbacks,
  geocode,
  haversineMiles,
} from "./utils";
import { SUGGESTED_REPAIR_SHOP } from "./constants";

interface LocationFormProps {
  locationInfo: LocationInfo;
  onLocationInfoChange: (info: Partial<LocationInfo>) => void;
  onDistanceCalculated: (miles: string) => void;
  restrictToPhoenix?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  locationInfo,
  onLocationInfoChange,
  onDistanceCalculated,
  restrictToPhoenix = false,
}) => {
  const [fromSuggestions, setFromSuggestions] = useState<AddressSuggestion[]>(
    [],
  );
  const [toSuggestions, setToSuggestions] = useState<AddressSuggestion[]>([]);
  const [calcBusy, setCalcBusy] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [geoErrorMsg, setGeoErrorMsg] = useState("");
  const [geoBusy, setGeoBusy] = useState(false);

  const fetchAddressSuggestions = useCallback(
    async (query: string): Promise<AddressSuggestion[]> => {
      const trimmed = query.trim();
      if (trimmed.length < 3) return [];
      // Bias to AZ for better local relevance
      const biased = /\baz\b|arizona/i.test(trimmed)
        ? trimmed
        : `${trimmed}, AZ`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=us&accept-language=en&q=${encodeURIComponent(
        biased,
      )}`;
      try {
        const res = await fetch(url);
        const json: Array<{ display_name: string; lon: string; lat: string }> =
          await res.json();
        return json
          .filter((x) => x.lon && x.lat && x.display_name)
          .map((x) => ({
            label: x.display_name,
            coords: [parseFloat(x.lon), parseFloat(x.lat)],
          }));
      } catch {
        return [];
      }
    },
    [],
  );

  const debouncedFromFetch = useMemo(
    () =>
      debounce(async (q: string) => {
        const results = await fetchAddressSuggestions(q);
        setFromSuggestions(results);
      }, 300),
    [fetchAddressSuggestions],
  );

  const debouncedToFetch = useMemo(
    () =>
      debounce(async (q: string) => {
        const results = await fetchAddressSuggestions(q);
        setToSuggestions(results);
      }, 300),
    [fetchAddressSuggestions],
  );

  function handleFromInputChange(value: string) {
    onLocationInfoChange({ fromAddress: value, fromSelected: null });
    debouncedFromFetch(value);
  }

  function handleToInputChange(value: string) {
    onLocationInfoChange({ toAddress: value, toSelected: null });
    debouncedToFetch(value);
  }

  function handlePickFromSuggestion(s: AddressSuggestion) {
    onLocationInfoChange({ fromAddress: s.label, fromSelected: s });
    setFromSuggestions([]);
  }

  function handlePickToSuggestion(s: AddressSuggestion) {
    onLocationInfoChange({ toAddress: s.label, toSelected: s });
    setToSuggestions([]);
  }

  // Fill from address using GPS and reverse geocode
  async function handleUseGPSForFrom() {
    setGeoErrorMsg("");
    setGeoBusy(true);
    try {
      // Check permission state when available to show better guidance
      try {
        const perm = await (navigator.permissions?.query?.({
          name: "geolocation" as PermissionName,
        }) as Promise<{ state: string }> | undefined);
        if (perm && perm.state === "denied") {
          throw new Error(
            "Location permission is denied. Please enable location access for this site in your browser settings and try again.",
          );
        }
      } catch (_err) {
        // Permissions API may not be available; ignore
      }

      const coords = await getCoordsWithFallbacks();
      onLocationInfoChange({ currentCoords: coords });
      // Reverse geocode
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}`;
      const res = await fetch(url);
      const data = await res.json();
      const address = data.display_name || `${coords[1]}, ${coords[0]}`;
      onLocationInfoChange({
        fromAddress: address,
        fromSelected: { label: address, coords },
      });
      setFromSuggestions([]);
    } catch (e) {
      let message =
        "Could not get your location. Please allow location access and try again.";
      const tips =
        " If you are on iOS/Safari, ensure you are on HTTPS and Location Services are enabled for the browser. Try moving to an open area and turning on Wi‑Fi for better accuracy.";
      if (typeof e === "object" && e && "code" in e) {
        const code = (e as { code?: number }).code;
        if (code === 1) {
          message =
            "Location permission denied. Please enable location access for this site in your browser settings and try again.";
        } else if (code === 2) {
          message =
            "Location unavailable. Your device could not determine a position. Please try again.";
        } else if (code === 3) {
          message = "Timed out getting your location. Please try again.";
        }
      } else if (
        typeof e === "object" &&
        e &&
        "message" in e &&
        typeof (e as { message?: string }).message === "string"
      ) {
        message += `\nError: ${(e as { message: string }).message}`;
      }
      setGeoErrorMsg(message + tips);
    } finally {
      setGeoBusy(false);
    }
  }

  async function handleSuggestShop() {
    onLocationInfoChange({
      toAddress: SUGGESTED_REPAIR_SHOP,
      toSelected: null,
    });
    // Pre-resolve coords for better success rate
    const coords = await geocode(SUGGESTED_REPAIR_SHOP);
    if (coords) {
      onLocationInfoChange({
        toSelected: { label: SUGGESTED_REPAIR_SHOP, coords },
      });
    }
  }

  async function handleCalculateDistance() {
    setCalcError("");
    setCalcBusy(true);
    try {
      let from: LngLat | null = null;
      let to: LngLat | null = null;

      // Prefer selected suggestions' coords when available and matching the input
      if (
        locationInfo.fromSelected &&
        locationInfo.fromSelected.label === locationInfo.fromAddress
      )
        from = locationInfo.fromSelected.coords;
      if (!from) {
        const exact = fromSuggestions.find(
          (s) => s.label === locationInfo.fromAddress,
        )?.coords;
        from = exact ?? (await geocode(locationInfo.fromAddress));
      }
      if (!from) throw new Error("Could not find location for from address.");

      if (
        locationInfo.toSelected &&
        locationInfo.toSelected.label === locationInfo.toAddress
      )
        to = locationInfo.toSelected.coords;
      if (!to) {
        const exactTo = toSuggestions.find(
          (s) => s.label === locationInfo.toAddress,
        )?.coords;
        to = exactTo ?? (await geocode(locationInfo.toAddress));
      }
      if (!to) throw new Error("Could not find location for to address.");

      const dist = haversineMiles(from, to);
      const miles = dist.toFixed(2);
      onLocationInfoChange({ miles });
      onDistanceCalculated(miles);
    } catch (e) {
      setCalcError((e as Error).message || "Error calculating distance.");
    } finally {
      setCalcBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Location Information</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fromAddress">From address (pickup location)</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                id="fromAddress"
                placeholder="Enter pickup location"
                value={locationInfo.fromAddress}
                onChange={(e) => handleFromInputChange(e.target.value)}
              />
              {fromSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {fromSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left p-2 hover:bg-accent text-sm border-b last:border-b-0"
                      onClick={() => handlePickFromSuggestion(suggestion)}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleUseGPSForFrom}
              disabled={geoBusy}
              title="Use my current location"
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </div>
          {geoErrorMsg && (
            <div className="text-destructive text-sm">{geoErrorMsg}</div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAddress">To address (dropoff location)</Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                id="toAddress"
                placeholder="Enter destination"
                value={locationInfo.toAddress}
                onChange={(e) => handleToInputChange(e.target.value)}
              />
              {toSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                  {toSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left p-2 hover:bg-accent text-sm border-b last:border-b-0"
                      onClick={() => handlePickToSuggestion(suggestion)}
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleSuggestShop}
              className="text-xs px-2"
            >
              Repair Shop
            </Button>
          </div>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="miles">Distance (miles)</Label>
            <Input
              id="miles"
              type="number"
              placeholder="0.00"
              value={locationInfo.miles}
              onChange={(e) => onLocationInfoChange({ miles: e.target.value })}
              min="0"
              step="0.1"
            />
          </div>
          <Button
            type="button"
            onClick={handleCalculateDistance}
            disabled={
              calcBusy ||
              !locationInfo.fromAddress.trim() ||
              !locationInfo.toAddress.trim()
            }
            className="mb-0"
          >
            {calcBusy ? "Calculating..." : "Calculate"}
          </Button>
        </div>

        {calcError && (
          <div className="text-destructive text-sm">{calcError}</div>
        )}
      </div>
    </div>
  );
};

export default LocationForm;
