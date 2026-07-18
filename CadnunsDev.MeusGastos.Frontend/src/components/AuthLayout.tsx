import { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-night items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-rule bg-white p-8 shadow-xl shadow-ink/5 backdrop-blur dark:border-rule-dark dark:bg-panel">
        {children}
      </div>
    </div>
  );
}
