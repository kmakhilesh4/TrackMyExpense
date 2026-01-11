import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { Category, ApiResponse } from '../types';

export const useCategories = () => {
    const fetchCategories = async (): Promise<Category[]> => {
        const response = await apiClient.get<ApiResponse<Category[]>>('/categories');
        return response.data.data || [];
    };

    const categoriesQuery = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    return {
        categories: categoriesQuery.data || [],
        isLoading: categoriesQuery.isLoading,
        isError: categoriesQuery.isError,
    };
};
