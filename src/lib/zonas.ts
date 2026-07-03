export type ZonaDistribucion = {
  codigo: string;
  nombre: string;
};

/** Catálogo oficial de zonas de distribución Pan Pa Ya */
export const ZONAS_DISTRIBUCION: ZonaDistribucion[] = [
  { codigo: '1CAN01', nombre: 'Medellin' },
  { codigo: '1CAN02', nombre: 'Medellin' },
  { codigo: '1CBG01', nombre: 'ZONA T' },
  { codigo: '1CBG02', nombre: 'ORIENTE /CHAPINERO' },
  { codigo: '1CBG03', nombre: 'NOR OCCIDENTE' },
  { codigo: '1CBG04', nombre: 'OCCIDENTE/ ZONA FRANCA' },
  { codigo: '1CBG05', nombre: 'BOSA/SOACHA' },
  { codigo: '1CBG06', nombre: 'CENTRO' },
  { codigo: '1CBG07', nombre: 'SUR ORIENTE' },
  { codigo: '1CBG09', nombre: 'TENJO/COTA SIBERIA' },
  { codigo: '1CBG10', nombre: 'NORTE' },
  { codigo: '1CBG11', nombre: 'NOR ORIENTE' },
  { codigo: '1CBG12', nombre: 'SUR OCCIDENTE' },
  { codigo: '1CBG13', nombre: 'R&M ZIPAQUIRA' },
  { codigo: '1CBY01', nombre: 'Boyacá' },
  { codigo: '1CBY02', nombre: 'Boyacá' },
  { codigo: '1CCT01', nombre: 'Barranquilla' },
  { codigo: '1CCT02', nombre: 'Cartagena' },
  { codigo: '1CCT03', nombre: 'Barranquilla/Cartagena' },
  { codigo: '1CCU01', nombre: 'Cucuta' },
  { codigo: '1CCU02', nombre: 'Santander' },
  { codigo: '1CEC01', nombre: 'Eje cafetero' },
  { codigo: '1CEC02', nombre: 'Eje cafetero' },
  { codigo: '1CFA01', nombre: 'Faca' },
  { codigo: '1CME01', nombre: 'Meta' },
  { codigo: '1CVL01', nombre: 'Valle' },
  { codigo: '1CZM01', nombre: 'Sumapaz Melgar/Girardot/Neiva' },
  { codigo: '1CZM02', nombre: 'Mesa-Mesitas' },
  { codigo: '1CZM03', nombre: 'Fusagasugá/Melgar' },
  { codigo: '1RBG01', nombre: 'MULTITEMPERATURA 1' },
  { codigo: '1RBG02', nombre: 'MULTITEMPERATURA 2' },
  { codigo: '1RBG03', nombre: 'MULTITEMPERATURA 3' },
  { codigo: '1RBG04', nombre: 'MULTITEMPERATURA 4' },
  { codigo: '1RBG05', nombre: 'MULTITEMPERATURA 5' },
  { codigo: '1SBG01', nombre: 'Sabana 1 /Cajicá/Zipa/Tabio' },
  { codigo: '1SBG02', nombre: 'Tocancipa/Gachancipa/Sopo' },
  { codigo: '1SBG03', nombre: 'Sabana 3 Tocancipa/Gachancipa' },
  { codigo: '1SBG04', nombre: 'RAPPI 1' },
  { codigo: '1SBG05', nombre: 'RAPPI 2' },
];

export function nombresZonasPorCodigos(codigos: string[]): string[] {
  return codigos
    .map((c) => ZONAS_DISTRIBUCION.find((z) => z.codigo === c)?.nombre)
    .filter((n): n is string => Boolean(n));
}

/** Nombres únicos para filtrar rutas (evita duplicados si el asesor tiene 1CAN01 + 1CAN02) */
export function nombresUnicosZonas(codigos: string[]): string[] {
  return Array.from(new Set(nombresZonasPorCodigos(codigos)));
}

export function etiquetaZonas(codigos: string[]): string {
  const nombres = nombresUnicosZonas(codigos);
  if (nombres.length === 0) return 'Sin zona asignada';
  if (nombres.length <= 2) return nombres.join(' · ');
  return `${nombres.slice(0, 2).join(' · ')} (+${nombres.length - 2} más)`;
}

export function filtroOrPorNombresZona(nombres: string[]): string {
  const unicos = Array.from(new Set(nombres));
  return unicos.map((n) => `rutas.nombre_zona.ilike.%${n}%`).join(',');
}
