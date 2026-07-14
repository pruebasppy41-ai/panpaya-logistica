import { DEFAULT_QR_CONFIG, STORAGE_KEY, type QrDesignConfig } from './types';

export function loadDefaultDesign(): QrDesignConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return { ...DEFAULT_QR_CONFIG, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function saveDefaultDesign(config: QrDesignConfig): void {
  if (typeof window === 'undefined') return;
  const { data: _data, ...rest } = config;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
}
