import React, { useState, useEffect, useRef } from 'react';
import { Camera, Navigation, X, Maximize2, Minimize2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../ui/GlassCard';

interface ARNavigationProps {
  destination?: { lat: number; lng: number; name: string };
  currentLocation?: { lat: number; lng: number };
  onClose: () => void;
}

const ARNavigation: React.FC<ARNavigationProps> = ({ 
  destination, 
  currentLocation,
  onClose 
}) => {
  const [isARActive, setIsARActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [distance, setDistance] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);
  const [deviceOrientation, setDeviceOrientation] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Calculate bearing between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);

    return (θ * 180 / Math.PI + 360) % 360; // Bearing in degrees
  };

  // Start AR Camera
  const startAR = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsARActive(true);
      }

      // Start device orientation tracking
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  // Stop AR Camera
  const stopAR = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsARActive(false);
    window.removeEventListener('deviceorientation', handleOrientation);
  };

  // Handle device orientation
  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      setDeviceOrientation(event.alpha);
    }
  };

  // Draw AR overlay
  useEffect(() => {
    if (isARActive && canvasRef.current && destination && currentLocation) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate relative angle for AR arrow
        const targetBearing = calculateBearing(
          currentLocation.lat, 
          currentLocation.lng,
          destination.lat, 
          destination.lng
        );
        const relativeBearing = (targetBearing - deviceOrientation + 360) % 360;

        // Draw AR elements only if destination is in view (within 60 degrees)
        if (relativeBearing > 300 || relativeBearing < 60) {
          // Draw direction arrow
          const centerX = canvas.width / 2 + (relativeBearing - 30) * (canvas.width / 60);
          const centerY = canvas.height / 2;

          ctx.save();
          ctx.translate(centerX, centerY);
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(0, -40);
          ctx.lineTo(-20, 20);
          ctx.lineTo(0, 10);
          ctx.lineTo(20, 20);
          ctx.closePath();
          
          // Gradient fill
          const gradient = ctx.createLinearGradient(0, -40, 0, 20);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.9)');
          gradient.addColorStop(1, 'rgba(37, 99, 235, 0.9)');
          ctx.fillStyle = gradient;
          ctx.fill();
          
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          ctx.restore();

          // Draw distance text
          ctx.font = 'bold 18px Arial';
          ctx.fillStyle = 'white';
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 4;
          ctx.textAlign = 'center';
          
          const distanceText = distance < 1000 
            ? `${Math.round(distance)}m` 
            : `${(distance / 1000).toFixed(1)}km`;
          
          ctx.strokeText(distanceText, centerX, centerY + 60);
          ctx.fillText(distanceText, centerX, centerY + 60);

          // Draw destination name
          ctx.font = '16px Arial';
          ctx.strokeText(destination.name, centerX, centerY + 85);
          ctx.fillText(destination.name, centerX, centerY + 85);
        }

        requestAnimationFrame(draw);
      };

      draw();
    }
  }, [isARActive, deviceOrientation, destination, currentLocation, distance]);

  // Update distance and bearing
  useEffect(() => {
    if (destination && currentLocation) {
      const dist = calculateDistance(
        currentLocation.lat,
        currentLocation.lng,
        destination.lat,
        destination.lng
      );
      setDistance(dist);

      const bear = calculateBearing(
        currentLocation.lat,
        currentLocation.lng,
        destination.lat,
        destination.lng
      );
      setBearing(bear);
    }
  }, [destination, currentLocation]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* AR Camera View */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* AR Overlay Canvas */}
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={window.innerHeight}
          className="absolute inset-0 pointer-events-none"
        />

        {/* Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-white transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="text-white text-right">
                <div className="text-sm opacity-75">Distance</div>
                <div className="text-lg font-bold">
                  {distance < 1000 
                    ? `${Math.round(distance)}m` 
                    : `${(distance / 1000).toFixed(1)}km`}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Info Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-blue-400" />
                <span className="text-sm">
                  Heading: {Math.round(bearing)}°
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-yellow-400" />
                <span className="text-sm">
                  Point camera towards destination
                </span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Start AR Button */}
        {!isARActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              onClick={startAR}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-2xl flex items-center space-x-3 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera className="h-6 w-6" />
              <span className="text-lg font-semibold">Start AR Navigation</span>
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ARNavigation;
