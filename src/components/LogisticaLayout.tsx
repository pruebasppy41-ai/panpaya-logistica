"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LogisticaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard Asesores", path: "/asesor", icon: "📊" },
    { name: "Cargar Programación", path: "/logistica", icon: "📁" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased font-sans">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-200">
        <div className="flex h-16 items-center border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍞</span>
            <div className="flex flex-col">
              <span className="font-bold tracking-wider text-white text-sm">
                PAN PA YA
              </span>
              <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                Ecosistema Logístico
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4 bg-slate-900/40">
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 font-bold text-xs text-blue-400 border border-slate-700">
              U
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-semibold text-white">
                Usuario Central
              </span>
              <span className="truncate text-[10px] text-slate-400">
                Plataforma Vercel
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-64">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Módulo de Distribución Comercial
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-xs font-medium text-slate-600 font-mono">
              Servidor Cloud: OK
            </span>
          </div>
        </header>

        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
