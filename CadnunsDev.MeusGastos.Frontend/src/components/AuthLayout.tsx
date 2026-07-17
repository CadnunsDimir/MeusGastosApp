import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/95">
        {children}
      </div>
    </div>
  );
}
