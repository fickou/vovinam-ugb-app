/**
 * @file src/components/shared/PrintHeader.tsx
 * En-tête affiché uniquement lors de l'impression (visible avec print:block).
 * Masqué à l'écran via hidden.
 */
interface PrintHeaderProps {
  title: string;
  subtitle: string;
  seasonLabel?: string;
}

export function PrintHeader({ title, subtitle, seasonLabel }: PrintHeaderProps) {
  return (
    <div className="hidden print:block mb-8 text-center pt-8 border-b pb-8">
      <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-navy mb-2">
        {title}
      </h1>
      <div className="inline-block px-4 py-1 bg-navy text-white font-bold text-lg mb-4 rounded-md">
        {subtitle}
      </div>
      {seasonLabel && (
        <p className="text-sm font-semibold">{seasonLabel}</p>
      )}
      <p className="text-xs text-muted-foreground mt-2 italic">
        Document généré le {new Date().toLocaleDateString('fr-FR')} à{' '}
        {new Date().toLocaleTimeString('fr-FR')}
      </p>
    </div>
  );
}
