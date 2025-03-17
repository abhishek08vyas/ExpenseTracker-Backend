// src/modules/category/service.ts
import { PrismaClient, Prisma } from "@prisma/client";
import { CategoryCreateDto, CategoryUpdateDto } from "./controller";

const prisma = new PrismaClient();

export const categoryService = {
	async createCategory(data: CategoryCreateDto, userId: string) {
		return prisma.category.create({
			data: {
				name: data.name,
				description: data.description || null,
				icon: data.icon || null,
				color: data.color || null,
				userId, // Ensure userId is included
			},
		});
	},

	async updateCategory(id: string, data: CategoryUpdateDto) {
		try {
			return await prisma.category.update({
				where: { id },
				data: {
					name: data.name,
					description: data.description,
					icon: data.icon,
					color: data.color,
				},
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2025") {
					return null; // Category not found
				}
			}
			throw error;
		}
	},

	async deleteCategory(id: string) {
		try {
			await prisma.category.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === "P2025") {
					return false; // Category not found
				}
			}
			throw error;
		}
	},

	async getCategoryById(id: string, userId: string) {
		return prisma.category.findUnique({
			where: { id, userId },
		});
	},

	async getAllCategories(userId: string) {
		return prisma.category.findMany({
			where: { userId },
			orderBy: {
				name: "asc",
			},
		});
	},
};
