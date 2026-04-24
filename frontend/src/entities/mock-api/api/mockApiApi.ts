import { apiInstance } from '../../../shared/api/instance';
import { CreateMockEndpointDto, MockEndpoint } from '../model/types';

export const mockApiApi = {
  list: (projectName: string) =>
    apiInstance.get<MockEndpoint[]>(`/api/projects/${projectName}/endpoints`),

  create: (projectName: string, dto: CreateMockEndpointDto) =>
    apiInstance.post<MockEndpoint>(`/api/projects/${projectName}/endpoints`, dto),

  get: (projectName: string, id: string) =>
    apiInstance.get<MockEndpoint>(`/api/projects/${projectName}/endpoints/${id}`),

  delete: (projectName: string, id: string) =>
    apiInstance.delete(`/api/projects/${projectName}/endpoints/${id}`),
};
