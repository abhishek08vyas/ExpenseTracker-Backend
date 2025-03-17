//route
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { BudgetController } from "./controller";

export default async function budgetRoutes(fastify: FastifyInstance, options: FastifyPluginOptions): Promise<void> {
	const budgetController = new BudgetController();

	// Create a new budget
	fastify.post("/", {
		schema: {
			tags: ["Budget"],
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
				required: ["startDate", "endDate", "amount"],
				properties: {
					categoryId: { type: "string", default: "cm8djxws40000l103234zdrsq" },
					period: { type: "string" },
					currency: { type: "string", default: "CAD" },
					startDate: { type: "string", format: "date-time" },
					endDate: { type: "string", format: "date-time" },
					amount: { type: "number", minimum: 10 },
					isActive: { type: "boolean", default: true },
					desc: { type: "string" },
					bname: { type: "string" },
				},
			},
		},
		handler: async function (request, reply) {
			return budgetController.createBudget(request as any, reply);
		},
	});

	// Get all budgets for a user
	fastify.get("/", {
		schema: {
			tags: ["Budget"],
			security: [{ bearerAuth: [] }],
			headers: {
				type: "object",
				properties: {
					Authorization: { type: "string" },
				},
				required: ["Authorization"],
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
			return budgetController.getBudgets(request as any, reply);
		},
	});

	// Get a single budget by ID
	fastify.get("/:id", {
		schema: {
			tags: ["Budget"],
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
				properties: {
					id: { type: "string" },
				},
				required: ["id"],
			},
			response: {
				200: {
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: { type: "object", additionalProperties: true },
					},
				},
			},
		},
		handler: async function (request, reply) {
			return budgetController.getBudget(request as any, reply);
		},
	});

	// Update a budget by ID
	fastify.put("/:id", {
		schema: {
			tags: ["Budget"],
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
				properties: {
					id: { type: "string" },
				},
				required: ["id"],
			},
			body: {
				type: "object",
				properties: {
					categoryId: { type: "string", default: "cm8djxws40000l103234zdrsq" },
					period: { type: "string" },
					currency: { type: "string", default: "CAD" },
					startDate: { type: "string", format: "date-time" },
					endDate: { type: "string", format: "date-time" },
					amount: { type: "number", minimum: 0 },
					isActive: { type: "boolean", default: false },
					bname: { type: "string" },
					desc: { type: "string" },
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
			},
		},
		handler: async function (request, reply) {
			return budgetController.updateBudget(request as any, reply);
		},
	});

	// Delete a budget by ID
	fastify.delete("/:id", {
		schema: {
			tags: ["Budget"],
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
				properties: {
					id: { type: "string" },
				},
				required: ["id"],
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
			return budgetController.deleteBudget(request as any, reply);
		},
	});
}
