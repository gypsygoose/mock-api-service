export interface MockEndpoint {
  id: string;
  project_id: string;
  path: string;
  method: string;
  status_code: number;
  response_data: Record<string, unknown>;
  created_at: string;
}

export interface CreateMockEndpointDto {
  path: string;
  method: string;
  status_code: number;
  response_data: Record<string, unknown>;
}
