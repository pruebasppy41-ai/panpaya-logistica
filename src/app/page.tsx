import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2 tracking-wider">PAN PA YA</h1>
      <p className="text-slate-400 mb-8 text-sm">
        Seleccione el módulo del ecosistema logístico
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/asesor"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold shadow-lg transition text-center"
        >
          📊 Panel de Asesores
        </Link>
        <Link
          href="/logistica"
          className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-3 rounded-xl font-semibold shadow-lg transition text-center"
        >
          📁 Carga de Logística
        </Link>
      </div>
    </div>
  );
}
