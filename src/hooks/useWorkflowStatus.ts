'use client';

import { useEffect, useState } from 'react';

/**
 * Response type from GET /api/v1/grd/active-workflow
 */
interface WorkflowStatusResponse {
  hasActiveWorkflow: boolean;
  grdId?: number;
  episodio?: string;
  estado?: string;
  message?: string;
}

/**
 * Hook state
 */
interface UseWorkflowStatusReturn {
  hasActiveWorkflow: boolean;
  grdId?: number;
  episodio?: string;
  estado?: string;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to check if there's an active workflow (file in progress)
 * Calls GET /api/v1/grd/active-workflow
 * 
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 * @param refreshInterval - Auto-refresh interval in ms (default: 0 = no auto-refresh)
 * @returns Workflow status and loading/error states
 * 
 * @example
 * ```tsx
 * const { hasActiveWorkflow, grdId, estado, loading } = useWorkflowStatus();
 * 
 * if (loading) return <Spinner />;
 * if (hasActiveWorkflow) {
 *   return <Alert>Ya existe un archivo en proceso (Estado: {estado})</Alert>;
 * }
 * ```
 */
export function useWorkflowStatus(
  autoFetch: boolean = true,
  refreshInterval: number = 0
): UseWorkflowStatusReturn {
  const [hasActiveWorkflow, setHasActiveWorkflow] = useState<boolean>(false);
  const [grdId, setGrdId] = useState<number | undefined>(undefined);
  const [episodio, setEpisodio] = useState<string | undefined>(undefined);
  const [estado, setEstado] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch workflow status from API
   */
  const fetchWorkflowStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/grd/active-workflow', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies/session
      });

      if (!response.ok) {
        // Handle non-200 responses
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data: WorkflowStatusResponse = await response.json();

      // Update state with response data
      setHasActiveWorkflow(data.hasActiveWorkflow);
      setGrdId(data.grdId);
      setEpisodio(data.episodio);
      setEstado(data.estado);
    } catch (err) {
      console.error('Error fetching workflow status:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido al verificar workflow');
      
      // Reset state on error
      setHasActiveWorkflow(false);
      setGrdId(undefined);
      setEpisodio(undefined);
      setEstado(undefined);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchWorkflowStatus();
    } else {
      setLoading(false);
    }
  }, [autoFetch]);

  // Auto-refresh if refreshInterval is set
  useEffect(() => {
    if (refreshInterval > 0 && autoFetch) {
      const intervalId = setInterval(() => {
        fetchWorkflowStatus();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, autoFetch]);

  return {
    hasActiveWorkflow,
    grdId,
    episodio,
    estado,
    loading,
    error,
    refetch: fetchWorkflowStatus,
  };
}
