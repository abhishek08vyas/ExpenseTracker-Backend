import { FastifyRequest, FastifyReply } from "fastify";
import AuthService from "./service";
import logger from "../../utils/logger";
import { Prisma } from "@prisma/client"; // Import Prisma types
import { z } from "zod";

const loginSchema = z.object({
	hd: z.string().optional(),
	email: z.string().email(),
	email_verified: z.boolean().optional().default(true),
	name: z.string(),
	given_name: z.string().optional(),
	family_name: z.string().optional(),
	picture: z.string().optional(),
	id: z.string().optional(), // Optional user ID
});

class AuthController {
	private authService: AuthService;

	constructor() {
		this.authService = new AuthService();

		// Bind methods to preserve 'this' context
		this.register = this.register.bind(this);
		this.login = this.login.bind(this);
	}

	async register(request: FastifyRequest<{ Body: Prisma.UserCreateInput }>, reply: FastifyReply) {
		try {
			const user = await this.authService.register(request.body);
			reply.code(201).send(user);
		} catch (error) {
			logger.error("Registration error:", error);
			reply.code(400).send({ error: "Registration failed" });
		}
	}

	async login(request: FastifyRequest, reply: FastifyReply) {
		try {
			const userData = loginSchema.parse(request.body);
			const result = await this.authService.generateToken(userData);
			return reply.code(200).send(result);
		} catch (error) {
			logger.error("Authentication error:", error);
			return reply.code(401).send({
				error: "Authentication failed",
				message: "Invalid email or password",
				statusCode: 401,
			});
		}
	}
}

export default new AuthController();
