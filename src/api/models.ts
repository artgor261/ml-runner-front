import { apiClient } from './client';
import type { Message, ModelRead, ModelRegisterRequest, ModelUploadRequest } from './types';

export const modelsApi = {
  list: async (): Promise<ModelRead[]> => {
    const { data } = await apiClient.get<ModelRead[]>('/models');
    return data;
  },

  get: async (modelId: string): Promise<ModelRead> => {
    const { data } = await apiClient.get<ModelRead>(`/models/${modelId}`);
    return data;
  },

  register: async (payload: ModelRegisterRequest): Promise<ModelRead> => {
    const { data } = await apiClient.post<ModelRead>('/models/register', payload);
    return data;
  },

  upload: async (payload: ModelUploadRequest): Promise<ModelRead> => {
    const form = new FormData();
    form.append('name', payload.name);
    if (payload.description) form.append('description', payload.description);
    form.append('file', payload.file);
    const { data } = await apiClient.post<ModelRead>('/models/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  remove: async (modelId: string): Promise<Message> => {
    const { data } = await apiClient.delete<Message>(`/models/${modelId}`);
    return data;
  },
};
