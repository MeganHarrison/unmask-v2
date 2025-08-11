/**
 * @file Reusable Data Hooks
 * @description Smart hooks for accessing and managing database table data
 * @envVars NEXT_PUBLIC_DATA_FETCH_INTERVAL, NEXT_PUBLIC_API_BASE_URL
 */

import { useState, useEffect, useCallback } from 'react';
import { DatabaseSchema, TableName, QueryOptions } from '@/types/database';
import { tableQueries } from '@/lib/database/queries';

interface UseTableDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateInterval: number;
}

/**
 * @hook useTableData
 * @description Universal hook for fetching data from any database table
 * @param {TableName} tableName - The name of the table to fetch from
 * @param {QueryOptions} options - Query options for filtering and pagination
 * @usedIn All components that display database data
 * @apiRoute Dynamically constructs route based on table name
 */
export function useTableData<T extends TableName>(
  tableName: T,
  options?: QueryOptions
): UseTableDataResult<DatabaseSchema[T]> {
  const [data, setData] = useState<DatabaseSchema[T][] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const updateInterval = parseInt(process.env.NEXT_PUBLIC_DATA_FETCH_INTERVAL || '30000');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct API endpoint based on table name
      const endpoint = `${apiBaseUrl}/${tableName.replace('_', '-')}`;
      
      // Build query string from options
      const queryParams = new URLSearchParams();
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.offset) queryParams.append('offset', options.offset.toString());
      if (options?.orderBy) queryParams.append('orderBy', options.orderBy);
      if (options?.orderDirection) queryParams.append('orderDirection', options.orderDirection);
      if (options?.dateRange) {
        queryParams.append('startDate', options.dateRange.start);
        queryParams.append('endDate', options.dateRange.end);
      }
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = `${endpoint}${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${tableName}: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data || result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error(`Error fetching ${tableName}:`, err);
    } finally {
      setLoading(false);
    }
  }, [tableName, options, apiBaseUrl]);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh if interval is specified
    if (updateInterval > 0) {
      const intervalId = setInterval(fetchData, updateInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, updateInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    updateInterval
  };
}

/**
 * @hook useRelatedTableData
 * @description Fetches data from multiple related tables
 * @param {TableName} primaryTable - The main table to fetch from
 * @param {boolean} includeRelated - Whether to fetch related table data
 */
export function useRelatedTableData<T extends TableName>(
  primaryTable: T,
  includeRelated: boolean = true
) {
  const primaryData = useTableData(primaryTable);
  const [relatedData, setRelatedData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!includeRelated || !primaryData.data) return;

    // Get table connections
    const connections = tableQueries[primaryTable];
    
    // Fetch related data based on connections
    // This is a placeholder - implement based on specific relationships
  }, [primaryTable, includeRelated, primaryData.data]);

  return {
    ...primaryData,
    relatedData
  };
}

/**
 * @hook useAggregatedData
 * @description Combines data from multiple tables for comprehensive views
 * @param {TableName[]} tables - Array of tables to aggregate
 * @usedIn Dashboard components, analytics views
 */
export function useAggregatedData(tables: TableName[]) {
  const [aggregatedData, setAggregatedData] = useState<Record<TableName, any>>({} as Record<TableName, any>);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const results: Record<string, any> = {};

        await Promise.all(
          tables.map(async (table) => {
            const response = await fetch(`/api/${table.replace('_', '-')}`);
            if (response.ok) {
              const data = await response.json();
              results[table] = data.data || data;
            }
          })
        );

        setAggregatedData(results as Record<TableName, any>);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to aggregate data'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [tables]);

  return { data: aggregatedData, loading, error };
}

/**
 * @hook useTableMutation
 * @description Handles create, update, and delete operations for tables
 * @param {TableName} tableName - The table to mutate
 */
export function useTableMutation<T extends TableName>(tableName: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

  const mutate = useCallback(async (
    operation: 'create' | 'update' | 'delete',
    data?: Partial<DatabaseSchema[T]>,
    id?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const endpoint = `${apiBaseUrl}/${tableName.replace('_', '-')}${id ? `/${id}` : ''}`;
      
      const method = operation === 'create' ? 'POST' : 
                     operation === 'update' ? 'PUT' : 'DELETE';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`Failed to ${operation} in ${tableName}`);
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Mutation failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tableName, apiBaseUrl]);

  return {
    create: (data: Partial<DatabaseSchema[T]>) => mutate('create', data),
    update: (id: string, data: Partial<DatabaseSchema[T]>) => mutate('update', data, id),
    delete: (id: string) => mutate('delete', undefined, id),
    loading,
    error
  };
}