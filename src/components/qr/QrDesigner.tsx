'use client';

import { useCallback, useRef, useState } from 'react';
import type QRCodeStyling from 'qr-code-styling';
import VolverInicio from '@/components/VolverInicio';
import QrPreview from '@/components/qr/QrPreview';
import ShapeThumb from '@/components/qr/ShapeThumb';
import TemplateThumb from '@/components/qr/TemplateThumb';
import { loadDefaultDesign, saveDefaultDesign } from '@/lib/qr/defaults';
import { QR_MASK_SHAPES, shapesByCategory } from '@/lib/qr/shapes';
import { QR_STICKERS } from '@/lib/qr/stickers';
import { QR_TEMPLATES } from '@/lib/qr/templates';
import {
  DEFAULT_QR_CONFIG,
  SHAPE_CATEGORY_LABELS,
  TEMPLATE_CATEGORY_LABELS,
  type QrDesignConfig,
  type QrShapeCategory,
  type QrTab,
  type QrTemplateCategory,
} from '@/lib/qr/types';

const TABS: { id: QrTab; label: string }[] = [
  { id: 'formas-qr', label: 'FORMAS QR' },
  { id: 'predisennado', label: 'PREDISEÑADO' },
  { id: 'pegatinas', label: 'PEGATINAS' },
  { id: 'color', label: 'COLOR' },
  { id: 'formas', label: 'FORMAS' },
  { id: 'logotipos', label: 'LOGOTIPOS' },
  { id: 'decora', label: 'DECORA TU IMAGEN' },
];

const DOT_TYPES = [
  { id: 'square', label: 'Cuadrado' },
  { id: 'dots', label: 'Puntos' },
  { id: 'rounded', label: 'Redondeado' },
  { id: 'extra-rounded', label: 'Extra redondo' },
  { id: 'classy', label: 'Elegante' },
  { id: 'classy-rounded', label: 'Elegante redondo' },
] as const;

const COLOR_PRESETS = [
  '#16a34a',
  '#c45c26',
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#d97706',
  '#1a1612',
  '#ffffff',
  '#0f172a',
  '#059669',
];

export default function QrDesigner() {
  const [config, setConfig] = useState<QrDesignConfig>(DEFAULT_QR_CONFIG);
  const [activeTab, setActiveTab] = useState<QrTab>('formas-qr');
  const [showMoreTemplates, setShowMoreTemplates] = useState(false);
  const [shapeCategory, setShapeCategory] = useState<QrShapeCategory | 'todas'>('todas');
  const [templateCategory, setTemplateCategory] = useState<QrTemplateCategory | 'todas'>(
    'todas'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  const updateConfig = useCallback((patch: Partial<QrDesignConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyTemplate = (templateId: string) => {
    const template = QR_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setConfig((prev) => ({ ...prev, ...template.config }));
    }
  };

  const applyMask = (shapeId: string) => {
    const shape = QR_MASK_SHAPES.find((s) => s.id === shapeId);
    if (!shape) return;
    setSelectedTemplateId(null);
    updateConfig({
      maskShapeId: shapeId,
      libraryShape: shape.libraryShape ?? 'square',
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateConfig({ logoUrl: url });
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateConfig({ backgroundImageUrl: url });
  };

  const handleDownload = () => {
    qrInstanceRef.current?.download({ name: 'codigo-qr-panpaya', extension: 'png' });
  };

  const handleReset = () => {
    setSelectedTemplateId(null);
    setConfig(DEFAULT_QR_CONFIG);
  };

  const handleSaveDefault = () => {
    saveDefaultDesign(config);
  };

  const handleApplyDefault = () => {
    const saved = loadDefaultDesign();
    if (saved) setConfig((prev) => ({ ...prev, ...saved }));
  };

  const filteredShapes = shapesByCategory(shapeCategory);
  const filteredTemplates =
    templateCategory === 'todas'
      ? QR_TEMPLATES
      : QR_TEMPLATES.filter((t) => t.category === templateCategory);
  const visibleTemplates = showMoreTemplates
    ? filteredTemplates
    : filteredTemplates.slice(0, 12);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'formas-qr':
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setShapeCategory('todas')}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  shapeCategory === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({QR_MASK_SHAPES.length})
              </button>
              {(Object.keys(SHAPE_CATEGORY_LABELS) as QrShapeCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setShapeCategory(cat)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    shapeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {SHAPE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="grid max-h-[26rem] grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
              {filteredShapes.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => applyMask(shape.id)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border-2 p-1.5 transition hover:border-blue-400 ${
                    config.maskShapeId === shape.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-slate-200 bg-white'
                  }`}
                  title={shape.label}
                >
                  <ShapeThumb
                    shapeId={shape.id}
                    color={config.maskShapeId === shape.id ? config.dotColor : '#475569'}
                    size={44}
                  />
                  <span className="mt-0.5 line-clamp-1 text-[9px] font-medium text-slate-600">
                    {shape.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'predisennado':
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Plantillas Predefinidas</h3>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTemplateCategory('todas');
                  setShowMoreTemplates(false);
                }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  templateCategory === 'todas'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todas ({QR_TEMPLATES.length})
              </button>
              {(Object.keys(TEMPLATE_CATEGORY_LABELS) as QrTemplateCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setTemplateCategory(cat);
                    setShowMoreTemplates(false);
                  }}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    templateCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {TEMPLATE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
            <div className="grid max-h-[26rem] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
              {visibleTemplates.map((tpl) => (
                <TemplateThumb
                  key={tpl.id}
                  config={tpl.config}
                  label={tpl.label}
                  selected={selectedTemplateId === tpl.id}
                  onClick={() => applyTemplate(tpl.id)}
                />
              ))}
            </div>
            {filteredTemplates.length > 12 && (
              <button
                type="button"
                onClick={() => setShowMoreTemplates((v) => !v)}
                className="w-full text-center text-sm font-medium text-blue-600 hover:underline"
              >
                {showMoreTemplates
                  ? 'Ver menos'
                  : `Ver más (${filteredTemplates.length - 12})`}
              </button>
            )}
          </div>
        );

      case 'pegatinas':
        return (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {QR_STICKERS.map((sticker) => (
              <button
                key={sticker.id}
                type="button"
                onClick={() => updateConfig({ stickerId: sticker.id })}
                className={`flex aspect-square flex-col items-center justify-center rounded-lg border-2 p-2 text-2xl transition hover:border-blue-400 ${
                  config.stickerId === sticker.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white'
                }`}
                title={sticker.label}
              >
                {sticker.emoji}
                <span className="mt-1 text-[10px] text-slate-500">{sticker.label}</span>
              </button>
            ))}
          </div>
        );

      case 'color':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Color del QR
              </label>
              <div className="mb-2 flex flex-wrap gap-2">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateConfig({ dotColor: color })}
                    className={`h-8 w-8 rounded-full border-2 transition hover:scale-110 ${
                      config.dotColor === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={config.dotColor}
                onChange={(e) => updateConfig({ dotColor: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Color de fondo
              </label>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => updateConfig({ backgroundColor: 'transparent' })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    config.backgroundColor === 'transparent'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Transparente
                </button>
                <button
                  type="button"
                  onClick={() => updateConfig({ backgroundColor: '#ffffff' })}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                    config.backgroundColor === '#ffffff'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  Blanco
                </button>
              </div>
              <input
                type="color"
                value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
                onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                className="h-10 w-full cursor-pointer rounded-lg border border-slate-200"
              />
            </div>
          </div>
        );

      case 'formas':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estilo de puntos
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DOT_TYPES.map((dot) => (
                  <button
                    key={dot.id}
                    type="button"
                    onClick={() => updateConfig({ dotType: dot.id })}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      config.dotType === dot.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {dot.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Esquinas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['square', 'dot', 'extra-rounded', 'rounded'] as const).map((corner) => (
                  <button
                    key={corner}
                    type="button"
                    onClick={() =>
                      updateConfig({
                        cornerSquareType: corner,
                        cornerDotType: corner === 'dot' ? 'dot' : 'square',
                      })
                    }
                    className={`rounded-lg border px-3 py-2 text-xs font-medium capitalize transition ${
                      config.cornerSquareType === corner
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    {corner}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'logotipos':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Sube un logotipo para colocarlo en el centro del código QR. Se recomienda PNG con fondo
              transparente.
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-blue-400 hover:bg-blue-50/50">
              <span className="mb-2 text-3xl">🖼️</span>
              <span className="text-sm font-medium text-slate-700">Seleccionar logotipo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
            {config.logoUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={config.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg border border-slate-200 object-contain bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => updateConfig({ logoUrl: null })}
                  className="text-sm text-red-600 hover:underline"
                >
                  Quitar logotipo
                </button>
              </div>
            )}
          </div>
        );

      case 'decora':
        return (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Añade una imagen de fondo detrás del código QR para crear un diseño decorativo.
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-blue-400 hover:bg-blue-50/50">
              <span className="mb-2 text-3xl">🎨</span>
              <span className="text-sm font-medium text-slate-700">Subir imagen de fondo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBackgroundUpload}
              />
            </label>
            {config.backgroundImageUrl && (
              <div className="flex items-center gap-3">
                <img
                  src={config.backgroundImageUrl}
                  alt="Fondo"
                  className="h-16 w-16 rounded-lg border border-slate-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => updateConfig({ backgroundImageUrl: null })}
                  className="text-sm text-red-600 hover:underline"
                >
                  Quitar imagen
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Personalizar código QR</h1>
            <p className="text-sm text-slate-500">Diseña códigos QR artísticos para Pan Pa Ya</p>
          </div>
          <VolverInicio className="!border-slate-200 !bg-slate-100 !text-slate-700 hover:!text-slate-900" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Contenido del QR (URL o texto)
          </label>
          <input
            type="text"
            value={config.data}
            onChange={(e) => updateConfig({ data: e.target.value })}
            placeholder="https://ejemplo.com o texto"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <div className="mb-4 overflow-x-auto">
          <div className="flex min-w-max gap-1 border-b border-slate-200">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-3 py-2.5 text-xs font-bold tracking-wide transition ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {renderTabContent()}
          </section>

          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
              Vista previa
            </h2>

            <div
              className="mx-auto flex flex-1 items-center justify-center rounded-2xl p-6"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                backgroundColor: '#f1f5f9',
              }}
            >
              <QrPreview
                config={config}
                size={280}
                onReady={(instance) => {
                  qrInstanceRef.current = instance;
                }}
              />
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={config.effect3d}
                  onChange={(e) => updateConfig({ effect3d: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Agregar efecto 3D
              </label>

              <div className="flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  onClick={handleSaveDefault}
                  className="text-blue-600 hover:underline"
                >
                  Establecer como diseño predeterminado
                </button>
                <button
                  type="button"
                  onClick={handleApplyDefault}
                  className="text-blue-600 hover:underline"
                >
                  Aplicar predeterminado
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-slate-500 hover:underline"
                >
                  Restablecer
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownload}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                Descargar PNG
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
