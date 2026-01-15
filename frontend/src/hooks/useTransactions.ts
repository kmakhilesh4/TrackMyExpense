import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Transaction, ApiResponse } from '../types';
import { toast } from 'react-hot-toast';

export interface TransactionFilters {
    startDate?: string;
    endDate?: string;
    accountId?: string;
    categoryId?: string;
}

export const useTransactions = (filters?: TransactionFilters) => {
    const queryClient = useQueryClient();

    const fetchTransactions = async (): Promise<Transaction[]> => {
        const response = await apiClient.get<ApiResponse<{ items: Transaction[] }>>('/transactions', {
            params: filters,
        });
        // Backend returns { success: true, data: { items: [] } }
        return response.data.data?.items || [];
    };

    const transactionsQuery = useQuery({
        queryKey: ['transactions', filters],
        queryFn: fetchTransactions,
    });

    const createTransaction = useMutation({
        mutationFn: async (newTransaction: Partial<Transaction>) => {
            const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', newTransaction);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] }); // Balance updates
            toast.success('Transaction added');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to add transaction');
        },
    });

    const deleteTransaction = useMutation({
        mutationFn: async (sk: string) => {
            await apiClient.delete(`/transactions`, { params: { sk } });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Transaction deleted');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to delete transaction');
        },
    });

    return {
        transactions: transactionsQuery.data || [],
        isLoading: transactionsQuery.isLoading,
        isError: transactionsQuery.isError,
        createTransaction,
        deleteTransaction,
    };
};
