import { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'glass' | 'elevated';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: ReactNode;
  hover?: boolean;
}
