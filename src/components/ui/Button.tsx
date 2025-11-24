import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  animate?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  animate = true,
  disabled,
  onClick,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 disabled:bg-purple-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 disabled:border-gray-300 disabled:text-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer';

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${disabledClass} ${className}`;

  const buttonContent = (
    <>
      {loading && (
        <Loader2 className={`animate-spin ${children ? 'mr-2' : ''} ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`} />
      )}
      {!loading && icon && iconPosition === 'left' && (
        <span className={children ? 'mr-2' : ''}>{icon}</span>
      )}
      {children}
      {!loading && icon && iconPosition === 'right' && (
        <span className={children ? 'ml-2' : ''}>{icon}</span>
      )}
    </>
  );

  if (animate) {
    return (
      <motion.button
        className={combinedClasses}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.1 }}
      >
        {buttonContent}
      </motion.button>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
    >
      {buttonContent}
    </button>
  );
};

export default Button;
