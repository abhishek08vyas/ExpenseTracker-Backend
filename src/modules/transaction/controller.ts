import { FastifyRequest, FastifyReply } from "fastify";
import { TransactionService } from "./service";
import { z } from "zod";

// Request type definitions with proper typing
export interface CreateTransactionRequest extends FastifyRequest {
	body: {
		categoryId?: number;
		transactionType: "expense" | "income";
		source?: string;
		currency?: string;
		amount: number;
		transactionDate: string;
		description?: string;
		isRecurring?: boolean;
	};
}

export interface UpdateTransactionRequest extends FastifyRequest {
	params: {
		id: string;
	};
	body: {
		categoryId?: number;
		transactionType?: "expense" | "income";
		source?: string;
		currency?: string;
		amount?: number;
		transactionDate?: string;
		description?: string;
		isRecurring?: boolean;
	};
}

export interface GetTransactionByIdRequest extends FastifyRequest {
	params: {
		id: string;
	};
}

export interface DeleteTransactionRequest extends FastifyRequest {
	params: {
		id: string;
	};
}

export interface FilterTransactionsRequest extends FastifyRequest {
	query: {
		startDate?: string;
		endDate?: string;
		categoryId?: string;
		transactionType?: string;
		source?: string;
		minAmount?: string;
		maxAmount?: string;
		search?: string;
		page?: string;
		limit?: string;
		sortBy?: string;
		sortOrder?: string;
	};
}

export interface RecentTransactionsRequest extends FastifyRequest {
	query: {
		limit?: string;
	};
}

export class TransactionController {
	private transactionService: TransactionService;

	constructor() {
		this.transactionService = new TransactionService();
	}

	// Create a new transaction
	async createTransaction(request: CreateTransactionRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			const transaction = await this.transactionService.createTransaction({
				...request.body,
				userId,
			});

			return reply.code(201).send({
				success: true,
				data: transaction,
			});
		} catch (error) {
			request.log.error("Failed to create transaction", error);

			if (error instanceof z.ZodError) {
				return reply.code(400).send({
					success: false,
					error: error.format(),
				});
			}

			return reply.code(500).send({
				success: false,
				error: "Failed to create transaction",
			});
		}
	}

	// Get transaction by ID
	async getTransactionById(request: GetTransactionByIdRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			const transactionId = parseInt(request.params.id, 10);

			const transaction = await this.transactionService.getTransactionById(transactionId, userId);

			if (!transaction) {
				return reply.code(404).send({
					success: false,
					error: "Transaction not found",
				});
			}

			return reply.send({
				success: true,
				data: transaction,
			});
		} catch (error) {
			request.log.error(`Failed to get transaction with ID: ${request.params.id}`, error);
			return reply.code(500).send({
				success: false,
				error: "Failed to fetch transaction",
			});
		}
	}

	// Update a transaction
	async updateTransaction(request: UpdateTransactionRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			const transactionId = parseInt(request.params.id, 10);

			// Check if transaction exists and belongs to user
			const existingTransaction = await this.transactionService.getTransactionById(transactionId, userId);

			if (!existingTransaction) {
				return reply.code(404).send({
					success: false,
					error: "Transaction not found",
				});
			}

			const updatedTransaction = await this.transactionService.updateTransaction(transactionId, userId, request.body);

			return reply.send({
				success: true,
				data: updatedTransaction,
			});
		} catch (error) {
			request.log.error(`Failed to update transaction with ID: ${request.params.id}`, error);

			if (error instanceof z.ZodError) {
				return reply.code(400).send({
					success: false,
					error: error.format(),
				});
			}

			return reply.code(500).send({
				success: false,
				error: "Failed to update transaction",
			});
		}
	}

	// Delete a transaction
	async deleteTransaction(request: DeleteTransactionRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			const transactionId = parseInt(request.params.id, 10);

			// Check if transaction exists and belongs to user
			const existingTransaction = await this.transactionService.getTransactionById(transactionId, userId);

			if (!existingTransaction) {
				return reply.code(404).send({
					success: false,
					error: "Transaction not found",
				});
			}

			await this.transactionService.deleteTransaction(transactionId, userId);

			return reply.send({
				success: true,
				message: "Transaction deleted successfully",
			});
		} catch (error) {
			request.log.error(`Failed to delete transaction with ID: ${request.params.id}`, error);
			return reply.code(500).send({
				success: false,
				error: "Failed to delete transaction",
			});
		}
	}

	// Get recent transactions
	async getRecentTransactions(request: RecentTransactionsRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			const limit = request.query.limit ? parseInt(request.query.limit, 10) : 10;

			const transactions = await this.transactionService.getRecentTransactions(userId, limit);

			return reply.send({
				success: true,
				data: transactions,
			});
		} catch (error) {
			request.log.error("Failed to get recent transactions", error);
			return reply.code(500).send({
				success: false,
				error: "Failed to fetch recent transactions",
			});
		}
	}

	// Filter transactions with comprehensive options
	async filterTransactions(request: FilterTransactionsRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;

			const filterOptions = await this.transactionService.parseFilterOptions(request.query);

			const { transactions, pagination } = await this.transactionService.filterTransactions(userId, filterOptions);

			return reply.send({
				success: true,
				data: transactions,
				pagination,
			});
		} catch (error) {
			request.log.error("Failed to filter transactions", error);

			if (error instanceof z.ZodError) {
				return reply.code(400).send({
					success: false,
					error: error.format(),
				});
			}

			return reply.code(500).send({
				success: false,
				error: "Failed to filter transactions",
			});
		}
	}
}
