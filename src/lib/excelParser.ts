/**
 * Parser dinámico Excel Pan Pa Ya — portado desde backend Python.
 * Bloques bidireccionales: columnas 0-3 (izq) y 5-8 (der).
 */

import * as XLSX from "xlsx";

const DRIVER_LABELS = new Set(["NOMBRE", "PLACA", "AUX.", "AUX"]);
const CODIGO_PATTERN = /^\d{4,7}$/;

export type PedidoParseado = {
  codigo_cliente: string;
  nombre_cliente: string;
  direccion: string;
  notas: string | null;
  orden: number | null;
};

export type RutaParseada = {
  fecha: string;
  nombre_zona: string;
  lado: "izquierda" | "derecha";
  conductor: string;
  placa: string;
  auxiliar: string | null;
  hora_salida: string | null;
  pedidos: PedidoParseado[];
};

function cellStr(value: unknown): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).trim();
}

function parseFecha(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = cellStr(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const parts = text.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
  if (parts) {
    return `${parts[3]}-${parts[2].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
  }
  if (typeof value === "number") {
    const d = XLSX.SSF.parse_date_code(value);
    if (d) {
      return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    }
  }
  throw new Error(`No se pudo interpretar la fecha: ${text}`);
}

function parseHora(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toTimeString().slice(0, 8);
  const text = cellStr(value);
  if (!text) return null;
  if (/^\d{1,2}:\d{2}/.test(text)) {
    const [h, m, s = "0"] = text.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
  }
  if (typeof value === "number" && value < 1) {
    const totalSec = Math.round(value * 86400);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return null;
}

function parseOrden(value: string): number | null {
  if (!value) return null;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function isCodigoCliente(text: string): boolean {
  return CODIGO_PATTERN.test(text);
}

function isDriverRow(label: string): boolean {
  const u = label.toUpperCase();
  return DRIVER_LABELS.has(u) || u.startsWith("AUX");
}

function isZoneHeader(row: string[], col: number): boolean {
  const label = row[col] ?? "";
  if (!label) return false;
  if (isCodigoCliente(label)) return false;
  if (isDriverRow(label)) return false;
  if (["DIRECCION", "DIRECCIÓN", "ORDEN", "MULTIPLAZA"].includes(label.toUpperCase()))
    return false;
  return true;
}

function detectZone(row: string[], side: "izquierda" | "derecha"): string | null {
  const cols = side === "izquierda" ? [0, 1] : [5, 6];
  const oppBase = side === "izquierda" ? 5 : 0;

  for (const col of cols) {
    if (!isZoneHeader(row, col)) continue;
    if ((col === 1 || col === 6) && row[cols[0]]) continue;
    if (isCodigoCliente(row[oppBase] ?? "")) continue;
    return row[col];
  }
  return null;
}

function rowStartsNewBlock(row: string[]): boolean {
  return detectZone(row, "izquierda") != null || detectZone(row, "derecha") != null;
}

function normalizeRow(fila: unknown[]): string[] {
  const row: string[] = [];
  for (let c = 0; c < 9; c++) {
    row.push(cellStr(fila[c]));
  }
  return row;
}

function extractCliente(row: string[], colStart: number): PedidoParseado | null {
  const codigo = row[colStart] ?? "";
  if (!isCodigoCliente(codigo)) return null;
  const nombre = row[colStart + 1] ?? "";
  const direccion = row[colStart + 2] ?? "";
  const notasRaw = row[colStart + 3] ?? "";
  const orden = parseOrden(notasRaw);
  return {
    codigo_cliente: codigo,
    nombre_cliente: nombre,
    direccion,
    notas: notasRaw && orden == null ? notasRaw : null,
    orden,
  };
}

function parseBlock(
  rows: string[][],
  colStart: number,
  lado: "izquierda" | "derecha",
  fecha: string,
  nombreZona: string
): RutaParseada | null {
  const pedidos: PedidoParseado[] = [];
  let conductor = "";
  let placa = "";
  let auxiliar: string | null = null;
  let horaSalida: string | null = null;

  for (const row of rows) {
    const label = row[colStart] ?? "";

    if (isDriverRow(label)) {
      const valor = row[colStart + 1] ?? "";
      const horaCelda = row[colStart + 2] ?? "";
      const upper = label.toUpperCase();
      if (upper === "NOMBRE") {
        conductor = valor;
        const h = parseHora(horaCelda);
        if (h) horaSalida = h;
      } else if (upper === "PLACA") {
        placa = valor;
        const h = parseHora(horaCelda);
        if (h && !horaSalida) horaSalida = h;
      } else if (upper.startsWith("AUX")) {
        auxiliar = valor || null;
        const h = parseHora(horaCelda);
        if (h && !horaSalida) horaSalida = h;
      }
      continue;
    }

    const cliente = extractCliente(row, colStart);
    if (cliente) pedidos.push(cliente);
  }

  if (!conductor && !placa && pedidos.length === 0) return null;

  return {
    fecha,
    nombre_zona: nombreZona,
    lado,
    conductor: conductor || "SIN ASIGNAR",
    placa: placa || "SIN PLACA",
    auxiliar,
    hora_salida: horaSalida,
    pedidos,
  };
}

export function parseExcelBuffer(buffer: Buffer): RutaParseada[] {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const filasRaw = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
  });

  if (!filasRaw.length) throw new Error("El archivo Excel está vacío");

  const fecha = parseFecha(filasRaw[0]?.[0]);
  const rutas: RutaParseada[] = [];

  let rowIdx = 1;
  while (rowIdx < filasRaw.length) {
    const row = normalizeRow(filasRaw[rowIdx] as unknown[]);
    const zonaIzq = detectZone(row, "izquierda");
    const zonaDer = detectZone(row, "derecha");

    if (!zonaIzq && !zonaDer) {
      rowIdx++;
      continue;
    }

    const blockRows: string[][] = [];
    rowIdx++;
    while (rowIdx < filasRaw.length) {
      const nextRow = normalizeRow(filasRaw[rowIdx] as unknown[]);
      if (rowStartsNewBlock(nextRow)) break;
      if (nextRow.every((c) => !c) && rowIdx + 1 < filasRaw.length) {
        const peek = normalizeRow(filasRaw[rowIdx + 1] as unknown[]);
        if (rowStartsNewBlock(peek)) break;
      }
      blockRows.push(nextRow);
      rowIdx++;
    }

    if (zonaIzq) {
      const ruta = parseBlock(blockRows, 0, "izquierda", fecha, zonaIzq);
      if (ruta) rutas.push(ruta);
    }
    if (zonaDer) {
      const ruta = parseBlock(blockRows, 5, "derecha", fecha, zonaDer);
      if (ruta) rutas.push(ruta);
    }
  }

  return rutas;
}
