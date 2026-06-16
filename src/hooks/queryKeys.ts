import type { ListRunsParams } from '../api';

/** Centralized React Query cache keys. */
export const queryKeys = {
  health: ['health'] as const,

  datasets: ['datasets'] as const,
  dataset: (id: string) => ['datasets', id] as const,

  experiments: ['experiments'] as const,
  experiment: (id: string) => ['experiments', id] as const,
  experimentRuns: (id: string) => ['experiments', id, 'runs'] as const,
  allRuns: ['experiments', 'runs'] as const,
  runDetail: (id: string) => ['experiments', 'runs', id] as const,

  trainingRuns: (params: ListRunsParams) => ['training', 'runs', params] as const,
  trainingRun: (id: string) => ['training', 'runs', id] as const,
  trainingStatus: (id: string) => ['training', 'runs', id, 'status'] as const,

  models: ['models'] as const,
  model: (id: string) => ['models', id] as const,
};
