import { apiClient } from './client';
import type {
  DatasetRead,
  GDriveImportRequest,
  LocalImportRequest,
  Message,
  MoexLoadRequest,
} from './types';

export const datasetsApi = {
  list: async (): Promise<DatasetRead[]> => {
    const { data } = await apiClient.get<DatasetRead[]>('/datasets');
    return data;
  },

  get: async (datasetId: string): Promise<DatasetRead> => {
    const { data } = await apiClient.get<DatasetRead>(`/datasets/${datasetId}`);
    return data;
  },

  loadFromMoex: async (payload: MoexLoadRequest): Promise<DatasetRead> => {
    const { data } = await apiClient.post<DatasetRead>('/datasets/moex', payload);
    return data;
  },

  importFromLocal: async (payload: LocalImportRequest): Promise<DatasetRead> => {
    const { data } = await apiClient.post<DatasetRead>('/datasets/local', payload);
    return data;
  },

  importFromGDrive: async (payload: GDriveImportRequest): Promise<DatasetRead> => {
    const { data } = await apiClient.post<DatasetRead>('/datasets/gdrive', payload);
    return data;
  },

  remove: async (datasetId: string): Promise<Message> => {
    const { data } = await apiClient.delete<Message>(`/datasets/${datasetId}`);
    return data;
  },
};
