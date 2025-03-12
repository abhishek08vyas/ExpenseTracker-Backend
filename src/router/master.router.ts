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

	// Register existing category routes
	fastify.register(import("../modules/category/route"), { prefix: "/v1/categories" });

	// Health check endpoint with Swagger documentation
	fastify.get(
		"/health",
		{
			schema: {
				description: "Health check endpoint to verify API status",
				tags: ["System"],
				response: {
					200: {
						description: "Successful response indicating the API is operational",
						type: "object",
						properties: {
							status: { type: "string", enum: ["ok"], description: "Service status" },
							timestamp: { type: "string", format: "date-time", description: "Current server timestamp in ISO format" },
						},
					},
				},
			},
		},
		async () => {
			return { status: "ok", timestamp: new Date().toISOString() };
		},
	);
}

export default masterRouter;
