import { FastifyInstance } from "fastify";
import AuthController from "./controller";
import config from "../../config/config";
import AuthMiddleware from "./middleware";

async function authRoutes(fastify: FastifyInstance) {
	fastify.post("/register", AuthController.register.bind(AuthController));

	await fastify.register(import("@fastify/jwt"), {
		secret: config.jwt.secret,
		sign: {
			expiresIn: "1h",
		},
	});

	// Define the authentication route
	fastify.post(
		"/login",
		{
			schema: {
				tags: ["Authentication"],
				summary: "User login",
				description: "Generate a JWT token with user information",
				body: {
					type: "object",
					required: ["email", "name"],
					properties: {
						id: { type: "string" },
						hd: { type: "string" },
						email: { type: "string", format: "email" },
						email_verified: { type: "boolean" },
						name: { type: "string" },
						given_name: { type: "string" },
						family_name: { type: "string" },
						picture: { type: "string" },
					},
				},
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							token: { type: "string" },
							user: {
								type: "object",
								properties: {
									id: { type: "string" },
									email: { type: "string" },
									name: { type: "string" },
								},
							},
						},
					},
					401: {
						type: "object",
						properties: {
							error: { type: "string" },
							message: { type: "string" },
							statusCode: { type: "number" },
						},
					},
				},
			},
		},
		AuthController.login,
	);

	// Helper method for other routes to authenticate
	fastify.decorate("authenticate", AuthMiddleware.verifyToken);
}

export default authRoutes;
