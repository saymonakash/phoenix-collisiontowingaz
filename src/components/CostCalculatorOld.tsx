type LngLat = [number, number];
const HOOK_FEE_USD = 110;
const PER_MILE_RATE_USD = 6;
const PER_MILE_RATE_LARGE_VEHICLE_USD = 7;
const LOCKOUT_BASE_USD = 85;
const LOCKOUT_PER_MILE_USD = 2;
const FUEL_DELIVERY_BASE_USD = 85;
const FUEL_DELIVERY_PER_MILE_USD = 2;
const JUMP_START_BASE_USD = 85;
const JUMP_START_PER_MILE_USD = 2;
const VETERAN_DISCOUNT = 0.1;
const STUDENT_DISCOUNT = 0.08;

import { useEffect, useMemo, useState, useCallback } from "react";
import { Truck, Fuel, Lock, Car } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import QuoteModal from "@/components/QuoteModal";

type ServiceType = "towing" | "fuel" | "lockout" | "jumpstart";

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMiles(a: LngLat, b: LngLat) {
  const Rm = 3958.7613; // Earth radius in miles
  const dLat = toRadians(b[1] - a[1]);
  const dLng = toRadians(b[0] - a[0]);
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));
  return Rm * c;
}

const currency = (n: number) => `$${n.toFixed(2)}`;

// ...existing code...

function CostCalculator() {
  type AddressSuggestion = { label: string; coords: LngLat };
  // Vehicle info state
  const [vehicleYear, setVehicleYear] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleRegistrationState, setVehicleRegistrationState] = useState("");
  const [isLargeVehicle, setIsLargeVehicle] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<AddressSuggestion[]>(
    [],
  );
  const [toSuggestions, setToSuggestions] = useState<AddressSuggestion[]>([]);
  const [fromSelected, setFromSelected] = useState<AddressSuggestion | null>(
    null,
  );
  const [toSelected, setToSelected] = useState<AddressSuggestion | null>(null);
  const [isVeteran, setIsVeteran] = useState(false);
  const [isStudent, setIsStudent] = useState(false);
  const [service, setService] = useState<ServiceType>("towing");
  const [miles, setMiles] = useState<string>("");
  // Remove fuelCost state since we're removing fuel input options
  // const [fuelCost, setFuelCost] = useState<string>("");
  // Removed geoBusy, geoError, hasSavedLocation
  // Only use from/to address for distance input
  const [distanceMode] = useState<"address">("address");
  // Remove shopMode, selectedShopId, userLng, userLat, showPermissionHelp
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [calcBusy, setCalcBusy] = useState(false);
  const [calcError, setCalcError] = useState("");
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [geoErrorMsg, setGeoErrorMsg] = useState("");
  const [currentCoords, setCurrentCoords] = useState<LngLat | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);

  async function getCoordsWithFallbacks(): Promise<LngLat> {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    const getOnce = (opts: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, opts);
      });

    const watchOnce = (opts: PositionOptions) =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            navigator.geolocation.clearWatch(watchId);
            resolve(pos);
          },
          (err) => {
            navigator.geolocation.clearWatch(watchId);
            reject(err);
          },
          opts,
        );
        // Safety timeout for watch
        const timeoutMs = (opts.timeout ?? 20000) + 2000;
        window.setTimeout(() => {
          try {
            navigator.geolocation.clearWatch(watchId);
          } catch (_err) {
            void 0;
          }
          reject(new Error("Timed out waiting for location update."));
        }, timeoutMs);
      });

    // Try 1: High accuracy, accept cached within 1 min
    try {
      const pos = await getOnce({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      });
      return [pos.coords.longitude, pos.coords.latitude];
    } catch (e: unknown) {
      // Continue to next strategy unless permission denied
      if (
        typeof e === "object" &&
        e &&
        "code" in e &&
        (e as { code: number }).code === 1
      ) {
        const permErr: Error & { code?: number } = new Error(
          "Permission denied",
        );
        permErr.code = 1;
        throw permErr;
      }
    }

    // Try 2: Lower accuracy, longer timeout, allow older cached result
    try {
      const pos = await getOnce({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 900000,
      });
      return [pos.coords.longitude, pos.coords.latitude];
    } catch (e) {
      console.debug("Low-accuracy geolocation attempt failed", e);
    }

    // Try 3: Watch for a single update
    try {
      const pos = await watchOnce({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 0,
      });
      return [pos.coords.longitude, pos.coords.latitude];
    } catch (e) {
      console.debug("watchPosition attempt failed", e);
    }

    // Try 4: IP-based approximate geolocation as a last resort
    try {
      const resp = await fetch("https://ipapi.co/json/");
      const json = await resp.json();
      if (
        json &&
        typeof json.longitude === "number" &&
        typeof json.latitude === "number"
      ) {
        return [json.longitude, json.latitude];
      }
    } catch (e) {
      console.debug("IP-based geolocation failed", e);
    }

    throw new Error("Unable to determine your location at this time.");
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
      setCurrentCoords(coords);
      // Reverse geocode
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}`;
      const res = await fetch(url);
      const data = await res.json();
      const address = data.display_name || `${coords[1]}, ${coords[0]}`;
      setFromAddress(address);
      setFromSelected({ label: address, coords });
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

  useEffect(() => {}, [service, miles, isLargeVehicle]);

  const towingCost = useMemo(() => {
    const m = Math.max(0, Number(miles) || 0);
    const perMileRate = isLargeVehicle ? PER_MILE_RATE_LARGE_VEHICLE_USD : PER_MILE_RATE_USD;
    return HOOK_FEE_USD + perMileRate * m;
  }, [miles, isLargeVehicle]);

  const fuelDeliveryCost = useMemo(() => {
    const m = Math.max(0, Number(miles) || 0);
    return FUEL_DELIVERY_BASE_USD + FUEL_DELIVERY_PER_MILE_USD * m;
  }, [miles]);

  const lockoutCost = useMemo(() => {
    const m = Math.max(0, Number(miles) || 0);
    return LOCKOUT_BASE_USD + LOCKOUT_PER_MILE_USD * m;
  }, [miles]);

  const jumpStartCost = useMemo(() => {
    const m = Math.max(0, Number(miles) || 0);
    return JUMP_START_BASE_USD + JUMP_START_PER_MILE_USD * m;
  }, [miles]);

  const perMileCost = useMemo(() => {
    const m = Math.max(0, Number(miles) || 0);
    switch (service) {
      case "towing":
        const perMileRate = isLargeVehicle ? PER_MILE_RATE_LARGE_VEHICLE_USD : PER_MILE_RATE_USD;
        return perMileRate * m;
      case "fuel":
        // For fuel delivery, large vehicles could have a higher rate if needed
        return FUEL_DELIVERY_PER_MILE_USD * m;
      case "lockout":
        // For lockout, large vehicles could have a higher rate if needed  
        return LOCKOUT_PER_MILE_USD * m;
      case "jumpstart":
        // For jump start, large vehicles could have a higher rate if needed
        return JUMP_START_PER_MILE_USD * m;
      default:
        return 0;
    }
  }, [miles, service, isLargeVehicle]);

  // Calculate total before discount
  const baseTotal = useMemo(() => {
    switch (service) {
      case "towing":
        return towingCost;
      case "fuel":
        return fuelDeliveryCost;
      case "lockout":
        return lockoutCost;
      case "jumpstart":
        return jumpStartCost;
      default:
        return 0;
    }
  }, [service, towingCost, fuelDeliveryCost, lockoutCost, jumpStartCost]);

  // Apply discounts
  const total = useMemo(() => {
    let discount = 0;
    if (isVeteran) discount += VETERAN_DISCOUNT;
    if (isStudent) discount += STUDENT_DISCOUNT;
    return baseTotal * (1 - discount);
  }, [baseTotal, isVeteran, isStudent]);
  const SUGGESTED_REPAIR_SHOP = "8625 E. McDowell Road Scottsdale, AZ";

  async function geocode(address: string): Promise<LngLat | null> {
    if (!address.trim()) return null;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        address,
      )}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json?.[0]?.lon && json[0].lat) {
        return [parseFloat(json[0].lon), parseFloat(json[0].lat)];
      }
      return null;
    } catch {
      return null;
    }
  }

  function debounce<T extends (...args: any[]) => void>(
    fn: T,
    wait: number,
  ) {
    let t: number | undefined;
    return (...args: Parameters<T>) => {
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => fn(...args), wait);
    };
  }

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
    setFromAddress(value);
    setFromSelected(null);
    debouncedFromFetch(value);
  }

  function handleToInputChange(value: string) {
    setToAddress(value);
    setToSelected(null);
    debouncedToFetch(value);
  }

  function handlePickFromSuggestion(s: AddressSuggestion) {
    setFromAddress(s.label);
    setFromSelected(s);
    setFromSuggestions([]);
  }

  function handlePickToSuggestion(s: AddressSuggestion) {
    setToAddress(s.label);
    setToSelected(s);
    setToSuggestions([]);
  }

  async function handleSuggestShop() {
    setToAddress(SUGGESTED_REPAIR_SHOP);
    setToSelected(null);
    // Pre-resolve coords for better success rate
    const coords = await geocode(SUGGESTED_REPAIR_SHOP);
    if (coords) {
      setToSelected({ label: SUGGESTED_REPAIR_SHOP, coords });
    }
  }

  async function handleCalculateDistance() {
    setCalcError("");
    setCalcBusy(true);
    try {
      let from: LngLat | null = null;
      let to: LngLat | null = null;
      // Prefer selected suggestions' coords when available and matching the input
      if (fromSelected && fromSelected.label === fromAddress)
        from = fromSelected.coords;
      if (!from) {
        const exact = fromSuggestions.find(
          (s) => s.label === fromAddress,
        )?.coords;
        from = exact ?? (await geocode(fromAddress));
      }
      if (!from) throw new Error("Could not find location for from address.");

      if (toSelected && toSelected.label === toAddress) to = toSelected.coords;
      if (!to) {
        const exactTo = toSuggestions.find(
          (s) => s.label === toAddress,
        )?.coords;
        to = exactTo ?? (await geocode(toAddress));
      }
      if (!to) throw new Error("Could not find location for to address.");
      const dist = haversineMiles(from, to);
      setMiles(String(dist));
    } catch (e) {
      setCalcError((e as Error).message || "Error calculating distance.");
    } finally {
      setCalcBusy(false);
    }
  }

  // Modal state for quote form
  const [showQuoteModal, setShowQuoteModal] = useState(false);

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
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Left column */}
              <div className="flex flex-col gap-4 h-full">
                <div className="space-y-2">
                  <Label htmlFor="service" className="flex items-center gap-2">
                    Service
                  </Label>
                  <Select
                    value={service}
                    onValueChange={(v) => setService(v as ServiceType)}
                  >
                    <SelectTrigger id="service">
                      <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="towing">Towing</SelectItem>
                      <SelectItem value="fuel">Fuel Delivery</SelectItem>
                      <SelectItem value="lockout">Lock-out Service</SelectItem>
                      <SelectItem value="jumpstart">Jump Start</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Large vehicle option - applies to all services */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-vehicle" className="text-sm font-medium">
                      Large vehicle (truck, SUV, van)
                    </Label>
                    <Switch
                      id="large-vehicle"
                      checked={isLargeVehicle}
                      onCheckedChange={setIsLargeVehicle}
                    />
                  </div>
                  {isLargeVehicle && (
                    <p className="text-xs text-muted-foreground">
                      Higher rates apply for large vehicles
                    </p>
                  )}
                </div>
                {/* Vehicle type fields */}
                <div className=" space-y-2">
                  <Label className="block font-medium">Vehicle Type</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Input
                        id="vehicleYear"
                        placeholder="Year"
                        value={vehicleYear}
                        onChange={(e) => setVehicleYear(e.target.value)}
                        inputMode="numeric"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <Input
                        id="vehicleMake"
                        placeholder="Make"
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        id="vehicleModel"
                        placeholder="Model"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        id="vehiclePlate"
                        placeholder="Plate #"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        id="vehicleRegistrationState"
                        placeholder="Registration State"
                        value={vehicleRegistrationState}
                        onChange={(e) =>
                          setVehicleRegistrationState(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Right column: Only from/to address input */}
              <div className="flex flex-col gap-4 h-full">
                <div className="space-y-2 relative">
                  <Label
                    htmlFor="fromAddress"
                    className="flex items-center gap-2"
                  >
                    From address (pickup location)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="fromAddress"
                      placeholder="Enter pickup address"
                      value={fromAddress}
                      autoComplete="off"
                      onChange={(e) => handleFromInputChange(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUseGPSForFrom}
                      title="Use my location"
                      className="hover:bg-primary"
                      disabled={geoBusy}
                    >
                      {geoBusy ? "Locating..." : "Use GPS"}
                    </Button>
                  </div>
                  {currentCoords && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Your location: lat {currentCoords[1].toFixed(6)}, lng{" "}
                      {currentCoords[0].toFixed(6)}
                    </div>
                  )}
                  {geoErrorMsg && (
                    <div className="text-xs text-destructive mt-1">
                      {geoErrorMsg}
                    </div>
                  )}
                  {fromSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-20 rounded-md border bg-background shadow-sm max-h-56 overflow-auto mt-1">
                      <ul className="py-1 text-sm">
                        {fromSuggestions.map((s) => (
                          <li key={s.label}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                              onClick={() => handlePickFromSuggestion(s)}
                            >
                              {s.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-2 relative">
                  <Label
                    htmlFor="toAddress"
                    className="flex items-center gap-2"
                  >
                    To address (dropoff location)
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="toAddress"
                      placeholder="Enter dropoff address"
                      value={toAddress}
                      autoComplete="off"
                      onChange={(e) => handleToInputChange(e.target.value)}
                    />
                    {service === "towing" && (
                      <Button
                        variant="outline"
                        className="hover:bg-primary"
                        onClick={handleSuggestShop}
                      >
                        Suggest repair shop
                      </Button>
                    )}
                  </div>
                  {toSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-20 rounded-md border bg-background shadow-sm max-h-56 overflow-auto">
                      <ul className="py-1 text-sm">
                        {toSuggestions.map((s) => (
                          <li key={s.label}>
                            <button
                              type="button"
                              className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
                              onClick={() => handlePickToSuggestion(s)}
                            >
                              {s.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleCalculateDistance}
                  disabled={
                    calcBusy || !fromAddress.trim() || !toAddress.trim()
                  }
                >
                  {calcBusy ? "Calculating..." : "Calculate Distance"}
                </Button>
                {calcError && (
                  <p className="text-sm text-destructive">{calcError}</p>
                )}
                {/* Discount options */}
                <div className="flex flex-col gap-3 relative">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="veteran-discount" className="text-sm font-medium">
                      Veteran discount (10%)
                    </Label>
                    <Switch
                      id="veteran-discount"
                      checked={isVeteran}
                      onCheckedChange={setIsVeteran}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="student-discount" className="text-sm font-medium">
                      Student discount (8%)
                    </Label>
                    <Switch
                      id="student-discount"
                      checked={isStudent}
                      onCheckedChange={setIsStudent}
                    />
                  </div>
                  {(isVeteran || isStudent) && (
                    <p className="text-xs text-muted-foreground">
                      Discount will be applied to your quote. Valid ID required at time of service.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Removed towing location and actions UI */}

            {/* Cost summary */}
            <div className="rounded-lg border p-4 bg-background/50 ">
              {service === "towing" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Hook fee</span>
                    <span>{currency(HOOK_FEE_USD)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Per mile × {Math.max(0, Number(miles) || 0)} {isLargeVehicle ? "(large vehicle)" : ""}</span>
                    <span>
                      {currency(isLargeVehicle ? PER_MILE_RATE_LARGE_VEHICLE_USD : PER_MILE_RATE_USD)} ×{" "}
                      {Math.max(0, Number(miles) || 0)}
                    </span>
                  </div>
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Estimated total</span>
                    <span>{currency(total)}</span>
                  </div>
                  {(isVeteran || isStudent) && (
                    <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-400">
                      <span>Discount applied</span>
                      <span>
                        -{isVeteran ? "10% " : ""}
                        {isStudent ? "8%" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {service === "fuel" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Service fee</span>
                    <span>{currency(FUEL_DELIVERY_BASE_USD)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Per mile × {Math.max(0, Number(miles) || 0)}</span>
                    <span>
                      {currency(FUEL_DELIVERY_PER_MILE_USD)} ×{" "}
                      {Math.max(0, Number(miles) || 0)}
                    </span>
                  </div>
                  {isLargeVehicle && (
                    <div className="text-xs text-muted-foreground">
                      Large vehicle surcharge may apply
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Estimated total</span>
                    <span>{currency(total)}</span>
                  </div>
                  {(isVeteran || isStudent) && (
                    <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-400">
                      <span>Discount applied</span>
                      <span>
                        -{isVeteran ? "10% " : ""}
                        {isStudent ? "8%" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {service === "lockout" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Lock-out service</span>
                    <span>{currency(LOCKOUT_BASE_USD)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Per mile × {Math.max(0, Number(miles) || 0)}</span>
                    <span>
                      {currency(LOCKOUT_PER_MILE_USD)} ×{" "}
                      {Math.max(0, Number(miles) || 0)}
                    </span>
                  </div>
                  {isLargeVehicle && (
                    <div className="text-xs text-muted-foreground">
                      Large vehicle surcharge may apply
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Estimated total</span>
                    <span>{currency(total)}</span>
                  </div>
                  {(isVeteran || isStudent) && (
                    <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-400">
                      <span>Discount applied</span>
                      <span>
                        -{isVeteran ? "10% " : ""}
                        {isStudent ? "8%" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {service === "jumpstart" && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>Jump start</span>
                    <span>{currency(JUMP_START_BASE_USD)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Per mile × {Math.max(0, Number(miles) || 0)}</span>
                    <span>
                      {currency(JUMP_START_PER_MILE_USD)} ×{" "}
                      {Math.max(0, Number(miles) || 0)}
                    </span>
                  </div>
                  {isLargeVehicle && (
                    <div className="text-xs text-muted-foreground">
                      Large vehicle surcharge may apply
                    </div>
                  )}
                  <div className="h-px bg-border my-2" />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Estimated total</span>
                    <span>{currency(total)}</span>
                  </div>
                  {(isVeteran || isStudent) && (
                    <div className="flex items-center justify-between text-xs text-green-700 dark:text-green-400">
                      <span>Discount applied</span>
                      <span>
                        -{isVeteran ? "10% " : ""}
                        {isStudent ? "8%" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
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
            <Button
              variant="secondary"
              className="px-6"
              disabled={!fromAddress.trim() || !toAddress.trim()}
              onClick={() => {
                if (fromAddress.trim() && toAddress.trim()) {
                  setShowQuoteModal(true);
                }
              }}
            >
              Confirm Quote
            </Button>
            <QuoteModal
              open={showQuoteModal}
              onOpenChange={setShowQuoteModal}
              fromAddress={fromAddress}
              toAddress={toAddress}
              vehicleYear={vehicleYear}
              vehicleMake={vehicleMake}
              vehicleModel={vehicleModel}
              vehiclePlate={vehiclePlate}
              vehicleRegistrationState={vehicleRegistrationState}
            />
          </CardFooter>
        </Card>
      </div>
      {/* Removed geolocation permission dialog */}
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
