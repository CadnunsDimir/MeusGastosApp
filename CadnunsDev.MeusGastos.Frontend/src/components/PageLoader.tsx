export function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-paper dark:bg-night">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rule border-t-brass dark:border-rule-dark dark:border-t-brass-light" />
        <p className="text-xs text-ink-soft dark:text-stone animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}
