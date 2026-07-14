import type { QrSticker } from './types';

export const QR_STICKERS: QrSticker[] = [
  { id: 'none', label: 'Sin pegatina', emoji: '✕' },
  { id: 'scan', label: 'Scan me', emoji: '📲', cta: 'SCAN ME' },
  { id: 'gift', label: 'Regalo', emoji: '🎁', cta: 'OPEN ME' },
  { id: 'party', label: 'Fiesta', emoji: '🎉', cta: 'PARTY' },
  { id: 'food', label: 'Pan', emoji: '🍞', cta: 'PEDIR' },
  { id: 'coffee', label: 'Café', emoji: '☕', cta: 'COFFEE' },
  { id: 'flower', label: 'Flores', emoji: '🌸' },
  { id: 'star', label: 'Estrella', emoji: '✨', cta: 'NEW' },
  { id: 'heart', label: 'Amor', emoji: '💕', cta: 'LOVE' },
  { id: 'sale', label: 'Oferta', emoji: '🏷️', cta: '% OFF' },
  { id: 'chef', label: 'Chef', emoji: '👨‍🍳', cta: 'MENÚ' },
  { id: 'truck', label: 'Envío', emoji: '🚚', cta: 'ENVÍO' },
  { id: 'wifi', label: 'WiFi', emoji: '📶', cta: 'WIFI' },
  { id: 'map', label: 'Mapa', emoji: '📍', cta: 'MAPA' },
  { id: 'promo', label: 'Promo', emoji: '🔥', cta: 'PROMO' },
  { id: 'info', label: 'Info', emoji: 'ℹ️', cta: 'INFO' },
];
