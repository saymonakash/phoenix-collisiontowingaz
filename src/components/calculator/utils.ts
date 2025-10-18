import type { LngLat } from "./types";

export function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function haversineMiles(a: LngLat, b: LngLat) {
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

export async function getCoordsWithFallbacks(): Promise<LngLat> {
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

export async function geocode(address: string): Promise<LngLat | null> {
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

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
) {
  let t: number | undefined;
  return (...args: Parameters<T>) => {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), wait);
  };
}
