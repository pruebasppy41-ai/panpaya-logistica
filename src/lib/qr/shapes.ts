import type { QrMaskShape, QrShapeCategory } from './types';

/**
 * Paths are authored in a 100×100 viewBox and applied via SVG mask.
 * Coordinates stay inside ~4–96 so QR finder patterns remain mostly scannable.
 */
export const QR_MASK_SHAPES: QrMaskShape[] = [
  {
    id: 'none',
    label: 'Cuadrado',
    category: 'basicas',
    path: null,
    libraryShape: 'square',
  },
  {
    id: 'circle',
    label: 'Círculo',
    category: 'basicas',
    path: 'M50 4 A46 46 0 1 1 49.9 4 Z',
    libraryShape: 'circle',
  },
  {
    id: 'rounded-sq',
    label: 'Redondeado',
    category: 'basicas',
    path: 'M18 8 H82 Q92 8 92 18 V82 Q92 92 82 92 H18 Q8 92 8 82 V18 Q8 8 18 8 Z',
    libraryShape: 'square',
  },
  {
    id: 'hexagon',
    label: 'Hexágono',
    category: 'basicas',
    path: 'M50 4 L92 27 V73 L50 96 L8 73 V27 Z',
  },
  {
    id: 'octagon',
    label: 'Octágono',
    category: 'basicas',
    path: 'M30 6 H70 L94 30 V70 L70 94 H30 L6 70 V30 Z',
  },
  {
    id: 'diamond',
    label: 'Diamante',
    category: 'basicas',
    path: 'M50 4 L96 50 L50 96 L4 50 Z',
  },
  {
    id: 'soft-diamond',
    label: 'Rombo suave',
    category: 'basicas',
    path: 'M50 4 C62 18 82 38 96 50 C82 62 62 82 50 96 C38 82 18 62 4 50 C18 38 38 18 50 4 Z',
  },
  {
    id: 'triangle',
    label: 'Triángulo',
    category: 'basicas',
    path: 'M50 6 L94 92 H6 Z',
  },
  {
    id: 'shield',
    label: 'Escudo',
    category: 'simbolos',
    path: 'M50 4 L92 16 V48 C92 72 74 88 50 96 C26 88 8 72 8 48 V16 Z',
  },
  {
    id: 'badge',
    label: 'Insignia',
    category: 'simbolos',
    path: 'M50 5 L62 18 L80 16 L82 34 L96 44 L86 58 L88 76 L70 80 L60 95 L50 86 L40 95 L30 80 L12 76 L14 58 L4 44 L18 34 L20 16 L38 18 Z',
  },
  {
    id: 'star',
    label: 'Estrella',
    category: 'simbolos',
    path: 'M50 4 L60 36 L94 36 L66 56 L76 90 L50 70 L24 90 L34 56 L6 36 L40 36 Z',
  },
  {
    id: 'star-6',
    label: 'Estrella 6',
    category: 'simbolos',
    path: 'M50 4 L58 30 L86 22 L70 46 L96 54 L70 62 L86 86 L58 72 L50 98 L42 72 L14 86 L30 62 L4 54 L30 46 L14 22 L42 30 Z',
  },
  {
    id: 'heart',
    label: 'Corazón',
    category: 'simbolos',
    path: 'M50 88 C22 66 8 48 8 32 C8 18 18 10 30 10 C40 10 47 16 50 24 C53 16 60 10 70 10 C82 10 92 18 92 32 C92 48 78 66 50 88 Z',
  },
  {
    id: 'thumb',
    label: 'Me gusta',
    category: 'simbolos',
    path: 'M38 90 H18 V48 H32 L40 36 V22 C40 14 46 10 52 12 C56 14 58 18 56 24 L52 40 H78 C86 40 90 46 88 54 L80 88 C78 92 74 94 70 94 H44 C40 94 38 92 38 90 Z',
  },
  {
    id: 'paw',
    label: 'Huella',
    category: 'naturaleza',
    path: 'M28 28 C22 20 24 10 32 10 C40 10 42 20 36 28 Z M50 22 C44 12 48 4 56 6 C64 8 64 18 56 26 Z M72 28 C66 20 68 10 76 10 C84 10 86 20 80 28 Z M34 94 C18 90 14 70 28 58 C40 48 56 48 66 58 C80 70 76 90 60 94 C52 96 42 96 34 94 Z',
  },
  {
    id: 'leaf',
    label: 'Hoja',
    category: 'naturaleza',
    path: 'M50 6 C72 14 92 36 90 62 C88 84 68 96 50 94 C32 96 12 84 10 62 C8 36 28 14 50 6 Z',
  },
  {
    id: 'clover',
    label: 'Trébol',
    category: 'naturaleza',
    path: 'M50 48 C38 28 18 28 18 44 C18 58 36 60 50 70 C64 60 82 58 82 44 C82 28 62 28 50 48 C38 68 28 86 42 92 C46 94 50 88 50 82 C50 88 54 94 58 92 C72 86 62 68 50 48 Z',
  },
  {
    id: 'flower',
    label: 'Flor',
    category: 'naturaleza',
    path: 'M50 8 C58 20 70 22 78 14 C86 24 84 38 72 44 C84 50 86 64 78 74 C70 66 58 68 50 80 C42 68 30 66 22 74 C14 64 16 50 28 44 C16 38 14 24 22 14 C30 22 42 20 50 8 Z M50 40 A12 12 0 1 1 49.9 40 Z',
  },
  {
    id: 'tree',
    label: 'Árbol',
    category: 'naturaleza',
    path: 'M50 6 C70 18 78 34 68 48 H82 L66 62 H78 L62 76 H70 L55 92 H45 L30 76 H38 L22 62 H34 L18 48 H32 C22 34 30 18 50 6 Z',
  },
  {
    id: 'sun',
    label: 'Sol',
    category: 'naturaleza',
    path: 'M50 6 L56 22 L74 16 L64 32 L88 38 L68 48 L92 50 L68 52 L88 62 L64 68 L74 84 L56 78 L50 94 L44 78 L26 84 L36 68 L12 62 L32 52 L8 50 L32 48 L12 38 L36 32 L26 16 L44 22 Z M50 36 A14 14 0 1 0 50.1 36 Z',
  },
  {
    id: 'cloud',
    label: 'Nube',
    category: 'naturaleza',
    path: 'M28 72 H74 C86 72 94 64 94 52 C94 40 84 32 72 34 C70 22 60 14 48 14 C34 14 24 24 24 38 C14 40 8 48 8 58 C8 68 16 72 28 72 Z',
  },
  {
    id: 'drop',
    label: 'Gota',
    category: 'naturaleza',
    path: 'M50 6 C70 32 88 48 88 66 C88 84 72 96 50 96 C28 96 12 84 12 66 C12 48 30 32 50 6 Z',
  },
  {
    id: 'bulb',
    label: 'Bombilla',
    category: 'objetos',
    path: 'M50 6 C70 6 84 22 84 40 C84 54 76 64 68 72 V80 H32 V72 C24 64 16 54 16 40 C16 22 30 6 50 6 Z M36 84 H64 V90 H36 Z M40 92 H60 V96 H40 Z',
  },
  {
    id: 'gift',
    label: 'Regalo',
    category: 'objetos',
    path: 'M18 34 H82 V42 H18 Z M22 42 H78 V94 H22 Z M46 34 V94 M18 34 C18 22 30 18 40 28 C46 22 54 22 60 28 C70 18 82 22 82 34 M50 8 C40 8 34 18 40 28 C50 18 60 8 50 8 Z',
  },
  {
    id: 'bag',
    label: 'Bolsa',
    category: 'objetos',
    path: 'M28 30 C28 18 40 10 50 10 C60 10 72 18 72 30 H86 L80 94 H20 L14 30 H28 Z M34 30 C34 22 42 16 50 16 C58 16 66 22 66 30',
  },
  {
    id: 'cart',
    label: 'Carrito',
    category: 'objetos',
    path: 'M10 18 H22 L30 68 H82 L90 30 H34 M34 78 A6 6 0 1 0 34.1 78 Z M74 78 A6 6 0 1 0 74.1 78 Z M30 68 L82 68',
  },
  {
    id: 'tshirt',
    label: 'Camiseta',
    category: 'objetos',
    path: 'M34 14 L42 8 H58 L66 14 L90 28 L82 40 L72 34 V92 H28 V34 L18 40 L10 28 Z',
  },
  {
    id: 'tag',
    label: 'Etiqueta',
    category: 'objetos',
    path: 'M58 8 L92 42 L50 92 L8 50 L42 8 H58 Z M62 22 A6 6 0 1 1 61.9 22 Z',
  },
  {
    id: 'ticket',
    label: 'Ticket',
    category: 'objetos',
    path: 'M10 28 H70 C70 22 78 22 78 28 H90 V72 H78 C78 78 70 78 70 72 H10 V28 Z',
  },
  {
    id: 'envelope',
    label: 'Sobre',
    category: 'objetos',
    path: 'M8 28 H92 V78 H8 Z M8 28 L50 56 L92 28',
  },
  {
    id: 'phone',
    label: 'Móvil',
    category: 'objetos',
    path: 'M34 6 H66 C72 6 76 10 76 16 V84 C76 90 72 94 66 94 H34 C28 94 24 90 24 84 V16 C24 10 28 6 34 6 Z M44 84 H56',
  },
  {
    id: 'location',
    label: 'Ubicación',
    category: 'objetos',
    path: 'M50 6 C70 6 84 22 84 40 C84 62 50 96 50 96 C50 96 16 62 16 40 C16 22 30 6 50 6 Z M50 28 A14 14 0 1 1 49.9 28 Z',
  },
  {
    id: 'truck',
    label: 'Camión',
    category: 'objetos',
    path: 'M8 36 H58 V78 H8 Z M58 46 H78 L88 60 V78 H58 Z M24 78 A8 8 0 1 0 24.1 78 Z M74 78 A8 8 0 1 0 74.1 78 Z',
  },
  {
    id: 'helmet',
    label: 'Casco',
    category: 'objetos',
    path: 'M20 58 C20 28 36 10 50 10 C64 10 80 28 80 58 H88 V72 H12 V58 H20 Z M28 72 H72 V80 H28 Z',
  },
  {
    id: 'bread',
    label: 'Pan',
    category: 'comida',
    path: 'M18 58 C14 34 30 14 50 14 C70 14 86 34 82 58 C90 62 90 78 78 84 H22 C10 78 10 62 18 58 Z',
  },
  {
    id: 'croissant',
    label: 'Croissant',
    category: 'comida',
    path: 'M16 70 C10 48 22 24 46 18 C70 12 90 28 88 50 C96 54 94 70 82 74 C68 80 40 84 24 78 C16 76 14 74 16 70 Z',
  },
  {
    id: 'cupcake',
    label: 'Cupcake',
    category: 'comida',
    path: 'M30 48 C26 28 40 14 50 14 C60 14 74 28 70 48 H82 L74 92 H26 L18 48 H30 Z M46 8 C50 4 56 8 54 14 C48 12 46 10 46 8 Z',
  },
  {
    id: 'coffee',
    label: 'Taza',
    category: 'comida',
    path: 'M22 28 H70 V68 C70 80 60 88 48 88 H44 C32 88 22 80 22 68 Z M70 36 H80 C88 36 92 44 88 52 C84 58 78 58 70 56 M34 18 C38 12 44 14 46 20 M50 14 C54 8 60 10 62 16',
  },
  {
    id: 'pizza',
    label: 'Pizza',
    category: 'comida',
    path: 'M50 8 L92 88 H8 Z M42 40 A4 4 0 1 0 42.1 40 Z M58 52 A4 4 0 1 0 58.1 52 Z M40 64 A4 4 0 1 0 40.1 64 Z',
  },
  {
    id: 'icecream',
    label: 'Helado',
    category: 'comida',
    path: 'M50 4 C68 4 78 20 74 36 C82 38 84 50 74 52 H26 C16 50 18 38 26 36 C22 20 32 4 50 4 Z M32 52 L50 96 L68 52 Z',
  },
  {
    id: 'burger',
    label: 'Hamburguesa',
    category: 'comida',
    path: 'M20 42 C20 26 34 16 50 16 C66 16 80 26 80 42 H20 Z M16 46 H84 V54 H16 Z M18 58 H82 V66 C82 78 68 86 50 86 C32 86 18 78 18 66 Z',
  },
  {
    id: 'donut',
    label: 'Dona',
    category: 'comida',
    path: 'M50 8 A42 42 0 1 1 49.9 8 Z M50 34 A16 16 0 1 0 50.1 34 Z',
    libraryShape: 'circle',
  },
  {
    id: 'chef-hat',
    label: 'Chef',
    category: 'comida',
    path: 'M28 58 C16 58 12 42 24 36 C20 22 34 12 46 18 C50 8 66 8 70 20 C84 16 92 30 84 40 C94 46 90 58 78 58 H28 Z M32 58 H68 V90 H32 Z',
  },
];

export function getMaskShape(id: string): QrMaskShape {
  return QR_MASK_SHAPES.find((s) => s.id === id) ?? QR_MASK_SHAPES[0];
}

export function shapesByCategory(category: QrShapeCategory | 'todas'): QrMaskShape[] {
  if (category === 'todas') return QR_MASK_SHAPES;
  return QR_MASK_SHAPES.filter((s) => s.category === category);
}

export function shapeMaskCss(path: string | null): string | undefined {
  if (!path) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="black" d="${path}"/></svg>`;
  const encoded = encodeURIComponent(svg).replace(/'/g, '%27');
  return `url("data:image/svg+xml,${encoded}")`;
}
