/**
 * @file Card.tsx
 * @description Implements components/ui/Card.tsx for The Obsolete Human Museum.
 */
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <article
      ref={ref}
      className={cn(
        'rounded-xl border border-museum-border bg-museum-bg-glass backdrop-blur-md shadow-museum transition-all duration-300 motion-safe:hover:shadow-museum-lg motion-safe:hover:border-museum-border-hover',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn('flex flex-col gap-1.5 p-6 pb-3', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h3
    ref={ref}
    className={cn(
      'font-serif text-xl font-semibold text-museum-text tracking-wide',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-museum-text-muted font-sans', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-3', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <footer
      ref={ref}
      className={cn(
        'flex items-center p-6 pt-3 border-t border-museum-border',
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
