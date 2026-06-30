import { useMemo, useState } from 'react';
import type { DragEvent } from 'react';

import {
  calculateDesignEngineDemo,
  createDemoModuleFromTemplate,
  createWhatsApp3070DemoForm,
  DEFAULT_DESIGN_ENGINE_DEMO_FORM,
  DEMO_MODULE_LIBRARY,
  DEMO_PRELIMINARY_NOTE,
  updateDemoSelectedModuleWidth,
} from './demoCalculator';
import { Simple3DViewer } from './Simple3DViewer';
import type {
  DemoModuleComposition,
  DemoModuleCompositionStatus,
  DemoModuleTemplate,
  DemoSelectedBaseModule,
  DesignEngineDemoForm,
} from './types';

type NumberField = {
  [Key in keyof DesignEngineDemoForm]: DesignEngineDemoForm[Key] extends number ? Key : never;
}[keyof DesignEngineDemoForm];

type BooleanField = {
  [Key in keyof DesignEngineDemoForm]: DesignEngineDemoForm[Key] extends boolean ? Key : never;
}[keyof DesignEngineDemoForm];

const pageStyle = {
  color: '#1f2933',
  fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  lineHeight: 1.5,
  margin: '0 auto',
  maxWidth: '1180px',
  padding: '32px 20px 56px',
};

const gridStyle = {
  display: 'grid',
  gap: '16px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
};

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #d9e2ec',
  borderRadius: '16px',
  boxShadow: '0 8px 28px rgb(15 23 42 / 8%)',
  padding: '18px',
};

const inputStyle = {
  border: '1px solid #bcccdc',
  borderRadius: '10px',
  font: 'inherit',
  marginTop: '6px',
  padding: '9px 10px',
  width: '100%',
};

const tableWrapperStyle = {
  overflowX: 'auto' as const,
};

const tableStyle = {
  borderCollapse: 'collapse' as const,
  minWidth: '920px',
  width: '100%',
};

export function DesignEngineDemo() {
  const [form, setForm] = useState<DesignEngineDemoForm>(DEFAULT_DESIGN_ENGINE_DEMO_FORM);
  const result = useMemo(() => calculateDesignEngineDemo(form), [form]);
  const modulesWidthMm = result.moduleComposition.selectedWidthMm;
  const modulesDifferenceMm = result.moduleComposition.differenceMm;

  function updateNumberField(field: NumberField, value: string): void {
    setForm((current) => {
      const nextForm = {
        ...current,
        [field]: Number(value),
      };

      return syncSelectedModulesWithInternalFields(nextForm, field);
    });
  }

  function updateBooleanField(field: BooleanField, value: boolean): void {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function loadWhatsApp3070Preset(): void {
    setForm((current) => createWhatsApp3070DemoForm(current));
  }

  function addTemplateToWall(templateCode: string): void {
    setForm((current) => ({
      ...current,
      selectedBaseModules: [
        ...current.selectedBaseModules,
        createDemoModuleFromTemplate(templateCode, current.selectedBaseModules.length + 1),
      ],
    }));
  }

  function updateModuleInstanceWidth(moduleCode: string, value: string): void {
    setForm((current) => ({
      ...current,
      selectedBaseModules: current.selectedBaseModules.map((module) =>
        module.code === moduleCode ? updateDemoSelectedModuleWidth(module, Number(value)) : module,
      ),
    }));
  }

  function moveModuleInstance(moduleCode: string, direction: -1 | 1): void {
    setForm((current) => {
      const currentIndex = current.selectedBaseModules.findIndex(
        (module) => module.code === moduleCode,
      );
      const nextIndex = currentIndex + direction;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= current.selectedBaseModules.length) {
        return current;
      }

      const selectedBaseModules = [...current.selectedBaseModules];
      const [moduleToMove] = selectedBaseModules.splice(currentIndex, 1);

      if (!moduleToMove) {
        return current;
      }

      selectedBaseModules.splice(nextIndex, 0, moduleToMove);

      return {
        ...current,
        selectedBaseModules,
      };
    });
  }

  function removeModuleInstance(moduleCode: string): void {
    setForm((current) => ({
      ...current,
      selectedBaseModules: current.selectedBaseModules.filter(
        (module) => module.code !== moduleCode,
      ),
    }));
  }

  return (
    <main style={pageStyle}>
      <p
        style={{
          color: '#9f580a',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        Demo interna beta
      </p>
      <h1>Demo Rubik OS - Bajo Mesada</h1>
      <p>
        Prueba visual del Motor de Diseño Rubik v0. No guarda datos, no envía piezas a proveedor y
        no aprueba corte automáticamente.
      </p>

      <section aria-labelledby="form-title" style={{ ...cardStyle, marginBottom: '20px' }}>
        <h2 id="form-title">Datos de entrada</h2>
        <div style={gridStyle}>
          <NumberInput
            label="Ancho mueble (mm)"
            value={form.widthMm}
            onChange={(value) => updateNumberField('widthMm', value)}
          />
          <NumberInput
            label="Alto mueble (mm)"
            value={form.heightMm}
            onChange={(value) => updateNumberField('heightMm', value)}
          />
          <NumberInput
            label="Profundidad (mm)"
            value={form.depthMm}
            onChange={(value) => updateNumberField('depthMm', value)}
          />
          <NumberInput
            label="Espesor melamina (mm)"
            value={form.materialThicknessMm}
            onChange={(value) => updateNumberField('materialThicknessMm', value)}
          />
          <NumberInput
            label="Espesor fondo (mm)"
            value={form.backPanelThicknessMm}
            onChange={(value) => updateNumberField('backPanelThicknessMm', value)}
          />
          {form.hasToeKick ? (
            <NumberInput
              helperText="Valor orientativo Rubik: 100 mm. Para banquina/zócalo, revisar rango 120 a 150 mm según criterio de obra."
              label="Alto zócalo (mm)"
              value={form.toeKickHeightMm}
              onChange={(value) => updateNumberField('toeKickHeightMm', value)}
            />
          ) : (
            <p style={{ color: '#52606d', margin: 0 }}>Sin zócalo: altura tomada como 0 mm.</p>
          )}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '14px' }}>
          <CheckboxInput
            checked={form.hasBackPanel}
            label="Incluir fondo"
            onChange={(checked) => updateBooleanField('hasBackPanel', checked)}
          />
          <CheckboxInput
            checked={form.hasToeKick}
            label="Incluir zócalo"
            onChange={(checked) => updateBooleanField('hasToeKick', checked)}
          />
        </div>
      </section>

      <section aria-labelledby="modules-title" style={{ ...cardStyle, marginBottom: '20px' }}>
        <h2 id="modules-title">Módulos internos del bajo mesada</h2>
        <p>
          Estos módulos son las divisiones internas que componen el ancho total del bajo mesada. La
          suma de los módulos debe coincidir con el ancho total del mueble.
        </p>
        <ul>
          <li>Datos de entrada = estructura total del mueble.</li>
          <li>Módulos internos = divisiones dentro de esa estructura.</li>
          <li>Puertas/cajones/frentes = piezas que nacen de cada módulo.</li>
          <li>Si cambia el módulo, cambian las piezas.</li>
          <li>Si cambia el ancho total, debe revisarse la suma de módulos.</li>
        </ul>
        <ModulesWidthStatus
          differenceMm={modulesDifferenceMm}
          modulesWidthMm={modulesWidthMm}
          widthMm={form.widthMm}
        />
        <div style={gridStyle}>
          <NumberInput
            label="Ancho módulo de puertas (mm)"
            value={form.doorModuleWidthMm}
            onChange={(value) => updateNumberField('doorModuleWidthMm', value)}
          />
          <NumberInput
            label="Cantidad de puertas"
            value={form.doorCount}
            onChange={(value) => updateNumberField('doorCount', value)}
          />
          <NumberInput
            label="Cantidad de estantes"
            value={form.shelfCount}
            onChange={(value) => updateNumberField('shelfCount', value)}
          />
          <NumberInput
            label="Ancho módulo cajonera (mm)"
            value={form.drawerModuleWidthMm}
            onChange={(value) => updateNumberField('drawerModuleWidthMm', value)}
          />
          <NumberInput
            label="Cantidad de cajones"
            value={form.drawerCount}
            onChange={(value) => updateNumberField('drawerCount', value)}
          />
        </div>
      </section>

      <SmartModuleLibrarySection
        availableWidthMm={form.widthMm}
        composition={result.moduleComposition}
        modules={form.selectedBaseModules}
        templates={DEMO_MODULE_LIBRARY}
        onAddTemplate={addTemplateToWall}
        onMoveModule={moveModuleInstance}
        onRemoveModule={removeModuleInstance}
        onUpdateModuleWidth={updateModuleInstanceWidth}
      />

      <BaseModuleCatalogSection
        composition={result.moduleComposition}
        measurementWarning={form.measurementWarning}
        modules={form.selectedBaseModules}
        onLoadPreset={loadWhatsApp3070Preset}
      />

      <section aria-labelledby="quote-title" style={{ ...cardStyle, marginBottom: '20px' }}>
        <h2 id="quote-title">Datos de cotización</h2>
        <div style={gridStyle}>
          <NumberInput
            label="Precio placa ARS"
            value={form.boardPriceArs}
            onChange={(value) => updateNumberField('boardPriceArs', value)}
          />
          <NumberInput
            label="Ancho placa (mm)"
            value={form.boardWidthMm}
            onChange={(value) => updateNumberField('boardWidthMm', value)}
          />
          <NumberInput
            label="Largo placa (mm)"
            value={form.boardLengthMm}
            onChange={(value) => updateNumberField('boardLengthMm', value)}
          />
          <NumberInput
            label="Precio canto ARS/m"
            value={form.edgeBandPriceArsPerMeter}
            onChange={(value) => updateNumberField('edgeBandPriceArsPerMeter', value)}
          />
          <NumberInput
            label="Subtotal herrajes ARS"
            value={form.hardwareSubtotalArs}
            onChange={(value) => updateNumberField('hardwareSubtotalArs', value)}
          />
          <NumberInput
            label="Subtotal servicios ARS"
            value={form.servicesSubtotalArs}
            onChange={(value) => updateNumberField('servicesSubtotalArs', value)}
          />
          <NumberInput
            label="Subtotal mano de obra ARS"
            value={form.laborSubtotalArs}
            onChange={(value) => updateNumberField('laborSubtotalArs', value)}
          />
          <NumberInput
            label="Merma %"
            value={form.wastePercentage}
            onChange={(value) => updateNumberField('wastePercentage', value)}
          />
          <NumberInput
            label="Margen %"
            value={form.marginPercentage}
            onChange={(value) => updateNumberField('marginPercentage', value)}
          />
          <NumberInput
            label="Seña %"
            value={form.depositPercentage}
            onChange={(value) => updateNumberField('depositPercentage', value)}
          />
          <label>
            Moneda
            <select
              style={inputStyle}
              value={form.currency}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  currency: event.target.value === 'USD' ? 'USD' : 'ARS',
                }))
              }
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <NumberInput
            label="Dólar blue venta manual"
            value={form.exchangeRateSell}
            onChange={(value) => updateNumberField('exchangeRateSell', value)}
          />
        </div>
      </section>

      <Simple3DViewer model={result.viewer3d} />

      {result.errors.length > 0 ? (
        <Notice title="Revisar datos" items={result.errors} tone="error" />
      ) : (
        <>
          <section aria-labelledby="summary-title" style={{ ...cardStyle, marginBottom: '20px' }}>
            <h2 id="summary-title">Resumen del diseño</h2>
            <div style={gridStyle}>
              <Metric label="Piezas generadas" value={String(result.pieces.length)} />
              <Metric
                label="Superficie placa usada"
                value={`${formatNumber(result.materialSurfaceM2)} m²`}
              />
              <Metric label="Placas estimadas" value={formatNumber(result.estimatedBoards)} />
              <Metric
                label="Metros lineales de canto"
                value={`${formatNumber(result.edgeBandLinearMeters)} m`}
              />
              <Metric label="Costo material" value={formatCurrency(result.materialCostArs)} />
              <Metric label="Costo canto" value={formatCurrency(result.edgeBandCostArs)} />
              <Metric label="Total preliminar ARS" value={formatCurrency(result.totals.totalArs)} />
              <Metric label="Seña ARS" value={formatCurrency(result.totals.depositArs)} />
              {result.totals.totalUsd !== null ? (
                <Metric
                  label="Total preliminar USD"
                  value={`USD ${formatNumber(result.totals.totalUsd)}`}
                />
              ) : null}
              {result.totals.depositUsd !== null ? (
                <Metric label="Seña USD" value={`USD ${formatNumber(result.totals.depositUsd)}`} />
              ) : null}
            </div>
          </section>

          {result.warnings.length > 0 ? (
            <Notice title="Warnings del diseño" items={result.warnings} tone="warning" />
          ) : null}

          <PiecesTable pieces={result.pieces} title="Lista de piezas generadas" />
          <CutlistTable items={result.cutlistItems} />
        </>
      )}

      <section
        aria-label="Notas de demo"
        style={{ ...cardStyle, background: '#fff7ed', borderColor: '#fdba74' }}
      >
        <h2>Notas</h2>
        <p style={{ fontWeight: 700 }}>{DEMO_PRELIMINARY_NOTE}</p>
        <p>
          Esta pantalla es una demo interna/beta. No guarda en base de datos, no envía a proveedor y
          no marca piezas como aprobadas para corte.
        </p>
      </section>
    </main>
  );
}

function SmartModuleLibrarySection({
  availableWidthMm,
  composition,
  modules,
  templates,
  onAddTemplate,
  onMoveModule,
  onRemoveModule,
  onUpdateModuleWidth,
}: {
  availableWidthMm: number;
  composition: DemoModuleComposition;
  modules: DemoSelectedBaseModule[];
  templates: readonly DemoModuleTemplate[];
  onAddTemplate: (templateCode: string) => void;
  onMoveModule: (moduleCode: string, direction: -1 | 1) => void;
  onRemoveModule: (moduleCode: string) => void;
  onUpdateModuleWidth: (moduleCode: string, value: string) => void;
}) {
  const [selectedModuleCode, setSelectedModuleCode] = useState<string>(modules[0]?.code ?? '');
  const remainingMm = Math.max(availableWidthMm - composition.selectedWidthMm, 0);
  const overflowMm = Math.max(composition.selectedWidthMm - availableWidthMm, 0);
  const automaticNotes = modules.flatMap((module) => module.autoAdjustmentNotes ?? []);
  const selectedModule =
    modules.find((module) => module.code === selectedModuleCode) ?? modules[0] ?? null;
  const selectedModuleIndex = selectedModule
    ? modules.findIndex((module) => module.code === selectedModule.code)
    : -1;
  const rulerMarks = Array.from({ length: Math.floor(availableWidthMm / 600) + 1 }, (_, index) => {
    const value = index * 600;

    return {
      label: `${formatNumber(value)} mm`,
      left: `${Math.min((value / Math.max(availableWidthMm, 1)) * 100, 100)}%`,
    };
  });

  function handleAddTemplate(templateCode: string): void {
    onAddTemplate(templateCode);
    window.setTimeout(() => {
      const latestIndex = modules.length + 1;
      const template = templates.find((item) => item.templateCode === templateCode);

      if (template) {
        setSelectedModuleCode(`${template.templateCode}-${latestIndex}`);
      }
    }, 0);
  }

  function handleDrop(event: DragEvent<HTMLElement>): void {
    event.preventDefault();

    const templateCode = event.dataTransfer.getData('application/x-rubik-module-template');

    if (templateCode) {
      handleAddTemplate(templateCode);
    }
  }

  return (
    <section aria-labelledby="smart-library-title" style={{ ...cardStyle, marginBottom: '20px' }}>
      <h2 id="smart-library-title">Biblioteca de módulos inteligentes</h2>
      <p>
        Armado modular tipo Tetris: elegí módulos estándar ya inteligentes, agregalos a la pared y
        ajustá principalmente el ancho o accesorios. La plantilla recalcula puertas, estantes,
        reglas constructivas y avisos técnicos.
      </p>
      <div style={gridStyle}>
        <Metric label="Pared / espacio disponible" value={`${formatNumber(availableWidthMm)} mm`} />
        <Metric label="Espacio usado" value={`${formatNumber(composition.selectedWidthMm)} mm`} />
        <Metric label="Espacio restante" value={`${formatNumber(remainingMm)} mm`} />
        <Metric label="Exceso" value={`${formatNumber(overflowMm)} mm`} />
      </div>

      <div
        style={{
          display: 'grid',
          gap: '18px',
          gridTemplateColumns: 'minmax(260px, 340px) minmax(420px, 1fr)',
          marginTop: '18px',
        }}
      >
        <section aria-labelledby="visual-catalog-title">
          <h3 id="visual-catalog-title">Catálogo visual de módulos</h3>
          <div
            aria-label="Catálogo visual de tarjetas de módulos"
            style={{ display: 'grid', gap: '12px' }}
          >
            {templates.map((template) => (
              <article
                draggable
                key={template.templateCode}
                onDragStart={(event) => {
                  event.dataTransfer.setData(
                    'application/x-rubik-module-template',
                    template.templateCode,
                  );
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  display: 'grid',
                  gap: '10px',
                  padding: '12px',
                }}
              >
                <ModuleTemplateThumbnail template={template} />
                <div>
                  <h4 style={{ margin: 0 }}>{template.name}</h4>
                  <p style={{ color: '#52606d', margin: '2px 0 0' }}>
                    {formatTemplateCategory(template.category)} · {formatModuleType(template.type)}
                  </p>
                </div>
                <dl
                  style={{
                    display: 'grid',
                    gap: '6px',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    margin: 0,
                  }}
                >
                  <SpecItem
                    label="Ancho estándar"
                    value={`${formatNumber(template.defaultWidthMm)} mm`}
                  />
                  <SpecItem
                    label="Rango"
                    value={`${formatNumber(template.minWidthMm)}-${formatNumber(
                      template.maxWidthMm,
                    )} mm`}
                  />
                  <SpecItem label="Puertas" value={String(template.defaultDoors)} />
                  <SpecItem label="Cajones" value={String(template.defaultDrawers)} />
                  <SpecItem label="Estantes" value={String(template.defaultShelves)} />
                </dl>
                <button
                  style={{
                    background: '#0f766e',
                    border: 0,
                    borderRadius: '8px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    font: 'inherit',
                    fontWeight: 800,
                    padding: '9px 10px',
                  }}
                  type="button"
                  onClick={() => handleAddTemplate(template.templateCode)}
                >
                  Agregar {template.name}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="visual-wall-title">
          <h3 id="visual-wall-title">Espacio de trabajo</h3>
          <p style={{ color: '#52606d', marginTop: 0 }}>
            Arrastrá una tarjeta o usá Agregar. Los bloques representan el ancho real dentro de la
            pared de diseño.
          </p>
          <div
            aria-label="Regla visual en milímetros"
            style={{
              borderBottom: '1px solid #94a3b8',
              height: '34px',
              marginBottom: '10px',
              position: 'relative',
            }}
          >
            {rulerMarks.map((mark) => (
              <span
                key={mark.label}
                style={{
                  color: '#52606d',
                  fontSize: '0.72rem',
                  left: mark.left,
                  position: 'absolute',
                  top: 0,
                  transform: 'translateX(-2px)',
                  whiteSpace: 'nowrap',
                }}
              >
                {mark.label}
              </span>
            ))}
          </div>
          <div
            aria-label="Pared de diseño"
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            style={{
              background:
                'linear-gradient(90deg, rgba(15, 118, 110, 0.12) 1px, transparent 1px) 0 0 / 16.666% 100%, #eef2ff',
              border: `2px solid ${overflowMm > 0 ? '#b91c1c' : '#94a3b8'}`,
              borderRadius: '12px',
              minHeight: '168px',
              overflowX: 'auto',
              padding: '18px',
            }}
          >
            <div
              style={{
                alignItems: 'stretch',
                display: 'flex',
                minHeight: '118px',
                width: `${Math.max(100, (composition.selectedWidthMm / Math.max(availableWidthMm, 1)) * 100)}%`,
              }}
            >
              {modules.map((module, index) => {
                const widthPercent = Math.max(
                  8,
                  (module.widthMm / Math.max(availableWidthMm, 1)) * 100,
                );
                const isSelected = module.code === selectedModule?.code;

                return (
                  <button
                    aria-label={`Seleccionar módulo ${index + 1}: ${module.name}`}
                    aria-pressed={isSelected}
                    key={module.code}
                    style={{
                      background: getModuleVisualColor(module.type),
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      boxShadow: isSelected ? '0 0 0 3px #0f766e' : 'none',
                      color: '#111827',
                      cursor: 'pointer',
                      display: 'grid',
                      flex: `0 0 ${widthPercent}%`,
                      font: 'inherit',
                      gap: '4px',
                      marginRight: '6px',
                      minWidth: '84px',
                      padding: '8px',
                      placeItems: 'center',
                      textAlign: 'center',
                    }}
                    type="button"
                    onClick={() => setSelectedModuleCode(module.code)}
                  >
                    <strong>{module.name}</strong>
                    <span>{formatNumber(module.widthMm)} mm</span>
                    <small>#{index + 1}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gap: '12px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              marginTop: '14px',
            }}
          >
            <Metric label="Usado" value={`${formatNumber(composition.selectedWidthMm)} mm`} />
            <Metric label="Restante" value={`${formatNumber(remainingMm)} mm`} />
            <Metric label="Exceso" value={`${formatNumber(overflowMm)} mm`} />
          </div>

          {selectedModule ? (
            <div
              aria-label="Editor del módulo seleccionado"
              style={{
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: 'minmax(220px, 1fr) 160px',
                marginTop: '14px',
                padding: '14px',
              }}
            >
              <div>
                <p
                  style={{
                    color: '#64748b',
                    fontSize: '0.76rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    margin: '0 0 4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Módulo seleccionado
                </p>
                <h4 style={{ margin: 0 }}>{selectedModule.name}</h4>
                <p style={{ color: '#52606d', margin: '4px 0 0' }}>
                  {formatModuleType(selectedModule.type)} · {selectedModule.doors} puertas ·{' '}
                  {selectedModule.drawers} cajones · {selectedModule.shelves} estantes
                </p>
              </div>
              <label>
                Ancho
                <input
                  aria-label={`Editar ancho de ${selectedModule.name}`}
                  min="0"
                  step="any"
                  style={inputStyle}
                  type="number"
                  value={selectedModule.widthMm}
                  onChange={(event) => onUpdateModuleWidth(selectedModule.code, event.target.value)}
                />
              </label>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  gridColumn: '1 / -1',
                }}
              >
                <ActionButton
                  disabled={selectedModuleIndex <= 0}
                  label="Mover izquierda"
                  onClick={() => onMoveModule(selectedModule.code, -1)}
                />
                <ActionButton
                  disabled={selectedModuleIndex === modules.length - 1}
                  label="Mover derecha"
                  onClick={() => onMoveModule(selectedModule.code, 1)}
                />
                <ActionButton
                  label="Eliminar módulo"
                  tone="danger"
                  onClick={() => onRemoveModule(selectedModule.code)}
                />
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <details open style={{ marginTop: '18px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
          Detalle técnico de plantillas
        </summary>
        <div style={{ ...tableWrapperStyle, marginTop: '12px' }}>
          <table aria-label="Biblioteca de módulos estándar" style={tableStyle}>
            <thead>
              <tr>
                <TableHeader label="Módulo" />
                <TableHeader label="Tipo" />
                <TableHeader label="Ancho base" />
                <TableHeader label="Rango ajustable" />
                <TableHeader label="Reglas" />
                <TableHeader label="Acción" />
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.templateCode}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{formatTemplateCategory(template.category)}</TableCell>
                  <TableCell>{formatNumber(template.defaultWidthMm)} mm</TableCell>
                  <TableCell>
                    {formatNumber(template.minWidthMm)}-{formatNumber(template.maxWidthMm)} mm
                  </TableCell>
                  <TableCell>
                    {template.defaultDoors > 0 ? `${template.defaultDoors} puerta(s)` : null}
                    {template.defaultDrawers > 0 ? `${template.defaultDrawers} cajón(es)` : null}
                    {template.defaultShelves > 0
                      ? ` · ${template.defaultShelves} estante(s)`
                      : null}
                    {template.allowsAdvancedConfig ? ' · edición avanzada futura' : null}
                  </TableCell>
                  <TableCell>
                    <button
                      style={{
                        background: '#0f766e',
                        border: 0,
                        borderRadius: '10px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        font: 'inherit',
                        fontWeight: 800,
                        padding: '8px 10px',
                      }}
                      type="button"
                      onClick={() => onAddTemplate(template.templateCode)}
                    >
                      Agregar desde detalle {template.name}
                    </button>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <details open style={{ marginTop: '18px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
          Detalle técnico de módulos agregados
        </summary>
        <p>
          El usuario no carga alto, profundidad, puertas, estantes, fondo ni refuerzos desde cero:
          esos datos vienen de la plantilla. En esta primera versión se edita el ancho y Rubik OS
          recalcula.
        </p>
        <div style={tableWrapperStyle}>
          <table aria-label="Módulos inteligentes agregados a la pared" style={tableStyle}>
            <thead>
              <tr>
                <TableHeader label="Módulo" />
                <TableHeader label="Ancho editable" />
                <TableHeader label="Alto" />
                <TableHeader label="Profundidad" />
                <TableHeader label="Puertas" />
                <TableHeader label="Cajones" />
                <TableHeader label="Estantes" />
                <TableHeader label="Datos técnicos" />
              </tr>
            </thead>
            <tbody>
              {modules.map((module, index) => (
                <tr key={module.code}>
                  <TableCell>{module.name}</TableCell>
                  <TableCell>
                    <input
                      aria-label={`Ancho módulo inteligente ${index + 1}`}
                      min="0"
                      step="any"
                      style={{ ...inputStyle, minWidth: '120px' }}
                      type="number"
                      value={module.widthMm}
                      onChange={(event) => onUpdateModuleWidth(module.code, event.target.value)}
                    />
                  </TableCell>
                  <TableCell>{module.defaultHeightMm ?? 720} mm</TableCell>
                  <TableCell>{module.defaultDepthMm ?? 620} mm</TableCell>
                  <TableCell>{module.doors}</TableCell>
                  <TableCell>{module.drawers}</TableCell>
                  <TableCell>{module.shelves}</TableCell>
                  <TableCell>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      {(
                        module.technicalSummary ?? ['Plantilla preliminar pendiente de detalle.']
                      ).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {(module.accessories ?? []).length > 0 ? (
                        <li>Accesorios: {(module.accessories ?? []).join(', ')}</li>
                      ) : null}
                    </ul>
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {automaticNotes.length > 0 ? (
        <div
          role="status"
          style={{
            background: '#ecfdf5',
            border: '1px solid #86efac',
            borderRadius: '12px',
            color: '#166534',
            marginTop: '16px',
            padding: '12px',
          }}
        >
          <p style={{ fontWeight: 800, marginTop: 0 }}>Avisos automáticos de plantilla</p>
          <ul>
            {automaticNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function ModuleTemplateThumbnail({ template }: { template: DemoModuleTemplate }) {
  const lines =
    template.type === 'drawers' ? 3 : template.defaultDoors > 1 ? template.defaultDoors : 2;

  return (
    <div
      aria-hidden="true"
      style={{
        background: getModuleVisualColor(template.type),
        border: '2px solid rgb(51 65 85 / 45%)',
        borderRadius: '10px',
        display: 'grid',
        gap: '6px',
        gridAutoFlow: template.type === 'drawers' ? 'row' : 'column',
        height: '78px',
        padding: '9px',
      }}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={`${template.templateCode}-thumb-${index}`}
          style={{
            background: 'rgb(255 255 255 / 55%)',
            border: '1px solid rgb(51 65 85 / 25%)',
            borderRadius: '6px',
          }}
        />
      ))}
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ color: '#64748b', fontSize: '0.75rem' }}>{label}</dt>
      <dd style={{ fontWeight: 800, margin: 0 }}>{value}</dd>
    </div>
  );
}

function ActionButton({
  disabled = false,
  label,
  tone = 'neutral',
  onClick,
}: {
  disabled?: boolean;
  label: string;
  tone?: 'neutral' | 'danger';
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      style={{
        background: tone === 'danger' ? '#b91c1c' : '#0f766e',
        border: 0,
        borderRadius: '8px',
        color: '#ffffff',
        cursor: disabled ? 'not-allowed' : 'pointer',
        font: 'inherit',
        fontWeight: 800,
        opacity: disabled ? 0.5 : 1,
        padding: '9px 10px',
      }}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function getModuleVisualColor(type: DemoSelectedBaseModule['type']): string {
  const colors: Record<DemoSelectedBaseModule['type'], string> = {
    doors: '#c7d2fe',
    drawers: '#fde68a',
    filler: '#ddd6fe',
    open_shelves: '#bbf7d0',
    oven: '#cbd5e1',
    sink: '#99f6e4',
  };

  return colors[type];
}

function BaseModuleCatalogSection({
  composition,
  measurementWarning,
  modules,
  onLoadPreset,
}: {
  composition: DemoModuleComposition;
  measurementWarning: string | null;
  modules: DemoSelectedBaseModule[];
  onLoadPreset: () => void;
}) {
  return (
    <section
      aria-labelledby="base-module-catalog-title"
      style={{ ...cardStyle, marginBottom: '20px' }}
    >
      <h2 id="base-module-catalog-title">Catálogo de módulos prediseñados</h2>
      <p>Seleccioná o cargá módulos prediseñados para componer el ancho total del bajo mesada.</p>
      <button
        style={{
          background: '#1d4ed8',
          border: 0,
          borderRadius: '10px',
          color: '#ffffff',
          cursor: 'pointer',
          font: 'inherit',
          fontWeight: 800,
          marginBottom: '16px',
          padding: '10px 14px',
        }}
        type="button"
        onClick={onLoadPreset}
      >
        Cargar cocina WhatsApp 3070 mm
      </button>
      {measurementWarning ? (
        <p
          role="alert"
          style={{
            background: '#fffbeb',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            color: '#92400e',
            fontWeight: 700,
            marginTop: 0,
            padding: '12px',
          }}
        >
          {measurementWarning}
        </p>
      ) : null}
      <div
        style={{
          display: 'grid',
          gap: '12px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          marginBottom: '16px',
        }}
      >
        <Metric
          label="Ancho total disponible"
          value={`${formatNumber(composition.availableWidthMm)} mm`}
        />
        <Metric label="Suma de módulos" value={`${formatNumber(composition.selectedWidthMm)} mm`} />
        <Metric label="Diferencia" value={formatSignedMm(composition.differenceMm)} />
        <Metric label="Estado" value={formatCompositionStatus(composition.status)} />
      </div>
      <p style={{ fontWeight: 800 }}>{`Estado: ${formatCompositionStatus(composition.status)}`}</p>
      <div style={tableWrapperStyle}>
        <table aria-label="Módulos prediseñados seleccionados" style={tableStyle}>
          <thead>
            <tr>
              <TableHeader label="Nombre" />
              <TableHeader label="Tipo" />
              <TableHeader label="Ancho" />
              <TableHeader label="Puertas" />
              <TableHeader label="Cajones" />
              <TableHeader label="Estantes" />
            </tr>
          </thead>
          <tbody>
            {modules.map((module) => (
              <tr key={module.code}>
                <TableCell>{module.name}</TableCell>
                <TableCell>{formatModuleType(module.type)}</TableCell>
                <TableCell>{formatNumber(module.widthMm)} mm</TableCell>
                <TableCell>{module.doors}</TableCell>
                <TableCell>{module.drawers}</TableCell>
                <TableCell>{module.shelves}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ModulesWidthStatus({
  differenceMm,
  modulesWidthMm,
  widthMm,
}: {
  differenceMm: number;
  modulesWidthMm: number;
  widthMm: number;
}) {
  const status =
    differenceMm === 0
      ? {
          background: '#ecfdf5',
          borderColor: '#86efac',
          color: '#166534',
          message: 'OK: la suma de módulos coincide con el ancho total.',
          role: 'status' as const,
        }
      : differenceMm > 0
        ? {
            background: '#fef2f2',
            borderColor: '#fca5a5',
            color: '#991b1b',
            message: 'Alerta roja: la suma de módulos supera el ancho total.',
            role: 'alert' as const,
          }
        : {
            background: '#fffbeb',
            borderColor: '#fcd34d',
            color: '#92400e',
            message: 'Alerta amarilla: la suma de módulos es menor que el ancho total.',
            role: 'alert' as const,
          };

  return (
    <div
      aria-label="Validación de ancho de módulos internos"
      role={status.role}
      style={{
        background: status.background,
        border: `1px solid ${status.borderColor}`,
        borderRadius: '12px',
        color: status.color,
        marginBottom: '16px',
        padding: '14px',
      }}
    >
      <p style={{ fontWeight: 800, marginTop: 0 }}>{status.message}</p>
      <dl
        style={{
          display: 'grid',
          gap: '8px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        <div>
          <dt>Ancho total</dt>
          <dd style={{ fontWeight: 800, margin: 0 }}>{formatNumber(widthMm)} mm</dd>
        </div>
        <div>
          <dt>Suma módulos</dt>
          <dd style={{ fontWeight: 800, margin: 0 }}>{formatNumber(modulesWidthMm)} mm</dd>
        </div>
        <div>
          <dt>Diferencia</dt>
          <dd style={{ fontWeight: 800, margin: 0 }}>{formatSignedMm(differenceMm)}</dd>
        </div>
      </dl>
    </div>
  );
}

function NumberInput({
  helperText,
  label,
  value,
  onChange,
}: {
  helperText?: string;
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input
        aria-label={label}
        min="0"
        step="any"
        style={inputStyle}
        type="number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {helperText ? (
        <span style={{ color: '#627d98', display: 'block', fontSize: '0.86rem', marginTop: '4px' }}>
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

function CheckboxInput({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
      <input
        checked={checked}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px' }}>
      <dt style={{ color: '#52606d', fontSize: '0.9rem' }}>{label}</dt>
      <dd style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>{value}</dd>
    </div>
  );
}

function Notice({
  items,
  title,
  tone,
}: {
  items: string[];
  title: string;
  tone: 'error' | 'warning';
}) {
  const isError = tone === 'error';

  return (
    <section
      style={{
        ...cardStyle,
        background: isError ? '#fef2f2' : '#fffbeb',
        borderColor: isError ? '#fca5a5' : '#fcd34d',
        marginBottom: '20px',
      }}
    >
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function PiecesTable({
  pieces,
  title,
}: {
  pieces: Array<{
    moduleName: string | null;
    pieceName: string;
    quantity: number;
    lengthMm: number;
    widthMm: number;
    thicknessMm: number | null;
    edgeFrontMm: number;
    edgeBackMm: number;
    edgeLeftMm: number;
    edgeRightMm: number;
    grainDirection: string | null;
  }>;
  title: string;
}) {
  return (
    <section style={{ ...cardStyle, marginBottom: '20px' }}>
      <h2>{title}</h2>
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <TableHeader label="Módulo" />
              <TableHeader label="Pieza" />
              <TableHeader label="Cant." />
              <TableHeader label="Largo" />
              <TableHeader label="Ancho" />
              <TableHeader label="Espesor" />
              <TableHeader label="Cantos" />
              <TableHeader label="Veta" />
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece, index) => (
              <tr key={`${piece.moduleName ?? 'general'}-${piece.pieceName}-${index}`}>
                <TableCell>{piece.moduleName ?? 'General'}</TableCell>
                <TableCell>{piece.pieceName}</TableCell>
                <TableCell>{piece.quantity}</TableCell>
                <TableCell>{piece.lengthMm} mm</TableCell>
                <TableCell>{piece.widthMm} mm</TableCell>
                <TableCell>{piece.thicknessMm ?? '-'} mm</TableCell>
                <TableCell>
                  F {piece.edgeFrontMm} / B {piece.edgeBackMm} / I {piece.edgeLeftMm} / D{' '}
                  {piece.edgeRightMm}
                </TableCell>
                <TableCell>{piece.grainDirection ?? '-'}</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function CutlistTable({
  items,
}: {
  items: Array<{
    moduleName: string | null;
    pieceName: string;
    materialId: string | null;
    quantity: number;
    lengthMm: number;
    widthMm: number;
    approvedForCut: false;
  }>;
}) {
  return (
    <section style={{ ...cardStyle, marginBottom: '20px' }}>
      <h2>Lista de corte preliminar</h2>
      <p>Todas las piezas quedan sin aprobación de corte en esta demo.</p>
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <TableHeader label="Módulo" />
              <TableHeader label="Pieza" />
              <TableHeader label="Material" />
              <TableHeader label="Cantidad" />
              <TableHeader label="Medida" />
              <TableHeader label="Aprobada para corte" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.moduleName ?? 'general'}-${item.pieceName}-${index}`}>
                <TableCell>{item.moduleName ?? 'General'}</TableCell>
                <TableCell>{item.pieceName}</TableCell>
                <TableCell>{item.materialId ?? 'Sin material'}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  {item.lengthMm} x {item.widthMm} mm
                </TableCell>
                <TableCell>No</TableCell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TableHeader({ label }: { label: string }) {
  return (
    <th style={{ borderBottom: '1px solid #bcccdc', padding: '10px', textAlign: 'left' }}>
      {label}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td style={{ borderBottom: '1px solid #edf2f7', padding: '10px' }}>{children}</td>;
}

function syncSelectedModulesWithInternalFields(
  form: DesignEngineDemoForm,
  field: NumberField,
): DesignEngineDemoForm {
  const doorFields: ReadonlyArray<NumberField> = ['doorModuleWidthMm', 'doorCount', 'shelfCount'];
  const drawerFields: ReadonlyArray<NumberField> = ['drawerModuleWidthMm', 'drawerCount'];

  if (!doorFields.includes(field) && !drawerFields.includes(field)) {
    return form;
  }

  let updatedDoorModule = false;
  let updatedDrawerModule = false;

  return {
    ...form,
    selectedBaseModules: form.selectedBaseModules.map((module) => {
      if (module.type === 'doors' && doorFields.includes(field) && !updatedDoorModule) {
        updatedDoorModule = true;

        return {
          ...module,
          widthMm: form.doorModuleWidthMm,
          doors: form.doorCount,
          shelves: form.shelfCount,
        };
      }

      if (module.type === 'drawers' && drawerFields.includes(field) && !updatedDrawerModule) {
        updatedDrawerModule = true;

        return {
          ...module,
          widthMm: form.drawerModuleWidthMm,
          drawers: form.drawerCount,
        };
      }

      return module;
    }),
  };
}

function formatCompositionStatus(status: DemoModuleCompositionStatus): string {
  if (status === 'encaja') {
    return 'encaja';
  }

  if (status === 'falta_relleno') {
    return 'falta relleno';
  }

  return 'supera ancho disponible';
}

function formatTemplateCategory(category: DemoModuleTemplate['category']): string {
  if (category === 'base') {
    return 'bajo mesada';
  }

  if (category === 'wall') {
    return 'alacena';
  }

  if (category === 'tall') {
    return 'columna';
  }

  if (category === 'corner') {
    return 'esquina';
  }

  return 'terminal';
}
function formatModuleType(type: DemoSelectedBaseModule['type']): string {
  if (type === 'doors') {
    return 'puertas';
  }

  if (type === 'drawers') {
    return 'cajonera';
  }

  if (type === 'open_shelves') {
    return 'estantes abiertos';
  }

  if (type === 'sink') {
    return 'piletero';
  }

  if (type === 'filler') {
    return 'relleno/ajuste';
  }

  return 'horno';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    currency: 'ARS',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(value);
}

function formatSignedMm(value: number): string {
  const formattedValue = formatNumber(Math.abs(value));

  if (value > 0) {
    return `+${formattedValue} mm`;
  }

  if (value < 0) {
    return `-${formattedValue} mm`;
  }

  return '0 mm';
}
