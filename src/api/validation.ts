import { apiClient } from './client';
import type { ValidationRequest, ValidationResponse } from './types';

export const validationApi = {
  run: async (payload: ValidationRequest): Promise<ValidationResponse> => {
    const { data } = await apiClient.post<ValidationResponse>('/validation/run', payload);
    return data;
  },
};
