'use client';

import { useId } from 'react';
import { getMaskShape } from '@/lib/qr/shapes';

interface ShapeThumbProps {
  shapeId: string;
  color?: string;
  className?: string;
  size?: number;
}

export default function ShapeThumb({
  shapeId,
  color = '#334155',
  className = '',
  size = 48,
}: ShapeThumbProps) {
  const uid = useId().replace(/:/g, '');
  const shape = getMaskShape(shapeId);
  const patternId = `dot-${uid}`;
  const clipId = `clip-${uid}`;

  if (!shape.path) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={className}
        aria-hidden
      >
        <rect x="10" y="10" width="80" height="80" rx="6" fill={color} />
        <g fill="#fff" opacity="0.45">
          <rect x="18" y="18" width="16" height="16" rx="1" />
          <rect x="66" y="18" width="16" height="16" rx="1" />
          <rect x="18" y="66" width="16" height="16" rx="1" />
          <circle cx="42" cy="42" r="3" />
          <circle cx="54" cy="42" r="3" />
          <circle cx="42" cy="54" r="3" />
          <circle cx="54" cy="54" r="3" />
          <circle cx="66" cy="54" r="3" />
          <circle cx="54" cy="66" r="3" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden
    >
      <defs>
        <pattern id={patternId} width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2.2" fill="#fff" opacity="0.55" />
        </pattern>
        <clipPath id={clipId}>
          <path d={shape.path} />
        </clipPath>
      </defs>
      <path d={shape.path} fill={color} />
      <rect width="100" height="100" fill={`url(#${patternId})`} clipPath={`url(#${clipId})`} />
    </svg>
  );
}
