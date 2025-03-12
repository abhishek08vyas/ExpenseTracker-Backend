// src/modules/category/route.ts
import { FastifyInstance } from "fastify";
import { categoryController } from "./controller";
import { categoryValidation } from "./middleware";

export default async function categoryRoutes(fastify: FastifyInstance) {
	// Register Swagger documentation for Category routes
	const categorySchema = {
		type: "object",
		properties: {
			id: { type: "string", format: "uuid" },
			name: { type: "string" },
			description: { type: "string", nullable: true },
			icon: { type: "string", nullable: true },
			color: { type: "string", pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", nullable: true },
			createdAt: { type: "string", format: "date-time" },
			updatedAt: { type: "string", format: "date-time" },
		},
		required: ["id", "name", "createdAt", "updatedAt"],
	};

	const createCategorySchema = {
		schema: {
			description: "Create a new expense category",
			tags: ["Categories"],
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
				required: ["name"],
				properties: {
					name: { type: "string", description: "Category name" },
					description: { type: "string", description: "Category description", nullable: true },
					icon: { type: "string", description: "Icon identifier for the category", nullable: true },
					color: { type: "string", description: "Color hex code for the category", pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", nullable: true },
				},
			},
			response: {
				201: {
					description: "Successfully created category",
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: categorySchema,
						message: { type: "string" },
					},
				},
				400: {
					description: "Bad Request",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				500: {
					description: "Internal Server Error",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						error: { type: "string" },
					},
				},
			},
		},
	};

	const updateCategorySchema = {
		schema: {
			description: "Update an existing expense category",
			tags: ["Categories"],
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
					id: { type: "string", description: "Category ID" },
				},
			},
			body: {
				type: "object",
				properties: {
					name: { type: "string", description: "Category name" },
					description: { type: "string", description: "Category description", nullable: true },
					icon: { type: "string", description: "Icon identifier for the category", nullable: true },
					color: { type: "string", description: "Color hex code for the category", pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", nullable: true },
				},
			},
			response: {
				200: {
					description: "Successfully updated category",
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: categorySchema,
						message: { type: "string" },
					},
				},
				400: {
					description: "Bad Request",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				404: {
					description: "Category not found",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				500: {
					description: "Internal Server Error",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						error: { type: "string" },
					},
				},
			},
		},
	};

	const deleteCategorySchema = {
		schema: {
			description: "Delete an expense category",
			tags: ["Categories"],
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
					id: { type: "string", description: "Category ID" },
				},
			},
			response: {
				200: {
					description: "Successfully deleted category",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				400: {
					description: "Bad Request",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				404: {
					description: "Category not found",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				500: {
					description: "Internal Server Error",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						error: { type: "string" },
					},
				},
			},
		},
	};

	const getCategoryByIdSchema = {
		schema: {
			description: "Get a specific expense category by ID",
			tags: ["Categories"],
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
					id: { type: "string", description: "Category ID" },
				},
			},
			response: {
				200: {
					description: "Successfully retrieved category",
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: categorySchema,
					},
				},
				400: {
					description: "Bad Request",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				404: {
					description: "Category not found",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
					},
				},
				500: {
					description: "Internal Server Error",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						error: { type: "string" },
					},
				},
			},
		},
	};

	const getAllCategoriesSchema = {
		schema: {
			description: "Get all expense categories",
			tags: ["Categories"],
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
					description: "Successfully retrieved categories",
					type: "object",
					properties: {
						success: { type: "boolean" },
						data: {
							type: "array",
							items: categorySchema,
						},
					},
				},
				500: {
					description: "Internal Server Error",
					type: "object",
					properties: {
						success: { type: "boolean" },
						message: { type: "string" },
						error: { type: "string" },
					},
				},
			},
		},
	};

	// Register routes
	fastify.post("/", { ...createCategorySchema, preHandler: categoryValidation.validateCreate }, categoryController.createCategory);
	fastify.put("/:id", { ...updateCategorySchema, preHandler: categoryValidation.validateUpdate }, categoryController.updateCategory);
	fastify.delete("/:id", { ...deleteCategorySchema, preHandler: categoryValidation.validateId }, categoryController.deleteCategory);
	fastify.get("/:id", { ...getCategoryByIdSchema, preHandler: categoryValidation.validateId }, categoryController.getCategoryById);
	fastify.get("/", getAllCategoriesSchema, categoryController.getAllCategories);
}
