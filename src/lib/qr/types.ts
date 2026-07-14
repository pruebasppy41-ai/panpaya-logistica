export type QrTab =
  | 'formas-qr'
  | 'predisennado'
  | 'pegatinas'
  | 'color'
  | 'formas'
  | 'logotipos'
  | 'decora';

export type QrDotType =
  | 'dots'
  | 'rounded'
  | 'classy'
  | 'classy-rounded'
  | 'square'
  | 'extra-rounded';

export type QrCornerDotType = 'dot' | 'square' | QrDotType;
export type QrCornerSquareType = 'dot' | 'square' | 'extra-rounded' | QrDotType;
export type QrLibraryShape = 'square' | 'circle';

export interface QrMaskShape {
  id: string;
  label: string;
  icon: string;
  clipPath: string;
  libraryShape?: QrLibraryShape;
}

export interface QrSticker {
  id: string;
  label: string;
  emoji: string;
}

export interface QrTemplate {
  id: string;
  label: string;
  preview: string;
  config: Partial<QrDesignConfig>;
}

export interface QrDesignConfig {
  data: string;
  dotColor: string;
  backgroundColor: string;
  dotType: QrDotType;
  cornerSquareType: QrCornerSquareType;
  cornerDotType: QrCornerDotType;
  libraryShape: QrLibraryShape;
  maskShapeId: string;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  stickerId: string | null;
  effect3d: boolean;
}

export const DEFAULT_QR_CONFIG: QrDesignConfig = {
  data: 'https://panpaya.com',
  dotColor: '#16a34a',
  backgroundColor: 'transparent',
  dotType: 'rounded',
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  libraryShape: 'square',
  maskShapeId: 'none',
  logoUrl: null,
  backgroundImageUrl: null,
  stickerId: null,
  effect3d: false,
};

export const STORAGE_KEY = 'panpaya-qr-default-design';
