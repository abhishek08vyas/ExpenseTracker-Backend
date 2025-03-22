import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { TransactionController } from "./controller";

export default async function transactionRoutes(fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> {
	const transactionController = new TransactionController();

	// Create a new transaction
	fastify.post("/", {
		schema: {
			description: "Create a new transaction",
			tags: ["Transactions"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
			},
			body: {
				type: "object",
				required: ["transactionType", "amount", "transactionDate", "source", "categoryId", "description"],
				properties: {
					categoryId: { type: "string" },
					transactionType: { type: "string", enum: ["expense", "income"] },
					source: { type: "string" },
					currency: { type: "string", default: "CAD" },
					amount: { type: "number", minimum: 1 },
					transactionDate: { type: "string", format: "date-time" },
					description: { type: "string" },
					isRecurring: { type: "boolean", default: false },
					attachmentUrl: { type: "string" },
				},
			},
			response: {
				201: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "object", additionalProperties: true },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return transactionController.createTransaction(request as any, reply);
		},
	});

	// Get recent transactions
	fastify.get("/recent", {
		schema: {
			description: "Get recent transactions",
			tags: ["Transactions"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
			},
			querystring: {
				type: "object",
				properties: {
					limit: { type: "number", default: 5 },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "array" },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return transactionController.getRecentTransactions(request as any, reply);
		},
	});

	// Filter transactions
	fastify.get("/filter", {
		schema: {
			description: "Filter transactions with multiple criteria",
			tags: ["Transactions"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
			},
			querystring: {
				type: "object",
				properties: {
					startDate: { type: "string", format: "date-time" },
					endDate: { type: "string", format: "date-time" },
					categoryId: { type: "string" },
					transactionType: { type: "string", enum: ["expense", "income"] },
					source: { type: "string" },
					minAmount: { type: "string" },
					maxAmount: { type: "string" },
					search: { type: "string" },
					page: { type: "string", default: "1" },
					limit: { type: "string", default: "10" },
					sortBy: { type: "string", enum: ["amount", "transactionDate", "createdAt"], default: "transactionDate" },
					sortOrder: { type: "string", enum: ["asc", "desc"], default: "desc" },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "array" },
						pagination: { type: "object" },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return transactionController.filterTransactions(request as any, reply);
		},
	});

	// Get transaction by ID
	fastify.get("/:id", {
		schema: {
			description: "Get a transaction by ID",
			tags: ["Transactions"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
			},
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string" },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "object", additionalProperties: true },
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return transactionController.getTransactionById(request as any, reply);
		},
	});

	// Update transaction by ID
	fastify.put("/:id", {
		schema: {
			description: "Update an existing transaction",
			tags: ["Transactions"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
			},
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string" },
				},
			},
			body: {
				type: "object",
				properties: {
					categoryId: { type: "string" },
					transactionType: { type: "string", enum: ["expense", "income"] },
					source: { type: "string" },
					currency: { type: "string" },
					amount: { type: "number", minimum: 1 },
					transactionDate: { type: "string", format: "date-time" },
					description: { type: "string" },
					isRecurring: { type: "boolean" },
					attachmentUrl: { type: "string" },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "object", additionalProperties: true },
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return transactionController.updateTransaction(request as any, reply);
		},
	});

	// Delete transaction by ID
	fastify.delete("/:id", {
		schema: {
			description: "Delete a transaction",
			tags: ["Transactions"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
			},
			params: {
				type: "object",
				required: ["id"],
				properties: {
					id: { type: "string" },
				},
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				404: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						error: { type: "string" },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return transactionController.deleteTransaction(request as any, reply);
		},
	});
}
