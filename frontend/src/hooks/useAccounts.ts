import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Account, ApiResponse } from '../types';
import { toast } from 'react-hot-toast';

export const useAccounts = () => {
    const queryClient = useQueryClient();

    const fetchAccounts = async (): Promise<Account[]> => {
        const response = await apiClient.get<ApiResponse<Account[]>>('/accounts');
        return response.data.data || [];
    };

    const accountsQuery = useQuery({
        queryKey: ['accounts'],
        queryFn: fetchAccounts,
    });

    const createAccount = useMutation({
        mutationFn: async (newAccount: Partial<Account>) => {
            const response = await apiClient.post<ApiResponse<Account>>('/accounts', newAccount);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast.success('Account created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create account');
        },
    });

    return {
        accounts: accountsQuery.data || [],
        isLoading: accountsQuery.isLoading,
        isError: accountsQuery.isError,
        createAccount,
    };
};
