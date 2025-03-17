import config from "../../config/config";
import prisma from "../../config/database";
import { Prisma } from "@prisma/client";
import logger from "../../utils/logger";
import jwt from "jsonwebtoken";
import crypto from "node:crypto"; // Add this import

export interface JwtPayload {
	// Standard JWT claims
	iss: string; // Issuer
	azp: string; // Authorized party (client ID)
	aud: string; // Audience
	sub: string; // Subject (user UUID)
	iat: number; // Issued at timestamp
	exp: number; // Expiration timestamp

	// Custom claims
	hd: string | null; // Hosted domain (e.g., company domain for Google Workspace)
	id: string; // User ID from your system
	email: string; // User's email address
	email_verified: boolean; // Email verification status
	at_hash: string; // Access token hash
	name: string; // Full name
	picture: string | null; // Profile picture URL
	given_name: string; // First name
	family_name: string; // Last name
}
class AuthService {
	async register(userData: Prisma.UserCreateInput) {
		return prisma.user.create({
			data: userData,
		});
	}
	async authenticate(email: string, password: string) {
		try {
			// In a real application, you would check the email and password against the database
			// Here we're just simulating authentication for demonstration

			// Mock user verification (replace with actual DB lookup and password verification)
			const user = await prisma.user.findUnique({
				where: { email },
			});

			if (!user) {
				throw new Error("User not found");
			}

			// In a real app, you would verify the password with bcrypt or similar
			// if (!await bcrypt.compare(password, user.passwordHash)) {
			//   throw new Error("Invalid password");
			// }

			// For demonstration, we'll assume the password is correct

			// Generate a JWT token with user data
			return {
				success: true,
				token: this.generateToken(user),
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
				},
			};
		} catch (error) {
			logger.error("Authentication service error:", error);
			throw error;
		}
	}

	async generateToken(userData: any) {
		try {
			// Verify if the user exists or create a new one
			/* let user = await prisma.user.findUnique({
				where: { email: userData.email },
			});

			if (!user) {
				// Create a new user if they don't exist
				user = await prisma.user.create({
					data: {
						email: userData.email,
						name: userData.name,
						emailVerified: userData.email_verified || false,
						// Add other relevant fields
					},
				});
			}*/

			// Generate JWT token with the required format
			const token = await this.createToken(userData);

			return {
				success: true,
				token,
			};
		} catch (error) {
			logger.error("Token generation error:", error);
			throw error;
		}
	}

	async createToken(userData: any) {
		// Current timestamp in seconds
		const iat = Math.floor(Date.now() / 1000);

		// Create payload similar to your example
		const payload = {
			iss: config.jwt.iss,
			azp: config.jwt.appClintId,
			aud: config.jwt.appClintId,
			sub: crypto.randomUUID(),
			hd: userData.hd || null,
			id: userData.id,
			email: userData.email,
			email_verified: userData.email_verified || false,
			at_hash: this.generateRandomHash(),
			name: userData.name,
			picture: userData.picture || null,
			given_name: userData.given_name || userData.name?.split(" ")[0] || "",
			family_name: userData.family_name || userData.name?.split(" ").slice(1).join(" ") || "",
			iat,
			exp: iat + config.jwt.expire, // Token valid for 1 hour
		};
		let secret = config.jwt.secret;
		if (!secret || typeof secret !== "string" || secret.length < 32) {
			logger.error("JWT secret is not properly defined");
			throw new Error("Invalid JWT configuration");
		}
		return jwt.sign(payload, config.jwt.secret);
	}

	generateRandomHash() {
		// More secure random hash generation using crypto
		return crypto.randomBytes(16).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
	}
}

export default AuthService;
