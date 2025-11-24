import React, { useState, useRef, useCallback, ReactNode } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback(
    async (_: any, info: PanInfo) => {
      if (info.offset.y > threshold && !isRefreshing) {
        setIsRefreshing(true);
        
        // Animate to loading position
        await controls.start({
          y: threshold,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        });

        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          
          // Animate back to original position
          await controls.start({
            y: 0,
            transition: { type: 'spring', stiffness: 400, damping: 30 }
          });
        }
      } else {
        // Snap back if not pulled enough
        setPullDistance(0);
        controls.start({
          y: 0,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        });
      }
    },
    [controls, onRefresh, threshold, isRefreshing]
  );

  const handleDrag = useCallback(
    (_: any, info: PanInfo) => {
      if (info.offset.y > 0 && !isRefreshing) {
        // Only allow pulling down when at the top of the scroll
        const scrollTop = containerRef.current?.scrollTop || 0;
        if (scrollTop === 0) {
          setPullDistance(Math.min(info.offset.y, threshold * 1.5));
        }
      }
    },
    [threshold, isRefreshing]
  );

  const rotation = (pullDistance / threshold) * 180;
  const scale = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(pullDistance / (threshold * 0.5), 1);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-10"
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? threshold : 0)}px`,
          transition: isRefreshing ? 'height 0.2s ease-out' : 'none'
        }}
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : rotation,
            scale: isRefreshing ? 1 : scale,
            opacity: isRefreshing ? 1 : opacity
          }}
          transition={{
            rotate: isRefreshing ? {
              duration: 1,
              repeat: Infinity,
              ease: 'linear'
            } : { duration: 0 }
          }}
          className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg"
        >
          <RefreshCw 
            className={`h-5 w-5 ${
              isRefreshing ? 'text-blue-600' : 
              pullDistance > threshold ? 'text-green-600' : 'text-gray-400'
            }`}
          />
        </motion.div>
      </div>

      {/* Content container */}
      <motion.div
        ref={containerRef}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative"
        style={{
          touchAction: 'pan-x',
          overscrollBehavior: 'contain'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PullToRefresh;
