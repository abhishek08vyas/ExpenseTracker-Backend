import fastify from "fastify";
import masterRouter from "./router/master.router";
import logger from "./utils/logger";

function buildApp() {
	const app = fastify({ logger: false });

	// Register Swagger
	app.register(import("@fastify/swagger"), {
		swagger: {
			info: {
				title: "Student Finance Tracker API",
				description: "API for managing student finances, expenses, and spending habits",
				version: "1.0.0",
			},
			externalDocs: {
				url: "https://github.com/yourusername/student-finance-tracker",
				description: "Find more info here",
			},
			host: "localhost:3000",
			schemes: ["http", "https"],
			consumes: ["application/json"],
			produces: ["application/json"],
			tags: [
				{ name: "Authentication", description: "Authentication related endpoints" },
				{ name: "Transactions", description: "Transaction management endpoints" },
			],
			securityDefinitions: {
				bearerAuth: {
					type: "apiKey",
					name: "Authorization",
					in: "header",
				},
			},
		},
	});

	// Register Swagger UI
	app.register(import("@fastify/swagger-ui"), {
		routePrefix: "/documentation",
		uiConfig: {
			docExpansion: "list",
			deepLinking: false,
		},
		staticCSP: true,
		transformSpecificationClone: true,
	});

	// Register routes
	app.register(masterRouter, { prefix: "/api" });

	// Global error handler
	app.setErrorHandler((error, request, reply) => {
		logger.error("Server error:", error);
		reply.status(error.statusCode || 500).send({
			error: error.name || "Internal Server Error",
			message: error.message || "An unknown error occurred",
			statusCode: error.statusCode || 500,
		});
	});

	return app;
}

export default buildApp;
