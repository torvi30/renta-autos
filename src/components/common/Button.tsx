import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold-subtle';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const sizeStyles = {
    sm: "text-[11.5px] sm:text-xs px-3 sm:px-3.5 py-2 gap-1.5 min-h-[36px]",
    md: "text-xs sm:text-sm px-3.5 sm:px-5 py-2.5 gap-2 min-h-[40px]",
    lg: "text-xs sm:text-base px-4 sm:px-7 py-3 sm:py-3.5 gap-2 sm:gap-2.5 font-semibold min-h-[44px]",
  };

  const variantStyles = {
    primary: "bg-gold-500 hover:bg-gold-400 text-carbon-950 font-semibold shadow-lg shadow-gold-500/10 hover:shadow-gold-500/25 border border-gold-400/40",
    secondary: "bg-carbon-850 hover:bg-carbon-800 text-silver-100 border border-carbon-700 hover:border-carbon-600",
    outline: "bg-transparent hover:bg-white/5 text-silver-100 border border-white/20 hover:border-gold-500/60 hover:text-gold-400",
    ghost: "bg-transparent hover:bg-carbon-800 text-silver-300 hover:text-silver-100",
    'gold-subtle': "bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 border border-gold-500/30",
  };

  return (
    <button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};
