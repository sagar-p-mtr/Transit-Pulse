import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  variant = 'default',
  blur = 'md',
  ...motionProps 
}) => {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const variantClasses = {
    default: 'bg-white/70 dark:bg-gray-900/70 border border-white/20 dark:border-gray-700/30 shadow-lg',
    elevated: 'bg-white/80 dark:bg-gray-900/80 border border-white/30 dark:border-gray-700/40 shadow-xl',
    flat: 'bg-white/60 dark:bg-gray-900/60 border border-white/10 dark:border-gray-700/20 shadow-sm'
  };

  return (
    <motion.div
      className={`
        rounded-xl 
        ${blurClasses[blur]}
        ${variantClasses[variant]}
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...motionProps}
      style={{
        ...motionProps.style,
        WebkitBackdropFilter: `blur(${blur === 'sm' ? '4px' : blur === 'md' ? '12px' : blur === 'lg' ? '16px' : '24px'})`,
      }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
