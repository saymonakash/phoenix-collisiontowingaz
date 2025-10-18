import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google: typeof google;
    initGoogleMaps?: () => void;
  }
}

type Marker = { name: string; coordinates: [number, number] };

type ShopLocation = {
  name: string;
  coordinates: [number, number];
  address?: string;
  phone?: string;
};

type LocationDetails = {
  coords: [number, number];
  address?: string;
  distanceToShopKm?: number;
  nearestCity?: { name: string; distanceKm: number };
};

interface MapProps {
  shopLocation?: ShopLocation;
  onUserLocation?: (details: LocationDetails) => void;
  autoRequestLocation?: boolean; // New prop to control automatic location request
}

const phoenixCenter: [number, number] = [-112.074, 33.4484];

const markers: Marker[] = [
  { name: "Phoenix", coordinates: [-112.074, 33.4484] },
  { name: "Mesa", coordinates: [-111.8315, 33.4152] },
  { name: "Chandler", coordinates: [-111.8413, 33.3062] },
  { name: "Scottsdale", coordinates: [-111.9261, 33.4942] },
  { name: "Glendale", coordinates: [-112.18599, 33.5387] },
  { name: "Gilbert", coordinates: [-111.789, 33.3528] },
  { name: "Tempe", coordinates: [-111.94, 33.4255] },
  { name: "Peoria", coordinates: [-112.2374, 33.5806] },
  { name: "Surprise", coordinates: [-112.451, 33.6292] },
  { name: "Avondale", coordinates: [-112.3496, 33.4356] },
  { name: "Goodyear", coordinates: [-112.3577, 33.4353] },
  { name: "Buckeye", coordinates: [-112.5863, 33.3703] },
  { name: "Queen Creek", coordinates: [-111.6343, 33.2487] },
  { name: "Apache Junction", coordinates: [-111.5496, 33.415] },
  { name: "Paradise Valley", coordinates: [-111.951, 33.5312] },
  { name: "Fountain Hills", coordinates: [-111.722, 33.604] },
  { name: "El Mirage", coordinates: [-112.3246, 33.6131] },
  { name: "Tolleson", coordinates: [-112.2557, 33.45] },
  { name: "Maricopa", coordinates: [-112.0476, 33.0581] },
  { name: "Casa Grande", coordinates: [-111.7574, 32.8795] },
];

const Map: React.FC<MapProps> = ({
  shopLocation,
  onUserLocation,
  autoRequestLocation = false,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const shopRef = useRef<ShopLocation | undefined>(shopLocation);
  const onLocRef = useRef<typeof onUserLocation>(onUserLocation);
  const didLocateRef = useRef(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const autoRequestRef = useRef(autoRequestLocation);

  useEffect(() => {
    shopRef.current = shopLocation;
    onLocRef.current = onUserLocation;
    autoRequestRef.current = autoRequestLocation;
  }, [shopLocation, onUserLocation, autoRequestLocation]);

  // Load Google Maps API
  useEffect(() => {
    const initializeMap = async () => {
      const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey || apiKey === "your_google_maps_api_key_here") {
        console.error("Google Maps API key not configured");
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        setIsLoaded(true);
        return;
      }

      // Load Google Maps script
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;

      // Define the callback function
      window.initGoogleMaps = () => {
        setIsLoaded(true);
      };

      script.onerror = () => {
        console.error("Error loading Google Maps");
      };

      document.head.appendChild(script);

      return () => {
        // Cleanup script if component unmounts
        const existingScript = document.querySelector(
          `script[src*="maps.googleapis.com"]`,
        );
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        window.initGoogleMaps = undefined;
      };
    };

    initializeMap();
  }, []);

  // Initialize map when loaded
  useEffect(() => {
    if (!isLoaded || !mapContainer.current) return;

    const map = new google.maps.Map(mapContainer.current, {
      center: { lat: phoenixCenter[1], lng: phoenixCenter[0] },
      zoom: 10,
      styles: resolvedTheme === "dark" ? getDarkMapStyles() : [],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      scrollwheel: false,
    });

    mapRef.current = map;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add city markers
    markers.forEach((marker) => {
      const mapMarker = new google.maps.Marker({
        position: { lat: marker.coordinates[1], lng: marker.coordinates[0] },
        map,
        title: marker.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#E21B5A",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: marker.name,
      });

      mapMarker.addListener("click", () => {
        infoWindow.open(map, mapMarker);
      });

      markersRef.current.push(mapMarker);
    });

    // Add shop marker if available
    const shop = shopRef.current;
    if (shop) {
      const shopMarker = new google.maps.Marker({
        position: { lat: shop.coordinates[1], lng: shop.coordinates[0] },
        map,
        title: shop.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "hsl(var(--primary))",
          fillOpacity: 1,
          strokeColor: "hsl(var(--primary))",
          strokeWeight: 4,
          strokeOpacity: 0.3,
        },
      });

      const shopInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-size:13px;line-height:1.2">
            <strong>${shop.name}</strong><br/>
            ${shop.address ? `${shop.address}<br/>` : ""}
            ${
              shop.phone
                ? `<a href="tel:${shop.phone.replace(
                    /[^\d+]/g,
                    "",
                  )}">Call ${shop.phone}</a>`
                : ""
            }
          </div>
        `,
      });

      shopMarker.addListener("click", () => {
        shopInfoWindow.open(map, shopMarker);
      });

      markersRef.current.push(shopMarker);
    }

    // Handle user location
    const handleLocated = async (coords: [number, number]) => {
      if (didLocateRef.current) return;
      didLocateRef.current = true;

      const userMarker = new google.maps.Marker({
        position: { lat: coords[1], lng: coords[0] },
        map,
        title: "Your Location",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#2563eb",
          strokeWeight: 4,
          strokeOpacity: 0.3,
        },
      });

      markersRef.current.push(userMarker);

      // Calculate distances
      const toRad = (v: number) => (v * Math.PI) / 180;
      const distanceKm = (a: [number, number], b: [number, number]) => {
        const R = 6371;
        const dLat = toRad(b[1] - a[1]);
        const dLng = toRad(b[0] - a[0]);
        const lat1 = toRad(a[1]);
        const lat2 = toRad(b[1]);
        const s1 = Math.sin(dLat / 2);
        const s2 = Math.sin(dLng / 2);
        const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
        return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
      };

      const shopCoords = (shopRef.current?.coordinates ?? phoenixCenter) as [
        number,
        number,
      ];
      const distanceToShopKm =
        Math.round(distanceKm(coords, shopCoords) * 10) / 10;

      let nearestCity = markers[0];
      let nearestDist = distanceKm(coords, markers[0].coordinates);
      for (let i = 1; i < markers.length; i++) {
        const d = distanceKm(coords, markers[i].coordinates);
        if (d < nearestDist) {
          nearestCity = markers[i];
          nearestDist = d;
        }
      }

      // Get address using Google Geocoding
      let address: string | undefined;
      try {
        const geocoder = new google.maps.Geocoder();
        const response = await geocoder.geocode({
          location: { lat: coords[1], lng: coords[0] },
        });
        if (response.results[0]) {
          address = response.results[0].formatted_address;
        }
      } catch {
        // ignore reverse geocoding errors
      }

      // Fit bounds to show both user and shop locations
      const bounds = new google.maps.LatLngBounds();
      bounds.extend({ lat: coords[1], lng: coords[0] });
      bounds.extend({ lat: shopCoords[1], lng: shopCoords[0] });
      map.fitBounds(bounds, 48);

      // Set max zoom to prevent over-zooming
      const listener = google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 12) {
          map.setZoom(12);
        }
        google.maps.event.removeListener(listener);
      });

      onLocRef.current?.({
        coords,
        address,
        distanceToShopKm,
        nearestCity: {
          name: nearestCity.name,
          distanceKm: Math.round(nearestDist * 10) / 10,
        },
      });
    };

    // Only try to get user location if autoRequestLocation is true
    if (autoRequestRef.current && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLocated([pos.coords.longitude, pos.coords.latitude]),
        () => {},
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }

    return () => {
      // Cleanup markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [isLoaded, resolvedTheme]);

  // Dark mode styles for Google Maps
  const getDarkMapStyles = () => [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#2f3948" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ];

  if (!isLoaded) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full"
      aria-label="Service areas coverage map"
    >
      <div
        ref={mapContainer}
        className="absolute inset-0 overflow-hidden rounded-xl shadow-premium"
      />
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-transparent to-background/10" />
    </div>
  );
};

export default Map;
