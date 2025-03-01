// config/database.ts
import { PrismaClient, Prisma } from "@prisma/client";
import config from "./config";
import logger from "../utils/logger";

const createPrismaClient = () => {
	const prismaOptions: Prisma.PrismaClientOptions = {
		log: config.app.isDevelopment ? ["query", "error", "info", "warn"] : ["error"],
	};

	return new PrismaClient(prismaOptions);
};

declare global {
	var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma ?? createPrismaClient();

/* if (config.app.isDevelopment) {
	// Query event with explicit generic type
	prisma.$on("query", (e: Prisma.QueryEvent) => {
		logger.debug(`Query: ${e.query}`);
		logger.debug(`Duration: ${e.duration}ms`);
		logger.debug(`Timestamp: ${e.timestamp.toISOString()}`);
	});

	// Error event with explicit generic type
	prisma.$on("error", (e: Prisma.LogEvent) => {
		logger.error(`Prisma Error: ${e.message} (${new Date().toISOString()})`);
	});
} */

const extendedPrisma = prisma.$extends({
	name: "prismaClientWithLogging",
	query: {
		async $allOperations({ operation, model, args, query }) {
			const start = performance.now();
			const result = await query(args);
			const end = performance.now();

			if (config.app.isDevelopment) {
				logger.debug(`${model || "Unknown"}.${operation} - ${Math.round(end - start)}ms`);
			}

			return result;
		},
	},
});

if (config.app.isProduction) globalThis.prisma = prisma;

export default extendedPrisma;
