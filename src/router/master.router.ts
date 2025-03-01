import { FastifyInstance } from "fastify";
import AuthMiddleware from "../modules/auth/middleware";

async function masterRouter(fastify: FastifyInstance) {
	// Global preHandler hook for JWT verification
	// Global authentication hook
	fastify.addHook("preHandler", async (request, reply) => {
		let publicRoutes = ["/api/health", "/api/v1/auth/login", "/api/v1/auth/register"];

		// Get the actual request path without query parameters
		const requestPath = new URL(request.url, "http://dummy").pathname;

		if (publicRoutes.includes(requestPath)) {
			return;
		}
		AuthMiddleware.verifyToken(request, reply);
	});

	// Register auth routes
	fastify.register(import("../modules/auth/route"), { prefix: "/v1/auth" });

	// Register existing transaction routes
	fastify.register(import("../modules/transaction/route"), { prefix: "/v1/transactions" });

	// Health check
	fastify.get("/health", async () => {
		return { status: "ok", timestamp: new Date().toISOString() };
	});
}

export default masterRouter;
