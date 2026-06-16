import { apiClient } from './client';
import type {
  ExperimentCreate,
  ExperimentDetail,
  ExperimentRead,
  RunDetail,
  RunRead,
} from './types';

export const experimentsApi = {
  list: async (): Promise<ExperimentRead[]> => {
    const { data } = await apiClient.get<ExperimentRead[]>('/experiments');
    return data;
  },

  create: async (payload: ExperimentCreate): Promise<ExperimentRead> => {
    const { data } = await apiClient.post<ExperimentRead>('/experiments', payload);
    return data;
  },

  get: async (experimentId: string): Promise<ExperimentDetail> => {
    const { data } = await apiClient.get<ExperimentDetail>(`/experiments/${experimentId}`);
    return data;
  },

  listRuns: async (experimentId: string): Promise<RunRead[]> => {
    const { data } = await apiClient.get<RunRead[]>(`/experiments/${experimentId}/runs`);
    return data;
  },

  /** Flat list of all runs across experiments (MLflow-style Runs page). */
  listAllRuns: async (): Promise<RunRead[]> => {
    const { data } = await apiClient.get<RunRead[]>('/experiments/runs');
    return data;
  },

  getRunDetail: async (runId: string): Promise<RunDetail> => {
    const { data } = await apiClient.get<RunDetail>(`/experiments/runs/${runId}`);
    return data;
  },
};
