import useSWR from 'swr';
import { TextsBrandon } from '@/types/texts-brandon';

interface UseTextsBrandonParams {
  limit?: number;
  offset?: number;
  relationshipId?: string | null;
  sender?: string | null;
  from?: string | null;
  to?: string | null;
  search?: string | null;
}

interface TextsBrandonResponse {
  data: TextsBrandon[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const fetcher = (url: string): Promise<TextsBrandonResponse> => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch');
  return r.json() as Promise<TextsBrandonResponse>;
});

export function useTextsBrandon(params: UseTextsBrandonParams = {}) {
  const {
    limit = 1000,
    offset = 0,
    relationshipId,
    sender,
    from,
    to,
    search,
  } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  
  if (relationshipId) queryParams.append('relationship_id', relationshipId);
  if (sender) queryParams.append('sender', sender);
  if (from) queryParams.append('from', from);
  if (to) queryParams.append('to', to);
  if (search) queryParams.append('search', search);

  const { data, error, isLoading, mutate } = useSWR<TextsBrandonResponse>(
    `/api/texts-brandon?${queryParams.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  return {
    data: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for paginated data
export function useTextsBrandonPaginated(page: number = 1, pageSize: number = 50, filters?: Omit<UseTextsBrandonParams, 'limit' | 'offset'>) {
  const offset = (page - 1) * pageSize;
  
  const result = useTextsBrandon({
    ...filters,
    limit: pageSize,
    offset,
  });

  return {
    ...result,
    currentPage: page,
    pageSize,
    totalPages: result.pagination ? Math.ceil(result.pagination.total / pageSize) : 0,
  };
}