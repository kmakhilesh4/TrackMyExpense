import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Budget, ApiResponse } from '../types';
import { toast } from 'react-hot-toast';

export const useBudgets = () => {
    const queryClient = useQueryClient();

    const fetchBudgets = async (): Promise<Budget[]> => {
        const response = await apiClient.get<ApiResponse<Budget[]>>('/budgets');
        return response.data.data || [];
    };

    const budgetsQuery = useQuery({
        queryKey: ['budgets'],
        queryFn: fetchBudgets,
    });

    const createBudget = useMutation({
        mutationFn: async (newBudget: Partial<Budget>) => {
            const response = await apiClient.post<ApiResponse<Budget>>('/budgets', newBudget);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            toast.success('Budget created');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create budget');
        },
    });

    return {
        budgets: budgetsQuery.data || [],
        isLoading: budgetsQuery.isLoading,
        isError: budgetsQuery.isError,
        createBudget,
    };
};
