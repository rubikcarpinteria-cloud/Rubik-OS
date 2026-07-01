export type WorkOrderSummary = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  furniture_type: string | null;
  room: string | null;
  location: string | null;
  priority: string;
  status: string;
  is_blocked: boolean;
  tentative_delivery_date: string | null;
  confirmed_delivery_date: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkOrderClientSummary = {
  id: string;
  full_name: string;
  display_name: string | null;
  default_location: string | null;
};

export type WorkOrderDetail = WorkOrderSummary & {
  client: WorkOrderClientSummary | null;
};

export type WorkOrderFilters = {
  status: string | null;
  client_id: string | null;
};
