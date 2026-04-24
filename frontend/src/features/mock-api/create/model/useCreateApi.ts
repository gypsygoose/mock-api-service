import { useState } from 'react';
import { mockApiApi } from '../../../../entities/mock-api/api/mockApiApi';
import { MockEndpoint } from '../../../../entities/mock-api/model/types';

export const useCreateApi = (projectName: string, onSuccess: (endpoint: MockEndpoint) => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (path: string, method: string, statusCode: number, responseJson: string) => {
    setLoading(true);
    setError(null);

    let responseData: Record<string, unknown>;
    try {
      responseData = JSON.parse(responseJson);
    } catch {
      setError('Response data must be valid JSON');
      setLoading(false);
      return;
    }

    try {
      const { data } = await mockApiApi.create(projectName, {
        path,
        method,
        status_code: statusCode,
        response_data: responseData,
      });
      onSuccess(data);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError('Endpoint with this path and method already exists');
      } else {
        setError('Failed to create endpoint');
      }
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
};
