import { CardProps } from './Card.types';

export function Card({
  variant = 'default',
  children,
  hover = false,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-xl transition-all duration-300';

  const variantStyles = {
    default: 'bg-white border border-neutral-200 shadow-sm',
    glass: 'bg-white/70 backdrop-blur-md border border-white/20 shadow-lg',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
  };

  const hoverStyles = hover ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
