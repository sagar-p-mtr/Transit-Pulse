import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

// Smooth marker animation function
const animateMarker = (
  marker: google.maps.Marker,
  fromPos: google.maps.LatLng,
  toPos: google.maps.LatLng,
  duration: number = 1000
) => {
  const startTime = Date.now();
  const startLat = fromPos.lat();
  const startLng = fromPos.lng();
  const endLat = toPos.lat();
  const endLng = toPos.lng();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeProgress = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    const lat = startLat + (endLat - startLat) * easeProgress;
    const lng = startLng + (endLng - startLng) * easeProgress;

    marker.setPosition({ lat, lng });

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

// Interface for bus marker data
interface BusMarkerData {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  content: string;
  crowdLevel?: string;
  provider?: string;
  vehicleNumber?: string;
  routeName?: string;
  lastUpdated?: string;
  crowdPercentage?: number;
}

// Interface for stop marker data
interface StopMarkerData {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  content: string;
  onStopSelect?: (stopId: string) => void;
}

// Interface for route polyline data
interface RouteData {
  path: google.maps.LatLngLiteral[];
  color?: string;
  weight?: number;
  opacity?: number;
}

// Props for the Google Map component
interface GoogleMapProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  buses: BusMarkerData[];
  stops: StopMarkerData[];
  routePath?: RouteData;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
}

// Custom bus icon creator
const createBusIcon = (crowdLevel: string = 'Medium'): google.maps.Icon => {
  const color = crowdLevel === 'Low' ? '#10B981' : 
                crowdLevel === 'Medium' ? '#F59E0B' : '#EF4444';
  
  const svgIcon = `
    <svg width="40" height="24" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="40" height="24" rx="4" fill="${color}" stroke="white" stroke-width="2"/>
      <text x="20" y="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">BUS</text>
    </svg>
  `;
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
    size: new google.maps.Size(40, 24),
    anchor: new google.maps.Point(20, 12),
    scaledSize: new google.maps.Size(40, 24)
  };
};

// Custom stop icon creator
const createStopIcon = (): google.maps.Icon => {
  const svgIcon = `
    <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6" fill="#3B82F6" stroke="white" stroke-width="2"/>
    </svg>
  `;
  
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgIcon)}`,
    size: new google.maps.Size(16, 16),
    anchor: new google.maps.Point(8, 8),
    scaledSize: new google.maps.Size(16, 16)
  };
};

// Main Google Map component
const GoogleMap: React.FC<GoogleMapProps> = ({
  center,
  zoom,
  buses,
  stops,
  routePath,
  onMapLoad,
  className = "w-full h-full"
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindow] = useState<google.maps.InfoWindow>(new google.maps.InfoWindow());
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Initialize the map
  useEffect(() => {
    if (mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM
        },
        // Performance optimizations
        gestureHandling: 'greedy',
        clickableIcons: false,
        disableDefaultUI: false,
        backgroundColor: '#f3f4f6'
      });
      
      setMap(newMap);
      onMapLoad?.(newMap);
    }
  }, [mapRef, map, center, zoom, onMapLoad]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
  }, []);

  // Create bus markers with smooth animation
  useEffect(() => {
    if (!map) return;

    // Debounce marker updates
    const timeoutId = setTimeout(() => {
      const existingMarkers = new Map(
        markersRef.current.map(m => [m.getTitle(), m])
      );

      // Add or update bus markers with smooth transition
      buses.forEach(bus => {
        const existingMarker = existingMarkers.get(bus.title);
        
        if (existingMarker) {
          // Animate existing marker to new position
          const currentPos = existingMarker.getPosition();
          const newPos = new google.maps.LatLng(bus.position.lat, bus.position.lng);
          
          if (currentPos && !currentPos.equals(newPos)) {
            // Smooth animation from old position to new position
            animateMarker(existingMarker, currentPos, newPos, 1000);
          }
          
          // Update icon if crowd level changed
          existingMarker.setIcon(createBusIcon(bus.crowdLevel));
          existingMarkers.delete(bus.title);
        } else {
          // Create new marker
          const marker = new google.maps.Marker({
            position: bus.position,
            map,
            title: bus.title,
            icon: createBusIcon(bus.crowdLevel),
            zIndex: 1000,
            animation: google.maps.Animation.DROP
          });

          // Create info window content
          const getCrowdLevelColor = (level: string) => {
            switch (level) {
              case 'Low':
                return 'background-color: #10b981; color: white;';
              case 'Medium':
                return 'background-color: #f59e0b; color: white;';
              case 'High':
                return 'background-color: #ef4444; color: white;';
              default:
                return 'background-color: #6b7280; color: white;';
            }
          };

          const content = `
            <div style="min-width: 200px; padding: 8px;">
              <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${bus.routeName || 'Unknown Route'}</h3>
              <p style="margin: 4px 0; color: #6b7280;">Bus: ${bus.vehicleNumber || 'N/A'}</p>
              <p style="margin: 4px 0; color: #6b7280;">Provider: ${bus.provider || 'Unknown'}</p>
              <div style="margin: 8px 0;">
                <span style="padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; ${getCrowdLevelColor(bus.crowdLevel || 'Medium')}">
                  👥 ${bus.crowdLevel || 'Medium'} (${bus.crowdPercentage || 50}%)
                </span>
              </div>
              <p style="margin: 4px 0; font-size: 11px; color: #9ca3af;">
                Last updated: ${bus.lastUpdated ? new Date(bus.lastUpdated).toLocaleTimeString() : 'Unknown'}
              </p>
            </div>
          `;

          marker.addListener('click', () => {
            infoWindow.setContent(content);
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        }
      });

      // Remove markers that no longer exist
      existingMarkers.forEach(marker => {
        marker.setMap(null);
        const index = markersRef.current.indexOf(marker);
        if (index > -1) {
          markersRef.current.splice(index, 1);
        }
      });

    // Add stop markers
    stops.forEach(stop => {
      const marker = new google.maps.Marker({
        position: stop.position,
        map,
        title: stop.title,
        icon: createStopIcon(),
        zIndex: 500
      });

      const content = `
        <div style="min-width: 150px; padding: 8px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${stop.title}</h3>
          <button 
            onclick="window.selectStop('${stop.id}')" 
            style="margin-top: 8px; padding: 4px 8px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;"
          >
            View details
          </button>
        </div>
      `;

      // Add stop selection to global scope for onclick handler
      (window as any).selectStop = (stopId: string) => {
        const stopData = stops.find(s => s.id === stopId);
        if (stopData?.onStopSelect) {
          stopData.onStopSelect(stopId);
        }
        infoWindow.close();
      };

      marker.addListener('click', () => {
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [map, buses, stops, clearMarkers, infoWindow]);

  // Create route polyline
  useEffect(() => {
    if (!map) return;

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    // Add new polyline if route path exists
    if (routePath && routePath.path.length > 1) {
      const polyline = new google.maps.Polyline({
        path: routePath.path,
        geodesic: true,
        strokeColor: routePath.color || '#3B82F6',
        strokeOpacity: routePath.opacity || 0.7,
        strokeWeight: routePath.weight || 4,
        map
      });

      polylineRef.current = polyline;
    }
  }, [map, routePath]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMarkers();
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
      }
    };
  }, [clearMarkers]);

  return <div ref={mapRef} className={className} />;
};

// Loading component
const MapLoading: React.FC = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
      <p className="text-blue-600">Loading Google Maps...</p>
    </div>
  </div>
);

// Error component
const MapError: React.FC<{ error: Error }> = ({ error }) => (
  <div className="w-full h-full flex items-center justify-center bg-red-50 border border-red-200">
    <div className="flex flex-col items-center text-center p-4">
      <div className="text-red-500 mb-2">
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-800 mb-2">Map Loading Error</h3>
      <p className="text-red-600 text-sm mb-4">
        Failed to load Google Maps: {error.message}
      </p>
      <p className="text-red-500 text-xs">
        Please check your API key and internet connection.
      </p>
    </div>
  </div>
);

// Main wrapper component with Google Maps API
interface GoogleMapsWrapperProps extends Omit<GoogleMapProps, 'onMapLoad'> {
  apiKey?: string;
  onMapLoad?: (map: google.maps.Map) => void;
}

const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({
  apiKey,
  center,
  zoom,
  buses,
  stops,
  routePath,
  onMapLoad,
  className
}) => {
  const finalApiKey = apiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!finalApiKey) {
    return (
      <MapError error={new Error('Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.')} />
    );
  }

  // Render function for status handling
  const renderStatus = (status: Status): React.ReactElement => {
    if (status === Status.LOADING) return <MapLoading />;
    if (status === Status.FAILURE) return <MapError error={new Error('Failed to load Google Maps. Please check your API key and internet connection.')} />;
    return <></>;
  };

  return (
    <Wrapper 
      apiKey={finalApiKey}
      render={renderStatus}
      libraries={['places']}
    >
      <GoogleMap
        center={center}
        zoom={zoom}
        buses={buses}
        stops={stops}
        routePath={routePath}
        onMapLoad={onMapLoad}
        className={className}
      />
    </Wrapper>
  );
};

// Export types and components
export type { BusMarkerData, StopMarkerData, RouteData, GoogleMapProps, GoogleMapsWrapperProps };
export { GoogleMap, GoogleMapsWrapper };
export default GoogleMapsWrapper;