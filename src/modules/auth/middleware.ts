import { FastifyRequest, FastifyReply } from "fastify";
import { verify } from "jsonwebtoken";
import config from "../../config/config";
import { JwtPayload } from "./service";

class AuthMiddleware {
	async verifyToken(request: FastifyRequest, reply: FastifyReply) {
		try {
			const token = this.extractToken(request);
			if (!token) throw new Error("Missing token");
			let decodedUser = verify(token, config.jwt.secret) as JwtPayload;
			request.user = decodedUser;
		} catch (err) {
			reply.code(401).send({
				error: "Unauthorized",
				message: "Invalid or missing token",
				statusCode: 401,
			});
			return;
		}
	}

	private extractToken(request: FastifyRequest): string | null {
		const authHeader = request.headers.authorization;
		return authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
	}
}

export default new AuthMiddleware();

// Add type augmentation for FastifyRequest
declare module "fastify" {
	interface FastifyRequest {
		user: JwtPayload;
	}
}
