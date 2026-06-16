import { apiClient } from './client';
import type { RunRead, RunStatus, TrainRequest, TrainingStatusDetail } from './types';

export interface ListRunsParams {
  active?: boolean | null;
  status?: RunStatus | null;
}

export const trainingApi = {
  listRuns: async (params: ListRunsParams = {}): Promise<RunRead[]> => {
    const { data } = await apiClient.get<RunRead[]>('/training/runs', {
      params: {
        ...(params.active != null ? { active: params.active } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });
    return data;
  },

  startTraining: async (payload: TrainRequest): Promise<RunRead> => {
    const { data } = await apiClient.post<RunRead>('/training/runs', payload);
    return data;
  },

  startTrainingFromFile: async (file: File): Promise<RunRead> => {
    const form = new FormData();
    form.append('config', file);
    const { data } = await apiClient.post<RunRead>('/training/runs/from-file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getRun: async (runId: string): Promise<RunRead> => {
    const { data } = await apiClient.get<RunRead>(`/training/runs/${runId}`);
    return data;
  },

  getRunStatus: async (runId: string): Promise<TrainingStatusDetail> => {
    const { data } = await apiClient.get<TrainingStatusDetail>(
      `/training/runs/${runId}/status`,
    );
    return data;
  },

  cancelRun: async (runId: string): Promise<RunRead> => {
    const { data } = await apiClient.post<RunRead>(`/training/runs/${runId}/cancel`);
    return data;
  },
};
