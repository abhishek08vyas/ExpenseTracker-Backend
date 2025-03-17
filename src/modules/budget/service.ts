//service
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import logger from "../../utils/logger";

const prisma = new PrismaClient();

// Validation schema for creating and updating budgets
const budgetSchema = z.object({
	userId: z.string(),
	categoryId: z.string().optional(),
	currency: z.string().default("CAD"),
	amount: z.number().positive(),
	period: z.enum(["monthly", "weekly", "daily", "yearly"]),
	startDate: z.string().transform((str) => new Date(str)),
	endDate: z
		.string()
		.optional()
		.transform((str) => (str ? new Date(str) : undefined)),
	isActive: z.boolean().default(true),
	desc: z.string().optional(),
	bname: z.string(),
});

type BudgetInput = z.infer<typeof budgetSchema>;

export class BudgetService {
	// Create a budget
	async createBudget(data: any) {
		const validatedData = budgetSchema.parse(data);

		logger.info(`Creating budget for user ${validatedData.userId}`, {
			userId: validatedData.userId,
			amount: validatedData.amount,
			period: validatedData.period,
			bname: validatedData.bname,
		});

		return prisma.budget.create({
			data: validatedData,
			include: {
				category: true,
			},
		});
	}

	// Get all budgets for a user
	async getBudgets(userId: string) {
		logger.info(`Fetching budgets for user ${userId}`);

		return prisma.budget.findMany({
			where: { userId, isActive: true },
			include: {
				category: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	// Get a single budget by ID
	async getBudget(budgetId: string, userId: string) {
		logger.info(`Fetching budget ${budgetId} for user ${userId}`);

		return prisma.budget.findFirst({
			where: { id: budgetId, userId, isActive: true },
			include: {
				category: true,
			},
		});
	}

	// Update a budget by ID
	async updateBudget(budgetId: string, userId: string, data: any) {
		const validatedData = budgetSchema.partial().parse(data);

		logger.info(`Updating budget ${budgetId} for user ${userId}`);

		return prisma.budget.update({
			where: { id: budgetId, userId },
			data: validatedData,
		});
	}

	// Delete a budget by ID
	async deleteBudget(budgetId: string, userId: string) {
		logger.info(`Deleting budget ${budgetId} for user ${userId}`);

		await prisma.budget.delete({
			where: { id: budgetId, userId },
		});
	}
}
