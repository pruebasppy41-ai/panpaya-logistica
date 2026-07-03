'use client';

import Link from 'next/link';

export default function VolverInicio({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition active:scale-[0.98] ${className}`}
    >
      <span aria-hidden>←</span>
      <span>Módulos iniciales</span>
    </Link>
  );
}
