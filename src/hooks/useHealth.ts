import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api';
import { queryKeys } from './queryKeys';

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: healthApi.check,
    refetchInterval: 30_000,
    retry: 1,
  });
}
