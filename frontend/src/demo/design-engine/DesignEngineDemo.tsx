import { useMemo, useState } from 'react';

import {
  calculateDesignEngineDemo,
  createWhatsApp3070DemoForm,
  DEFAULT_DESIGN_ENGINE_DEMO_FORM,
  DEMO_PRELIMINARY_NOTE,
} from './demoCalculator';
import type {
  DemoModuleComposition,
  DemoModuleCompositionStatus,
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
