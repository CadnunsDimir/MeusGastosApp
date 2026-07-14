export function PageLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400 animate-pulse">Carregando...</p>
      </div>
    </div>
  );
}
