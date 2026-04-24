import { useState } from 'react';
import { projectApi } from '../../../../entities/project/api/projectApi';
import { Project } from '../../../../entities/project/model/types';

export const useCreateProject = (onSuccess: (project: Project) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await projectApi.create(name);
      onSuccess(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError('Project with this name already exists');
      } else {
        setError('Failed to create project');
      }
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
