import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import logger from "../../utils/logger";
import config from "../../config/config";

interface TokenPayload {
	id: string;
	email: string;
	iat: number;
	exp: number;
}

export class FinanceMiddleware {
	async authenticate(request: FastifyRequest, reply: FastifyReply) {
		try {
			const authHeader = request.headers.authorization;

			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				return reply.code(401).send({
					success: false,
					message: "Authentication required. Please provide a valid token.",
				});
			}

			const token = authHeader.split(" ")[1];
			if (!token) {
				return reply.code(401).send({
					success: false,
					message: "Authentication token is missing",
				});
			}

			try {
				const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
				(request as any).user = {
					id: decoded.id,
					email: decoded.email,
				};
			} catch (error) {
				logger.error("Token verification failed:", error);
				return reply.code(401).send({
					success: false,
					message: "Invalid or expired token",
				});
			}
		} catch (error) {
			logger.error("Authentication middleware error:", error);
			return reply.code(500).send({
				success: false,
				message: "Authentication failed due to server error",
			});
		}
	}

	async validateMonthParam(request: FastifyRequest, reply: FastifyReply) {
		const { month } = request.params as { month: string };

		if (!month || !/^\d{4}-\d{2}$/.test(month)) {
			return reply.code(400).send({
				success: false,
				message: "Invalid month format. Use YYYY-MM format.",
			});
		}
	}
}

export default new FinanceMiddleware();
