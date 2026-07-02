import { loadPublicEnvironment } from '../env';

import type { ApiErrorResponse, WorkOrderDetail } from './types';

type WorkOrderDetailResponse = {
  data: WorkOrderDetail;
};

export class WorkOrderDetailRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkOrderDetailRequestError';
  }
}

function resolveWorkOrderErrorMessage(status: number): string {
  if (status === 404) {
    return 'No encontramos esa orden de trabajo.';
  }

  if (status === 503) {
    return 'El backend o Supabase staging no está disponible.';
  }

  return 'No se pudo cargar la orden de trabajo.';
}

async function readSafeError(response: Response): Promise<ApiErrorResponse | null> {
  try {
    return (await response.json()) as ApiErrorResponse;
  } catch {
    return null;
  }
}

export async function getWorkOrderDetail(id: string): Promise<WorkOrderDetail> {
  const environment = loadPublicEnvironment();
  const baseUrl = environment.VITE_API_URL.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/work-orders/${encodeURIComponent(id)}`);

  if (!response.ok) {
    await readSafeError(response);
    throw new WorkOrderDetailRequestError(resolveWorkOrderErrorMessage(response.status));
  }

  const payload = (await response.json()) as WorkOrderDetailResponse;

  return payload.data;
}
