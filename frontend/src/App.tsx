import { useMemo, useState } from 'react';

import './App.css';

type ModuleCategory =
  'puertas' | 'cajonera' | 'horno' | 'lavavajillas' | 'bacha' | 'columna' | 'alacena';

type ModuleTemplate = {
  id: string;
  name: string;
  category: ModuleCategory;
  standardWidth: number;
  minWidth: number;
  maxWidth: number;
  doors: number;
  drawers: number;
  shelves: number;
};

type ModuleInstance = {
  id: string;
  templateId: string;
  width: number;
  doors: number;
};

const availableWidth = 3600;
const moduleDepth = 580;
const counterHeight = 900;
const scaleMax = 1100;

const moduleTemplates: ModuleTemplate[] = [
  {
    id: 'base-doors-900',
    name: 'Bajo puertas',
    category: 'puertas',
    standardWidth: 900,
    minWidth: 400,
    maxWidth: 1000,
    doors: 2,
    drawers: 0,
    shelves: 1,
  },
  {
    id: 'drawer-base-900',
    name: 'Cajonera',
    category: 'cajonera',
    standardWidth: 900,
    minWidth: 450,
    maxWidth: 1000,
    doors: 0,
    drawers: 4,
    shelves: 0,
  },
  {
    id: 'oven-600',
    name: 'Mueble horno',
    category: 'horno',
    standardWidth: 600,
    minWidth: 600,
    maxWidth: 600,
    doors: 0,
    drawers: 1,
    shelves: 1,
  },
  {
    id: 'dishwasher-600',
    name: 'Lavavajillas',
    category: 'lavavajillas',
    standardWidth: 600,
    minWidth: 600,
    maxWidth: 650,
    doors: 0,
    drawers: 0,
    shelves: 0,
  },
  {
    id: 'sink-800',
    name: 'Bajo bacha',
    category: 'bacha',
    standardWidth: 800,
    minWidth: 600,
    maxWidth: 1000,
    doors: 2,
    drawers: 0,
    shelves: 0,
  },
  {
    id: 'tall-column-600',
    name: 'Columna despensa',
    category: 'columna',
    standardWidth: 600,
    minWidth: 450,
    maxWidth: 700,
    doors: 2,
    drawers: 0,
    shelves: 5,
  },
  {
    id: 'wall-cabinet-800',
    name: 'Alacena',
    category: 'alacena',
    standardWidth: 800,
    minWidth: 400,
    maxWidth: 900,
    doors: 2,
    drawers: 0,
    shelves: 2,
  },
];

const initialInstances: ModuleInstance[] = [
  createModuleInstance(getTemplate('base-doors-900'), 'module-1'),
  createModuleInstance(getTemplate('drawer-base-900'), 'module-2'),
  createModuleInstance(getTemplate('oven-600'), 'module-3'),
  createModuleInstance(getTemplate('dishwasher-600'), 'module-4'),
];

function createModuleInstance(
  template: ModuleTemplate,
  id: string = crypto.randomUUID(),
): ModuleInstance {
  return {
    id,
    templateId: template.id,
    width: template.standardWidth,
    doors: getDoorCount(template, template.standardWidth),
  };
}

function getDoorCount(template: ModuleTemplate, width: number) {
  if (template.category === 'puertas' && width <= 400) {
    return 1;
  }

  return template.doors;
}

function clampWidth(template: ModuleTemplate, width: number) {
  return Math.min(template.maxWidth, Math.max(template.minWidth, Math.round(width)));
}

function getTemplate(templateId: string) {
  const template = moduleTemplates.find((item) => item.id === templateId);

  if (template === undefined) {
    throw new Error(`Module template was not found: ${templateId}`);
  }

  return template;
}

function formatMm(value: number) {
  return `${value.toLocaleString('es-AR')} mm`;
}

export function App() {
  const [moduleInstances, setModuleInstances] = useState<ModuleInstance[]>(initialInstances);
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialInstances[0]?.id ?? '');

  const usedWidth = moduleInstances.reduce((total, item) => total + item.width, 0);
  const remainingWidth = Math.max(availableWidth - usedWidth, 0);
  const overflowWidth = Math.max(usedWidth - availableWidth, 0);
  const selectedModule = moduleInstances.find((item) => item.id === selectedModuleId) ?? null;
  const selectedTemplate = selectedModule === null ? null : getTemplate(selectedModule.templateId);

  const rulerMarks = useMemo(
    () =>
      Array.from({ length: availableWidth / 600 + 1 }, (_, index) => ({
        label: formatMm(index * 600),
        left: `${(index * 600 * 100) / availableWidth}%`,
      })),
    [],
  );

  function addModule(template: ModuleTemplate) {
    const instance = createModuleInstance(template);

    setModuleInstances((current) => [...current, instance]);
    setSelectedModuleId(instance.id);
  }

  function updateModuleWidth(instanceId: string, nextWidth: number) {
    setModuleInstances((current) =>
      current.map((instance) => {
        if (instance.id !== instanceId) {
          return instance;
        }

        const template = getTemplate(instance.templateId);
        const width = clampWidth(template, nextWidth);

        return {
          ...instance,
          width,
          doors: getDoorCount(template, width),
        };
      }),
    );
  }

  function moveModule(instanceId: string, direction: -1 | 1) {
    setModuleInstances((current) => {
      const index = current.findIndex((instance) => instance.id === instanceId);
      const nextIndex = index + direction;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [moduleToMove] = next.splice(index, 1);

      if (moduleToMove === undefined) {
        return current;
      }

      next.splice(nextIndex, 0, moduleToMove);

      return next;
    });
  }

  function removeModule(instanceId: string) {
    setModuleInstances((current) => {
      const next = current.filter((instance) => instance.id !== instanceId);

      if (instanceId === selectedModuleId) {
        setSelectedModuleId(next[0]?.id ?? '');
      }

      return next;
    });
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Motor de Diseño Rubik</p>
          <h1>Constructor visual modular</h1>
        </div>
        <div className="summary-strip" aria-label="Resumen del espacio">
          <span>
            Disponible <strong>{formatMm(availableWidth)}</strong>
          </span>
          <span>
            Usado <strong>{formatMm(usedWidth)}</strong>
          </span>
          <span>
            Restante <strong>{formatMm(remainingWidth)}</strong>
          </span>
          <span className={overflowWidth > 0 ? 'danger-text' : ''}>
            Exceso <strong>{formatMm(overflowWidth)}</strong>
          </span>
        </div>
      </header>

      <section className="builder-layout" aria-label="Constructor de cocina">
        <aside className="catalog-panel" aria-labelledby="catalog-title">
          <div className="section-heading">
            <p className="eyebrow">Catálogo</p>
            <h2 id="catalog-title">Módulos prediseñados</h2>
          </div>
          <div className="module-card-grid">
            {moduleTemplates.map((template) => (
              <article className="module-card" key={template.id}>
                <ModuleThumbnail template={template} />
                <div>
                  <h3>{template.name}</h3>
                  <p>{template.category}</p>
                </div>
                <dl className="compact-specs">
                  <div>
                    <dt>Ancho estándar</dt>
                    <dd>{formatMm(template.standardWidth)}</dd>
                  </div>
                  <div>
                    <dt>Rango</dt>
                    <dd>
                      {formatMm(template.minWidth)} - {formatMm(template.maxWidth)}
                    </dd>
                  </div>
                  <div>
                    <dt>Componentes</dt>
                    <dd>
                      {template.doors} puertas · {template.drawers} cajones · {template.shelves}{' '}
                      estantes
                    </dd>
                  </div>
                </dl>
                <button type="button" onClick={() => addModule(template)}>
                  Agregar
                </button>
              </article>
            ))}
          </div>
        </aside>

        <section className="workspace-panel" aria-labelledby="workspace-title">
          <div className="section-heading">
            <p className="eyebrow">Pared de diseño</p>
            <h2 id="workspace-title">Espacio de trabajo</h2>
          </div>

          <div className="ruler" aria-label="Regla visual en milímetros">
            {rulerMarks.map((mark) => (
              <span key={mark.label} style={{ left: mark.left }}>
                {mark.label}
              </span>
            ))}
          </div>

          <div className={overflowWidth > 0 ? 'work-wall has-overflow' : 'work-wall'}>
            <div
              className="module-row"
              style={{ width: `${Math.max(100, (usedWidth * 100) / availableWidth)}%` }}
            >
              {moduleInstances.map((instance, index) => {
                const template = getTemplate(instance.templateId);
                const blockWidth = `${Math.max(8, (instance.width * 100) / availableWidth)}%`;
                const isSelected = instance.id === selectedModuleId;

                return (
                  <button
                    aria-label={`Seleccionar ${template.name} ${index + 1}`}
                    aria-pressed={isSelected}
                    className={`module-block module-${template.category}`}
                    key={instance.id}
                    onClick={() => setSelectedModuleId(instance.id)}
                    style={{ width: blockWidth }}
                    type="button"
                  >
                    <span>{template.name}</span>
                    <strong>{formatMm(instance.width)}</strong>
                    <small>#{index + 1}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="workspace-metrics">
            <Meter label="Usado" value={usedWidth} max={availableWidth} />
            <Meter label="Restante" value={remainingWidth} max={availableWidth} tone="success" />
            <Meter label="Exceso" value={overflowWidth} max={availableWidth} tone="danger" />
          </div>

          {selectedModule !== null && selectedTemplate !== null ? (
            <div className="editor-panel" aria-label="Editor del módulo seleccionado">
              <div>
                <p className="eyebrow">Módulo seleccionado</p>
                <h3>{selectedTemplate.name}</h3>
                <p>
                  {selectedTemplate.category} · {selectedModule.doors} puertas ·{' '}
                  {selectedTemplate.drawers} cajones · {selectedTemplate.shelves} estantes
                </p>
              </div>

              <label>
                Ancho
                <input
                  aria-label="Editar ancho"
                  max={selectedTemplate.maxWidth}
                  min={selectedTemplate.minWidth}
                  onChange={(event) =>
                    updateModuleWidth(selectedModule.id, Number(event.currentTarget.value))
                  }
                  step="10"
                  type="number"
                  value={selectedModule.width}
                />
              </label>

              <div className="button-row">
                <button
                  type="button"
                  onClick={() => moveModule(selectedModule.id, -1)}
                  disabled={moduleInstances[0]?.id === selectedModule.id}
                >
                  Mover izquierda
                </button>
                <button
                  type="button"
                  onClick={() => moveModule(selectedModule.id, 1)}
                  disabled={moduleInstances.at(-1)?.id === selectedModule.id}
                >
                  Mover derecha
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => removeModule(selectedModule.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="viewer-panel" aria-labelledby="viewer-title">
          <div className="section-heading">
            <p className="eyebrow">Vista conectada</p>
            <h2 id="viewer-title">Visor 3D</h2>
          </div>
          <div className="viewer-3d" aria-label="Representación 3D de la composición actual">
            {moduleInstances.map((instance) => {
              const template = getTemplate(instance.templateId);
              const width = Math.max(54, (instance.width * scaleMax) / availableWidth);
              const height =
                template.category === 'columna' ? 172 : template.category === 'alacena' ? 86 : 118;

              return (
                <div
                  className={`module-box module-${template.category}`}
                  key={instance.id}
                  style={{ width: `${width}px`, height: `${height}px` }}
                >
                  <span>{template.name}</span>
                </div>
              );
            })}
          </div>
          <dl className="technical-list">
            <div>
              <dt>Profundidad base</dt>
              <dd>{formatMm(moduleDepth)}</dd>
            </div>
            <div>
              <dt>Altura mesada</dt>
              <dd>{formatMm(counterHeight)}</dd>
            </div>
            <div>
              <dt>Despiece</dt>
              <dd>Actualizado con {moduleInstances.length} módulos</dd>
            </div>
            <div>
              <dt>Cutlist</dt>
              <dd>{moduleInstances.length * 5} piezas preliminares</dd>
            </div>
            <div>
              <dt>Cotización preliminar</dt>
              <dd>${(usedWidth * 48).toLocaleString('es-AR')}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="technical-detail" aria-labelledby="technical-title">
        <div className="section-heading">
          <p className="eyebrow">Detalle técnico</p>
          <h2 id="technical-title">Instancias de módulo</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Orden</th>
              <th>Módulo</th>
              <th>Categoría</th>
              <th>Ancho</th>
              <th>Puertas</th>
              <th>Cajones</th>
              <th>Estantes</th>
            </tr>
          </thead>
          <tbody>
            {moduleInstances.map((instance, index) => {
              const template = getTemplate(instance.templateId);

              return (
                <tr key={instance.id}>
                  <td>{index + 1}</td>
                  <td>{template.name}</td>
                  <td>{template.category}</td>
                  <td>{formatMm(instance.width)}</td>
                  <td>{instance.doors}</td>
                  <td>{template.drawers}</td>
                  <td>{template.shelves}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function ModuleThumbnail({ template }: { template: ModuleTemplate }) {
  return (
    <div className={`module-thumbnail module-${template.category}`} aria-hidden="true">
      {template.category === 'cajonera' ? (
        <>
          <span />
          <span />
          <span />
        </>
      ) : (
        <>
          <span />
          <span />
        </>
      )}
    </div>
  );
}

function Meter({
  label,
  max,
  tone = 'neutral',
  value,
}: {
  label: string;
  max: number;
  tone?: 'neutral' | 'success' | 'danger';
  value: number;
}) {
  return (
    <div className={`meter meter-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{formatMm(value)}</strong>
      </div>
      <progress max={max} value={Math.min(value, max)} />
    </div>
  );
}
