import { PrismaClient, Prisma } from "@prisma/client";
import { z } from "zod";
import logger from "../../utils/logger";

// Validation schema for creating transactions
const createTransactionSchema = z.object({
	userId: z.string(),
	categoryId: z.number().optional(),
	transactionType: z.enum(["expense", "income"]),
	source: z.string().optional(),
	currency: z.string().default("CAD"),
	amount: z.number().positive(),
	transactionDate: z.string().transform((str) => new Date(str)),
	description: z.string().optional(),
	isRecurring: z.boolean().default(false),
});

// Validation schema for updating transactions
const updateTransactionSchema = z.object({
	categoryId: z.number().optional(),
	transactionType: z.enum(["expense", "income"]).optional(),
	source: z.string().optional(),
	currency: z.string().optional(),
	amount: z.number().positive().optional(),
	transactionDate: z
		.string()
		.transform((str) => new Date(str))
		.optional(),
	description: z.string().optional(),
	isRecurring: z.boolean().optional(),
});

// Validation schema for filtering transactions
const filterTransactionsSchema = z.object({
	startDate: z
		.string()
		.optional()
		.transform((d) => (d ? new Date(d) : undefined)),
	endDate: z
		.string()
		.optional()
		.transform((d) => (d ? new Date(d) : undefined)),
	categoryId: z
		.string()
		.optional()
		.transform((val) => (val ? parseInt(val, 10) : undefined)),
	transactionType: z.enum(["expense", "income"]).optional(),
	source: z.string().optional(),
	minAmount: z.coerce.number().optional(),
	maxAmount: z.coerce.number().optional(),
	search: z.string().optional(),
	page: z.coerce.number().default(1),
	limit: z.coerce.number().default(10),
	sortBy: z.enum(["amount", "transactionDate", "createdAt"]).default("transactionDate"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type FilterOptions = z.infer<typeof filterTransactionsSchema>;

export class TransactionService {
	private prisma: PrismaClient;

	constructor() {
		this.prisma = new PrismaClient();
	}

	// Create a new transaction
	async createTransaction(data: any) {
		const validatedData = createTransactionSchema.parse(data);

		logger.info(`Creating transaction for user ${validatedData.userId}`, {
			userId: validatedData.userId,
			transactionType: validatedData.transactionType,
			amount: validatedData.amount,
		});

		return this.prisma.transaction.create({
			data: validatedData,
			include: {
				category: true,
			},
		});
	}

	// Get a transaction by ID
	async getTransactionById(id: number, userId: string) {
		logger.info(`Fetching transaction with ID ${id} for user ${userId}`, {
			userId,
			transactionId: id,
		});

		return this.prisma.transaction.findFirst({
			where: {
				id,
				userId,
				isActive: true,
			},
			include: {
				category: true,
			},
		});
	}

	// Update a transaction
	async updateTransaction(id: number, userId: string, data: any) {
		const validatedData = updateTransactionSchema.parse(data);

		logger.info(`Updating transaction ${id} for user ${userId}`, {
			userId,
			transactionId: id,
			updateData: validatedData,
		});

		return this.prisma.transaction.update({
			where: {
				id,
				userId,
			},
			data: validatedData,
			include: {
				category: true,
			},
		});
	}

	// Delete a transaction (soft delete)
	async deleteTransaction(id: number, userId: string) {
		logger.info(`Deleting transaction ${id} for user ${userId}`, {
			userId,
			transactionId: id,
		});

		// Using soft delete by setting isActive to false
		return this.prisma.transaction.update({
			where: {
				id,
				userId,
			},
			data: {
				isActive: false,
			},
		});
	}

	// Get recent transactions
	async getRecentTransactions(userId: string, limit: number) {
		logger.info(`Fetching recent transactions for user ${userId}`, {
			userId,
			limit,
		});

		return this.prisma.transaction.findMany({
			where: {
				userId,
				isActive: true,
			},
			orderBy: {
				transactionDate: "desc",
			},
			take: limit,
			include: {
				category: true,
			},
		});
	}

	// Parse and validate filter options
	async parseFilterOptions(queryParams: Record<string, any>): Promise<FilterOptions> {
		return filterTransactionsSchema.parse({
			startDate: queryParams.startDate,
			endDate: queryParams.endDate,
			categoryId: queryParams.categoryId,
			transactionType: queryParams.transactionType,
			source: queryParams.source,
			minAmount: queryParams.minAmount,
			maxAmount: queryParams.maxAmount,
			search: queryParams.search,
			page: queryParams.page || 1,
			limit: queryParams.limit || 10,
			sortBy: queryParams.sortBy || "transactionDate",
			sortOrder: queryParams.sortOrder || "desc",
		});
	}

	// Filter transactions with comprehensive options
	async filterTransactions(userId: string, options: FilterOptions) {
		const { startDate, endDate, categoryId, transactionType, source, minAmount, maxAmount, search, page, limit, sortBy, sortOrder } = options;

		logger.info(`Filtering transactions for user ${userId}`, {
			userId,
			filterCriteria: {
				startDate,
				endDate,
				categoryId,
				transactionType,
				source,
				search,
				page,
				limit,
			},
		});

		// Build the where clause dynamically
		const where: Prisma.TransactionWhereInput = {
			userId,
			isActive: true,
		};

		// Date range filter
		if (startDate || endDate) {
			where.transactionDate = {};
			if (startDate) where.transactionDate.gte = startDate;
			if (endDate) where.transactionDate.lte = endDate;
		}

		// Category filter
		if (categoryId !== undefined) {
			where.categoryId = categoryId;
		}

		// Transaction type filter
		if (transactionType) {
			where.transactionType = transactionType;
		}

		// Source filter
		if (source) {
			where.source = source;
		}

		// Amount range filter
		if (minAmount !== undefined || maxAmount !== undefined) {
			where.amount = {};
			if (minAmount !== undefined) where.amount.gte = new Prisma.Decimal(minAmount);
			if (maxAmount !== undefined) where.amount.lte = new Prisma.Decimal(maxAmount);
		}

		// Text search filter
		if (search) {
			where.OR = [{ description: { contains: search, mode: "insensitive" } }];

			// Try to parse search as number for amount matching
			const numericSearch = parseFloat(search);
			if (!isNaN(numericSearch)) {
				where.OR.push({ amount: { equals: new Prisma.Decimal(numericSearch) } });
			}
		}

		// Get total count for pagination
		const total = await this.prisma.transaction.count({ where });

		// Execute the query with pagination
		const transactions = await this.prisma.transaction.findMany({
			where,
			include: {
				category: true,
			},
			orderBy: {
				[sortBy]: sortOrder,
			},
			skip: (page - 1) * limit,
			take: limit,
		});

		return {
			transactions,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}
}
