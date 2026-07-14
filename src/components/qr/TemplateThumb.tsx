'use client';

import { getMaskShape } from '@/lib/qr/shapes';
import { QR_STICKERS } from '@/lib/qr/stickers';
import type { QrDesignConfig } from '@/lib/qr/types';
import ShapeThumb from '@/components/qr/ShapeThumb';

interface TemplateThumbProps {
  config: Partial<QrDesignConfig>;
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

export default function TemplateThumb({
  config,
  label,
  selected = false,
  onClick,
}: TemplateThumbProps) {
  const shapeId = config.maskShapeId ?? 'none';
  const color = config.dotColor ?? '#1a1612';
  const bg =
    !config.backgroundColor || config.backgroundColor === 'transparent'
      ? '#f1f5f9'
      : config.backgroundColor;
  const sticker = QR_STICKERS.find((s) => s.id === config.stickerId && s.id !== 'none');
  const shape = getMaskShape(shapeId);

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border-2 p-2 transition hover:shadow-md ${
        selected
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-slate-200 bg-white hover:border-blue-300'
      }`}
    >
      <div
        className="relative flex h-[72%] w-[72%] items-center justify-center rounded-lg"
        style={{ backgroundColor: bg }}
      >
        <ShapeThumb
          shapeId={shapeId}
          color={color}
          size={56}
          className={config.effect3d ? 'drop-shadow-md' : ''}
        />
        {sticker && (
          <span className="absolute -bottom-1 text-sm leading-none" aria-hidden>
            {sticker.emoji}
          </span>
        )}
      </div>
      <span className="mt-1 line-clamp-1 text-[10px] font-medium text-slate-600">
        {label}
      </span>
      {shape.category === 'comida' && (
        <span className="sr-only">Categoría comida</span>
      )}
    </button>
  );
}
