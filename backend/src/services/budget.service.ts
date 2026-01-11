import { BudgetRepository } from '../repositories/budget.repository.js';
import { BudgetEntity } from '../types/index.js';
import { CreateBudgetInput, UpdateBudgetInput } from '../middleware/budget.validation.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Budget Service
 * Handles business logic for Budgets
 */
export class BudgetService {
    constructor(private readonly budgetRepository: BudgetRepository) { }

    /**
     * List all budgets for a user
     */
    async listBudgets(userId: string): Promise<BudgetEntity[]> {
        return await this.budgetRepository.list(userId);
    }

    /**
     * Get a specific budget
     */
    async getBudget(userId: string, budgetId: string): Promise<BudgetEntity> {
        const budget = await this.budgetRepository.get(userId, budgetId);
        if (!budget) {
            throw new AppError('Budget not found', 404);
        }
        return budget;
    }

    /**
     * Create a new budget
     */
    async createBudget(userId: string, data: CreateBudgetInput): Promise<BudgetEntity> {
        return await this.budgetRepository.create(userId, data);
    }

    /**
     * Update a budget
     */
    async updateBudget(userId: string, budgetId: string, data: UpdateBudgetInput): Promise<BudgetEntity> {
        // Verify budget exists and belongs to user
        await this.getBudget(userId, budgetId);

        return await this.budgetRepository.update(userId, budgetId, data);
    }

    /**
     * Delete a budget
     */
    async deleteBudget(userId: string, budgetId: string): Promise<void> {
        // Verify budget exists and belongs to user
        await this.getBudget(userId, budgetId);

        await this.budgetRepository.delete(userId, budgetId);
    }
}
