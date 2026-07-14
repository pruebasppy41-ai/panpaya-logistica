'use client';

import { useEffect, useRef } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import type { QrDesignConfig } from '@/lib/qr/types';
import { getMaskShape, shapeMaskCss } from '@/lib/qr/shapes';
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
        margin: mask.path ? 4 : 8,
        image: config.logoUrl || undefined,
        qrOptions: {
          errorCorrectionLevel: 'H' as const,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 6,
          imageSize: 0.32,
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
  const maskImage = shapeMaskCss(mask.path);
  const maskStyle = maskImage
    ? {
        WebkitMaskImage: maskImage,
        maskImage: maskImage,
        WebkitMaskSize: '100% 100%',
        maskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
      }
    : {};

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
        className={`relative ${config.effect3d ? 'qr-effect-3d' : ''}`}
        style={{
          width: size,
          height: size,
          ...maskStyle,
        }}
      >
        <div ref={containerRef} className="h-full w-full" />
      </div>

      {sticker && sticker.id !== 'none' && (
        <div className="pointer-events-none absolute -bottom-3 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 shadow-md">
            <span className="text-lg leading-none" aria-hidden>
              {sticker.emoji}
            </span>
            {sticker.cta && (
              <span className="text-[10px] font-bold tracking-wide text-slate-700">
                {sticker.cta}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
