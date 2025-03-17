// src/modules/category/controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { categoryService } from "./service";
import logger from "../../utils/logger";
import { isEmpty } from "../../utils/utils";

export interface CategoryCreateDto {
	name: string;
	description?: string;
	icon?: string;
	color?: string;
}

export interface CategoryUpdateDto {
	name?: string;
	description?: string;
	icon?: string;
	color?: string;
}

export interface CategoryParams {
	id: string;
}

export const categoryController = {
	async createCategory(request: FastifyRequest<{ Body: CategoryCreateDto }>, reply: FastifyReply) {
		try {
			const categoryData = request.body;
			const userId = request.user?.id; // Ensure `userId` is available from auth middleware

			if (!userId) {
				return reply.code(401).send({
					success: false,
					message: "Unauthorized: User ID is missing",
				});
			}

			const newCategory = await categoryService.createCategory(categoryData, userId);

			return reply.code(201).send({
				success: true,
				data: newCategory,
				message: "Category created successfully",
			});
		} catch (error) {
			logger.error("Error creating category", { error });
			return reply.code(500).send({
				success: false,
				message: "Failed to create category",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	async updateCategory(request: FastifyRequest<{ Params: CategoryParams; Body: CategoryUpdateDto }>, reply: FastifyReply) {
		try {
			const categoryId = request.params?.id;
			const categoryData = request.body;

			if (isEmpty(categoryId)) {
				return reply.code(400).send({
					success: false,
					message: "Invalid category ID",
				});
			}

			const updatedCategory = await categoryService.updateCategory(categoryId, categoryData);

			if (!updatedCategory) {
				return reply.code(404).send({
					success: false,
					message: `Category with ID ${categoryId} not found`,
				});
			}

			return reply.code(200).send({
				success: true,
				data: updatedCategory,
				message: "Category updated successfully",
			});
		} catch (error) {
			logger.error("Error updating category", { error, id: request.params.id });
			return reply.code(500).send({
				success: false,
				message: "Failed to update category",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	async deleteCategory(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) {
		try {
			const categoryId = request.params?.id;

			if (isEmpty(categoryId)) {
				return reply.code(400).send({
					success: false,
					message: "Invalid category ID",
				});
			}

			const deleted = await categoryService.deleteCategory(categoryId);

			if (!deleted) {
				return reply.code(404).send({
					success: false,
					message: `Category with ID ${categoryId} not found`,
				});
			}

			return reply.code(200).send({
				success: true,
				message: "Category deleted successfully",
			});
		} catch (error) {
			logger.error("Error deleting category", { error, id: request.params.id });
			return reply.code(500).send({
				success: false,
				message: "Failed to delete category",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	async getCategoryById(request: FastifyRequest<{ Params: CategoryParams }>, reply: FastifyReply) {
		try {
			const categoryId = request.params?.id;

			if (isEmpty(categoryId)) {
				return reply.code(400).send({
					success: false,
					message: "Invalid category ID",
				});
			}

			const category = await categoryService.getCategoryById(categoryId, request.user.id);

			if (!category) {
				return reply.code(404).send({
					success: false,
					message: `Category with ID ${categoryId} not found`,
				});
			}

			return reply.code(200).send({
				success: true,
				data: category,
			});
		} catch (error) {
			logger.error("Error fetching category by ID", { error, id: request.params.id });
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch category",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},

	async getAllCategories(request: FastifyRequest, reply: FastifyReply) {
		try {
			const categories = await categoryService.getAllCategories(request.user.id);

			return reply.code(200).send({
				success: true,
				data: categories,
			});
		} catch (error) {
			logger.error("Error fetching all categories", { error });
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch categories",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	},
};
