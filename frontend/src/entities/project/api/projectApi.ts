import { apiInstance } from '../../../shared/api/instance';
import { Project } from '../model/types';

export const projectApi = {
  list: () => apiInstance.get<Project[]>('/api/projects'),

  create: (name: string) => apiInstance.post<Project>('/api/projects', { name }),

  get: (name: string) => apiInstance.get<Project>(`/api/projects/${name}`),

  delete: (name: string) => apiInstance.delete(`/api/projects/${name}`),
};
