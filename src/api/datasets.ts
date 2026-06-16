import { apiClient } from './client';
import type {
  DatasetRead,
  DatasetReadWithData,
  GDriveImportRequest,
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

  loadFromMoex: async (payload: MoexLoadRequest): Promise<DatasetReadWithData> => {
    const { data } = await apiClient.post<DatasetReadWithData>('/datasets/moex', payload);
    return data;
  },

  importFromGDrive: async (payload: GDriveImportRequest): Promise<DatasetReadWithData> => {
    const { data } = await apiClient.post<DatasetReadWithData>('/datasets/gdrive', payload);
    return data;
  },

  remove: async (datasetId: string): Promise<Message> => {
    const { data } = await apiClient.delete<Message>(`/datasets/${datasetId}`);
    return data;
  },
};
