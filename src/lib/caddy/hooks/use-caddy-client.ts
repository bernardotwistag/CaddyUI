import { useMemo } from 'react';
import { CaddyApiClient } from '../api-client';

export function useCaddyClient() {
  const client = useMemo(() => new CaddyApiClient(), []);
  return client;
} 