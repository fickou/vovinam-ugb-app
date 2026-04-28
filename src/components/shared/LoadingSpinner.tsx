/**
 * @file src/components/shared/LoadingSpinner.tsx
 * Spinner de chargement réutilisable avec message optionnel.
 */
interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = 'Chargement…', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 gap-4 ${className}`}>
      <div className="h-8 w-8 rounded-full border-4 border-navy border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">{message}</p>
    </div>
  );
}

/** Variante skeleton pour les grilles de cards */
export function SkeletonCards({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}
