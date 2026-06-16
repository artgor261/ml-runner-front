import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, validationApi } from '../api';
import type { ValidationRequest } from '../api';
import { notify } from '../store/notificationStore';

export function useRunValidation() {
  return useMutation({
    mutationFn: (payload: ValidationRequest) => validationApi.run(payload),
    onSuccess: () => notify('Validation completed', 'success'),
    onError: (error) => notify(getErrorMessage(error), 'error'),
  });
}
