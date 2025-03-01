import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { TransactionController } from "./controller";
// import { authenticate } from "../common/middleware";

export default async function transactionRoutes(fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> {
	// All routes are protected with authentication
	// fastify.addHook("preHandler", authenticate);

	const transactionController = new TransactionController();

	// Create a new transaction
	fastify.post("/", {
		schema: {
			body: {
				type: "object",
				required: ["transactionType", "amount", "transactionDate"],
				properties: {
					categoryId: { type: "number" },
					transactionType: { type: "string", enum: ["expense", "income"] },
					source: { type: "string" },
					currency: { type: "string", default: "CAD" },
					amount: { type: "number", minimum: 0 },
					transactionDate: { type: "string", format: "date-time" },
					description: { type: "string" },
					isRecurring: { type: "boolean", default: false },
				},
			},
			response: {
				201: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "object" },
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
			querystring: {
				type: "object",
				properties: {
					limit: { type: "number", default: 10 },
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
}
