import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, modelsApi } from '../api';
import type { ModelRegisterRequest, ModelUploadRequest } from '../api';
import { notify } from '../store/notificationStore';
import { queryKeys } from './queryKeys';

export function useModels() {
  return useQuery({ queryKey: queryKeys.models, queryFn: modelsApi.list });
}

export function useModel(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.model(id ?? ''),
    queryFn: () => modelsApi.get(id as string),
    enabled: Boolean(id),
  });
}

function useInvalidateModels() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.models });
}

export function useRegisterModel() {
  const invalidate = useInvalidateModels();
  return useMutation({
    mutationFn: (payload: ModelRegisterRequest) => modelsApi.register(payload),
    onSuccess: (model) => {
      notify(`Model "${model.name}" registered`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useUploadModel() {
  const invalidate = useInvalidateModels();
  return useMutation({
    mutationFn: (payload: ModelUploadRequest) => modelsApi.upload(payload),
    onSuccess: (model) => {
      notify(`Model "${model.name}" uploaded`, 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}

export function useDeleteModel() {
  const invalidate = useInvalidateModels();
  return useMutation({
    mutationFn: (id: string) => modelsApi.remove(id),
    onSuccess: () => {
      notify('Model deleted', 'success');
      invalidate();
    },
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}
