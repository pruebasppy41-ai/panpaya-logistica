import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6 font-sans">
      <h1 className="text-3xl font-bold mb-2 tracking-wider">PAN PA YA</h1>
      <p className="text-slate-400 mb-8 text-sm">Seleccione el módulo del ecosistema logístico</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full px-4">
        <Link
          href="/login"
          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-semibold shadow-lg shadow-blue-600/10 transition active:scale-95 text-center"
        >
          📊 Panel de Asesores
        </Link>

        <Link
          href="/conductor"
          className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 p-4 rounded-xl font-semibold shadow-lg shadow-emerald-600/10 transition active:scale-95 text-center"
        >
          🚛 Legalizar POD (Conductores)
        </Link>

        <Link
          href="/logistica/login"
          className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-4 rounded-xl font-semibold shadow-lg transition active:scale-95 text-center"
        >
          📁 Carga de Logística
        </Link>

        <Link
          href="/qr"
          className="flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-700 p-4 rounded-xl font-semibold shadow-lg shadow-violet-600/10 transition active:scale-95 text-center"
        >
          📱 Generador QR
        </Link>
      </div>
    </div>
  );
}
