import { TransactionRepository } from '../repositories/transaction.repository.js';
import { AccountRepository } from '../repositories/account.repository.js';
import { TransactionEntity } from '../types/index.js';
import {
    CreateTransactionInput,
    UpdateTransactionInput,
    TransactionQueryFilters
} from '../middleware/transaction.validation.js';
import { AppError } from '../middleware/error.middleware.js';
import { transactWriteItems } from '../utils/dynamodb.js';

/**
 * Transaction Service
 * Handles business logic for Transactions and handles atomic balance updates
 */
export class TransactionService {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly accountRepository: AccountRepository
    ) { }

    /**
     * List transactions for a user
     */
    async listTransactions(userId: string, filters: TransactionQueryFilters) {
        return await this.transactionRepository.list(userId, filters);
    }

    /**
     * Get a specific transaction
     * Note: SK is required because it's a composite key (TX#date#id)
     */
    async getTransaction(userId: string, sk: string): Promise<TransactionEntity> {
        const transaction = await this.transactionRepository.get(userId, sk);
        if (!transaction) {
            throw new AppError('Transaction not found', 404);
        }
        return transaction;
    }

    /**
     * Create a new transaction with atomic balance update
     */
    async createTransaction(userId: string, data: CreateTransactionInput): Promise<TransactionEntity> {
        // 1. Verify account exists
        const account = await this.accountRepository.get(userId, data.accountId);
        if (!account) {
            throw new AppError('Account not found', 404);
        }

        // 2. Prepare transaction creation
        const { transaction, op: txOp } = this.transactionRepository.prepareCreate(userId, data);

        // 3. Prepare balance update
        // If income: balance increases (+amount)
        // If expense: balance decreases (-amount)
        const balanceChange = data.type === 'income' ? data.amount : -data.amount;
        const balanceOp = this.accountRepository.prepareUpdateBalance(userId, data.accountId, balanceChange);

        // 4. Execute atomically
        await transactWriteItems([txOp, balanceOp]);

        return transaction;
    }

    /**
     * Delete a transaction with atomic balance reversal
     */
    async deleteTransaction(userId: string, sk: string): Promise<void> {
        // 1. Get existing transaction to know the amount and account
        const transaction = await this.getTransaction(userId, sk);

        // 2. Prepare transaction deletion
        const txOp = this.transactionRepository.prepareDelete(userId, sk);

        // 3. Prepare balance reversal
        // If old was income: balance decreases (-amount)
        // If old was expense: balance increases (+amount)
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        const balanceOp = this.accountRepository.prepareUpdateBalance(userId, transaction.accountId, balanceChange);

        // 4. Execute atomically
        await transactWriteItems([txOp, balanceOp]);
    }

    /**
     * Update a transaction
     * For simplicity, update is implemented as Delete + Create if critical fields change, 
     * or a simple update if not. But for now, we'll implement simple metadata update 
     * and handle amount/type changes separately if needed.
     * 
     * TODO: Implement robust update logic that correctly adjusts balances if amount/type/account changes.
     */
    async updateTransaction(_userId: string, _sk: string, _data: UpdateTransactionInput): Promise<void> {
        throw new AppError('Update transaction not implemented yet. Please delete and recreate for now.', 501);
    }
}
