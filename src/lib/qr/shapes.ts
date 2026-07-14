import type { QrMaskShape } from './types';

export const QR_MASK_SHAPES: QrMaskShape[] = [
  { id: 'none', label: 'Cuadrado', icon: '⬜', clipPath: 'none', libraryShape: 'square' },
  { id: 'circle', label: 'Círculo', icon: '⚪', clipPath: 'circle(50% at 50% 50%)', libraryShape: 'circle' },
  {
    id: 'heart',
    label: 'Corazón',
    icon: '❤️',
    clipPath:
      'polygon(50% 90%, 10% 45%, 10% 25%, 25% 10%, 50% 30%, 75% 10%, 90% 25%, 90% 45%)',
  },
  {
    id: 'hexagon',
    label: 'Hexágono',
    icon: '⬡',
    clipPath: 'polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)',
  },
  {
    id: 'star',
    label: 'Estrella',
    icon: '⭐',
    clipPath:
      'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  },
  {
    id: 'leaf',
    label: 'Hoja',
    icon: '🍃',
    clipPath:
      'path("M50 5 C75 15, 95 40, 90 70 C85 90, 60 98, 50 95 C40 98, 15 90, 10 70 C5 40, 25 15, 50 5 Z")',
  },
  {
    id: 'diamond',
    label: 'Diamante',
    icon: '💎',
    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  },
  {
    id: 'shield',
    label: 'Escudo',
    icon: '🛡️',
    clipPath: 'polygon(50% 0%, 100% 15%, 100% 60%, 50% 100%, 0% 60%, 0% 15%)',
  },
  {
    id: 'bag',
    label: 'Bolsa',
    icon: '🛍️',
    clipPath: 'polygon(15% 25%, 85% 25%, 95% 100%, 5% 100%)',
  },
  {
    id: 'bulb',
    label: 'Bombilla',
    icon: '💡',
    clipPath: 'ellipse(50% 45% at 50% 45%)',
  },
  {
    id: 'tshirt',
    label: 'Camiseta',
    icon: '👕',
    clipPath: 'polygon(20% 20%, 35% 5%, 50% 15%, 65% 5%, 80% 20%, 95% 25%, 90% 100%, 10% 100%, 5% 25%)',
  },
  {
    id: 'thumb',
    label: 'Me gusta',
    icon: '👍',
    clipPath: 'polygon(30% 0%, 70% 0%, 90% 30%, 90% 70%, 70% 100%, 30% 100%, 10% 70%, 10% 30%)',
  },
];

export function getMaskShape(id: string): QrMaskShape {
  return QR_MASK_SHAPES.find((s) => s.id === id) ?? QR_MASK_SHAPES[0];
}
