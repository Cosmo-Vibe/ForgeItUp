import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/20 text-primary',
        secondary: 'border-transparent bg-secondary/20 text-secondary',
        destructive: 'border-transparent bg-destructive/20 text-red-400',
        outline: 'border-[#2E2E2E] text-[#F5F5F5]',
        success: 'border-transparent bg-emerald-500/20 text-emerald-400',
        warning: 'border-transparent bg-yellow-500/20 text-yellow-400',
        // Loader badges
        forge: 'border-transparent bg-[rgba(255,107,53,0.15)] text-[#FF6B35]',
        fabric: 'border-transparent bg-[rgba(181,197,255,0.15)] text-[#B5C5FF]',
        neoforge: 'border-transparent bg-[rgba(255,215,0,0.15)] text-[#FFD700]',
        bedrock: 'border-transparent bg-[rgba(105,211,167,0.15)] text-[#69D3A7]',
        quilt: 'border-transparent bg-[rgba(155,89,182,0.15)] text-[#9B59B6]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
