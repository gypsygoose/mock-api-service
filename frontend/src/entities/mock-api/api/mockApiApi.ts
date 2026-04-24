import { apiInstance } from '../../../shared/api/instance';
import { CreateMockEndpointDto, MockEndpoint } from '../model/types';

export const mockApiApi = {
  list: (projectName: string, filters?: { method?: string; path?: string }) => {
    const params: Record<string, string> = {};
    if (filters?.method) params.method = filters.method;
    if (filters?.path) params.path = filters.path;
    return apiInstance.get<MockEndpoint[]>(`/api/projects/${projectName}/endpoints`, { params });
  },

  create: (projectName: string, dto: CreateMockEndpointDto) =>
    apiInstance.post<MockEndpoint>(`/api/projects/${projectName}/endpoints`, dto),

  get: (projectName: string, id: string) =>
    apiInstance.get<MockEndpoint>(`/api/projects/${projectName}/endpoints/${id}`),

  delete: (projectName: string, id: string) =>
    apiInstance.delete(`/api/projects/${projectName}/endpoints/${id}`),
};
