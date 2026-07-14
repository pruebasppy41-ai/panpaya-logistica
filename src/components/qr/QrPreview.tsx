'use client';

import { useEffect, useRef } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import type { QrDesignConfig } from '@/lib/qr/types';
import { getMaskShape } from '@/lib/qr/shapes';
import { QR_STICKERS } from '@/lib/qr/stickers';

interface QrPreviewProps {
  config: QrDesignConfig;
  size?: number;
  onReady?: (instance: QRCodeStyling) => void;
}

export default function QrPreview({ config, size = 320, onReady }: QrPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    let cancelled = false;
    const onReadyRef = onReady;

    async function renderQr() {
      const QRCodeStylingModule = (await import('qr-code-styling')).default;
      if (cancelled || !containerRef.current) return;

      const mask = getMaskShape(config.maskShapeId);
      const libraryShape = mask.libraryShape ?? config.libraryShape;

      const options = {
        width: size,
        height: size,
        type: 'canvas' as const,
        shape: libraryShape,
        data: config.data || 'https://panpaya.com',
        margin: 8,
        image: config.logoUrl || undefined,
        qrOptions: {
          errorCorrectionLevel: 'H' as const,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 6,
          imageSize: 0.35,
          hideBackgroundDots: true,
        },
        dotsOptions: {
          type: config.dotType,
          color: config.dotColor,
        },
        cornersSquareOptions: {
          type: config.cornerSquareType,
          color: config.dotColor,
        },
        cornersDotOptions: {
          type: config.cornerDotType,
          color: config.dotColor,
        },
        backgroundOptions: {
          color:
            config.backgroundColor === 'transparent'
              ? 'rgba(255,255,255,0)'
              : config.backgroundColor,
        },
      };

      if (!qrRef.current) {
        qrRef.current = new QRCodeStylingModule(options);
        containerRef.current.innerHTML = '';
        qrRef.current.append(containerRef.current);
        onReadyRef?.(qrRef.current);
      } else {
        qrRef.current.update(options);
      }
    }

    renderQr();

    return () => {
      cancelled = true;
    };
  }, [config, size]);

  const mask = getMaskShape(config.maskShapeId);
  const sticker = QR_STICKERS.find((s) => s.id === config.stickerId);
  const clipStyle =
    mask.clipPath !== 'none' ? { clipPath: mask.clipPath, WebkitClipPath: mask.clipPath } : {};

  return (
    <div className="relative flex items-center justify-center">
      {config.backgroundImageUrl && (
        <img
          src={config.backgroundImageUrl}
          alt=""
          className="absolute inset-0 h-full w-full rounded-2xl object-cover"
          style={{ width: size + 48, height: size + 48 }}
        />
      )}

      <div
        className={`relative overflow-hidden ${config.effect3d ? 'qr-effect-3d' : ''}`}
        style={{
          width: size,
          height: size,
          ...clipStyle,
        }}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {sticker && sticker.id !== 'none' && (
        <div
          className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-2xl shadow-md"
          aria-hidden
        >
          {sticker.emoji}
        </div>
      )}
    </div>
  );
}
