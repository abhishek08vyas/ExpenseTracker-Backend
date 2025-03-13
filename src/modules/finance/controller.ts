import { FastifyRequest, FastifyReply } from "fastify";
import financeService from "./service";
import logger from "../../utils/logger";

// Define parameter interfaces
interface MonthParams {
	month: string;
}

// Create a simple type for just what we need
interface UserWithId {
	id: string;
}

// Use type assertion approach to handle the request
export class FinanceController {
	async getExpenseByCategory(request: FastifyRequest, reply: FastifyReply) {
		try {
			// Use type assertion to access the user id
			const userId = (request as any).user.id;
			const expenseByCategory = await financeService.getExpenseByCategory(userId);

			return reply.code(200).send({
				success: true,
				data: expenseByCategory,
			});
		} catch (error) {
			logger.error("Error in getExpenseByCategory:", error);
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch expense categories",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	async getTopSpendingByCategory(request: FastifyRequest, reply: FastifyReply) {
		try {
			const userId = (request as any).user.id;
			const topSpending = await financeService.getTopSpendingByCategory(userId);

			return reply.code(200).send({
				success: true,
				data: topSpending,
			});
		} catch (error) {
			logger.error("Error in getTopSpendingByCategory:", error);
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch top spending categories",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	async getMonthlySummary(
		request: FastifyRequest<{
			Params: MonthParams;
		}>,
		reply: FastifyReply,
	) {
		try {
			const userId = (request as any).user.id;
			const { month } = request.params;

			const parts = month.split("-");
			if (parts.length !== 2 || parts[0].length !== 4 || parts[1].length !== 2 || isNaN(parseInt(parts[0])) || isNaN(parseInt(parts[1]))) {
				return reply.code(400).send({
					success: false,
					message: "Invalid month format. Use YYYY-MM format.",
				});
			}

			const monthlySummary = await financeService.getMonthlySummary(userId, month);

			return reply.code(200).send({
				success: true,
				data: monthlySummary,
			});
		} catch (error) {
			logger.error("Error in getMonthlySummary:", error);
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch monthly summary",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	async getOverallSummary(request: FastifyRequest, reply: FastifyReply) {
		try {
			const userId = (request as any).user.id;
			const overallSummary = await financeService.getOverallSummary(userId);

			return reply.code(200).send({
				success: true,
				data: overallSummary,
			});
		} catch (error) {
			logger.error("Error in getOverallSummary:", error);
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch overall financial summary",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	async getIncomeExpenseTrend(request: FastifyRequest, reply: FastifyReply) {
		try {
			const userId = (request as any).user.id;
			const trend = await financeService.getIncomeExpenseTrend(userId);

			return reply.code(200).send({
				success: true,
				data: trend,
			});
		} catch (error) {
			logger.error("Error in getIncomeExpenseTrend:", error);
			return reply.code(500).send({
				success: false,
				message: "Failed to fetch income and expense trend",
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}
}

export default new FinanceController();
