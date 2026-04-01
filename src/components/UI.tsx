import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, title, subtitle, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("bg-white rounded-2xl p-6 shadow-sm border border-gray-100", className)}
    >
      {(title || icon) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          {icon && <div className="text-2xl">{icon}</div>}
        </div>
      )}
      {children}
    </motion.div>
  );
};

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#065A82] text-white hover:bg-[#1C7293] shadow-[0_0_20px_rgba(6,90,130,0.2)]',
    secondary: 'bg-[#1C7293] text-white hover:bg-[#065A82] shadow-[0_0_20px_rgba(28,114,147,0.2)]',
    outline: 'border-2 border-[#065A82] text-[#065A82] hover:bg-[#065A82] hover:text-white',
    danger: 'bg-[#F96167] text-white hover:bg-red-600 shadow-[0_0_20px_rgba(249,97,103,0.2)]',
    success: 'bg-[#2C5F2D] text-white hover:bg-green-700 shadow-[0_0_20px_rgba(44,95,45,0.2)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-bold',
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.02,
        y: -2,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "relative overflow-hidden rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Shimmer effect */}
      <motion.div
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      />
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </span>
    </motion.button>
  );
}

interface GaugeProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function Gauge({ value, max = 100, size = 200, strokeWidth = 15, label }: GaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  const getColor = (val: number) => {
    if (val < 40) return '#F96167';
    if (val < 70) return '#F9A825';
    if (val < 85) return '#1C7293';
    return '#2C5F2D';
  };

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={getColor(value)}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-gray-900">{Math.round(value)}</span>
        {label && <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}
