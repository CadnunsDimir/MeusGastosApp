export const uiClasses = {
  pageBackButton: 'inline-flex items-center gap-2 rounded-2xl border border-rule bg-white px-3 py-2 text-ink-soft transition hover:border-brass/40 dark:border-rule-dark dark:bg-panel dark:text-stone',
  pageSubtitle: 'font-mono text-xs uppercase tracking-widest text-sage dark:text-sage-light',
  pageTitle: 'mt-2 font-display text-3xl tracking-tight text-ink dark:text-paper',
  primaryButton: 'inline-flex items-center gap-2 rounded-full bg-brass px-5 py-3 text-sm font-semibold text-white transition hover:bg-brass-dark',
  tableCard: 'overflow-hidden rounded-2xl border border-rule bg-white shadow-sm dark:border-rule-dark dark:bg-panel',
  tableHead: 'bg-paper-dark/40 text-sage font-mono uppercase tracking-[0.2em] text-xs dark:bg-night-soft dark:text-sage-light',
  tableRowHover: 'hover:bg-paper/60 dark:hover:bg-night-soft/60',
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4',
  modalPanel: 'w-full max-w-2xl rounded-2xl border border-rule bg-white p-6 shadow-2xl dark:border-rule-dark dark:bg-panel',
  formInput: 'rounded-2xl border border-rule bg-paper-dark/30 px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:border-brass/50 dark:border-rule-dark dark:bg-night dark:text-paper dark:placeholder:text-stone/60',
} as const;
