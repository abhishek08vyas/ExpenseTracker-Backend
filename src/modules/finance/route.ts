import { FastifyInstance } from "fastify";
import financeController from "./controller";
import financeMiddleware from "./middleware";

// Define parameter interfaces
interface MonthParams {
	month: string;
}

async function financeRoutes(fastify: FastifyInstance) {
	// Add schemas for swagger documentation
	fastify.addSchema({
		$id: "expenseByCategory",
		type: "object",
		properties: {
			category: { type: "string" },
			amount: { type: "number" },
			month: { type: "string" },
		},
	});

	fastify.addSchema({
		$id: "topSpending",
		type: "object",
		properties: {
			category: { type: "string" },
			amount: { type: "number" },
			percentage: { type: "number" },
		},
	});

	fastify.addSchema({
		$id: "monthlySummary",
		type: "object",
		properties: {
			month: { type: "string" },
			totalIncome: { type: "number" },
			totalExpense: { type: "number" },
			balance: { type: "number" },
			savingsRate: { type: "number" },
		},
	});

	fastify.addSchema({
		$id: "overallSummary",
		type: "object",
		properties: {
			totalIncome: { type: "number" },
			totalExpense: { type: "number" },
			balance: { type: "number" },
			savingsRate: { type: "number" },
			mostExpensiveCategory: { type: "string" },
			mostFrequentCategory: { type: "string" },
			averageMonthlyExpense: { type: "number" },
			averageMonthlyIncome: { type: "number" },
		},
	});

	fastify.addSchema({
		$id: "incomeExpenseTrend",
		type: "object",
		properties: {
			month: { type: "string" },
			income: { type: "number" },
			expense: { type: "number" },
		},
	});

	// Routes
	fastify.get(
		"/expense-by-category",
		{
			preHandler: [financeMiddleware.authenticate],
			schema: {
				tags: ["Finance Analytics"],
				summary: "Get expenses by category for the last 6 months",
				description: "Returns expense data grouped by category for each month in the last 6 months",
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							data: {
								type: "array",
								items: { $ref: "expenseByCategory" },
							},
						},
					},
					401: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
							error: { type: "string" },
						},
					},
				},
				security: [{ bearerAuth: [] }],
			},
		},
		financeController.getExpenseByCategory,
	);

	fastify.get(
		"/top-spending-by-category",
		{
			preHandler: [financeMiddleware.authenticate],
			schema: {
				tags: ["Finance Analytics"],
				summary: "Get top spending categories for the last 6 months",
				description: "Returns spending data by category sorted by amount with percentage of total spending",
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							data: {
								type: "array",
								items: { $ref: "topSpending" },
							},
						},
					},
					401: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
							error: { type: "string" },
						},
					},
				},
				security: [{ bearerAuth: [] }],
			},
		},
		financeController.getTopSpendingByCategory,
	);

	fastify.get<{
		Params: MonthParams;
	}>(
		"/monthly-summary/:month",
		{
			preHandler: [financeMiddleware.authenticate, financeMiddleware.validateMonthParam],
			schema: {
				tags: ["Finance Analytics"],
				summary: "Get financial summary for a specific month",
				description: "Returns income, expense, balance and savings rate for the specified month (format: YYYY-MM)",
				params: {
					type: "object",
					required: ["month"],
					properties: {
						month: {
							type: "string",
							description: "Month in YYYY-MM format",
							pattern: "^\\d{4}-\\d{2}$",
						},
					},
				},
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							data: { $ref: "monthlySummary" },
						},
					},
					400: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
						},
					},
					401: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
							error: { type: "string" },
						},
					},
				},
				security: [{ bearerAuth: [] }],
			},
		},
		financeController.getMonthlySummary,
	);

	fastify.get(
		"/overall-summary",
		{
			preHandler: [financeMiddleware.authenticate],
			schema: {
				tags: ["Finance Analytics"],
				summary: "Get overall financial summary",
				description: "Returns comprehensive financial summary including total income, expenses, and insights on spending patterns",
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							data: { $ref: "overallSummary" },
						},
					},
					401: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
							error: { type: "string" },
						},
					},
				},
				security: [{ bearerAuth: [] }],
			},
		},
		financeController.getOverallSummary,
	);

	fastify.get(
		"/income-expense-trend",
		{
			preHandler: [financeMiddleware.authenticate],
			schema: {
				tags: ["Finance Analytics"],
				summary: "Get income and expense trend for the last 6 months",
				description: "Returns monthly income and expense data for the last 6 months for trend analysis",
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							data: {
								type: "array",
								items: { $ref: "incomeExpenseTrend" },
							},
						},
					},
					401: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							message: { type: "string" },
							error: { type: "string" },
						},
					},
				},
				security: [{ bearerAuth: [] }],
			},
		},
		financeController.getIncomeExpenseTrend,
	);
}

export default financeRoutes;
