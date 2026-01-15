import { CategoryRepository } from '../repositories/category.repository.js';
import { CategoryEntity } from '../types/index.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../middleware/category.validation.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Category Service
 * Handles business logic for Categories
 */
export class CategoryService {
    constructor(private readonly categoryRepository: CategoryRepository) { }

    /**
     * List all categories for a user
     */
    async listCategories(userId: string): Promise<CategoryEntity[]> {
        return await this.categoryRepository.list(userId);
    }

    /**
     * Get a specific category
     */
    async getCategory(userId: string, categoryId: string): Promise<CategoryEntity> {
        const category = await this.categoryRepository.get(userId, categoryId);
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        return category;
    }

    /**
     * Create a new category
     */
    async createCategory(userId: string, data: CreateCategoryInput): Promise<CategoryEntity> {
        return await this.categoryRepository.create(userId, data);
    }

    /**
     * Update a category
     */
    async updateCategory(userId: string, categoryId: string, data: UpdateCategoryInput): Promise<CategoryEntity> {
        // Verify category exists and belongs to user
        await this.getCategory(userId, categoryId);

        return await this.categoryRepository.update(userId, categoryId, data);
    }

    /**
     * Delete a category
     */
    async deleteCategory(userId: string, categoryId: string): Promise<void> {
        // Verify category exists and belongs to user
        await this.getCategory(userId, categoryId);

        // TODO: Check if category is used by any transactions before deleting
        // For now, simple delete
        await this.categoryRepository.delete(userId, categoryId);
    }
}
