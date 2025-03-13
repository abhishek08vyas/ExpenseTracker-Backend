//controller
import { FastifyRequest, FastifyReply } from "fastify";
import { BudgetService } from "./service";

// Extend FastifyRequest to include user property
export interface BudgetRequest extends FastifyRequest {
	body: {
		categoryId: number;
		currency: string;
		amount: number;
		period?: string;
		startDate: string;
		endDate: string;
		isActive?: boolean;
	};
	params: {
		id: string;
	};
}

export class BudgetController {
	private budgetService: BudgetService;

	constructor() {
		this.budgetService = new BudgetService();
	}

	// Helper function to validate period
	private isValidPeriod(period?: string): period is "monthly" | "weekly" | "daily" | "yearly" {
		return ["monthly", "weekly", "daily", "yearly"].includes(period as any);
	}

	// Create a new budget
	async createBudget(request: BudgetRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			//const userId ="1";

			// Ensure period is either one of the allowed values or set a default
			const period = this.isValidPeriod(request.body.period) ? request.body.period : "monthly"; // Default to 'monthly'

			// Normalize dates to Date objects
			//const startDate = new Date(request.body.startDate);
			//const endDate = request.body.endDate ? new Date(request.body.endDate) : undefined;

			// Ensure isActive has a valid boolean value (default to true if not provided)
			const isActive = request.body.isActive ?? true; // Default to true if undefined

			const budget = await this.budgetService.createBudget({
				...request.body,
				period,
				//startDate,
				//endDate,
				isActive, // This will ensure isActive is always a boolean
				userId,
			});

			return reply.code(201).send({
				success: true,
				data: budget,
			});
		} catch (error) {
			request.log.error("Failed to create budget", error);

			return reply.code(500).send({
				success: false,
				error: "Failed to create budget",
			});
		}
	}

	// Get all budgets for a user
	async getBudgets(request: BudgetRequest, reply: FastifyReply) {
		try {
			const userId = request.user.id;
			const budgets = await this.budgetService.getBudgets(userId);

			return reply.send({
				success: true,
				data: budgets,
			});
		} catch (error) {
			request.log.error("Failed to fetch budgets", { error });
			return reply.code(500).send({
				success: false,
				error: "Failed to fetch budgets",
			});
		}
	}

	// Get a single budget by ID
	async getBudget(request: BudgetRequest, reply: FastifyReply) {
		try {
			const budgetId = parseInt(request.params.id);
			const userId = request.user.id;
			const budget = await this.budgetService.getBudget(budgetId, userId);

			return reply.send({
				success: true,
				data: budget,
			});
		} catch (error) {
			request.log.error("Failed to fetch budget", error);
			return reply.code(500).send({
				success: false,
				error: "Failed to fetch budget",
			});
		}
	}

	// Update a budget by ID
	async updateBudget(request: BudgetRequest, reply: FastifyReply) {
		try {
			const budgetId = parseInt(request.params.id);
			const userId = request.user.id;
			//const userId ="1";

			// Ensure period is either one of the allowed values or set a default
			const period = this.isValidPeriod(request.body.period) ? request.body.period : "monthly"; // Default to 'monthly'

			// Normalize dates to Date objects
			const startDate = new Date(request.body.startDate);
			const endDate = request.body.endDate ? new Date(request.body.endDate) : undefined;

			// Ensure isActive has a valid boolean value (default to true if not provided)
			const isActive = request.body.isActive ?? true; // Default to true if undefined

			const updatedBudget = await this.budgetService.updateBudget(budgetId, userId, request.body);

			return reply.send({
				success: true,
				data: updatedBudget,
			});
		} catch (error) {
			request.log.error("Failed to update budget", error);
			return reply.code(500).send({
				success: false,
				error: "Failed to update budget",
			});
		}
	}

	// Delete a budget by ID
	async deleteBudget(request: BudgetRequest, reply: FastifyReply) {
		try {
			const budgetId = parseInt(request.params.id);
			const userId = request.user.id;
			await this.budgetService.deleteBudget(budgetId, userId);

			return reply.code(204).send();
		} catch (error) {
			request.log.error("Failed to delete budget", error);
			return reply.code(500).send({
				success: false,
				error: "Failed to delete budget",
			});
		}
	}
}
