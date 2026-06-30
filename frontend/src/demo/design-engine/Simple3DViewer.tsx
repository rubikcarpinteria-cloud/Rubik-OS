import type { Demo3DViewerModel, DemoBaseModuleType } from './types';

const cardStyle = {
  background: '#ffffff',
  border: '1px solid #d9e2ec',
  borderRadius: '16px',
  boxShadow: '0 8px 28px rgb(15 23 42 / 8%)',
  marginBottom: '20px',
  padding: '18px',
};

const metricGridStyle = {
  display: 'grid',
  gap: '12px',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  marginBottom: '16px',
};

const viewerShellStyle = {
  background: '#f8fafc',
  border: '1px solid #d9e2ec',
  borderRadius: '16px',
  overflowX: 'auto' as const,
  padding: '12px',
};

const VIEWBOX_WIDTH = 920;
const VIEWBOX_HEIGHT = 430;
const FRONT_X = 88;
const FRONT_Y = 82;
const FRONT_WIDTH = 704;
const FRONT_HEIGHT = 230;
const DEPTH_X = 72;
const DEPTH_Y = 38;

export function Simple3DViewer({ model }: { model: Demo3DViewerModel | null }) {
  return (
    <section aria-labelledby="simple-3d-title" style={cardStyle}>
      <h2 id="simple-3d-title">Vista 3D técnica preliminar</h2>
      {!model ? (
        <p>Agregá módulos desde el catálogo para generar la vista técnica.</p>
      ) : (
        <>
          <p style={{ fontWeight: 800 }}>{model.validationNote}</p>
          <div style={metricGridStyle}>
            <Metric label="Ancho" value={`${formatNumber(model.widthMm)} mm`} />
            <Metric label="Alto" value={`${formatNumber(model.heightMm)} mm`} />
            <Metric label="Profundidad" value={`${formatNumber(model.depthMm)} mm`} />
            <Metric
              label="Suma módulos"
              value={`${formatNumber(model.moduleComposition.selectedWidthMm)} mm`}
            />
            <Metric
              label="Diferencia"
              value={formatSignedMm(model.moduleComposition.differenceMm)}
            />
            <Metric
              label="Zócalo"
              value={model.hasToeKick ? `${model.toeKickHeightMm} mm` : 'Sin zócalo'}
            />
            <Metric label="Fondo" value={model.hasBackPanel ? 'Fondo incluido' : 'Sin fondo'} />
          </div>
          {model.warnings.length > 0 ? (
            <div
              role="alert"
              style={{
                background: '#fffbeb',
                border: '1px solid #fcd34d',
                borderRadius: '12px',
                color: '#92400e',
                marginBottom: '16px',
                padding: '12px',
              }}
            >
              <p style={{ fontWeight: 800, marginTop: 0 }}>Warnings de módulos internos</p>
              <ul>
                {model.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div style={viewerShellStyle}>
            <svg
              aria-label="Vista técnica del bajo mesada"
              role="img"
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Vista técnica del bajo mesada</title>
              <CabinetSketch model={model} />
            </svg>
          </div>
          <p style={{ color: '#52606d' }}>
            Lectura técnica: bloques proporcionales al ancho de cada módulo, líneas para puertas y
            cajones, y franja inferior solo si el bajo mesada incluye zócalo.
          </p>
        </>
      )}
    </section>
  );
}

function CabinetSketch({ model }: { model: Demo3DViewerModel }) {
  const scaleBaseMm = Math.max(model.widthMm, model.moduleComposition.selectedWidthMm, 1);
  const scaleX = FRONT_WIDTH / scaleBaseMm;
  const toeKickHeightPx = model.hasToeKick
    ? Math.min(36, Math.max(16, (model.toeKickHeightMm / model.heightMm) * FRONT_HEIGHT))
    : 0;
  const bodyHeight = FRONT_HEIGHT - toeKickHeightPx;
  const availableWidthX = FRONT_X + model.widthMm * scaleX;
  const selectedWidthPx = model.moduleComposition.selectedWidthMm * scaleX;

  return (
    <>
      <polygon
        fill="#dbeafe"
        points={`${FRONT_X},${FRONT_Y} ${FRONT_X + DEPTH_X},${FRONT_Y - DEPTH_Y} ${FRONT_X + FRONT_WIDTH + DEPTH_X},${FRONT_Y - DEPTH_Y} ${FRONT_X + FRONT_WIDTH},${FRONT_Y}`}
        stroke="#1d4ed8"
        strokeWidth="2"
      />
      <polygon
        fill="#bfdbfe"
        points={`${FRONT_X + FRONT_WIDTH},${FRONT_Y} ${FRONT_X + FRONT_WIDTH + DEPTH_X},${FRONT_Y - DEPTH_Y} ${FRONT_X + FRONT_WIDTH + DEPTH_X},${FRONT_Y + FRONT_HEIGHT - DEPTH_Y} ${FRONT_X + FRONT_WIDTH},${FRONT_Y + FRONT_HEIGHT}`}
        stroke="#1d4ed8"
        strokeWidth="2"
      />
      <rect
        fill="#eff6ff"
        height={FRONT_HEIGHT}
        stroke="#1d4ed8"
        strokeWidth="2"
        width={FRONT_WIDTH}
        x={FRONT_X}
        y={FRONT_Y}
      />
      <text fill="#1e3a8a" fontSize="15" fontWeight="700" x={FRONT_X} y={FRONT_Y - 50}>
        Profundidad: {formatNumber(model.depthMm)} mm
      </text>
      <line
        stroke="#1e3a8a"
        strokeDasharray="5 5"
        strokeWidth="2"
        x1={FRONT_X + FRONT_WIDTH + 12}
        x2={FRONT_X + FRONT_WIDTH + DEPTH_X + 8}
        y1={FRONT_Y + FRONT_HEIGHT + 18}
        y2={FRONT_Y + FRONT_HEIGHT - DEPTH_Y + 18}
      />
      <text
        fill="#1f2933"
        fontSize="14"
        fontWeight="700"
        x={FRONT_X + FRONT_WIDTH + 40}
        y={FRONT_Y + FRONT_HEIGHT - DEPTH_Y + 40}
      >
        vista técnica con profundidad indicada
      </text>
      {model.modules.map((module, index) => {
        const x = FRONT_X + module.startMm * scaleX;
        const width = Math.max(module.widthMm * scaleX, 18);

        return (
          <ModuleBlock
            bodyHeight={bodyHeight}
            index={index}
            key={module.code}
            module={module}
            width={width}
            x={x}
            y={FRONT_Y}
          />
        );
      })}
      {model.moduleComposition.differenceMm < 0 ? (
        <rect
          fill="#fef3c7"
          height={bodyHeight}
          stroke="#92400e"
          strokeDasharray="6 4"
          strokeWidth="2"
          width={Math.abs(model.moduleComposition.differenceMm) * scaleX}
          x={FRONT_X + selectedWidthPx}
          y={FRONT_Y}
        />
      ) : null}
      {model.moduleComposition.differenceMm < 0 ? (
        <text
          fill="#92400e"
          fontSize="13"
          fontWeight="700"
          textAnchor="middle"
          x={
            FRONT_X +
            selectedWidthPx +
            (Math.abs(model.moduleComposition.differenceMm) * scaleX) / 2
          }
          y={FRONT_Y + bodyHeight / 2}
        >
          falta relleno
        </text>
      ) : null}
      {model.moduleComposition.differenceMm > 0 ? (
        <line
          stroke="#b91c1c"
          strokeDasharray="6 4"
          strokeWidth="3"
          x1={availableWidthX}
          x2={availableWidthX}
          y1={FRONT_Y - 8}
          y2={FRONT_Y + FRONT_HEIGHT + 8}
        />
      ) : null}
      {model.moduleComposition.differenceMm > 0 ? (
        <text
          fill="#b91c1c"
          fontSize="13"
          fontWeight="800"
          x={availableWidthX + 8}
          y={FRONT_Y - 14}
        >
          límite ancho disponible
        </text>
      ) : null}
      {model.hasToeKick ? (
        <g aria-label="Zócalo representado">
          <rect
            fill="#334155"
            height={toeKickHeightPx}
            stroke="#0f172a"
            width={FRONT_WIDTH}
            x={FRONT_X}
            y={FRONT_Y + bodyHeight}
          />
          <text
            fill="#ffffff"
            fontSize="13"
            fontWeight="800"
            textAnchor="middle"
            x={FRONT_X + FRONT_WIDTH / 2}
            y={FRONT_Y + bodyHeight + toeKickHeightPx / 2 + 5}
          >
            Zócalo {formatNumber(model.toeKickHeightMm)} mm
          </text>
        </g>
      ) : (
        <text
          fill="#475569"
          fontSize="14"
          fontWeight="800"
          x={FRONT_X}
          y={FRONT_Y + FRONT_HEIGHT + 28}
        >
          Sin zócalo
        </text>
      )}
      {model.hasBackPanel ? (
        <text
          fill="#475569"
          fontSize="14"
          fontWeight="700"
          x={FRONT_X}
          y={FRONT_Y + FRONT_HEIGHT + 50}
        >
          Fondo incluido en el modelo técnico
        </text>
      ) : null}
      <line
        stroke="#1f2937"
        strokeWidth="2"
        x1={FRONT_X}
        x2={FRONT_X + FRONT_WIDTH}
        y1={FRONT_Y + FRONT_HEIGHT + 76}
        y2={FRONT_Y + FRONT_HEIGHT + 76}
      />
      <text
        fill="#1f2937"
        fontSize="15"
        fontWeight="800"
        textAnchor="middle"
        x={FRONT_X + FRONT_WIDTH / 2}
        y={FRONT_Y + FRONT_HEIGHT + 100}
      >
        Ancho total: {formatNumber(model.widthMm)} mm
      </text>
      <line
        stroke="#1f2937"
        strokeWidth="2"
        x1={FRONT_X - 28}
        x2={FRONT_X - 28}
        y1={FRONT_Y}
        y2={FRONT_Y + FRONT_HEIGHT}
      />
      <text
        fill="#1f2937"
        fontSize="15"
        fontWeight="800"
        transform={`rotate(-90 ${FRONT_X - 48} ${FRONT_Y + FRONT_HEIGHT / 2})`}
        x={FRONT_X - 48}
        y={FRONT_Y + FRONT_HEIGHT / 2}
      >
        Alto: {formatNumber(model.heightMm)} mm
      </text>
    </>
  );
}

function ModuleBlock({
  bodyHeight,
  index,
  module,
  width,
  x,
  y,
}: {
  bodyHeight: number;
  index: number;
  module: Demo3DViewerModel['modules'][number];
  width: number;
  x: number;
  y: number;
}) {
  const fill = getModuleFill(module.type, index);
  const labelX = x + width / 2;
  const labelY = y + Math.max(52, bodyHeight / 2);

  return (
    <g aria-label={`${module.name}: ${module.label}, ancho ${formatNumber(module.widthMm)} mm`}>
      <rect
        fill={fill}
        height={bodyHeight}
        stroke="#1f2937"
        strokeWidth="1.5"
        width={width}
        x={x}
        y={y}
      />
      <ModuleDetails bodyHeight={bodyHeight} module={module} width={width} x={x} y={y} />
      <text
        fill="#111827"
        fontSize="13"
        fontWeight="800"
        textAnchor="middle"
        x={labelX}
        y={labelY - 12}
      >
        {truncateLabel(module.name, width)}
      </text>
      <text
        fill="#111827"
        fontSize="12"
        fontWeight="700"
        textAnchor="middle"
        x={labelX}
        y={labelY + 8}
      >
        {formatNumber(module.widthMm)} mm
      </text>
      <text fill="#111827" fontSize="12" textAnchor="middle" x={labelX} y={labelY + 26}>
        {module.label}
      </text>
    </g>
  );
}

function ModuleDetails({
  bodyHeight,
  module,
  width,
  x,
  y,
}: {
  bodyHeight: number;
  module: Demo3DViewerModel['modules'][number];
  width: number;
  x: number;
  y: number;
}) {
  if (module.type === 'doors' || module.type === 'sink') {
    return (
      <g aria-label={`Puertas de ${module.name}`}>
        {Array.from({ length: Math.max(module.doors - 1, 0) }).map((_, index) => {
          const lineX = x + ((index + 1) * width) / module.doors;

          return (
            <line
              key={`${module.code}-door-${index}`}
              stroke="#1f2937"
              strokeDasharray="4 3"
              strokeWidth="1.5"
              x1={lineX}
              x2={lineX}
              y1={y + 8}
              y2={y + bodyHeight - 8}
            />
          );
        })}
        <line
          stroke="#475569"
          strokeDasharray="3 4"
          x1={x + 8}
          x2={x + width - 8}
          y1={y + bodyHeight * 0.55}
          y2={y + bodyHeight * 0.55}
        />
      </g>
    );
  }

  if (module.type === 'drawers') {
    return (
      <g aria-label={`Divisiones de cajones de ${module.name}`}>
        {Array.from({ length: Math.max(module.drawers - 1, 0) }).map((_, index) => {
          const lineY = y + ((index + 1) * bodyHeight) / module.drawers;

          return (
            <line
              key={`${module.code}-drawer-${index}`}
              stroke="#1f2937"
              strokeWidth="1.5"
              x1={x + 8}
              x2={x + width - 8}
              y1={lineY}
              y2={lineY}
            />
          );
        })}
      </g>
    );
  }

  if (module.type === 'filler') {
    return (
      <>
        <line
          stroke="#78350f"
          strokeWidth="1.5"
          x1={x + 8}
          x2={x + width - 8}
          y1={y + 8}
          y2={y + bodyHeight - 8}
        />
        <line
          stroke="#78350f"
          strokeWidth="1.5"
          x1={x + width - 8}
          x2={x + 8}
          y1={y + 8}
          y2={y + bodyHeight - 8}
        />
      </>
    );
  }

  return null;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px' }}>
      <dt style={{ color: '#52606d', fontSize: '0.9rem' }}>{label}</dt>
      <dd style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{value}</dd>
    </div>
  );
}

function getModuleFill(type: DemoBaseModuleType, index: number): string {
  if (type === 'filler') {
    return '#fde68a';
  }

  if (type === 'drawers') {
    return '#dcfce7';
  }

  if (type === 'open_shelves') {
    return '#f3e8ff';
  }

  if (type === 'sink') {
    return '#cffafe';
  }

  if (type === 'oven') {
    return '#fee2e2';
  }

  return index % 2 === 0 ? '#e0f2fe' : '#dbeafe';
}

function truncateLabel(label: string, widthPx: number): string {
  const maxLength = Math.max(8, Math.floor(widthPx / 9));

  if (label.length <= maxLength) {
    return label;
  }

  return `${label.slice(0, maxLength - 1)}…`;
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
