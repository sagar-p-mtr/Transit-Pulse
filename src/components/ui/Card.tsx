import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  onClick,
  padding = 'md',
  animate = false
}) => {
  const baseClasses = 'rounded-lg transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-xl',
    gradient: 'bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-200 shadow-md',
    elevated: 'bg-white shadow-lg'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const hoverClasses = hover
    ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
    : '';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  if (animate) {
    return (
      <motion.div
        className={combinedClasses}
        onClick={onClick}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={hover ? { scale: 1.02 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={combinedClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
