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

export type OperationalReadinessCheckSummary = {
  id: string;
  check_type: string;
  title: string;
  description: string | null;
  status: string;
  required_evidence_type: string | null;
  responsible_party: string | null;
  requested_by_agent: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
  expires_at: string | null;
  blocks_next_stage: boolean;
  blocks_worker_dispatch: boolean;
  created_at: string;
  updated_at: string;
};

export type PlanningAlertSummary = {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  severity: string;
  status: string;
  generated_by: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkOrderDetail = WorkOrderSummary & {
  client: WorkOrderClientSummary | null;
  operational_readiness_checks: OperationalReadinessCheckSummary[];
  planning_alerts: PlanningAlertSummary[];
};

export type WorkOrderFilters = {
  status: string | null;
  client_id: string | null;
};
