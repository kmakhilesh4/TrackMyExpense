import { AccountRepository } from '../repositories/account.repository.js';
import { AccountEntity } from '../types/index.js';
import { CreateAccountInput, UpdateAccountInput } from '../middleware/account.validation.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Account Service
 * Handles business logic for Accounts
 */
export class AccountService {
    constructor(private readonly accountRepository: AccountRepository) { }

    /**
     * List all accounts for a user
     */
    async listAccounts(userId: string): Promise<AccountEntity[]> {
        return await this.accountRepository.list(userId);
    }

    /**
     * Get a specific account
     */
    async getAccount(userId: string, accountId: string): Promise<AccountEntity> {
        const account = await this.accountRepository.get(userId, accountId);
        if (!account) {
            throw new AppError('Account not found', 404);
        }
        return account;
    }

    /**
     * Create a new account
     */
    async createAccount(userId: string, data: CreateAccountInput): Promise<AccountEntity> {
        return await this.accountRepository.create(userId, data);
    }

    /**
     * Update an account
     */
    async updateAccount(userId: string, accountId: string, data: UpdateAccountInput): Promise<AccountEntity> {
        // Verify account exists and belongs to user
        await this.getAccount(userId, accountId);

        return await this.accountRepository.update(userId, accountId, data);
    }

    /**
     * Delete an account
     */
    async deleteAccount(userId: string, accountId: string): Promise<void> {
        // Verify account exists and belongs to user
        await this.getAccount(userId, accountId);

        // TODO: Check if account has any transactions before deleting
        // In the future, we might want to prevent deletion or archive instead
        await this.accountRepository.delete(userId, accountId);
    }
}
